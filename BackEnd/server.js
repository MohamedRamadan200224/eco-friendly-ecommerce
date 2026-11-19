const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('Uncaught Exception. Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

// Fail fast on missing required configuration instead of starting a
// server that signs JWTs with an undefined secret or cannot reach a DB.
const requiredEnv = ['DATABASE', 'JWT_SECRET', 'JWT_EXPIRES_IN'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(', ')}. ` +
      'Copy BackEnd/.env.example to config.env and fill in the values.'
  );
  process.exit(1);
}

const app = require('./app');

const DB = process.env.DATABASE;

const port = process.env.PORT || 3000;

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const server = app.listen(port, () => {
  console.log(`App listening on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection. Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
