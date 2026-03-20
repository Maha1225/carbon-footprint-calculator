# 🌿 EcoShip - Carbon Footprint Calculator

A beginner-friendly full-stack web application that calculates the CO₂ cost of shipping products and allows users to purchase carbon offset credits.

---

## 🏗️ Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Frontend | React + Tailwind CSS |
| Backend  | Node.js + Express  |
| Database | MongoDB (Mongoose) |
| Auth     | JWT + bcrypt       |

---

## 📁 Project Structure

```
project/
├── backend/                 ← Node.js + Express API
│   ├── server.js            ← Main backend file (all routes here)
│   ├── package.json         ← Backend dependencies
│   └── .env                 ← Environment variables
│
├── src/                     ← React Frontend
│   ├── context/
│   │   └── AuthContext.tsx  ← Global login state
│   ├── pages/
│   │   ├── Login.tsx        ← Login page
│   │   ├── Signup.tsx       ← Signup page
│   │   ├── Dashboard.tsx    ← Main dashboard
│   │   └── Calculator.tsx   ← CO2 calculator form
│   ├── services/
│   │   └── api.ts           ← All API calls to backend
│   ├── App.tsx              ← Entry point + routing
│   └── main.tsx             ← React DOM render
│
├── index.html
└── package.json             ← Frontend dependencies
```

---

## 🚀 How to Run the Project

### Step 1: Install MongoDB
- Download MongoDB from: https://www.mongodb.com/try/download/community
- Start MongoDB service on your machine

### Step 2: Start the Backend

```bash
# Go to the backend folder
cd backend

# Install backend packages
npm install

# Start the backend server
npm start
```

The backend will run on: **http://localhost:5000**

### Step 3: Start the Frontend

Open a **new terminal** in the project root:

```bash
# Install frontend packages
npm install

# Start the frontend
npm run dev
```

The frontend will run on: **http://localhost:5173**

---

## 🔌 API Endpoints

### Auth Routes
| Method | URL                  | Description           |
|--------|----------------------|-----------------------|
| POST   | /api/auth/signup     | Register new user     |
| POST   | /api/auth/login      | Login existing user   |
| GET    | /api/auth/me         | Get current user info |

### Calculator Routes (requires login)
| Method | URL                           | Description                |
|--------|-------------------------------|----------------------------|
| POST   | /api/calculate                | Calculate CO2 + save result|
| GET    | /api/calculations             | Get all user calculations  |
| PATCH  | /api/calculations/:id/offset  | Purchase carbon offset     |
| DELETE | /api/calculations/:id         | Delete a calculation       |
| GET    | /api/stats                    | Get user summary stats     |

---

## 🧮 How CO₂ is Calculated

```
CO₂ (kg) = Weight (kg) × Distance (km) × Emission Factor

Emission Factors:
  Economy  = 0.00015 kg CO₂/kg/km   (ship/slow freight)
  Standard = 0.00021 kg CO₂/kg/km   (truck/road freight)
  Express  = 0.00035 kg CO₂/kg/km   (air freight)

Offset Cost = CO₂ × $0.02 per kg
```

---

## 🌱 Features

- ✅ User Sign Up & Login (with JWT auth)
- ✅ Calculate CO₂ for any shipment
- ✅ 3 shipping methods (Economy, Standard, Express)
- ✅ Purchase carbon offset credits
- ✅ Dashboard with stats & history
- ✅ Delete calculations
- ✅ Data saved in MongoDB

---

## 🔐 Environment Variables (backend/.env)

```env
MONGO_URI=mongodb://localhost:27017/carbonfootprint
JWT_SECRET=mysupersecretkey123
PORT=5000
```
