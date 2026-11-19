# 🌱 GreenGray — Sustainable E-Commerce Platform

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/MohamedRamadan200224/eco-friendly-ecommerce/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/MohamedRamadan200224/eco-friendly-ecommerce/pulls)
![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-green)

A MERN-stack e-commerce platform that promotes sustainable shopping: sellers list eco-friendly products, experts verify sustainability claims, and buyers earn reward points for choosing non-harmful products.

> **Live demo:** https://eco-friendly-ecommerce.vercel.app (frontend only, as published in the original README — the backend is not deployed to a public URL; run it locally as described below.)

## ✨ Key features

| Feature | Description |
| ------- | ----------- |
| ♻ Eco Rewards | Reward points for buying sustainable products; 100 points unlock a discount coupon at checkout |
| 🌿 Seller badges | Verified "Eco-Friendly Seller" program (certification) |
| 🔍 Product verification | Experts review / vote on products' sustainability claims |
| 🛒 Cart & checkout | Cart, quantity / stock checks, and Stripe Checkout |
| 💳 Payments | Stripe Checkout; orders are created only after Stripe confirms payment via webhook |
| ⭐ Reviews & votes | One review / vote per user per product, with aggregated ratings |

## 🛠️ Tech stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router, Axios, Stripe.js
- **Backend:** Node.js + Express 4, Mongoose (MongoDB), JWT auth (httpOnly cookie), Stripe, Nodemailer
- **Security:** Helmet, express-mongo-sanitize, XSS clean, HPP, rate limiting (global + stricter auth limiter), Zod-free but allowlisted request bodies, hashed password-reset tokens

## 🏁 Getting started

### Prerequisites

- Node.js 20+ (see `BackEnd/package.json` / `FrontEnd/package.json`)
- MongoDB Atlas account or a local MongoDB (a replica set is required for the Stripe webhook transaction — Atlas provides this by default)
- A Stripe account (test mode is enough) and the Stripe CLI for local webhook testing

### 1. Backend

```bash
cd BackEnd
npm install

# Copy the example env file and fill in real values (never commit it).
cp .env.example config.env
# server.js loads ./config.env and refuses to start without
# DATABASE, JWT_SECRET and JWT_EXPIRES_IN.
npm start
# API runs on http://localhost:3000 by default (PORT in config.env)
```

### 2. Frontend

```bash
cd FrontEnd
npm install

cp .env.example .env
# Set VITE_API_URL (default http://localhost:3000) and
# VITE_STRIPE_PUBLISHABLE_KEY (Stripe publishable key only).
npm run dev
# App runs on http://localhost:5173 by default
```

## 🔑 Environment variables

Backend (`BackEnd/config.env`, see `BackEnd/.env.example`):

| Variable | Purpose |
| -------- | ------- |
| `PORT` | Backend port (default `3000`) |
| `DATABASE` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing JWTs (required) |
| `JWT_EXPIRES_IN` / `JWT_COOKIE_EXPIRES_IN` | Token / cookie lifetime |
| `FRONTEND_URL` | Frontend origin (CORS + reset / Stripe redirect URLs) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side only) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook endpoint |
| `STRIPE_REWARD_COUPON_ID` / `STRIPE_ECO_COUPON_ID` | Optional Stripe coupon ids (empty = no coupon) |
| `EMAIL_FROM` / `GMAIL_EMAIL` / `GMAIL_PASSWORD` | Email for password resets / certificates |

Frontend (`FrontEnd/.env`, see `FrontEnd/.env.example`):

| Variable | Purpose |
| -------- | ------- |
| `VITE_API_URL` | Backend base URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (public, safe in the browser) |

## 📡 API

