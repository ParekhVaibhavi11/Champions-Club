# Champions Club API Reference

Base URL: `http://localhost:5000/api/v1`

---

## 1. Authentication (`/auth`)

### `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200)**:
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 4,
        "name": "Alex Morgan (Gold)",
        "email": "alex@example.com",
        "role": "member",
        "plan_name": "Gold Member",
        "discount_shop_pct": 15,
        "discount_cafe_pct": 15
      }
    }
  }
  ```

### `GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**: Profile and active membership benefits.

---

## 2. Courts & Bookings (`/courts`)

### `GET /courts/sports`
- Returns sports catalog: Tennis, Cricket, Padel, Badminton.

### `GET /courts?sport_id=1`
- List active courts for sport.

### `GET /courts/availability?court_id=1&date=YYYY-MM-DD`
- Checks booked allocations on given date for timeline grid.

### `POST /courts/bookings`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "court_id": 1,
    "start_time": "2026-11-21T14:00:00Z",
    "end_time": "2026-11-21T15:00:00Z"
  }
  ```
- **Constraints Handled**:
  - Max 2 sessions per day per member.
  - PostgreSQL GiST exclusion prevents double booking (`409 Conflict`).

---

## 3. Gear Shop (`/shop`)

> ⚠️ **Key Business Rule**: Public & Members can browse catalog and stock online. Purchases are made strictly in-person via Staff POS.

### `GET /shop/products`
- Browse items with live `stock_quantity` and in-stock badges.

### `POST /shop/orders` (Staff / Admin Only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "customer_id": 4,
    "items": [{ "product_id": 1, "quantity": 1 }],
    "payment_method": "CARD"
  }
  ```
- **Atomic Operations**:
  - Automatically verifies stock >= quantity.
  - Updates inventory and records sale in `payments` ledger.

---

## 4. Café & Bar (`/cafe`)

### `GET /cafe/menu`
- Returns active drinks, shakes, and food items.

### `GET /cafe/tables`
- Lists dining tables with open tabs and occupants.

### `POST /cafe/orders`
- Opens table tab, sends items to kitchen, and deducts member discount automatically.

### `PATCH /cafe/orders/:id/kitchen-status`
- Updates kitchen status: `PENDING` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`.

### `POST /cafe/orders/:id/settle`
- Settles tab via `CASH`, `CARD`, or `UPI`, releases dining table.

---

## 5. CRM Leads (`/leads`)

### `POST /leads`
- Public contact & trial request form.
