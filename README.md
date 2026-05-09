# PrepAir — AI Interview Coach

> Walk into your next interview fully prepared. Drop in a job description and your background, and PrepAir generates a tailored question bank, model answers, a day-by-day study plan, a skill-gap analysis, and an optimized resume — all powered by Google's Gemini.

---

## Table of contents

- [The problem PrepAir solves](#the-problem-prepair-solves)
- [What you get](#what-you-get)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the repo](#1-clone-the-repo)
  - [2. Backend setup](#2-backend-setup)
  - [3. Frontend setup](#3-frontend-setup)
  - [4. First run](#4-first-run)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Data model](#data-model)
- [User flow](#user-flow)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## The problem PrepAir solves

Interview prep is high-stakes, slow, and lonely. Most candidates do some mix of:

- Skimming a job description trying to *guess* what'll be asked
- Hunting through Glassdoor / LeetCode / blog posts for "common interview questions"
- Patching together a study plan that's more vibes than structure
- Tweaking a resume for each role with no clear sense of what's missing

Every step is manual, generic, and disconnected from **your actual background** and **the actual role**.

**PrepAir collapses all of that into a 30-second flow.** You paste the job description, give us your resume (or a quick self-description), and it returns a single coherent prep packet:

- Which technical and behavioral questions are most likely
- Why an interviewer would ask each one and how to answer it
- A multi-day study plan focused on the gaps that matter
- A match score so you know how close you already are
- A polished, role-targeted resume PDF you can send today

It's the difference between *preparing for some interview* and *preparing for **this** interview*.

---

## What you get

### Auth
- Email + password registration and login
- JWT issued in an httpOnly cookie (no token juggling on the frontend)
- Session persistence and protected routes
- Logout invalidates the token via a server-side blacklist

### Interview report generation
For each plan you generate, the AI returns a structured report:

| Field | What it contains |
| --- | --- |
| `title` | The role / position the plan is for |
| `matchScore` | 0–100 score for how well your profile fits the JD |
| `technicalQuestions` | Likely technical questions, each with the interviewer's *intention* and a *model answer* |
| `behavioralQuestions` | Likely behavioral questions, also annotated with intention + model answer |
| `skillGaps` | Skills the role needs that your profile is light on, ranked `low` / `medium` / `high` |
| `preparationPlan` | Day-by-day schedule (`day`, `focus`, `tasks[]`) |

### Resume PDF generation
One click downloads a role-targeted resume rendered server-side via Puppeteer.

### Dashboard
- Stats at a glance: plans created, average match score, best match
- Recent plans grid with one-click drill-down
- Empty state that walks first-time users into creating a plan

### Interview detail page
- Three-column layout: section nav · content · live sidebar
- Animated SVG match-score ring with count-up
- Expand/collapse question cards
- Visual roadmap timeline for the prep plan
- Skill-gap chips colored by severity
- Resume PDF download

---

## How it works

```
        ┌─────────────────────────┐
        │  Browser  (React 19)    │
        │  - Dashboard            │
        │  - Prep form            │
        │  - Interview detail     │
        └──────────┬──────────────┘
                   │  axios (cookies)
                   ▼
        ┌─────────────────────────┐
        │  Express API  :3000     │
        │  - /api/auth/*          │
        │  - /api/interview/*     │
        └────┬──────────────┬─────┘
             │              │
             ▼              ▼
       ┌──────────┐    ┌────────────────┐
       │ MongoDB  │    │ Google Gemini  │
       │ (users,  │    │ (interview     │
       │  reports)│    │  generation)   │
       └──────────┘    └────────────────┘
                              │
                              ▼
                       ┌────────────┐
                       │ Puppeteer  │
                       │ (resume    │
                       │  PDF)      │
                       └────────────┘
```

**Generation flow**

1. User submits a job description, optional self-description, and an optional resume PDF.
2. Backend parses the resume text via `pdf-parse`, then calls Gemini with a Zod-defined response schema (`zod-to-json-schema`) so the model returns strictly typed JSON.
3. The structured report is persisted in MongoDB and returned to the client.
4. Resume PDF requests render an HTML template with the report content and convert it via headless Chromium (Puppeteer).

---

## Tech stack

### Frontend
- **React 19** + **React Router 7**
- **Vite 7** (dev server + build)
- **SCSS** (modern syntax — no deprecated `lighten()` / `darken()`)
- **Axios** with `withCredentials: true` for cookie-based auth
- Glassmorphism UI: animated gradient mesh, frosted glass cards, animated SVG match-score ring, rich micro-interactions, `prefers-reduced-motion` support

### Backend
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose 9**
- **JWT** in httpOnly cookies + token blacklist on logout
- **bcryptjs** for password hashing
- **Multer** (in-memory, 3 MB cap) for resume uploads
- **pdf-parse** for resume text extraction
- **@google/genai** (Gemini) for report generation
- **Zod** + **zod-to-json-schema** for typed AI output
- **Puppeteer** for HTML → PDF rendering
- **CORS** + **cookie-parser**

---

## Project structure

```
interview-ai-yt/
├── Backend/
│   ├── server.js                          # bootstrap: dotenv + DB + listen
│   ├── package.json
│   └── src/
│       ├── app.js                         # express + cors + cookie-parser + routes
│       ├── config/
│       │   └── database.js                # mongoose connect
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── interview.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js         # JWT verify + blacklist check
│       │   └── file.middleware.js         # multer (memoryStorage, 3MB)
│       ├── models/
│       │   ├── user.model.js
│       │   ├── interviewReport.model.js
│       │   └── blacklist.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── interview.routes.js
│       └── services/
│           └── ai.service.js              # Gemini call + Puppeteer PDF
│
└── Frontend/
    ├── index.html                         # fonts: Inter + Plus Jakarta Sans
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx                        # provider tree + RouterProvider
        ├── app.routes.jsx                 # /, /new, /login, /register, /interview/:id
        ├── style.scss                     # design tokens, animated background
        ├── style/
        │   └── button.scss
        └── features/
            ├── auth/
            │   ├── auth.context.jsx
            │   ├── auth.form.scss
            │   ├── components/Protected.jsx
            │   ├── hooks/useAuth.js
            │   ├── pages/Login.jsx
            │   ├── pages/Register.jsx
            │   └── services/auth.api.js
            └── interview/
                ├── interview.context.jsx
                ├── hooks/useInterview.js
                ├── pages/Dashboard.jsx     # landing after login
                ├── pages/Home.jsx          # /new — prep form
                ├── pages/Interview.jsx     # /interview/:id
                ├── services/interview.api.js
                └── style/
                    ├── dashboard.scss
                    ├── home.scss
                    └── interview.scss
```

---

## Getting started

### Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | **20.19+** or **22.12+** (Vite 7 requires this) |
| npm | 10+ (ships with Node) |
| MongoDB | A running instance — local or Atlas |
| Google AI Studio API key | For Gemini access — [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Chromium runtime | Installed automatically by Puppeteer on first install |

### 1. Clone the repo

```bash
git clone https://github.com/Ayushhh-source/Ai-interview-prep.git
cd Ai-interview-prep
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
MONGO_URI=mongodb://localhost:27017/prepair
JWT_SECRET=replace-with-a-long-random-string
GOOGLE_GENAI_API_KEY=your-gemini-api-key
```

Run the API:

```bash
npm run dev
```

You should see:

```
Server is running on port 3000
Connected to Database
```

### 3. Frontend setup

In a second terminal, from the repo root:

```bash
cd Frontend
npm install
npm run dev
```

Vite will print a local URL — typically `http://localhost:5173/`.

> **Important — port must be 5173.** The backend's CORS config only allows `http://localhost:5173`. If Vite picks a different port (because 5173 is in use), either free up 5173 or update the `cors({ origin })` value in `Backend/src/app.js`.

### 4. First run

1. Open `http://localhost:5173/`.
2. You'll be redirected to `/login`. Click **Create an account** and register.
3. After registering you land on the **Dashboard** (empty state).
4. Click **New interview plan** to go to `/new`.
5. Paste a job description, add a self-description and/or upload a resume PDF, click **Generate My Interview Strategy**.
6. After ~30 seconds you're on the interview detail page with your full report. Use **Download Resume** in the left nav to get the role-targeted PDF.
7. Use the **Dashboard** button (top-left of `/new`) or **All plans** (top-left of the interview page) to return to the dashboard, where the new plan now appears in the grid.

---

## Environment variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign session JWTs |
| `GOOGLE_GENAI_API_KEY` | yes | Google AI Studio API key for Gemini |

### Frontend

The Vite dev server reads no env vars by default. The API base URL is hardcoded to `http://localhost:3000` in:

- `Frontend/src/features/auth/services/auth.api.js`
- `Frontend/src/features/interview/services/interview.api.js`

If you deploy to a different host, change those two `axios.create({ baseURL })` calls (or refactor them to read from `import.meta.env.VITE_API_BASE_URL`).

---

## API reference

All `/api/interview/*` routes require a valid session cookie (set on login).

### Auth

| Method | Path | Body / Params | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ username, email, password }` | Create a new user, sets session cookie |
| `POST` | `/api/auth/login` | `{ email, password }` | Verify credentials, set session cookie |
| `GET` | `/api/auth/logout` | — | Clear cookie, blacklist the token |
| `GET` | `/api/auth/get-me` | — | Return the currently logged-in user |

### Interview

| Method | Path | Body / Params | Description |
| --- | --- | --- | --- |
| `POST` | `/api/interview/` | `multipart/form-data` with `jobDescription`, `selfDescription`, `resume` (file) | Generate a new report |
| `GET` | `/api/interview/` | — | List all reports for the current user |
| `GET` | `/api/interview/report/:interviewId` | path param | Fetch a single report by id |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | path param | Render the role-targeted resume as a PDF (returns `application/pdf`) |

---

## Data model

### `users`

```js
{
  username: String,         // unique
  email:    String,         // unique
  password: String          // bcrypt hash
}
```

### `InterviewReport`

```js
{
  title:              String,
  jobDescription:     String,
  resume:             String,        // extracted text
  selfDescription:    String,
  matchScore:         Number,        // 0-100
  technicalQuestions: [{ question, intention, answer }],
  behavioralQuestions:[{ question, intention, answer }],
  skillGaps:          [{ skill, severity: 'low'|'medium'|'high' }],
  preparationPlan:    [{ day: Number, focus: String, tasks: [String] }],
  user:               ObjectId,      // ref: users
  createdAt:          Date,
  updatedAt:          Date
}
```

### `tokenBlacklists`

Stores invalidated JWTs after logout so they can't be reused before they expire.

---

## User flow

```
/login  ──►  /  (Dashboard)  ──►  /new  ──►  /interview/:id
   ▲                                           │
   │                                           ▼
   └──────── Sign out ◄── Dashboard ◄────── (back)
```

- **`/login`, `/register`** — public
- **`/`** — Dashboard. Greeting, stats, recent plans, *New interview plan* CTA.
- **`/new`** — Prep form. Job description + resume / self-description.
- **`/interview/:interviewId`** — Three-column report view with PDF download.

---

## Troubleshooting

**Login appears to do nothing / I'm bounced back to `/login`.**
The frontend silently swallows API errors today. Check the **Network** tab in devtools:
- `401` → backend rejected the credentials.
- CORS error → frontend origin isn't `http://localhost:5173`. See note in [Frontend setup](#3-frontend-setup).
- Connection refused → backend isn't running.

**`Generate My Interview Strategy` does nothing.**
Make sure at least one of the inputs is filled (job description, self-description, or resume). If the input is empty the button stays disabled.

**Backend exits or crashes on the AI call.**
Most likely `GOOGLE_GENAI_API_KEY` is missing or invalid, or the model name has rolled. Open `Backend/src/services/ai.service.js` and confirm the `model` field matches a model your key has access to.

**Puppeteer fails to launch on Linux servers.**
Install Chromium's runtime deps: `apt-get install -y libnss3 libatk-bridge2.0-0 libxss1 libasound2 libgbm1`. On macOS it generally just works.

**Resume upload errors with `LIMIT_FILE_SIZE`.**
Multer is capped at 3 MB in `Backend/src/middlewares/file.middleware.js`. Bump it there if you need more.

**MongoDB connection times out.**
- Local: confirm `mongod` is running.
- Atlas: confirm your IP is whitelisted under Network Access.

---

## Roadmap

Things on the wishlist:

- Streaming the report generation (token-by-token feedback instead of a 30s spinner)
- Mock-interview mode: voice in, voice feedback
- Re-run a plan against a different JD without re-uploading the resume
- Sharing a public read-only link to a plan
- Tags and search across saved plans
- Multi-resume profiles (different "narrative" for different role types)
- Switch resume PDF rendering from Puppeteer to a lighter HTML→PDF pipeline
