# BackEnd — GreenGray API

Express 4 + Mongoose (MongoDB) REST API for the GreenGray sustainable e-commerce platform. Serves the React frontend over HTTP only — it never serves frontend code and shares no code with it.

## Setup

```bash
npm install
cp .env.example config.env   # fill in real values, never commit config.env
npm run seed                 # demo users, products, reviews, votes (see below)
npm run dev                  # nodemon, for development
```

`server.js` loads `./config.env` and refuses to start without `DATABASE`, `JWT_SECRET` and `JWT_EXPIRES_IN`. API base path is `/api/v1`; default port `3000` (`PORT` in `config.env`). See the repo-root README for the endpoint table.

## Environment variables

See `.env.example` for the full list with placeholders. The essentials:

| Variable | Purpose |
| -------- | ------- |
| `PORT` | API port (default `3000`) |
| `DATABASE` | MongoDB connection string (Atlas or local; a replica set is required for the Stripe webhook transaction) |
| `JWT_SECRET` / `JWT_EXPIRES_IN` / `JWT_COOKIE_EXPIRES_IN` | JWT signing secret (long random string) and lifetimes |
| `FRONTEND_URL` | Frontend origin (CORS + reset / Stripe redirect URLs) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe secret key and webhook signing secret (server-side only) |
| `STRIPE_REWARD_COUPON_ID` / `STRIPE_ECO_COUPON_ID` | Optional Stripe coupon ids (empty = no coupon) |
| `EMAIL_FROM` / `GMAIL_EMAIL` / `GMAIL_PASSWORD` | Email for password resets / certificates |
| `SEED_PASSWORD` | Password for the three demo seed accounts (demo-only, default `password123`) |

## Scripts

| Script | What it does |
| ------ | ------------ |
| `npm run dev` | Start with nodemon (`server.js`) |
| `npm start` | Start the API (`node server.js`) |
| `npm run start:prod` | Start with `NODE_ENV=production` |
| `npm run worker` | Run the scheduled maintenance jobs (`workers/maintenanceJobs.js`) as a separate process |
| `npm run seed` | `node dev-data/seed.js --import` — seed the demo catalogue into MongoDB |
| `npm run seed:destroy` | `node dev-data/seed.js --delete` — remove the seeded data again |
| `npm run debug` | Start under `ndb` |

## Demo data

`dev-data/seed.js` + `dev-data/data/seed-products.json` seed the demo catalogue (5 products transcribed from the old frontend mock data, plus 3 demo users, 6 sample reviews and 3 sample votes) into MongoDB. The frontend has no mock data — without `npm run seed` the catalogue is empty. `--import` is safe to re-run (it wipes the previous seed first). `--delete` removes all documents in the Product, Review and Vote collections and deletes only the three demo users by email — read the header comment in `seed.js` before running it against a shared database.

## Worker

The scheduled jobs (expired sales, reward-point expiry, …) live in `workers/maintenanceJobs.js` and run as their own process (`npm run worker`), not inside the web server. Run exactly one worker instance — there is no distributed lock yet.

## Layout

```
app.js            Express app (Stripe webhook mounted before the JSON parser)
server.js         Entry point, fails fast on missing config
controller/       auth, products, cart/checkout, webhook, votes, reviews, users
models/           Mongoose schemas (incl. unique product+user indexes)
routes/           Express routers
utils/            APIFeatures (filter/sort/paginate), AppError, email
workers/          maintenanceJobs.js — scheduled jobs
dev-data/         seed.js + data/seed-products.json — demo seed data
```
