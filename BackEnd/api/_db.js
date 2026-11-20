// Shared MongoDB connection for Vercel serverless functions.
//
// A cold start opens one connection and reuses it while the function
// instance stays warm; concurrent invocations share the pool instead of
// opening a connection per request (Atlas M0 caps concurrent connections).
// Same pool/timeout options as server.js.
const mongoose = require('mongoose');

let cached = global.__ecoMongoose;
if (!cached) cached = global.__ecoMongoose = { promise: null };

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  if (!cached.promise) {
    const DB = process.env.DATABASE;
    if (!DB) throw new Error('DATABASE is not set');
    cached.promise = mongoose.connect(DB, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
  }
  await cached.promise;
}

module.exports = { connectDb };
