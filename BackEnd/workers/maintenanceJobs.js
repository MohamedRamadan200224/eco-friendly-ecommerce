// Maintenance jobs for the eco-friendly e-commerce backend.
//
// Perf P0: these two jobs used to run inside the web process (app.js,
// node-schedule) — every 10 minutes a full scan of all experts plus a
// save() per inactive expert, and every 5 minutes a full scan of all
// certified users plus a countDocuments() per user. With two or more web
// instances every instance ran the same jobs and duplicated the work, and
// the scans competed with live requests for the same event loop and DB
// pool. The web process (app.js / server.js) no longer schedules anything.
//
// Run as its own process:
//
//   npm run worker                 # from BackEnd/
//   node workers/maintenanceJobs.js
//
// Both jobs are batch updates instead of find + save() per user:
//
// - Expert check: one updateMany downgrades every expert who has not
//   voted in the last 10 minutes.
// - Certificate check: one distinct() finds every owner with at least one
//   sold, non-harmful product, then one updateMany decertifies every
//   certified user not in that set.
//
// Single-instance note: there is no distributed lock yet (P1). Run exactly
// one worker process. If two workers do run, the updates are idempotent —
// the second run finds no experts left to downgrade and no certified users
// left to decertify — so a duplicate run is a wasted scan, not corrupt data.

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const schedule = require('node-schedule');
const User = require('../models/userModel');
const Product = require('../models/productModel');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const DB_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

// Downgrade every expert who has not voted in the last 10 minutes.
// Same rule as the old per-user loop: time since lastVoted > 10 minutes.
// Experts with no lastVoted value are left alone, exactly as before (the
// old code computed new Date(undefined) -> Invalid Date -> NaN, and
// NaN > 10 is false). That is arguably a bug — an expert who never votes
// keeps the role forever — but changing it is out of this P0 patch.
async function runExpertCheck(now = new Date()) {
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const result = await User.updateMany(
    {
      role: 'expert',
      lastVoted: { $exists: true, $ne: null, $lt: tenMinutesAgo },
    },
    { $set: { role: 'user' } }
  );

  console.log(
    `[maintenance] expert check: downgraded ${result.modifiedCount} inactive expert(s).`
  );
  return result;
}

// Decertify every certified user who has no sold, non-harmful product.
// Same rule as the old per-user loop: count of products with
// { owner: user, harmfultoenv: false, soldNum >= 1 } < 1.
async function runCertificateCheck() {
  const qualifiedOwnerIds = await Product.distinct('owner', {
    harmfultoenv: false,
    soldNum: { $gte: 1 },
  });

  const result = await User.updateMany(
    { isCertified: true, _id: { $nin: qualifiedOwnerIds } },
    { $set: { isCertified: false } }
  );

  console.log(
    `[maintenance] certificate check: decertified ${result.modifiedCount} user(s).`
  );
  return result;
}

// A failing job must not kill the worker (or the schedule): log it and
// let the next run retry.
async function runJob(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`[maintenance] ${name} failed:`, err);
  }
}

async function main() {
  if (!process.env.DATABASE) {
    console.error(
      'Missing required environment variable: DATABASE. ' +
        'Copy BackEnd/.env.example to config.env and fill in the values.'
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.DATABASE, DB_OPTIONS);
  console.log('[maintenance] DB connection successful!');

  const expertJob = schedule.scheduleJob('*/10 * * * *', () =>
    runJob('expert check', () => runExpertCheck())
  );
  const certificateJob = schedule.scheduleJob('*/5 * * * *', () =>
    runJob('certificate check', runCertificateCheck)
  );

  console.log(
    '[maintenance] worker running: expert check every 10 min, certificate check every 5 min.'
  );

  const shutdown = async () => {
    console.log('[maintenance] shutting down...');
    if (expertJob) expertJob.cancel();
    if (certificateJob) certificateJob.cancel();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Only start scheduling when run directly (node workers/maintenanceJobs.js).
// Requiring this module (e.g. from a test) exposes runExpertCheck /
// runCertificateCheck without connecting or scheduling anything.
if (require.main === module) {
  main().catch((err) => {
    console.error('[maintenance] failed to start:', err);
    process.exit(1);
  });
}

module.exports = { runExpertCheck, runCertificateCheck };
