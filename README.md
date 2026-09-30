# 🚀 Skill Sphere — Online Skill-Based Recruitment Portal

A full-stack, project-based, assessment-driven recruitment platform connecting skilled candidates with top employers.

## ✨ Features

- **Project-Based Hiring** — Candidates showcase real projects, not just resumes
- **Assessment Scoring** — Structured rubrics for consistent evaluation
- **Real-Time Notifications** — Socket.IO-powered instant updates
- **Role-Based Dashboards** — Separate experiences for candidates and recruiters
- **Skill Matching** — Tech stack tags for precise job matching
- **Dark Mode** — Premium dark-themed UI with glassmorphism

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Styling | TailwindCSS v3 + Headless UI + Heroicons |
| State | React Context + useReducer |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.IO v4 |
| Email | Nodemailer (console fallback) |

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`

### Installation

```bash
# Install all dependencies (root + server + client)
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Seed Database

```bash
cd server && node seed.js
```

This creates sample accounts:
| Role | Email | Password |
|---|---|---|
| Recruiter | priya@techcorp.com | password123 |
| Recruiter | rahul@startupx.com | password123 |
| Candidate | arjun@email.com | password123 |
| Candidate | sneha@email.com | password123 |
| Candidate | vikram@email.com | password123 |

### Run Development

```bash
# From root — runs both server (port 5000) and client (port 3000)
npm run dev
```

Or separately:
```bash
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

Then open **http://localhost:3000**

## 📁 Project Structure

```
├── client/              # React Frontend (Vite)
│   ├── src/
│   │   ├── api/         # Axios client & API services
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth, Notification, Theme providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page-level components
│   │   └── utils/       # Helpers & constants
│   └── ...
├── server/              # Express Backend
│   ├── config/          # DB, env, socket setup
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error, rate limiting
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Email, notifications, assessment
│   ├── validators/      # Request validation
│   └── utils/           # Helpers & error classes
└── package.json         # Root workspace scripts
```

## 🔑 API Endpoints

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/jobs` — List jobs (public, filterable)
- `POST /api/jobs` — Post job (recruiter)
- `POST /api/applications` — Apply (candidate)
- `PATCH /api/applications/:id/status` — Update status (recruiter)
- `PATCH /api/applications/:id/assess` — Score candidate (recruiter)
- `GET /api/notifications` — Get notifications

## 📄 License

MIT
