# FifthCusp Express Backend

REST API backend for the FifthCusp astrology platform and admin panel, built with **Express.js + TypeScript + MongoDB**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Language | TypeScript 5 |
| Framework | Express 4 |
| Database | MongoDB via Mongoose |
| Auth | JWT (access + refresh tokens) |
| Password hashing | bcryptjs |
| Validation | Zod |
| Env validation | envalid |
| Security | helmet, cors, express-mongo-sanitize, hpp |
| Rate limiting | express-rate-limit, express-slow-down |
| Payment (planned) | Razorpay |

---

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB (local or Atlas)
- npm

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd fifthcusp-express-be

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values (MongoDB URI, JWT secrets, SMTP, etc.)

# 4. Start dev server
npm run dev
```

The server starts at `http://localhost:5000`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |

---

## Environment Variables

Copy `.env.example` to `.env`. All variables are validated at startup via **envalid** — the server will exit immediately with a descriptive error if any required variable is missing or malformed.

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default: 5000) |
| `NODE_ENV` | `development` / `production` / `test` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address for outgoing emails |

---

## API Overview

### Base URL
```
/api/v1
```

### Health check
```
GET /api/v1/health
```

### Auth
```
POST /api/v1/auth/login            — login, returns accessToken + refreshToken
POST /api/v1/auth/refresh          — get new accessToken using refreshToken
POST /api/v1/auth/logout           — invalidate refreshToken
GET  /api/v1/auth/me               — own profile (requires auth)
PUT  /api/v1/auth/change-password  — change password (requires auth)
```

### Users (admin panel)
```
POST   /api/v1/users        — create user [admin only]
GET    /api/v1/users        — list users  [admin, manager]
GET    /api/v1/users/:id    — get user    [admin, manager]
PUT    /api/v1/users/:id    — update user [admin only]
DELETE /api/v1/users/:id    — delete user [admin only]
```

All authenticated endpoints require:
```
Authorization: Bearer <accessToken>
```

### Response format
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## RBAC

Three roles:

| Role | Permissions |
|---|---|
| `admin` | Full access — create/update/delete users, manage all resources |
| `manager` | Manage content and bookings, read users, cannot modify users |
| `employee` | Read-only on most resources |

Users are created exclusively by admins — there is no public registration endpoint.

---

## Security

- **helmet** — HTTP security headers
- **CORS** — whitelist-based origin control
- **express-mongo-sanitize** — prevents NoSQL injection (`$gt`, `$where`, etc.)
- **hpp** — prevents HTTP parameter pollution attacks
- **bcryptjs** — passwords hashed with salt rounds = 12
- **Rate limiting** — 100 req/15min globally, 10 req/15min on auth routes
- **express-slow-down** — progressive delay after 50 req/min (DDoS mitigation)
- **Body size limit** — 10kb cap on all JSON payloads
- **JWT TTL** — access tokens expire in 15 min; refresh tokens in 7 days
- **Refresh token DB storage** — tokens invalidated on logout and password change; MongoDB TTL index auto-cleans expired tokens

---

## Project Structure

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for the annotated directory tree and guide on adding new features.
