# CHAMPIONS CLUB — COMPLETE REPOSITORY & SYSTEM AUDIT (PROJECT_AUDIT.md)

**Generated:** 2026-11-21  
**Project:** Champions Club — Sports Club Management System  
**Auditor:** Senior Full-Stack Engineer, System Architect, Database Architect, UI/UX Designer & QA Engineer  
**Database:** PostgreSQL (Port 5432, Database: `champions_club`, 31 tables active)  
**Branch:** `auth` (Clean working tree)

---

## 1. Executive Summary & Audit Matrix

The repository has a solid, well-architected foundation (Express ES modules backend + Vite React Tailwind frontend), with complete and verified implementations of **Authentication (JWT + RBAC)**, **Memberships & Plans**, **Sports & Availability Matrix**, and **Court Bookings Engine with GiST Concurrency Constraints**.

The updated project scope requires expanding beyond read-only showcases into a **fully integrated, real-world operational sports club management platform** with bidirectional online-and-counter gear sales, trial bookings with court allocations, café table POS with kitchen queue display, front desk CRM lead management, staff HR rosters, member self-service portals, and an executive financial ledger.

### Audit Status Matrix

| Module | Existing Implementation | Working? | Missing Functionality & Gaps | Priority |
|---|---|:---:|---|:---:|
| **Authentication & RBAC** | `server/src/modules/auth/`, `client/src/features/auth/`, JWT + bcrypt + 6-digit OTP email reset. | **Verified** | Admin staff account creation endpoint; enforce staff password change on first login. | **High** |
| **Public Website** | `client/src/features/public/Home.jsx`, `Plans.jsx`, `Navbar.jsx`, responsive sports showcase. | **Verified** | Dynamic trial booking CTA form; public café menu preview. | **Medium** |
| **Member Portal** | `MemberDashboard.jsx`, `MemberPlan.jsx`, digital pass with QR. | **Partial** | Needs real personal court booking history, gear shop order history, and cancellation actions. | **High** |
| **Court Booking Engine** | `bookings.repository.js`, `AvailabilityMatrix.jsx`, `MemberBookingFlow.jsx`, PostgreSQL GiST. | **Verified** | Front desk maintenance block overrides; trial booking court reservation hook. | **Medium** |
| **Trial Booking & CRM** | DB table `leads` exists (11 cols). UI has placeholder `/contact`. | **Missing** | Dedicated `/trials` page, unique trial reference generator, front desk confirmation/rescheduling, automatic court allocation. | **Critical** |
| **Sports Gear Shop** | Database tables `products`, `inventory`, `shop_orders`, `shop_order_items`, `stock_movements`. POS UI exists in `ShopPOS.jsx`. | **Partial** | Re-enable customer-facing online shop with cart, pickup/delivery choice, order status lifecycle (`PLACED → PACKING → READY → COMPLETED`). | **Critical** |
| **Café & Kitchen Display** | DB tables `dining_tables` (8 tables), `menu_items` (8 items), `cafe_orders`, `cafe_order_items`. | **Missing** | Café Table POS (`/staff/cafe-pos`) with tab management; Kitchen Queue Display (`/staff/kitchen`) with status toggles (`PENDING → PREPARING → READY → SERVED`). | **Critical** |
| **Inventory Ledger** | DB tables `inventory` & `stock_movements`. POS deducts stock. | **Partial** | Dedicated Staff Inventory Ledger (`/staff/inventory`) with low-stock alerts, shipment restock modal, damage write-off modal, audit trail. | **High** |
| **Staff & HR Management** | DB tables `users`, `staff_profiles`, `shifts`, `leave_requests`. | **Missing** | Admin staff management (`/admin/staff`), shift scheduling, clock-in/out digital punch card. | **Medium** |
| **Finance & Analytics** | DB tables `invoices`, `payments`, `expenses`. `AdminDashboard.jsx` has static cards. | **Partial** | Dynamic database-driven P&L analytics, unified departmental revenue breakdown (Courts + Shop + Café + Memberships), CSV export. | **High** |

---

## 2. Technical Stack & Architecture Assessment

- **Backend:** Node.js + Express with ES Modules. Well-structured modular separation (`controllers`, `services`, `repositories`, `routes`). Parameterized SQL queries using `pg.Pool` without an ORM.
- **Frontend:** React 18 with Vite, Tailwind CSS v3, React Router v6, Axios with JWT interceptors. Fast, responsive, cleanly separated feature directories.
- **Database:** PostgreSQL on port 5432 with 31 relational tables. Includes `btree_gist` extension for time-range exclusion locks (`slot_range WITH &&`), foreign key constraints, and numeric precision for currency.
- **Currency Compliance:** Standardized in **₹ INR** across plans, court rates, products, and café items.
- **Theme Consistency:** Follows Champions Club identity: Champion Red (`#C8102E`), Dark (`#111111`), White (`#FFFFFF`), Light Grey (`#F3F4F6`).

---

## 3. High-Priority Architectural & Functional Gaps

1. **Guest Trial Booking & Front Desk Lead Pipeline**:
   - Visitors must be able to book a trial without creating an account.
   - Front desk staff must review requests, assign courts, and update statuses (`REQUESTED → CONFIRMED → COMPLETED`).
   - Conversion mechanism to register lead as member with zero duplication.

2. **Unified Omnichannel Gear Shop**:
   - Customers must be able to browse catalog, add to cart, apply member discounts, and place orders for Club Pickup or Delivery.
   - Staff POS and Online Orders must draw from the same `inventory` pool with PostgreSQL `FOR UPDATE` transaction locks.
   - Order fulfillment workflow (`PLACED → CONFIRMED → PACKING → READY_FOR_PICKUP / OUT_FOR_DELIVERY → COMPLETED`).

3. **Café POS & Kitchen Display System (KDS)**:
   - Visual 8-table floor layout for café waitstaff to open tabs, add menu items, apply member discounts, and settle bills.
   - Dedicated Kitchen Display (`/staff/kitchen`) for line cooks to track incoming tickets and progress items.

4. **Staff Inventory Ledger & Stock Movement Audit**:
   - Centralized view of all inventory with threshold warnings.
   - Actionable supplier restock deliveries and write-off adjustments recorded in `stock_movements`.

5. **Member Self-Service & Admin Financial Analytics**:
   - Replace static dashboard mockups with live SQL aggregation (`invoices`, `payments`, `shop_orders`, `cafe_orders`, `court_allocations`).

---

## 4. Phased Implementation Roadmap

```
Phase 1: Complete Repository Audit (This document)
Phase 2: Guest Trial Booking System & Front Desk CRM Pipeline
Phase 3: Omnichannel Sports Gear Shop (Public Online Orders + Staff In-Store POS)
Phase 4: Staff Inventory Ledger, Restocks & Stock Adjustments
Phase 5: Café Dining Tables POS & Kitchen Queue Display
Phase 6: Staff HR Management, Shifts & Digital Attendance
Phase 7: Member Portal Self-Service & Real Activity History
Phase 8: Executive Financial Hub, Real-time P&L & CSV Reports
Phase 9: Comprehensive End-to-End Verification & Documentation
```
