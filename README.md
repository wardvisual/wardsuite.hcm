# WardSuite HCM

> A mini Human Capital Management time tracking system for attendance operations.

WardSuite HCM helps teams track time-ins/time-outs with a clean punch flow, while automatically computing regular hours, overtime, night differential, lateness, and undertime.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hcm.wardvisual.com-white?style=for-the-badge)](https://hcm.wardvisual.com)

![WardSuite HCM](./apps/web/src/assets/banner.jpg)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7 |
| Animations | Motion |
| State | Zustand (with persist) |
| Backend | Node.js, Express 5, TypeScript (class-based/OOP) |
| Database | Firebase Firestore |
| Authentication | Firebase Auth + Firebase Admin token verification |
| Monorepo | npm workspaces (`apps/*`) |

---

## Repository Structure

```text
wardsuite.hcm/
├── apps/
│   ├── api/                # Express 5 API (TypeScript)
│   │   ├── main.ts
│   │   ├── scripts/
│   │   │   └── migrate.ts
│   │   └── src/
│   │       ├── app.ts
│   │       ├── core/
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   └── users/
│   │       └── types/
│   └── web/                # React SPA (Vite + Tailwind)
│       └── src/
│           ├── components/
│           ├── modules/
│           │   ├── auth/
│           │   ├── attendance/
│           │   ├── dashboard/
│           │   └── Landing/
│           └── services/
├── libs/
├── .env.example
├── package.json
└── tsconfig.base.json
```

---

## Core Features

| Area | Included |
|---|---|
| Punch Tracking | Punch in/out flow with real-time attendance updates |
| Time Computation | Regular hours, OT, ND (22:00–06:00), late/undertime summaries |
| Daily Summary | Pre-computed day-level metrics |
| Role Access | RBAC support for ADMIN and MANAGER surfaces |
| Admin Visibility | Attendance reporting and punch management panels |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- Firebase project with Firestore + Auth enabled
- Firebase service account credentials

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy values from `.env.example` into your local `.env`:

```env
API_PORT=3000
NODE_ENV=development

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_ID=

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_ID=
JWT_SECRET=
```

### 3. Run in development

```bash
npm run dev
```

- API: `http://localhost:3000`
- Web: `http://localhost:5173`

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run API + Web concurrently |
| `npm run dev:api` | Run API only |
| `npm run dev:web` | Run Web only |
| `npm run build` | Build API + Web |
| `npm run build:api` | Build API only |
| `npm run build:web` | Build Web only |
| `npm run typecheck` | Typecheck API + Web |
| `npm run lint` | Lint TypeScript/TSX source files |
| `npm run lint:fix` | Auto-fix lint issues where possible |
| `npm run format` | Format app files with Prettier |
| `npm run format:check` | Check formatting with Prettier |
| `npm run migrate` | Apply Firestore migrations |
| `npm run migrate:status` | Show migration status |
| `npm run seed` | Seed API demo data |
| `npm run emulate` | Run Firebase emulators |
| `npm run firebase:deploy:rules` | Deploy Firestore security rules |
| `npm run firebase:deploy:indexes` | Deploy Firestore indexes |
| `npm run firebase:deploy:hosting` | Deploy Firebase hosting |
| `npm run clean` | Remove build output directories |

---

## API Response Contract

```json
// success
{ "success": true, "message": "...", "data": {}, "meta": {} }

// error
{ "success": false, "message": "...", "error": "...", "statusCode": 400 }
```

---

## Firestore Collections

| Collection | Doc ID format | Purpose |
|---|---|---|
| `users` | Firebase UID (`_schema` sentinel also exists) | User profiles and schedule metadata |
| `attendance` | auto-id (`_schema` sentinel also exists) | Punch in/out records (one doc per IN/OUT event) |
| `dailySummary` | `{userId}_{YYYY-MM-DD}` (`_schema` sentinel also exists) | Computed daily totals |
| `attendanceHistory` | auto-id (`_schema` sentinel also exists) | Immutable audit log for punch edits/adjustments |
| `weeklySummary` | `{userId}_{YYYY-WNN}` (`_schema` sentinel also exists) | Aggregated weekly totals for reporting |
| `_migrations` | migration version | Migration tracking |

---

## Author

**Eduardo** — [@wardvisual](https://github.com/wardvisual)
