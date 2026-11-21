# Champions Club

Basic minimal setup as defined in the Implementation Plan:
- `client/`: React + Vite
- `server/`: Node.js + Express (ESM) + PostgreSQL database connection

---

## 📁 Monorepo File Tree

```text
champions-club/
├── client/                      # React + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx              # Tests backend /api/health DB connection
│       ├── index.css
│       └── main.jsx
│
├── server/                      # Express + PostgreSQL
│   ├── .env                     # DB credentials (PGHOST, PGDATABASE, etc.)
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js            # Express app & /api/health endpoint
│       └── config/
│           └── db.js            # pg.Pool database connection
│
├── .gitignore
└── README.md
```

---

## 🚀 How to Run

### 1. Server (Backend)

```bash
cd server
npm install
npm run dev
```

API runs at `http://localhost:5000`.  
Health & DB test endpoint: `http://localhost:5000/api/health`

### 2. Client (Frontend)

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`.
