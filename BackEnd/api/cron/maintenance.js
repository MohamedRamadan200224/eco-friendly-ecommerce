// Daily maintenance endpoint, invoked by Vercel Cron (see vercel.json).
// Runs the same two batch jobs the standalone worker used to run every
// 5–10 minutes. On the Hobby plan cron runs at most once a day, so the
// checks are less fresh than the worker's — acceptable for a demo, and
// the updates are idempotent, so a duplicate run is a wasted scan, not
// corrupt data. Requiring the worker module is side-effect-free: it only
// schedules when run directly (require.main === module).
const { connectDb } = require('../_db');
const {
  runExpertCheck,
  runCertificateCheck,
} = require('../../workers/maintenanceJobs');

module.exports = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ status: 'fail', message: 'unauthorized' });
  }
  await connectDb();
  await runExpertCheck();
  await runCertificateCheck();
  return res.status(200).json({ status: 'success' });
};
