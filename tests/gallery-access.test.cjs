const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
test('gallery and collection access requires a current confirmed session and survives no cache',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'roy-gallery-')),previous={...process.env};
 Object.assign(process.env,{DATABASE_URL:'',DATABASE_FILE:'',DATA_FILE:path.join(dir,'records.json'),JWT_SECRET:'gallery-tests-secret-longer-than-32-characters',ADMIN_EMAIL:'owner@example.com',SMTP_HOST:''});
 delete require.cache[require.resolve('../server.js')];const app=require('../server.js'),server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base='http://127.0.0.1:'+server.address().port;
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await app.locals.storage.close();await app.locals.analytics.close();process.env=previous;fs.rmSync(dir,{recursive:true,force:true});});
 const routes=['/portfolio','/portfolio/','/collections','/collections/khadney-birthday'];
 for(const route of routes){const r=await fetch(base+route,{redirect:'manual'});assert.equal(r.status,302);assert.match(r.headers.get('cache-control'),/no-store/);assert.match(r.headers.get('location'),/^\/login.html\?next=/);assert.doesNotMatch(await r.text(),/portfolio-open/);}
 const credentials={name:'Gallery client',email:'gallery@example.com',password:'test-gallery-password'};
 const post=(route,body)=>fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await post('/api/register',credentials)).status,200);
 const login=await post('/api/login',credentials),cookie=login.headers.get('set-cookie').split(';')[0];
 for(const route of ['/portfolio','/portfolio/','/collections','/collections/khadney-birthday']){const r=await fetch(base+route,{headers:{Cookie:cookie}});assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);assert.match(await r.text(),/class="portfolio-open"/);}
 const data=await app.locals.storage.read();data.users[0].tokenVersion=1;await app.locals.storage.write(data);
 assert.equal((await fetch(base+'/portfolio',{headers:{Cookie:cookie},redirect:'manual'})).status,302);
});
test('return destinations reject external redirects while retaining collection anchors',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../gallery-return.js'),'utf8');
 function target(next){const context={URL,URLSearchParams,location:{search:'?next='+encodeURIComponent(next),origin:'https://roy.example.com'},window:{},document:{addEventListener(){}}};vm.runInNewContext(code,context);return context.window.RoyGalleryReturn.next;}
 assert.equal(target('//evil.example/portfolio'),'');assert.equal(target('https://evil.example/portfolio'),'');assert.equal(target('/admin.html'),'');assert.equal(target('/collections/khadney-birthday#frame-02'),'/collections/khadney-birthday#frame-02');
});
