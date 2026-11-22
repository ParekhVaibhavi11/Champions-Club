# Champions Club

Champions Club is a sports complex management application with a React/Vite client, an Express API, and PostgreSQL storage.

## Requirements

- Node.js and npm
- PostgreSQL
- `psql` for applying SQL schema and seed files

## Local setup

### 1. Create and seed the database

Create a PostgreSQL database named `champions_club`, then run these commands from the repository root:

```powershell
psql -U postgres -d champions_club -f database/schema.sql
psql -U postgres -d champions_club -f database/seed.sql
```

For an existing database created with an older schema, apply the applicable migrations in numeric order. The latest receipt and membership-plan migrations can also be run from the server directory with the npm commands below.

### 2. Configure and start the API

```powershell
Copy-Item server/.env.example server/.env
cd server
npm install
npm run dev
```

Set the PostgreSQL connection values and a private `JWT_SECRET` in `server/.env`. The API listens on `http://localhost:5000`; its health and database check is `http://localhost:5000/api/health`.

SMTP settings in `server/.env` are optional for local development. Without SMTP credentials, receipt and password-reset email delivery is simulated and logged by the server.

### 3. Start the client

Open another terminal:

```powershell
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` calls to the local server.

## Database migrations

From the `server` directory, run the receipt and admin plan migrations when upgrading an older database:

```powershell
npm run migrate:shop-receipts
npm run migrate:cafe-receipts
npm run migrate:membership-checkout
npm run migrate:admin-membership-plans
```

The SQL files are in `database/migrations/`. Files `001`–`003` can be applied with `psql` when upgrading databases that predate password reset, court notes, or guest trial booking support. A new database created from the current `schema.sql` already includes those columns and tables.

## Demo accounts and data

The base seed creates admin, front desk, Gear Shop, Café, Kitchen, and member accounts. Seeded demo passwords are `Password123!`.

To add more sample data for member plans, inventory, bookings, social play, leads, HR, finance, Gear Shop sales, and Café kitchen tickets, run from `server`:

```powershell
npm run seed:demo-more
```

The additional seed is repeatable and uses demo accounts such as `demo.noplan@championsclub.com`, `demo.platinum@championsclub.com`, and `demo.expired@championsclub.com`. It adds open Café orders to a few tables to demonstrate kitchen stages; settle those demo tabs to release the tables.

The source seed file is `database/seed_demo_more.sql`.

## Updating prices

### Interactive update

Run from `server`:

```powershell
npm run prices:update
```

The script prompts for every membership monthly fee, Gear Shop retail and member price, and Café menu price. Enter a new value or press Enter to keep the current value. Confirm with `YES` to apply the changes together in one transaction. Enter `Q` at a prompt to cancel before any updates are applied.

### One-time price scale SQL

`database/update_prices_low_to_high.sql` is a separate one-time bulk update. Its current factors are:

- Membership fees: multiply by 10
- Gear Shop retail and member prices: multiply by 100
- Café menu prices: multiply by 10

Review or edit those factors before running the SQL file. It creates a run marker so running the file again will not multiply prices a second time. Neither price update changes historical orders or invoices.

## Application areas

- **Member portal:** membership plans and purchase receipts, court booking, court availability, café ordering, and member benefits.
- **Front Desk:** court schedule, member directory, registrations, renewals, and leads.
- **Gear Shop:** POS, membership discounts, inventory ledger, stock movements, and receipts.
- **Café and Kitchen:** table tabs, membership discounts, kitchen preparation stages, payment, and receipts.
- **Admin:** owner overview, courts, café, finance ledger with pagination, HR, and membership plan management.

Membership plan purchases and staff POS screens record CASH, CARD, or UPI selections in the application ledger. These are not connected to an external payment gateway.

## Useful commands

| Location | Command | Purpose |
| --- | --- | --- |
| `server` | `npm run dev` | Start the API in development mode |
| `server` | `npm run seed:demo-more` | Add repeatable demo data |
| `server` | `npm run prices:update` | Interactively update catalog and plan prices |
| `client` | `npm run dev` | Start the Vite client |
| `client` | `npm run build` | Create a production client build |