Base URL: `http://localhost:3000/api/v1` (local). Auth is a JWT in an httpOnly cookie set on login / signup — send requests with credentials (`withCredentials: true` in Axios) instead of storing the token in browser storage.

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/users/signup` | — | Create account (role is always `user`) |
| POST | `/users/login` | — | Log in (rate-limited) |
| POST | `/users/forgotPassword` | — | Request reset link (always returns the same generic response) |
| PATCH | `/users/resetPassword/:token` | — | Reset password with the emailed token |
| PATCH | `/users/updateMyPassword` | User | Change password |
| GET | `/users/me` | User | Current user |
| PATCH | `/users/updateMe` | User | Update name / email / photo |
| GET | `/products` | — | List products (filter / sort / paginate, `limit` capped at 50) |
| GET | `/products/:id` | — | One product, with reviews and votes |
| POST | `/products/myProducts` | Company | Create a product (owner is set server-side) |
| PATCH | `/products/myProducts/:id` | Company | Update your own product |
| DELETE | `/products/myProducts/:id` | Company | Delete your own product |
| GET | `/addToCart/myCart` | User | Cart items + total price |
| POST | `/addToCart/myCart/:id` | User | Add a product to the cart |
| PATCH | `/addToCart/myCart/:id` | User | Change quantity (checked against stock) |
| DELETE | `/addToCart/myCart/:id` | User | Remove one item |
| GET | `/addToCart/Checkout-session` | User | Create a Stripe Checkout Session (no order is created here) |
| POST | `/webhooks/stripe` | Stripe signature | Stripe webhook — creates the order after verified payment |
| GET | `/myOrders` | User | Your past orders |
| GET | `/products/:productId/review` | — | Reviews for a product |
| POST | `/products/:productId/review` | User | Add one review per product |
| GET | `/products/:productId/vote` | — | Votes for a product |
| POST | `/products/:productId/vote` | User | Vote / report a product |

## 💳 Payments — how checkout works

1. The frontend calls `GET /addToCart/Checkout-session`. The backend only decides which coupon applies and creates a Stripe Checkout Session. It does **not** create an order, decrement stock, or deduct reward points.
2. The customer pays on Stripe.
3. Stripe calls `POST /api/v1/webhooks/stripe` with a signed event. The backend verifies the signature with `STRIPE_WEBHOOK_SECRET`, then — inside a Mongoose transaction — creates the order, atomically decrements stock (guarded so it can never go below zero), deducts reward points if the reward coupon was used, and clears the cart. The order is idempotent on the Stripe session id, so retried webhooks cannot create duplicate orders.

Local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
# Use the whsec_... secret it prints as STRIPE_WEBHOOK_SECRET
```

## 🔒 Security notes

- Signup never accepts `role` from the request body; `updateMe` cannot change `role`; generic update/create handlers strip server-computed fields (`owner`, `ratingsAverage`, `soldNum`, `environmentalScore`, `rewardPoints`, …).
- Passwords must be at least 8 characters with at least one letter and one number, and are hashed with bcrypt (cost 12).
- Forgot-password always returns the same generic response, whether or not the email exists, and reset tokens are stored hashed, single-use, 10-minute expiry.
- Auth endpoints have a stricter rate limit (10 attempts / 15 min / IP) on top of the global API limiter.
- No secrets are committed: use `.env.example` / `config.env` (see above) and the `.gitignore` files.

## 📁 Project structure

```
.
├── BackEnd/
│   ├── app.js                  # Express app (webhook mounted before the JSON parser)
│   ├── server.js               # Entry point, fails fast on missing config
│   ├── controller/             # auth, products, cart/checkout, webhook, votes, reviews, users
│   ├── models/                 # Mongoose schemas (incl. unique product+user indexes)
│   ├── routes/                 # Express routers
│   └── utils/                  # APIFeatures (filter/sort/paginate), AppError, email
├── FrontEnd/                   # React + Vite app
│   └── src/
│       ├── components/         # incl. CartModal (Stripe via env key, cookie auth)
│       ├── helper/Storage.js   # user profile only — never stores the JWT
│       └── pages/
└── .github/workflows/ci.yml    # backend syntax check + frontend lint/build
```

## 🤝 Contributing

PRs are welcome. Please keep secrets out of commits, run the frontend lint/build (`npm run lint && npm run build` in `FrontEnd/`), and do not change payment behaviour without updating the webhook flow above.

## 📄 License

MIT — see [LICENSE](LICENSE).
