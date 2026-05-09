# RED — Rare Disease Epi Database

Full-stack web application: React + Node.js/Express + MySQL.

## Project Structure

```
red-database/
├── server/          # Node.js + Express REST API
└── client/          # React frontend
```

## Quick Start

### 1. Database Setup
```bash
# Create the MySQL database and tables
mysql -u root -p < server/db/schema.sql
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env   # Edit with your MySQL credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm start
```

The app runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login (after seeding DB)
- Email: admin@red.com
- Password: admin123
