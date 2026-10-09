# StartupMeu Marketplace

**Status:** Functional MVP — core features implemented, manual testing completed.

A MERN marketplace for founders and investors. Auth uses JWT in httpOnly cookies with a TTL-indexed blacklist for revocation. Role and ownership checks are enforced at both the UI and API layers.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React.js (Vite), Plain CSS (design tokens in `index.css`) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| ODM | Mongoose |
| Auth | JWT, bcryptjs, httpOnly cookies |
| Validation | express-validator |

---

## System Architecture

### 1. Security and Authorization

- **Role-based access control (RBAC):** Implemented via `requireRole` middleware. Access is gated at the route level based on the user's role (founder or investor).
- **Ownership-level authorization:** To prevent unauthorized data mutation, controllers verify that `req.user.id` matches the owner of the resource (e.g., an Ask or a Connection) before processing updates.
- **Session management:** Uses JWTs stored in httpOnly cookies to mitigate XSS risks.
- **Token revocation:** Implements a blacklist in MongoDB. A TTL (Time-To-Live) index is applied to the `expiresAt` field, allowing the database to automatically prune revoked tokens once they reach their natural expiry.

### 2. Database Design and Performance

- **Denormalization:** The Connection model includes the `founder` ID. This allows the founder's inbox query to use a direct index lookup rather than a `$lookup` join against the Ask collection, reducing query cost and latency.
- **Indexing:** Compound indexes are applied to the Ask collection on `{ status: 1, industry: 1, stage: 1, createdAt: -1 }` to support efficient filtering.
- **Schema integrity:** Mongoose `pre-validate` hooks strip profile fields that do not match the user's role (e.g., removing investor-specific fields from a founder profile), ensuring the collection remains internally consistent.

---

## Folder Structure

```text
StartupMeu/
├── Backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Request handlers
│   ├── middleware/         # auth, role, validation, error
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── error.middleware.js
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── app.js              # Express app configuration
│   └── server.js           # Entry point
└── Frontend/
    ├── src/
    │   ├── api/            # API client wrapper
    │   ├── components/     # Reusable UI components
    │   ├── context/        # AuthContext, ToastContext
    │   ├── pages/          # Page-level components
    │   ├── routes/         # Protected and role-based routes
    │   └── utils/          # Enums and formatters
    └── vite.config.js
```

---

## API Reference

### HTTP Status Codes

| Code | Meaning | Use Case |
| :--- | :--- | :--- |
| 200 | OK | Successful GET or PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Malformed ObjectId (`CastError`) |
| 401 | Unauthorized | Missing or invalid JWT / blacklisted token |
| 403 | Forbidden | Role mismatch or ownership violation |
| 409 | Conflict | Duplicate email or duplicate connection |
| 422 | Unprocessable Entity | Validation failed (express-validator) |

### Authentication

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and set httpOnly cookie |
| POST | `/api/auth/logout` | Public | Revoke token via blacklist |
| GET | `/api/auth/me` | Auth | Get current user session |

### Asks

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/asks` | Founder | Create a new listing |
| GET | `/api/asks` | Auth | List asks (with filtering/pagination) |
| GET | `/api/asks/mine` | Founder | List asks owned by user |
| GET | `/api/asks/:id` | Auth | Get single ask details |

### Connections

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/connections` | Investor | Send connection request |
| GET | `/api/connections/mine` | Auth | List requests (role-scoped) |
| PATCH | `/api/connections/:id` | Founder | Accept or decline request |

---

## Setup and Installation

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance
- Whitelist your IP in MongoDB Atlas under **Network Access**
- Database names must be ≤ 38 bytes

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/startupmeu.git
   cd StartupMeu
   ```

2. **Backend Setup:**
   ```bash
   cd Backend
   npm install
   ```

   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

   Run the server:
   ```bash
   npm run dev
   ```
   The `dev` script uses `nodemon` for auto-restart on save. For a one-off run without nodemon, use `npm start`.

3. **Frontend Setup:**
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```

---

## Running the Application

To run the full stack, open two terminals.

**Terminal 1 — Backend:**
```bash
cd Backend
npm run dev
```
Expected output:
```
Connection Established to DB
 Server is live at 3000
```

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
```
Expected output (approximate):
```
VITE v5.x.x  ready in 300ms
➜  Local:   http://localhost:5173/
```

Navigate to **http://localhost:5173** to access the application.

---

## Verification Steps

To verify the core flows, use Postman or cURL:

1. **Register:** `POST /api/auth/register` with `role: "founder"`.
2. **Login:** `POST /api/auth/login` — receives the httpOnly cookie. Postman stores it automatically.
3. **Create Ask:** `POST /api/asks` using the session cookie. Expect `201`.
4. **Connect:** Register a second user as `investor`, log in, and `POST /api/connections` targeting the Ask ID from step 3. Expect `201`. Sending it again should return `409`.
5. **Respond:** Log in as the original founder and `PATCH /api/connections/:id` with `{"status": "accepted"}`. Expect `200` and `connection.status === "accepted"`.
6. **Revocation check:** `POST /api/auth/logout`, then manually re-send the old token in a `Cookie` header to `GET /api/auth/me`. Expect `401 Token revoked`.

---

## AI Development Experience

**Tool Used:** Code0

I used Code0 as a coding assistant to improve development velocity. I maintained full control over the architecture and implementation, using the tool for specific, verifiable tasks.

**Specific tasks completed using the AI tool:**

- **Auth middleware review (`middleware/auth.middleware.js`):**
  Prompted Code0 to audit the middleware order between JWT verification and the blacklist lookup. It flagged that my initial version queried the Blacklist collection before verifying the token signature — meaning invalid tokens could still hit the database. I reordered so `jwt.verify` runs first, and the DB lookup only happens for tokens that pass signature validation.

- **Query optimization in `ask.controller.js`:**
  Asked Code0 to review the paginated `listAsks` function. It suggested running `Ask.find(...)` and `Ask.countDocuments(...)` under `Promise.all` instead of sequentially, cutting the response time to the slower of the two queries rather than the sum. Applied and confirmed with Postman.

- **Error handler audit (`middleware/error.middleware.js`):**
  Prompted Code0 to identify error types my global handler wasn't catching. It pointed out that malformed MongoDB ObjectIds (`CastError`) were falling through to the generic 500 response. Added a dedicated branch returning 400 with the invalid field and value.

- **Enum consistency check:**
  Asked Code0 to compare the industry enum in `ask.model.js` against the list in `ask.middleware.js`. It confirmed they were duplicated and prone to drift. I maintained the duplication for this MVP but identified the need for a centralized constants file for future refactoring.

- **README sanity check:**
  Used Code0 to review the README structure against the provided evaluation criteria to ensure all required sections (AI usage, setup, and instructions) were present and accurate.

