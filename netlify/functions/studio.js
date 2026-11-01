// Never use the function's temporary filesystem for customer records.
let handler;
exports.handler = async (event, context) => {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || !process.env.ADMIN_EMAIL) {
    return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'The account service is being configured. Please try again shortly.' }) };
  }
  process.env.NODE_ENV = 'production';
  process.env.TRUST_PROXY = '1';
  process.env.SITE_URL = process.env.URL || process.env.SITE_URL;
  if (!handler) handler = require('serverless-http')(require('../../server.js'));
  context.callbackWaitsForEmptyEventLoop = false;
  const prefix = '/.netlify/functions/studio';
  const normalize = value => value && value.startsWith(prefix) ? value.slice(prefix.length) || '/' : value;
  return handler({ ...event, path: normalize(event.path), rawPath: normalize(event.rawPath) }, context);
};
