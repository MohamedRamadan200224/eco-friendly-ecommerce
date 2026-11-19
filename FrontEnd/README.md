# FrontEnd — GreenGray web app

React 18 + Vite app for the GreenGray sustainable e-commerce platform. It talks to the backend **only over HTTP** (see below) — there is no shared code and no imports across the frontend/backend boundary.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL (and the Stripe publishable key)
npm run dev            # Vite dev server, http://localhost:5173 by default
```

The backend must be running for the app to show any data (see the repo-root README for the end-to-end steps, including `npm run seed` in `BackEnd/`).

## Environment variables

| Variable | Purpose |
| -------- | ------- |
| `VITE_API_URL` | Backend base URL (default `http://localhost:3000`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (public, safe in the browser — never put a Stripe *secret* key here) |

## Scripts

| Script | What it does |
| ------ | ------------ |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `js,jsx` (must pass with zero warnings) |

## Data — no mock data

There is no mock data in the frontend anymore. Every product, review and vote comes from the backend API, backed by the MongoDB database seeded with `npm run seed` in `BackEnd/`. If the catalogue is empty, the backend is either not running or not seeded — check `VITE_API_URL` and run the seed.

Auth is a JWT in an httpOnly cookie set on login / signup; requests are sent with credentials (`withCredentials: true` in Axios). The token is never stored in browser storage.
