# CodeBreak

An escape-room style technical assessment platform where candidates fix broken code to solve puzzles. Built for course 2190512 Application Development.

## Features

- **Terminal** — Dark code-editor UI where candidates read prompts and fix broken JSON, API calls, and auth headers
- **Leaderboard** — Real-time ranking of candidates sorted by fastest puzzle completion time
- **Reviewer Dashboard** — HR view showing every attempt, failed submissions, and the candidate's debugging journey

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB |
| Backend | Python Flask + PyMongo + Flask-CORS |
| Web | React 19 + Vite + React Router |
| Mobile | React Native + Expo SDK 53 |

## Project Structure

```
codebreak/
├── backend/          # Flask API server
│   ├── app.py        # API endpoints
│   ├── db.py         # MongoDB connection
│   ├── models.py     # Data models
│   ├── seed.py       # Database seeder with sample data
│   └── requirements.txt
├── web/              # React web application
│   ├── src/
│   │   ├── screens/  # Terminal, Leaderboard, ReviewerDashboard
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── api.js
│   └── package.json
├── mobile/           # React Native mobile app
│   ├── src/
│   │   ├── screens/  # TerminalScreen, LeaderboardScreen, ReviewerScreen
│   │   └── api.js
│   ├── App.js
│   └── package.json
└── README.md
```

## Prerequisites

- Python 3.x
- Node.js
- MongoDB
- Android Studio (for mobile emulator)

## Setup & Run

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py       # Seed database with puzzles and sample data
python app.py        # Starts on http://localhost:5000
```

### 2. Web App

```bash
cd web
npm install
npm run dev          # Starts on http://localhost:3000
```

### 3. Mobile App

```bash
cd mobile
npm install
npx expo start --android
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/puzzles/order/:n` | Fetch puzzle by order |
| POST | `/submit-attempt` | Submit and verify answer |
| GET | `/leaderboard` | Get rankings |
| GET | `/reviewer/candidate/:id` | Get candidate review |
| GET | `/reviewer/candidates` | List all candidates |
| POST | `/candidates` | Register candidate |

## Team

- Phanit Nilodom 6738162221
- Pariwat Sittisuntornwat 6738141021
- Supawattaka Rattanamakul 6738260021
