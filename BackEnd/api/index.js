// Vercel serverless entry point: every request (rewritten by vercel.json)
// runs through the Express app. There is no app.listen() here — Vercel
// invokes this function per request. The DB connection is opened lazily
// and cached while the function instance stays warm (see _db.js).
const { connectDb } = require('./_db');
const app = require('../app');

module.exports = async (req, res) => {
  await connectDb();
  return app(req, res);
};
