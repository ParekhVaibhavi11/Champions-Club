# Champions Club

Basic minimal setup: React + Vite on the frontend and Node.js + Express + PostgreSQL on the backend.

## 📁 Structure

```text
Champions-Club/
├── backend/
│   ├── .env              # Database connection config
│   ├── .env.example
│   ├── db.js             # PostgreSQL connection pool
│   ├── package.json
│   └── server.js         # Express server & DB test route
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx       # Simple React view checking DB connection
        ├── index.css
        └── main.jsx
```

---

## 🚀 How to Run

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server starts on `http://localhost:5000`. Test endpoint: `http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server starts on `http://localhost:5173`.
