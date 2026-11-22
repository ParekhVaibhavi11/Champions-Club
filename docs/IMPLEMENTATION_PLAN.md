# Champions Club — Complete Project Implementation Plan & Architecture Specification

> **Status**: Frozen Document (Awaiting User Sign-off to proceed to execution)  
> **Rule**: Do not deviate or alter without explicit user instruction.  
> **Tech Stack**: React + Vite (JS) | Node.js + Express (ESM) | PostgreSQL (`pg`, No ORM)  
> **Brand Palette**: `#111111` (Hero Black), `#C8102E` (Champion Red), `#FFFFFF` (Surface White), `#F3F4F6` (Light Grey Body)  

---

## 1. System Architecture & High-Level Overview

Champions Club is an enterprise multi-department athletic and sports club management platform covering court management with overlap prevention, a public gear showcase with in-store physical POS, a café & bar with live table tabs and kitchen display queue, member subscriptions with automatic tier discounts, CRM leads, staff HR shifts, and owner financial revenue reports.

```
                          ┌────────────────────────┐
                          │   Client (React/Vite)  │
                          └───────────┬────────────┘
                                      │ HTTP / REST (/api/v1)
                                      ▼
                          ┌────────────────────────┐
                          │ Express API (ESM)      │
                          ├────────────────────────┤
                          │ JWT Auth & RBAC        │
                          │ Sub-permission Checks  │
                          │ Business Validations   │
                          └───────────┬────────────┘
                                      │ pg.Pool & withTransaction
                                      ▼
                          ┌────────────────────────┐
                          │ PostgreSQL 15+         │
                          │ (GiST Exclusion Locks) │
                          └────────────────────────┘
```

---

## 2. Exhaustive List of Modules to Build

### A. Backend Modules (`server/src/modules/`)

Every backend module adheres strictly to the 4-layer architecture:
- `*.routes.js`: Route definitions, parameter validators, and middleware attachments.
- `*.controller.js`: Request parsing, HTTP status orchestration, and standard API response envelope formatting.
- `*.service.js`: Domain rules, transactions, calculations, and constraints.
- `*.repository.js`: Raw SQL execution with parameterized queries (`$1, $2, ...`) via `pg`.

