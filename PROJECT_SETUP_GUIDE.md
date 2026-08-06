# Netflix Clone — Complete Project Setup Guide

> **Last updated:** 2026-06-30  
> **GitHub:** https://github.com/piyushm-collab/Netflix-Clone  
> **Branch:** `main` (production-ready) | `payment-auth-integration` (feature branch, already merged)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What Was There Before (Original Project)](#2-what-was-there-before-original-project)
3. [What Changed (New Features Added)](#3-what-changed-new-features-added)
4. [Complete File Structure](#4-complete-file-structure)
5. [Prerequisites](#5-prerequisites)
6. [First-Time Setup (Fresh Clone)](#6-first-time-setup-fresh-clone)
7. [Daily Development Workflow](#7-daily-development-workflow)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [All API Endpoints](#9-all-api-endpoints)
10. [Payment Auth Flow — How It Works](#10-payment-auth-flow--how-it-works)
11. [Key Engineering Concepts (Resume Points)](#11-key-engineering-concepts-resume-points)
12. [All Routes in the Frontend](#12-all-routes-in-the-frontend)
13. [Troubleshooting](#13-troubleshooting)
14. [Git History Summary](#14-git-history-summary)

---

## 1. Project Overview

A full-stack Netflix-style web application with:

- **Netflix UI** — home page, browse (movies, TV, trending), search, trailers
- **Custom Auth** — register/login with JWT (no Supabase, no paid service)
- **OTP Payment Auth** — subscription plans (Basic/Standard/Premium) verified via a 6-digit OTP challenge (mirrors production EMV 3DS patterns)
- **TMDB Integration** — real movie/TV data via The Movie Database API

```
Stack:
  Frontend  →  React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
  Backend   →  Node.js + Express (custom, no framework lock-in)
  Auth      →  JWT (jsonwebtoken) + bcryptjs, stored in localStorage
  OTP Store →  In-memory with TTL (no Redis/DB needed — runs zero services)
  Movie API →  TMDb API v3 (free tier, 1000 req/day)
```

---

## 2. What Was There Before (Original Project)

The project was a React + TypeScript Netflix clone that used:

| Old Component | What It Did |
|---|---|
| `@supabase/supabase-js` | Auth (sign up, sign in, session management) |
| `@supabase/auth-helpers-react` | React hooks for Supabase auth state |
| `SupabaseProvider.tsx` | Provided Supabase client to all components |
| `AuthContext.tsx` | Wrapped Supabase session as React context |
| `lib/supabase.ts` | All Supabase auth functions (signIn, signUp, signOut, resetPassword) |
| `lib/database.ts` / `lib/db-browser.ts` | Supabase DB queries (profiles, watchlist, signin_attempts, active_sessions, security_audit_log) |
| `ProfilePage.tsx` | Fetched user profile from Supabase `profiles` table |
| `BrowsePage.tsx` | Fetched signin logs from Supabase `signin_logs` table |
| `MyListPage.tsx` | Fetched/managed watchlist from Supabase `user_watchlist` table |

**Why Supabase was removed:**  
Supabase requires an account, a remote project, and specific DB tables that are private. The project could not run without those credentials. We replaced it with a self-contained Express backend that runs locally with zero external dependencies.

---

## 3. What Changed (New Features Added)

### A. Supabase → Custom JWT Backend

| Old | New |
|---|---|
| `lib/supabase.ts` (real) | `lib/supabase.ts` (stub — prevents import errors) |
| `SupabaseProvider.tsx` (real) | `SupabaseProvider.tsx` (passthrough `<></>` — import kept to avoid breaking App.tsx) |
| `context/AuthContext.tsx` — used Supabase session | Rewritten — reads JWT from localStorage, calls `/api/auth/me` on load |
| `SignInForm.tsx` — called Supabase `signIn()` | Calls `POST /api/auth/login` via apiClient |
| `SignUpForm.tsx` — called Supabase `signUp()` | Calls `POST /api/auth/register` via apiClient, added `fullName` field |
| `ProfilePage.tsx` — fetched from Supabase `profiles` | Uses `user` from `useAuth()` directly, shows subscription status |
| `BrowsePage.tsx` — fetched Supabase signin logs | Cleaned — shows subscription status + "Choose a Plan" link |
| `MyListPage.tsx` — Supabase `user_watchlist` table | localStorage-based watchlist (no DB needed) |

### B. New Files Added

| File | Purpose |
|---|---|
| `project/server/index.js` | Express app entry point — port 3001 |
| `project/server/store.js` | In-memory store: users Map, transactions Map, otps Map |
| `project/server/middleware/auth.js` | JWT verification middleware — attaches `req.user` |
| `project/server/routes/auth.js` | `POST /register`, `POST /login`, `GET /me` |
| `project/server/routes/subscriptions.js` | Full OTP payment state machine |
| `project/src/lib/apiClient.ts` | Axios instance — auto-injects JWT from localStorage |
| `project/src/pages/Plans/PlansPage.tsx` | Plan selection UI (Basic/Standard/Premium cards) |
| `project/src/pages/Payment/PaymentPage.tsx` | OTP entry + verification UI with live status display |

### C. Modified Config Files

| File | Change |
|---|---|
| `project/vite.config.js` | Added `server.proxy` — `/api` → `http://localhost:3001` |
| `project/package.json` | Added `express`, `cors` deps; added `server` and `dev:full` scripts |
| `project/src/App.tsx` | Added `/plans` and `/payment/:transactionId` routes |
| `project/src/components/Navbar/BrowseNavbar.tsx` | Added "Plans" nav link |
| `project/.env.example` | Removed Supabase vars, added `JWT_SECRET` |
| `README.md` | Full rewrite with setup instructions and API table |

---

## 4. Complete File Structure

```
Netflix-Clone/
├── PROJECT_SETUP_GUIDE.md          ← this file
├── README.md                       ← quick-start README
├── package.json                    ← root (if any)
└── project/                        ← THE ACTUAL APP (work inside here)
    ├── package.json                ← all deps live here
    ├── vite.config.js              ← Vite config + /api proxy
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example                ← copy to .env, fill in TMDB key
    │
    ├── server/                     ← Express backend (NEW)
    │   ├── index.js                ← app start, port 3001
    │   ├── store.js                ← in-memory users/transactions/otps
    │   ├── middleware/
    │   │   └── auth.js             ← JWT middleware
    │   └── routes/
    │       ├── auth.js             ← register, login, me
    │       └── subscriptions.js   ← plans, OTP send/verify, state machine
    │
    └── src/
        ├── App.tsx                 ← router — all page routes
        ├── main.jsx                ← React entry point
        ├── index.css               ← global styles
        │
        ├── api/
        │   ├── axios.ts            ← TMDB axios instance
        │   ├── requests.ts         ← TMDB API URL constants
        │   ├── tmdbApi.ts          ← TMDB helper functions
        │   └── tmdbSearch.ts       ← TMDB search helpers
        │
        ├── components/
        │   ├── auth/
        │   │   ├── SignInForm.tsx   ← CHANGED: calls /api/auth/login
        │   │   ├── SignUpForm.tsx   ← CHANGED: calls /api/auth/register + fullName field
        │   │   └── ForgotPasswordForm.tsx
        │   ├── Banner/Banner.tsx
        │   ├── Navbar/
        │   │   ├── BrowseNavbar.tsx ← CHANGED: added Plans link
        │   │   └── Navbar.tsx
        │   ├── ProtectedRoute.tsx  ← UNCHANGED — reads useAuth().user
        │   ├── Row/Row.tsx
        │   ├── SearchBar/SearchBar.tsx
        │   └── TrailerModal.tsx
        │
        ├── context/
        │   ├── AuthContext.tsx      ← REWRITTEN: localStorage JWT, no Supabase
        │   └── SupabaseProvider.tsx ← GUTTED: passthrough only (kept for import compat)
        │
        ├── lib/
        │   ├── apiClient.ts        ← NEW: axios with auto JWT header
        │   ├── supabase.ts         ← STUBBED: exports null/no-ops
        │   ├── supabase.js         ← STUBBED: exports null/no-ops
        │   ├── database.ts         ← STUBBED: no-op
        │   └── db-browser.ts       ← STUBBED: no-op
        │
        └── pages/
            ├── Home/NetflixHome.tsx
            ├── SignIn/SignInPage.tsx
            ├── SignUp/SignUpPage.tsx
            ├── ForgotPassword/ForgotPasswordPage.tsx
            ├── Browse/
            │   ├── BrowsePage.tsx   ← CHANGED: no Supabase, shows subscription hint
            │   ├── MoviesPage.tsx
            │   ├── TVShowsPage.tsx
            │   ├── NewPopularPage.tsx
            │   └── MyListPage.tsx   ← CHANGED: localStorage watchlist
            ├── Profile/
            │   └── ProfilePage.tsx  ← REWRITTEN: shows subscription from useAuth()
            ├── Plans/
            │   └── PlansPage.tsx    ← NEW: Basic/Standard/Premium plan cards
            ├── Payment/
            │   └── PaymentPage.tsx  ← NEW: OTP send + verify + status display
            └── NetflixShow/NetflixShow.tsx
```

---

## 5. Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | comes with Node.js |
| Git | any | https://git-scm.com |
| TMDb API Key | free | https://www.themoviedb.org/settings/api |

You do **NOT** need:
- Docker
- Redis
- MySQL / PostgreSQL
- Supabase account
- Any paid service

---

## 6. First-Time Setup (Fresh Clone)

### Step 1 — Clone the repo

```bash
git clone https://github.com/piyushm-collab/Netflix-Clone.git
cd Netflix-Clone/project
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create your `.env` file

```bash
cp .env.example .env
```

Edit `.env` and fill in your TMDb API key:

```env
# Backend config (no changes needed for local dev)
JWT_SECRET=netflix-dev-secret-change-in-prod

# Get your free API key from https://www.themoviedb.org/settings/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

> TMDb API key is free. Sign up → Settings → API → Create → Developer → copy "API Key (v3 auth)".

### Step 4 — Start the backend

Open **Terminal 1**:

```bash
cd Netflix-Clone/project
node server/index.js
```

Expected output:
```
[Payment Auth Backend] running on http://localhost:3001
```

### Step 5 — Start the frontend

Open **Terminal 2**:

```bash
cd Netflix-Clone/project
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Step 6 — Open the app

Go to: **http://localhost:5173**

---

## 7. Daily Development Workflow

### Option A — Two terminals (recommended for debugging)

```bash
# Terminal 1 — backend
cd Netflix-Clone/project && node server/index.js

# Terminal 2 — frontend
cd Netflix-Clone/project && npm run dev
```

### Option B — One command

```bash
cd Netflix-Clone/project && npm run dev:full
```

### Test the full payment flow

```bash
# 1. Open http://localhost:5173/signup — create an account
# 2. Click "Plans" in the navbar
# 3. Click "Get Premium"
# 4. Click "Send OTP" — watch Terminal 1 for the OTP line:
#    [OTP DEMO] transactionId=xxx  OTP=123456  (copy this into the UI)
# 5. Type that OTP in the input field
# 6. Click "Verify & Activate Subscription"
# 7. You're redirected to /profile — plan shows as Active
```

### Quick backend API test (without UI)

```bash
# Health check
curl http://localhost:3001/api/health

# Register a user
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@test.com","password":"pass1234","fullName":"Your Name"}'

# Copy the token from above, then:
TOKEN="paste_token_here"

# Initiate a Premium subscription
curl -s -X POST http://localhost:3001/api/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planName":"Premium"}'

# Copy the transaction id, then send OTP:
TXN_ID="paste_txn_id_here"
curl -s -X POST http://localhost:3001/api/subscriptions/$TXN_ID/otp/send \
  -H "Authorization: Bearer $TOKEN"
# Watch server console for OTP

# Verify with the OTP from console:
curl -s -X POST http://localhost:3001/api/subscriptions/$TXN_ID/otp/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456"}'
```

---

## 8. Environment Variables Reference

### `project/.env` (frontend + runtime)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_TMDB_API_KEY` | YES | — | TMDb API v3 key — get free at themoviedb.org |
| `JWT_SECRET` | NO | `netflix-dev-secret-change-in-prod` | Secret used to sign JWTs in the backend |
| `VITE_TMDB_USERNAME` | NO | — | TMDb username (optional, for watchlist sync) |
| `VITE_TMDB_PASSWORD` | NO | — | TMDb password (optional, for watchlist sync) |

> `VITE_*` prefix makes variables available in the browser bundle.  
> `JWT_SECRET` without the `VITE_` prefix stays server-only (read by `node server/index.js`).

### How the Vite proxy works

`vite.config.js` has:
```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:3001', changeOrigin: true }
  }
}
```

So `apiClient.post('/auth/login')` in React → Vite dev server → `http://localhost:3001/api/auth/login`.  
**No CORS issues in dev.** In production, you'd deploy the Express server separately and set `VITE_API_URL`.

---

## 9. All API Endpoints

Base URL (dev): `http://localhost:3001`

### Auth

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{ email, password, fullName, phone? }` | `{ token, user: { id, email, fullName } }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, user: { id, email, fullName, subscription } }` |
| GET | `/api/auth/me` | JWT | — | `{ id, email, fullName, subscription, createdAt }` |
| GET | `/api/health` | No | — | `{ status: "ok", timestamp }` |

### Subscriptions / Payment

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/subscriptions` | JWT | `{ planName }` | Transaction object (status: CREATED) |
| POST | `/api/subscriptions/:id/otp/send` | JWT | — | `{ transactionId, message, resendCount }` |
| POST | `/api/subscriptions/:id/otp/verify` | JWT | `{ otp }` | Transaction object (status: PAYMENT_COMPLETE) |
| GET | `/api/subscriptions/:id` | JWT | — | Transaction object |
| GET | `/api/subscriptions/active` | JWT | — | `{ subscription }` |

### Plans available

| Plan | Body value | Monthly |
|---|---|---|
| Basic | `"planName": "Basic"` | ₹199 (19900 paise) |
| Standard | `"planName": "Standard"` | ₹499 (49900 paise) |
| Premium | `"planName": "Premium"` | ₹799 (79900 paise) |

### Error response shape (all endpoints)

```json
{ "error": "Human-readable error message" }
```

HTTP status codes used: `400` (bad input), `401` (unauthenticated), `403` (forbidden), `404` (not found), `409` (state conflict), `429` (rate limit).

---

## 10. Payment Auth Flow — How It Works

### State Machine

Every subscription transaction has two fields that always move together:

```
TransactionPhase  →  WHERE in the flow
TransactionStatus →  WHAT happened

CREATED          (phase: INITIATED)
    ↓  [POST /otp/send]
OTP_SENT         (phase: CHALLENGE)    ← OTP stored in memory with 5min TTL
    ↓  [POST /otp/verify — correct OTP]
PAYMENT_COMPLETE (phase: COMPLETED)   ← user.subscription updated
    
Side paths:
OTP_SENT  →  OTP_SENT  (resend, max 3 times)
Any state → FAILED / TIMED_OUT
```

### Security properties

| Property | Implementation |
|---|---|
| OTP TTL | 5 minutes — checked on verify via `Date.now() > otpRecord.expiresAt` |
| Resend limit | Max 3 per transaction — counter stored in `otps` Map |
| OTP never in API response | Only printed to server console |
| JWT expiry | 24 hours |
| Password storage | bcryptjs with salt rounds 10 |
| Ownership check | `txn.email !== req.user.email` → 403 |
| Terminal state guard | `PAYMENT_COMPLETE` / `FAILED` → no further transitions |

### How OTP works in demo mode

The OTP is generated server-side with `Math.random()` (sufficient for demo), stored in the server's in-memory `otps` Map, and printed to the console:

```
[OTP DEMO] transactionId=abc123  OTP=317670  (copy this into the UI)
```

In a production system you'd replace the `console.log` line in `server/routes/subscriptions.js` with a Twilio / AWS SNS / SMTP call.

---

## 11. Key Engineering Concepts (Resume Points)

These are the concepts to explain in interviews:

### 1. Dual-State Transaction Model
```
TransactionPhase + TransactionStatus always update together.
"I learned this from production EMV 3DS systems where out-of-sync 
states corrupt downstream settlement reporting."
```
See: `server/routes/subscriptions.js` → `phaseFor()` function + `updateTransaction()` calls.

### 2. Explicit State Machine
```js
const TRANSITIONS = {
  CREATED:          ['OTP_SENT'],
  OTP_SENT:         ['OTP_VERIFIED', 'OTP_SENT'],   // OTP_SENT allows resend
  OTP_VERIFIED:     ['PAYMENT_COMPLETE'],
  PAYMENT_COMPLETE: [],                              // terminal
  FAILED:           [],                              // terminal
};
```
Illegal transitions return HTTP 409 Conflict, not a silent no-op.

### 3. In-Memory TTL Store (Redis pattern without Redis)
OTPs use `expiresAt: Date.now() + 5 * 60 * 1000` checked on every verify call. Same pattern as Redis `SETEX` — no scheduler needed.

### 4. JWT Stateless Auth
```
Register/Login → JWT signed with HS256 → stored in localStorage
Every request → Authorization: Bearer <token> → verified in middleware
No session table, no cookies, no server-side state for auth
```

### 5. Rate Limiting Without Middleware Libraries
```js
const resendCount = (existing?.resendCount || 0) + 1;
if (resendCount > 3) return res.status(429).json({ error: '...' });
```
Tracks attempts in the same in-memory store — no Redis, no external library.

### 6. Masked Logging
OTP is never returned in the API response body. Only printed to server stdout. In production this line becomes a Twilio/SMS call. Phone numbers would be masked (`98****10` format).

### 7. Protected Routes Pattern (React)
```tsx
// ProtectedRoute.tsx — unchanged, works with new auth
// It reads useAuth().user — truthy = logged in, null = redirect to /signin
```
The AuthContext rewrite maintained the same interface so ProtectedRoute needed zero changes.

---

## 12. All Routes in the Frontend

| Path | Protected | Component | Description |
|---|---|---|---|
| `/` | No | `NetflixHome` | Landing page |
| `/signup` | No | `SignUpPage` | Registration form |
| `/signin` | No | `SignInPage` | Login form |
| `/forgot-password` | No | `ForgotPasswordPage` | Password reset |
| `/browse` | Yes | `BrowsePage` | Main browse with movie rows |
| `/browse/movies` | Yes | `MoviesPage` | Movies only |
| `/browse/tv-shows` | Yes | `TVShowsPage` | TV shows only |
| `/browse/new-popular` | Yes | `NewPopularPage` | Trending content |
| `/browse/my-list` | Yes | `MyListPage` | localStorage watchlist |
| `/profile` | Yes | `ProfilePage` | User info + subscription status |
| `/plans` | Yes | `PlansPage` | Plan selection cards |
| `/payment/:transactionId` | Yes | `PaymentPage` | OTP entry + verification |

---

## 13. Troubleshooting

### "Cannot connect to backend" / API calls fail silently

1. Make sure backend is running: `node server/index.js` in `project/`
2. Check it responds: `curl http://localhost:3001/api/health`
3. Vite proxy routes `/api` to `:3001` — both must be running simultaneously

### OTP field shows but "Invalid OTP"

- Look in **Terminal 1** (backend) for the line:  
  `[OTP DEMO] transactionId=xxx  OTP=123456`
- Each "Send OTP" generates a NEW OTP — always use the latest one
- OTP expires after 5 minutes — click "Resend OTP" if needed

### "Token expired" / kicked to sign in on page refresh

The backend is in-memory — **restarting `node server/index.js` wipes all users and tokens**. Sign in again after restart. This is expected for a demo/portfolio project.

### TypeScript errors after pulling changes

```bash
cd project && npx tsc --noEmit
```

If errors mention Supabase types — those files are stubbed and safe to ignore.

### "Plans" link not visible in navbar

You must be logged in (on `/browse` or any protected route). The `BrowseNavbar` only renders for authenticated users.

### Movies not loading / blank rows

You need a TMDb API key in `.env`:
```
VITE_TMDB_API_KEY=your_key_here
```
Get it free at https://www.themoviedb.org/settings/api → Create → Developer.

### Git push fails — "Permission denied"

The repo is owned by `piyushm-collab`. If pushing from a different machine:
```bash
gh auth login    # log in as piyushm-collab
cd Netflix-Clone
git remote set-url origin https://github.com/piyushm-collab/Netflix-Clone.git
git push origin main
```

If you get the `url.insteadOf` SSH rewrite issue (git converts HTTPS to SSH):
```bash
git config --global --unset url.git@github.com:.insteadof
```

---

## 14. Git History Summary

```
caa6ad4  feat: remove all Supabase from BrowsePage/MyListPage, stub db libs
a7e54e7  feat: ProfilePage shows subscription status, update README + env config
2ba5492  feat: Plans page (plan picker) and Payment/OTP page, wire into router + BrowseNavbar
69b87e0  feat: replace Supabase with custom JWT auth — AuthContext, SignIn/SignUp forms, apiClient, Vite proxy
1032b3d  feat: Express backend — auth routes, JWT middleware, in-memory store, subscription OTP state machine
ea0fe22  (pre-feature) last commit before payment auth integration
```

### What each commit did

**`1032b3d`** — Created the entire `project/server/` directory:
- `server/index.js` — Express app, CORS, routes
- `server/store.js` — in-memory users/transactions/OTPs
- `server/middleware/auth.js` — JWT middleware
- `server/routes/auth.js` — register, login, me
- `server/routes/subscriptions.js` — full OTP state machine

**`69b87e0`** — Removed Supabase from all frontend auth:
- `lib/apiClient.ts` — new axios instance with auto-JWT
- `context/AuthContext.tsx` — rewritten with localStorage JWT
- `context/SupabaseProvider.tsx` — gutted to passthrough
- `lib/supabase.ts` + `lib/supabase.js` — stubbed
- `SignInForm.tsx`, `SignUpForm.tsx` — call our backend now
- `vite.config.js` — added `/api` proxy

**`2ba5492`** — Built the payment UI:
- `pages/Plans/PlansPage.tsx` — 3 plan cards with subscribe buttons
- `pages/Payment/PaymentPage.tsx` — OTP send/verify UI with status display
- `App.tsx` — added `/plans` and `/payment/:transactionId` routes
- `BrowseNavbar.tsx` — added Plans nav link

**`a7e54e7`** — Cleanup and polish:
- `pages/Profile/ProfilePage.tsx` — shows active subscription
- `.env.example` — updated, removed Supabase vars
- `README.md` — full rewrite

**`caa6ad4`** — Final Supabase removal:
- `pages/Browse/BrowsePage.tsx` — removed Supabase signin logs, added subscription hint
- `pages/Browse/MyListPage.tsx` — replaced Supabase watchlist with localStorage
- `lib/database.ts`, `lib/db-browser.ts` — stubbed

---

*This guide covers everything needed to clone, run, understand, and extend the project.*
