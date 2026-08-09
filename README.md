# Mini ERP + CRM Operations Portal

A full-stack ERP/CRM system for a wholesale/distribution company, built as a case study project. Manages customers, products/inventory, and sales challans with role-based access control across Admin, Sales, Warehouse, and Accounts users.

## Live Links

- **GitHub repo:** https://github.com/PRADNESH-PATIL/mini-erp-crm
- **Frontend (live):** https://mini-erp-crm-eosin.vercel.app
- **Backend API (live):** https://mini-erp-crm-0n2t.onrender.com
- **Health check:** https://mini-erp-crm-0n2t.onrender.com/health

> Note: The backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30-60 seconds to respond while the server wakes up.

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@erp.com | Admin123 |
| Sales | sales@erp.com | sale123 |
| Warehouse | warehouse@erp.com | warehouse123 |
| Accounts | accounts@erp.com | account123 |

## Tech Stack

**Backend:** Node.js, TypeScript, Express.js, PostgreSQL (Neon), Prisma ORM, Zod validation, JWT authentication, bcrypt

**Frontend:** React, TypeScript, Vite, Tailwind CSS v4, React Router

**Deployment:** Backend on Render, Frontend on Vercel, Database on Neon (serverless PostgreSQL)

## Core Modules

### 1. Authentication & Roles
JWT-based login with four roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`. All API routes are protected by an `authenticate` middleware; role-specific routes are further gated by an `authorize(...roles)` middleware.

### 2. Customer CRM
Full CRUD for customers with fields: name, phone, email, business name, GST number, customer type (Retail/Wholesale/Distributor), address, status (Lead/Active/Inactive), follow-up date. Includes search, pagination, and a follow-up notes sub-feature.

### 3. Product & Inventory
Full CRUD for products with fields: name, SKU, category, price, current stock, minimum stock alert, location/warehouse. Stock adjustments (IN/OUT) are recorded as immutable movement log entries (type, quantity, reason, created by, timestamp), applied atomically with the stock update via a Prisma transaction, and blocked from going negative.

### 4. Sales Challan
The core business workflow:

```
Create DRAFT → Add/edit products → CONFIRM → Stock deducted atomically → CONFIRMED
                                  → or CANCEL → CANCELLED
```

- Draft challans store a **snapshot** of product name/SKU/price at the time of adding (not just a product ID reference), so later product edits don't retroactively change historical challans.
- Confirming a challan is done inside a single Prisma transaction: it checks stock availability for **every** item first, and only if all items have sufficient stock does it deduct stock and create `OUT` movement records for each item, then flips the status to `CONFIRMED`. If any single item has insufficient stock, the entire operation is rolled back — no partial deduction occurs, even across multiple products in the same challan.
- Auto-generated challan numbers (e.g. `CHL-2026-0001`).
- Draft/Confirmed/Cancelled status guards prevent invalid transitions (e.g. can't update or cancel a confirmed challan, can't confirm an already-confirmed or cancelled challan).
- List endpoint supports search (by challan number or customer name) and status filtering, with pagination.

## Role Permissions Summary

| Action | Admin | Sales | Warehouse | Accounts |
|---|:---:|:---:|:---:|:---:|
| View customers | ✅ | ✅ | ❌ | ✅ |
| Create/edit customers | ✅ | ✅ | ❌ | ❌ |
| Delete customers | ✅ | ❌ | ❌ | ❌ |
| Add follow-up notes | ✅ | ✅ | ❌ | ❌ |
| View products | ✅ | ✅ | ✅ | ✅ |
| Create/edit products | ✅ | ❌ | ✅ | ❌ |
| Delete products | ✅ | ❌ | ❌ | ❌ |
| Adjust stock (IN/OUT) | ✅ | ❌ | ✅ | ❌ |
| View stock movement history | ✅ | ✅ | ✅ | ✅ |
| Create/update/confirm/cancel challans | ✅ | ✅ | ❌ | ❌ |
| View challan list/detail | ✅ | ✅ | ❌ | ❌ |

These permissions are enforced on the backend via route-level middleware and mirrored in the frontend UI (buttons/forms are hidden for roles that lack permission, rather than shown and then rejected).

## Local Setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (this project uses [Neon](https://neon.tech), free tier)

### 1. Clone the repository
```bash
git clone https://github.com/PRADNESH-PATIL/mini-erp-crm.git
cd mini-erp-crm
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

Push the Prisma schema to your database and generate the client:
```bash
npx prisma db push
npx prisma generate
```