| # | Module Name | Primary Responsibilities & Business Rules |
|---|---|---|
| **M01** | `auth` | User registration, authentication (JWT), password hashing (bcrypt), token verification, `/auth/me` with profile and role-permissions bundle. |
| **M02** | `memberships` | Subscription plans (`Gold`, `Silver`, `Junior`), member benefit lookups, membership creation, renewals, status checks, discount rate resolution. |
| **M03** | `courts` | Sports categories (Tennis, Cricket, Padel, Badminton), court configuration, operational hours, slot availability calculation (30-min increments). |
| **M04** | `bookings` | Court allocations, PostgreSQL GiST exclusion lock validation, max 2 sessions/member/day quota check, booking cancellation, Friday social play sessions & rosters. |
| **M05** | `shop` | Product catalog with live stock status (online view only), in-person Staff POS checkout, receipt generation, member tier auto-discounts. |
| **M06** | `inventory` | Stock ledger, atomic stock decrement (`UPDATE inventory SET quantity = quantity - $qty WHERE quantity >= $qty`), restock adjustments, low-stock threshold triggers. |
| **M07** | `cafe` | Dining table management, menu categories & items, open table tabs, order placement, kitchen display status queue (`PENDING` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`), bill settlement. |
| **M08** | `crm` | Public inquiry/lead capture form, sales pipeline tracking (`NEW`, `CONTACTED`, `QUOTED`, `CONVERTED`, `LOST`), quotation generation for corporate/memberships. |
| **M09** | `hr` | Employee directory, shift clock-in/clock-out tracking, leave requests submission & approval, working hours calculation. |
| **M10** | `payments` | Simulated multi-channel payment engine (`CASH`, `CARD`, `UPI`), invoice linking, ledger audit records across Courts, Shop, Café, and Memberships. |
| **M11** | `reports` | Multi-department aggregated revenue analytics, KPI dashboard summaries (today's revenue, active courts, open tabs, inventory alerts), CSV export formatting. |

---

### B. Frontend Modules (`client/src/features/`)

Every frontend feature contains dedicated UI views, state management, modal forms, and hooks:

| # | Feature / Module | Views & User Interfaces |
|---|---|---|
| **F01** | `auth` | Login view, role redirect handler, JWT storage, active user session context (`useAuth`). |
| **F02** | `public` | Cinematic Landing Page (`/`), Sports Facilities viewer (`/sports`), Public Live Court Availability Grid (`/availability`), Membership Plans Comparison (`/plans`), Public Contact & Trial Inquiry (`/contact`). |
| **F03** | `members` | Member Dashboard (`/member/dashboard`), Personal booking history, Membership badge with active benefits, Profile overview. |
| **F04** | `courts` | Member Court Booking Interface (`/member/book-court`), 30-min slot selector, 1-hr duration enforcement, quota warning alert, Friday Social Play session roster (`/member/social-play`). |
| **F05** | `shop` | **Public/Member View**: Browse gear catalog (`/shop`), filter by sport, live stock badges (`In Stock`, `Low Stock`, `Out of Stock`), clear in-store counter purchase banner.<br>**Staff View**: POS Counter Terminal (`/staff/shop-pos`), product search/barcode mock, customer lookup for automatic discounts, instant receipt printer modal. |
| **F06** | `inventory` | Staff Inventory Manager (`/staff/inventory`), stock alert indicators, restock modal, stock movement audit history. |
| **F07** | `cafe` | **Staff POS View**: Table layout grid (`/staff/cafe-pos`), open active tabs, menu item click-to-add, split/settle bill modal with Cash/Card/UPI.<br>**Kitchen Display System (KDS)**: `/staff/kitchen` order ticket cards with interactive status transitions. |
| **F08** | `frontdesk` | Front Desk Master Calendar (`/desk/calendar`) with court status matrix, walk-in booking modal, quick check-in toggle, Member Directory (`/desk/members`) with instant search and renewal. |
| **F09** | `crm` | Desk/Admin Leads Pipeline Board (`/desk/leads`), inquiry detail drawer, status stage updater, quotation builder. |
| **F10** | `hr` | Admin HR Suite (`/admin/hr`), employee table, shift clock-in monitor, leave approval queue. |
| **F11** | `finance` | Admin Finance & Analytics (`/admin/dashboard` & `/admin/finance`), department revenue breakdown charts (Courts, Shop, Café, Memberships), invoice ledger, export options. |

---

## 3. Strict Monorepo Directory Layout

```text
champions-club/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StatCard.jsx
│       │   ├── AlertBanner.jsx
│       │   ├── Button.jsx
│       │   ├── Input.jsx
│       │   ├── Modal.jsx
│       │   ├── Table.jsx
│       │   └── Badge.jsx
│       ├── layouts/
│       │   ├── PublicLayout.jsx
│       │   ├── MemberLayout.jsx
│       │   ├── FrontDeskLayout.jsx
│       │   ├── StaffLayout.jsx
│       │   └── AdminLayout.jsx
│       ├── routes/
│       │   ├── AppRoutes.jsx
│       │   └── ProtectedRoute.jsx
│       ├── features/
│       │   ├── auth/
│       │   ├── public/
│       │   ├── members/
│       │   ├── courts/
│       │   ├── shop/
│       │   ├── inventory/
│       │   ├── cafe/
│       │   ├── frontdesk/
│       │   ├── crm/
│       │   ├── hr/
│       │   └── finance/
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── bookingService.js
│       │   ├── shopService.js
│       │   ├── cafeService.js
│       │   ├── crmService.js
│       │   ├── hrService.js
│       │   └── reportService.js
│       └── hooks/
│           ├── useAuth.js
│           ├── useCourtAvailability.js
│           └── useCart.js
│
├── server/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── rbac.js
│       │   ├── staffPermission.js
│       │   └── errorHandler.js
│       ├── utils/
│       │   ├── apiResponse.js
│       │   └── timeSlots.js
│       └── modules/
│           ├── auth/
│           ├── memberships/
│           ├── courts/
│           ├── bookings/
│           ├── shop/
│           ├── inventory/
│           ├── cafe/
│           ├── crm/
│           ├── hr/
│           ├── payments/
│           └── reports/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_constraints_and_indices.sql
│
└── docs/
    ├── IMPLEMENTATION_PLAN.md
    ├── API.md
    └── ERD.md
```

---

## 4. Key Architectural & Database Rules

1. **Zero Double-Bookings Guard**: Enforced via PostgreSQL `EXCLUDE USING gist (court_id WITH =, slot_range WITH &&)` on table `court_allocations`.
2. **Quota Cap**: Strict backend rule ensuring any single member cannot exceed 2 confirmed court sessions on the same calendar day.
3. **Physical-Only Shop Purchases**: Gear catalog is visible publicly with real-time stock levels, but purchasing APIs are strictly mounted under `POST /api/v1/shop/orders` requiring authenticated `staff` role with POS permission.
4. **Atomic Inventory Control**: POS transactions check and update inventory in one atomic command, avoiding race conditions and preventing negative stock.
5. **Tier Discount Engine**: Membership discounts (e.g. Gold 15%, Silver 10%) are resolved automatically on the backend during POS order creation and café tab settlements.
6. **No ORM Requirement**: All queries in repositories are raw, clean, parameterized PostgreSQL queries via `pg.Pool`.

---

## 5. Execution Roadmap (Step-by-Step)

1. **Step 1: Planning Sign-off (Current Step)** — User approves the modular breakdown and architecture plan.
2. **Step 2: Database Layer Verification** — Apply schema and seed data into PostgreSQL, verify GiST extension and indices.
3. **Step 3: Server Core & Middleware** — Set up `app.js`, central error handler, API response builders, JWT and RBAC middleware.
4. **Step 4: Backend Module Construction** — Implement modules M01 through M11 in sequence (routes, controllers, services, repositories).
5. **Step 5: Frontend Foundation & Design Tokens** — Install Tailwind/Lucide, configure brand palette, build shared layouts and components.
6. **Step 6: Frontend Feature Slices** — Implement features F01 through F11 connecting to `/api/v1`.
7. **Step 7: Verification & Acceptance Testing** — Test double-booking prevention, quota limits, POS stock deduction, café tabs, and revenue dashboard.


Module #	Module Name	Backend Scope	Frontend Scope
Module 1	Auth, Identity & Role Shells	JWT token lifecycle, password verification (bcrypt), /auth/login, /auth/me, RBAC middleware, staff sub-permissions	Brand Theme setup (Tailwind, Lucide icons), Unified Login view with quick-fill demo roles, Role Shells (Public, Member, Front Desk, Staff, Admin)

Module 2	Memberships & Member Directory	Plans (Gold, Silver, Junior), benefit limits, member creation & search, renewals	Member Profile view with tier badge, Front Desk Member Directory with search & renewal modal

Module 3	Courts & Availability Matrix	Sports types, court management, operational hours, 30-min slot calculation engine	Public Court Showcase (/sports), Live Public Availability Matrix (/availability)

Module 4	Bookings & Friday Social Play	Court allocations, PostgreSQL GiST exclusion double-booking prevention, 2/day quota validation, cancellations, Friday Social Play session rosters	Member 1-hr booking interface (/member/book-court), Friday Social Play registration (/member/social-play), Front Desk Master Calendar (/desk/calendar)

Module 5	Gear Shop & In-Store POS	Public catalog API, in-store Staff POS order processing, automatic member tier discount calculation, receipt generation	Public Gear Catalog with live shelf stock badges (/shop), Staff POS Cashier Terminal (/staff/shop-pos)

Module 6	Inventory Management	Stock ledger, atomic decrement (quantity >= $qty), low-stock threshold triggers, restock adjustments	Staff Inventory Manager (/staff/inventory) with stock alerts and restock modal

Module 7	Café & Bar with Kitchen KDS	Table layout, menu items, open tabs, item orders, kitchen queue status lifecycle (PENDING ➔ PREPARING ➔ READY ➔ SERVED), tab settlement	Staff Café Table Floor Plan & Tab Manager (/staff/cafe-pos), Kitchen Display System queue (/staff/kitchen)

Module 8	CRM & Leads Pipeline	Public trial/inquiry capture, pipeline stages (NEW, CONTACTED, QUOTED, CONVERTED), quote generation	Public Contact/Trial form (/contact), Front Desk Leads Pipeline Board (/desk/leads) with quotation drawer

Module 9	HR & Shift Tracker	Employee directory, shift clock-in/out, hours worked calculation, leave requests & approval	Admin HR Suite (/admin/hr) with shift monitor and leave approvals

Module 10	Payments & Invoicing	Simulated payment engine (CASH, CARD, UPI), invoice linking, transaction audit records across all departments	Universal Payment Modal & Receipt generation across POS, Café, and Front Desk

Module 11	Owner Financial Reports & KPIs	Cross-department revenue aggregation (Courts, Shop, Café, Memberships), daily KPI summary endpoint, CSV export