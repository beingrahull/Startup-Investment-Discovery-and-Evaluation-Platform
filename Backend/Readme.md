# StartupMeu — Backend

Backend API for StartupMeu, a marketplace that connects startups with investors. Founders publish fundraising asks; investors browse and send connection requests; founders accept or decline.

This repo currently contains the backend only. The React frontend is being built against this API.

---

## What's in here

**Auth**
- Register / login / logout
- Passwords hashed with bcrypt via a `pre('save')` hook on the User model
- JWT issued on login and stored in an httpOnly cookie
- Logout blacklists the token in a `Blacklist` collection with a TTL index, so entries expire when the token would have expired anyway
- `GET /api/auth/me` for session restore on page load

**Asks**
- Founders create asks with the usual fields — startup name, tagline, description, industry, stage, funding goal, equity offered, use of funds, traction, team size, pitch deck
- Feed is paginated and filterable by industry, stage, text search, and funding range
- Any authenticated user can browse the feed; only founders can create

**Connections**
- Investors send a request against an ask with an optional message
- Unique index on `(investor, ask)` blocks duplicate requests
- Founders see received requests; investors see sent ones
- Founders accept or decline; only the owner of the ask can act on it

**Access control**
- `verifyToken` middleware for authenticated routes
- `requireRole` middleware for founder-only / investor-only routes
- Ownership checks in the controller where route-level role checks aren't enough

---

## Stack

- Node + Express
- MongoDB via Mongoose
- jsonwebtoken, bcryptjs, cookie-parser
- express-validator for request validation
- cors (credentials enabled)

---

## Project layout
Backend/
├── controllers/ request handlers
├── db/ mongo connection
├── middleware/ auth, role, validation, error handler
├── models/ User, Ask, Connection, Blacklist
├── routes/ auth, asks, connections
├── app.js express app
└── server.js entry point

text

---

## Running it locally

You need Node 18+ and a MongoDB instance (Atlas works fine).
cd Backend
npm install
cp .env.example .env

text

Fill in `.env`:
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

text

A couple of MongoDB gotchas worth knowing:

- Whitelist your IP under Network Access in Atlas
- The database name in the URI has to be 38 bytes or less — MongoDB rejects longer names

Start the server:
node server.js

text

You should see:
Connection Established to DB
🚀 Server live at 3000

text

Base URL is `http://localhost:3000`.

---

## API

Everything returns `{ success, ... }` on success and `{ success: false, message, errors? }` on failure.

### Auth

| Method | Path | Access | Body |
|---|---|---|---|
| POST | `/api/auth/register` | public | `{ name, email, password, role, profile }` |
| POST | `/api/auth/login` | public | `{ email, password }` |
| POST | `/api/auth/logout` | public | — |
| GET | `/api/auth/me` | auth | — |

### Asks

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/asks` | founder | create |
| GET | `/api/asks` | auth | query params: `industry`, `stage`, `q`, `minGoal`, `maxGoal`, `page`, `limit` |
| GET | `/api/asks/:id` | auth | detail, founder populated |

### Connections

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/connections` | investor | body: `{ ask, message? }` |
| GET | `/api/connections/mine` | auth | role-scoped: sent for investors, received for founders |
| PATCH | `/api/connections/:id` | founder | body: `{ status: "accepted" \| "declined" }` |

### Status codes

- `400` malformed ObjectId or input shape
- `401` unauthenticated / token revoked
- `403` wrong role
- `409` duplicate email or duplicate connection
- `422` validation errors (returned as `errors: [{ field, message }]`)
- `500` server error

---

## Notes on some decisions

**Single User model with a role enum.** Founders and investors share auth, and the profile subdocument holds role-specific fields. A `pre('validate')` hook strips fields that don't belong to the current role, so a founder can't accidentally persist investor-only data. Splitting into two collections would have duplicated auth and complicated the connection model.

**JWT in an httpOnly cookie** rather than localStorage. The token isn't reachable from JavaScript, which closes off XSS as a path to stealing sessions.

**Blacklist with a TTL index** rather than a fixed-duration access token + refresh token. Simpler to reason about, and the TTL index means the collection self-prunes — entries only live until the token would have expired anyway.

**Role checks at the route layer, ownership checks in the controller.** `requireRole("founder")` gets a request past the door; the controller still verifies that the ask or connection belongs to the caller. Both checks matter.

**Parallel queries in the feed.** `listAsks` runs `find` and `countDocuments` under `Promise.all` — one round trip instead of two.

---

## Testing

Everything was tested with Postman. A working sequence:

1. Register a founder, log in
2. Create an ask, confirm it shows up in `GET /api/asks`
3. Register and log in as an investor
4. Send a connection against the ask
5. Send it again — expect `409`
6. Log back in as the founder, see the request in `GET /api/connections/mine`
7. `PATCH` to accept
8. Log out, then re-send the old token — expect `401 Token revoked`

---

## AI tooling

I used **Code0** through the Cline extension in VS Code. I brought it in after the backend architecture was already in place and used it mainly for review rather than generation.

Things it actually did:

- Caught that my `auth.middleware` was hitting the blacklist collection *before* verifying the JWT signature. Reordering means invalid tokens never touch the database.
- Suggested replacing two sequential queries in `listAsks` with `Promise.all`.
- Helped trace a `422 Invalid industry` error back to the frontend sending the display label (`AI / ML`) instead of the enum value (`ai_ml`). I fixed it by moving the enum to a `{value, label}` structure on both sides.
- Pointed out that my error middleware returned the email-duplicate message for *any* `11000` error. That was fine when `User` was the only model with a unique index, but broken once `Connection` got one. Updated to inspect `err.keyPattern`.

It was less useful for domain modeling — its suggestions for the Ask schema were generic and I didn't use them.

---

## Not done yet

- `GET /api/asks/mine` — founder's own listings including drafts
- `PATCH /api/asks/:id` and `DELETE /api/asks/:id`
- Frontend

---

## License

Built as a technical evaluation for StartupMeu.