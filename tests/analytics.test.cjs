const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { createAnalytics } = require('../analytics-store.cjs');
test('anonymous records survive restart, deduplicate retries and separate views from sessions', async () => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'roy-analytics-')); const file=path.join(dir,'analytics.sqlite');
 let store=createAnalytics({databaseURL:'',file});
 try {
  const session=randomUUID(), event={id:randomUUID(),session,at:'2026-10-31T12:00:00.000Z',page:'/',kind:'pageview',device:'mobile',source:'Direct / internal'};
  await store.record(event); await store.record(event); await store.record({...event,id:randomUUID(),page:'/portfolio'}); await store.record({...event,id:randomUUID(),kind:'whatsapp'});
  await store.close(); store=createAnalytics({databaseURL:'',file});
  const report=await store.report(7,new Date('2026-10-31T15:00:00Z'));
  assert.equal(report.views,2); assert.equal(report.visits,1); assert.equal(report.actions[0].count,1); assert.equal(report.daily[0].views,2);
  assert.equal(JSON.stringify(report).includes(session),false);
  assert.equal((await store.report(7,new Date('2026-11-10T15:00:00Z'))).views,0);
 } finally { await store.close(); fs.rmSync(dir,{recursive:true,force:true}); }
});
test('analytics validates events, enforces origin and owner access, and separates client records', async t => {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'roy-audience-api-')); const prior={...process.env};
 Object.assign(process.env,{DATABASE_URL:'',DATABASE_FILE:'',DATA_FILE:path.join(dir,'records.json'),JWT_SECRET:'test-analytics-secret-at-least-32-characters',ADMIN_EMAIL:'owner@example.com',SMTP_HOST:''});
 const at=new Date().toISOString(), password=require('bcryptjs').hashSync('test-owner-password',4);
 fs.writeFileSync(process.env.DATA_FILE,JSON.stringify({users:[{id:'owner',email:'owner@example.com',password,emailConfirmed:true,adminApproved:true},{id:'client',email:'client@example.com',password,emailConfirmed:true}],signups:[{email:'client@example.com',createdAt:at}],bookings:[{id:'b1',email:'client@example.com',status:'pending',createdAt:at},{id:'b2',email:'client@example.com',status:'confirmed',createdAt:at}]}));
 delete require.cache[require.resolve('../server.js')]; const app=require('../server.js'); const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve)); const base='http://127.0.0.1:'+server.address().port;
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await app.locals.analytics.close();await app.locals.storage.close();process.env=prior;fs.rmSync(dir,{recursive:true,force:true});});
 const event={id:randomUUID(),session:randomUUID(),page:'/',kind:'pageview',device:'desktop',source:'google.com'};
 const post=(data,origin=base)=>fetch(base+'/api/analytics/event',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)});
 assert.equal((await post(event,'https://unrelated.example')).status,403);
 assert.equal((await post({...event,page:'/admin'})).status,400);
 assert.equal((await post(event)).status,204); assert.equal((await post(event)).status,204);
 assert.equal((await fetch(base+'/api/admin/analytics')).status,401);
 const login=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'owner@example.com',password:'test-owner-password'})}); const cookie=login.headers.get('set-cookie').split(';')[0];
 const response=await fetch(base+'/api/admin/analytics?days=7',{headers:{Cookie:cookie}}); assert.equal(response.status,200); const report=await response.json();
 assert.equal(report.visits,1);assert.equal(report.views,1);assert.equal(report.business.registered,1);assert.equal(report.business.enquiries,2);assert.equal(report.business.bookingClients,1);assert.equal(report.daily.length,7); assert.equal(report.sources[0].source,'Search');
 assert.equal(JSON.stringify(report).includes('client@example.com'),false);
 assert.equal((await fetch(base+'/api/admin/analytics?days=999',{headers:{Cookie:cookie}})).status,400);
 const member=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'client@example.com',password:'test-owner-password'})});
 assert.equal((await fetch(base+'/api/admin/analytics',{headers:{Cookie:member.headers.get('set-cookie').split(';')[0]}})).status,403);
});