Start the backend:
```bash
npm run dev
```
The API will be available at `http://localhost:5000`.

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### 4. Create test users
Register users for each role via `POST /api/auth/register` (see Postman collection), e.g.:
```json
{
  "name": "Admin User",
  "email": "admin@erp.com",
  "password": "Admin123",
  "role": "ADMIN"
}
```
Repeat with `role: "SALES"`, `"WAREHOUSE"`, and `"ACCOUNTS"` to test role-based access. See the Test Credentials table above for the exact accounts already seeded on the live deployment.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `JWT_SECRET` | backend | Secret used to sign/verify JWTs |
| `PORT` | backend | Port the API listens on (defaults to 5000 locally; Render assigns its own) |
| `VITE_API_URL` | frontend | Base URL the frontend uses to call the API, including `/api` suffix |

## Deployment

- **Database:** Neon PostgreSQL (serverless, connected via `DATABASE_URL`)
- **Backend:** Render Web Service, deployed from the `backend` folder on push to `main`. Build command: `npm install && npx prisma generate && npm run build` (or equivalent per `package.json`); start command: `npm start`. Environment variables (`DATABASE_URL`, `JWT_SECRET`) set in Render's dashboard.
- **Frontend:** Vercel, deployed from the `frontend` folder (Root Directory set to `frontend` in project settings) on push to `main`. `VITE_API_URL` set in Vercel's Environment Variables to point at the deployed Render backend URL with `/api` appended (`https://mini-erp-crm-0n2t.onrender.com/api`).

## API Overview

All endpoints are prefixed with `/api`. Full request/response examples are in the included Postman collection.

```
POST   /auth/register
POST   /auth/login
GET    /auth/me

GET    /customers
POST   /customers
GET    /customers/:id
PUT    /customers/:id
DELETE /customers/:id
POST   /customers/:customerId/follow-ups
GET    /customers/:customerId/follow-ups

GET    /products
POST   /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id
POST   /products/:id/stock
GET    /products/:id/stock-movements

GET    /challans
POST   /challans
GET    /challans/:id
PATCH  /challans/:id
POST   /challans/:id/confirm
POST   /challans/:id/cancel
```

## Architecture Notes

- **Backend** follows a layered structure: `routes` → `controllers` → `services`, with Zod schemas in `validators` for input validation. Prisma is the single data-access layer, with a shared client instance.
- **Stock-affecting operations** (stock IN/OUT, challan confirmation) are wrapped in `prisma.$transaction()` blocks to guarantee atomicity — either the whole operation succeeds (stock updated + movement record created + status changed) or none of it does.
- **Frontend** is a single-page app with route-based code organization: `pages` for screens, `components` for shared UI (data table, pagination, modal, toast, forms), `api` for typed request functions per resource, `context` for auth state, `types` for shared TypeScript interfaces.
- **Role-based access control** is enforced twice: on the backend via middleware (the actual security boundary), and mirrored on the frontend by conditionally rendering UI elements so users don't encounter confusing permission-denied errors after already filling out a form.

## Assumptions Made

- Warehouse users have no visibility into the Sales Challan module at all (not even read-only), since challans are treated as a sales/admin concern and warehouse staff are expected to work from confirmed stock movements instead. This is a design interpretation, not an explicit PDF requirement either way.
- Accounts users have read-only access to Customers and Products, and no access to Challans, reflecting a finance/reporting role rather than an operational one.
- "Delete" is restricted to Admin only across all modules, as a safety measure, even though the PDF doesn't explicitly specify this restriction for every module.
- A cancelled Draft challan cannot be un-cancelled; a new challan must be created instead.
- Challan numbers are generated sequentially per year (`CHL-<year>-<sequence>`) based on total challan count; this is simple and sufficient for the scope of this project but would need a more robust approach (e.g. a dedicated counter table) under concurrent writes at scale.

## Known Limitations

- No PDF invoice export (listed as a bonus feature in the brief).
- No product image upload / AWS S3 integration (bonus feature).
- No Docker setup or CI/CD pipeline (bonus features).
- AWS deployment was not used; the app is deployed on Render + Vercel + Neon instead, per the brief's guidance that this is an acceptable alternative.
- The Render free tier backend may sleep after inactivity, causing a slow first response after idle periods.
- Warehouse and Accounts roles have no visibility into the Sales Challan module (see Assumptions above).
- No automated test suite (unit/integration tests) — all functionality was verified manually via Postman and the live UI, both locally and in production, including edge cases like insufficient stock, atomic rollback on multi-item challans, and double-confirm/cancel protection.
