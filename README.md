# Champions Club — Monorepo Setup & Developer Guide

Welcome to the **Champions Club** project! This repository contains the complete full-stack web application designed for sports facility management, member services, court booking, gear shop, café POS, and administration.

---

## 🏗️ Architecture Overview

The repository is organized as a clean monorepo:

```text
Champions-Club/
├── client/              # React + Vite frontend with Tailwind CSS
│   ├── src/
│   │   ├── components/  # Shared reusable UI primitives
│   │   ├── layouts/     # Role shells (Public, Member, FrontDesk, Staff, Admin)
│   │   ├── routes/      # App routing & role guards
│   │   ├── features/    # Modular business feature slices
│   │   ├── services/    # Axios/fetch API clients with JWT interceptor
│   │   └── hooks/       # Custom React hooks
├── server/              # Node.js + Express (ESM) backend
│   ├── src/
│   │   ├── config/      # PostgreSQL connection pool & transaction helper
│   │   ├── middleware/  # JWT auth, RBAC, error handling
│   │   ├── modules/     # Domain-driven architecture (auth, courts, bookings, shop, cafe, etc.)
│   │   └── utils/       # Standardized response formatters & slot calculators
├── database/            # PostgreSQL DDL schemas & seed data
│   ├── schema.sql       # Baseline database structure with GiST exclusion constraints
│   └── seed.sql         # Demo test data for all roles and facilities
└── docs/                # Architecture docs, API contracts & team guides
```

---

## 🚀 Quickstart for Team Members

### 1. Prerequisites
- **Node.js**: v18+ (Recommended v20 or v22)
- **PostgreSQL**: v14+ (Must have `btree_gist` extension supported)

---

### 2. Database Setup

1. Open PostgreSQL CLI or pgAdmin:
   ```sql
   CREATE DATABASE champions_club;
   ```
2. Run the database migration and seed script:
   ```bash
   psql -U postgres -d champions_club -f database/schema.sql
   psql -U postgres -d champions_club -f database/seed.sql
   ```

---

### 3. Backend Setup (`server`)

1. Open terminal in `server/`:
   ```bash
   cd server
   npm install
   ```
2. Copy environment file and adjust your database credentials:
   ```bash
   cp .env.example .env
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
   Backend will start at: `http://localhost:5000` (Healthcheck: `http://localhost:5000/api/health`)

---

### 4. Frontend Setup (`client`)

1. Open terminal in `client/`:
   ```bash
   cd client
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run at: `http://localhost:5173`

---

## 👥 Demo Logins (Pre-seeded)

All demo accounts use password: `Password123!`

| Role | Email | Permissions / Features Accessible |
|---|---|---|
| **Admin** | `admin@championsclub.com` | Full owner KPI dashboard, revenue reports, HR & system settings |
| **Front Desk** | `desk@championsclub.com` | Visual calendar, check-ins, member directory, leads |
| **Staff (Shop/Café)** | `staff@championsclub.com` | Gear Shop POS, Café Tabs POS, Kitchen Queue Display |
| **Member (Gold)** | `alex@example.com` | Member dashboard, 1-hr court booking (max 2/day), social play |
| **Public Visitor** | N/A (Unauthenticated) | Landing page, court schedule viewer, browse shop catalog (in-store purchase only) |

---

## 🎨 Design System & Colors

- **Champion Red**: `#C8102E` (Primary CTAs, active states, brand badges)
- **Dark Obsidian**: `#111111` (Hero backgrounds, headers, dark UI elements)
- **Light Grey**: `#F3F4F6` (Dashboard body background)
- **Card White**: `#FFFFFF` (Card surfaces, modals)

---

## 🤝 Team Responsibilities (24-Hour Plan)

- **Ramakant**: Backend APIs, PostgreSQL queries, transaction integrity, GiST overlap guard, quota enforcement.
- **Vaibhavi**: Member portal, court booking grid & slot matrix, public gear shop catalog, CRM trial booking.
- **Purav**: Front desk calendar view, Staff Shop & Café POS, Kitchen queue display, Admin KPI dashboard.
