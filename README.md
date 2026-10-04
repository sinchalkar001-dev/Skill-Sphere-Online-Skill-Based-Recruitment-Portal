# Skill Sphere: Skill-Based Recruitment Portal

A full-stack hiring platform where candidates apply with the projects they have built and recruiters score every applicant against the same rubric.

**Stack:** React 18, Vite, Tailwind CSS, Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO, Nodemailer.

## Features

- **Project-based applications.** Candidates attach up to three projects, with links, to each application.
- **Rubric scoring.** Recruiters score applicants on weighted criteria; candidates see their score and feedback.
- **Application pipeline.** Applied, in review, shortlisted, assessed, then accepted or rejected, with a dated history.
- **Role-based access.** Separate candidate and recruiter experiences, enforced on the server.
- **Skill tags.** Search and filter jobs by skill in any letter case, with tag suggestions from a shared catalogue.
- **Notifications.** Real-time in-app updates over Socket.IO, plus email with automatic retry.
- **Light and dark themes**, documented in [`design-system/skill-sphere/MASTER.md`](design-system/skill-sphere/MASTER.md).

## Architecture

```text
├── client/                React front end (Vite)
│   └── src/
│       ├── api/           Axios client and endpoint wrappers
│       ├── components/    Reusable UI
│       ├── context/       Auth, notifications, theme
│       └── pages/         Route-level screens
├── server/                Express API
│   ├── config/            Environment, database, Socket.IO
│   ├── controllers/       Request handlers
│   ├── middleware/        Auth, role guard, validation, rate limiting, errors
│   ├── models/            Mongoose schemas (6 collections)
│   ├── routes/            API routes
│   ├── services/          Applications, assessment, email outbox, notifications, skills
│   ├── scripts/           Benchmark, load test, database sync
│   └── tests/             Node test runner suites
├── docs/                  Performance measurements and raw results
└── design-system/         UI design tokens and rules
```

### Data model

Six MongoDB collections:

| Collection | Holds | Key indexes |
| --- | --- | --- |
| `users` | Candidates and recruiters; bcrypt password hash, profile, skills, company | `email` (unique), `{ role, isActive }`, `skills` |
| `jobs` | Postings with tech stack, salary, rubric, application cap | `{ isActive, techStackKeys, createdAt }`, `{ recruiter, createdAt }`, text index on title, tech stack and description |
| `applications` | One per candidate per job; projects, status history, assessment | `{ job, candidate }` (unique), `{ job, status, createdAt }`, `{ job, createdAt }`, `{ job, assessment.percentageScore }`, `{ candidate, status, createdAt }` |
| `notifications` | In-app notifications | `{ recipient, createdAt }`, `{ recipient, isRead }` |
| `skills` | Catalogue of skill tags with usage counts | `key` (unique), `{ jobCount, candidateCount }` |
| `emailjobs` | Outbox for transactional email, with attempts and retry time | `{ status, nextAttemptAt }`, TTL on `expiresAt` |

### How the important parts work

- **Authentication.** Passwords are hashed with bcrypt (cost 12). Login returns a signed JWT access token and refresh token; the server keeps no session state. A role guard restricts each route to candidates or recruiters, and ownership is checked for every job and application.
- **Dashboards.** Status counts come from one aggregation per dashboard. The compound indexes above let MongoDB answer those counts from the index without reading any application documents, and let the applicants page read only the 20 rows it shows from a posting with hundreds of applications.
- **Applying under load.** Taking a slot on a posting is a single atomic update that checks the posting is open, before its deadline and under its cap. Concurrent applicants can never push a posting over its limit, and a unique index guarantees one application per candidate.
- **Email with retry.** Every email is first written to the `emailjobs` outbox, then delivered in the background. A failed send is retried up to five times with increasing waits (30 s, 2 min, 8 min, 32 min). A worker claims each job atomically, so an email is sent once even with several server instances, and nothing is lost if the server restarts mid-send.

## Performance

Measured on a development laptop with a dataset of 156,112 applications (about 520 per posting). Method, environment and all runs are in [`docs/performance.md`](docs/performance.md).

| Measurement | Result |
| --- | --- |
| Recruiter dashboard query, after adding compound indexes | 28.2 ms to 12.1 ms median (57% faster); documents read 5,262 to 0 |
| Applicants page, one page of a 528-applicant posting | Documents read 528 to 20 |
| 200 concurrent users, six 60-second runs | 0 failed requests out of 72,747; p95 between 32 and 165 ms in five runs, 832 ms in one |

## Getting started

Requirements: Node.js 20 or later, and MongoDB on `mongodb://localhost:27017`.

```bash
# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Configure the server (optional; the defaults work for local development)
cp server/.env.example server/.env

# Load sample data
cd server && npm run seed && cd ..

# Run the API (port 5000) and the client (port 3000)
npm run dev
```

Open <http://localhost:3000>.

Sample accounts (password `password123`):

| Role | Email |
| --- | --- |
| Recruiter | `priya@techcorp.com` |
| Recruiter | `rahul@startupx.com` |
| Recruiter | `ananya@cloudnine.com` |
| Candidate | `arjun@email.com` |
| Candidate | `sneha@email.com` |
| Candidate | `vikram@email.com` |

Without SMTP settings in `server/.env`, emails are logged to the console instead of being sent.

## Server scripts

Run from `server/`:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API with reload |
| `npm run seed` | Reset the database and load sample data |
| `npm run db:sync` | Create or drop indexes to match the schemas and backfill derived fields; run after pulling schema changes |
| `npm test` | Run the test suites against a throwaway database |
| `npm run benchmark` | Time the dashboard queries with and without the compound indexes |
| `npm run loadtest` | Run 200 concurrent users against a temporary API instance |

The tests, benchmark and load test each use their own database (`skill-sphere-test`, `-benchmark`, `-loadtest`) and never touch development data or send email.

## API

| Method and path | Access | Purpose |
| --- | --- | --- |
| `POST /api/auth/register`, `/login`, `/refresh-token` | Public | Accounts and tokens |
| `GET /api/auth/me`, `PUT /api/auth/profile` | Signed in | Own profile |
| `GET /api/jobs`, `GET /api/jobs/:id` | Public | Job board with search and filters |
| `POST /api/jobs`, `PUT`, `DELETE`, `PATCH /api/jobs/:id/toggle` | Recruiter (owner) | Manage postings |
| `GET /api/jobs/my-jobs` | Recruiter | Own postings |
| `POST /api/applications`, `DELETE /api/applications/:id` | Candidate | Apply, withdraw |
| `GET /api/applications/my` | Candidate | Own applications |
| `GET /api/applications/stats` | Signed in | Dashboard counts by status |
| `GET /api/applications/job/:jobId` | Recruiter (owner) | Applicants, paginated, with counts per status |
| `PATCH /api/applications/:id/status`, `/assess` | Recruiter (owner) | Move through the pipeline, score |
| `GET /api/notifications` | Signed in | Notifications |
| `GET /api/skills?q=` | Public | Skill tag suggestions |

## License

MIT
