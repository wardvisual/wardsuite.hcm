# WardSuite HCM — Agent Guide

This file is the source of truth for how to work in this codebase. Read it before making any structural decisions.

---

## Project Overview

Mini HCM Time Tracking system. Employees punch in/out via a React frontend; a Node.js/Express API computes regular hours, overtime (OT), night differential (ND), lateness, and undertime. Firebase is the auth and database layer.

**Tech stack:**
- Frontend: React 19 + Vite + Tailwind CSS 4 + Zustand + React Router 7
- Backend: Node.js + Express 5 (OOP / class-based)
- Database + Auth: Firebase (Firestore + Firebase Auth) — free tier
- Language: TypeScript throughout

---

## Repository Structure

```
wardsuite.hcm/
├── apps/
│   ├── api/                 Standalone Node.js/Express API
│   │   ├── main.ts          Entry point — bootstraps App class
│   │   ├── scripts/
│   │   │   └── migrate.ts   Firestore migration CLI
│   │   ├── src/
│   │   │   ├── app.ts       App class (OOP server bootstrap)
│   │   │   ├── core/
│   │   │   │   ├── database/
│   │   │   │   │   ├── firestore.client.ts        Singleton Firestore client
│   │   │   │   │   └── migrations/                Schema migration files + runner
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── auth.middleware.ts          requireAuth, requireRole, resolveActor
│   │   │   │   │   └── error.middleware.ts         Global error handler + 404
│   │   │   │   └── utils/
│   │   │   │       └── response.utils.ts          success(), error(), successWithMeta()
│   │   │   ├── modules/
│   │   │   │   ├── auth/                          Login, register, /me
│   │   │   │   │   ├── auth.dto.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   └── auth.routes.ts
│   │   │   │   └── users/                         User CRUD
│   │   │   │       ├── users.service.ts
│   │   │   │       ├── users.controller.ts
│   │   │   │       └── users.routes.ts
│   │   │   └── types/
│   │   │       ├── common.types.ts                ApiResponse, ApiError, UserRole, BaseEntity
│   │   │       ├── user.types.ts                  User, CreateUserDto, UpdateUserDto
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                 Standalone React SPA
│       ├── src/
│       │   ├── App.tsx                            Router + route definitions
│       │   ├── main.tsx                           React entry point
│       │   ├── index.css                          Global styles (Tailwind)
│       │   ├── types.ts                           Root re-exports (no new types here)
│       │   ├── lib/
│       │   │   ├── firebase.ts                    Firebase app init (auth + firestore)
│       │   │   └── env.ts                         Typed env accessor (required() guard)
│       │   ├── services/
│       │   │   └── api.service.ts                 Shared HTTP client (apiRequest<T>)
│       │   ├── components/
│       │   │   ├── auth/AuthGuard.tsx             Route protection component
│       │   │   └── layout/Shell.tsx + Sidebar.tsx App shell
│       │   └── modules/                           Feature modules (one folder per domain)
│       │       └── auth/
│       │           ├── api/auth.api.ts            Module-scoped API calls
│       │           ├── hooks/useAuth.ts           useAuth() hook
│       │           ├── pages/
│       │           │   ├── LoginPage.tsx
│       │           │   └── RegisterPage.tsx
│       │           ├── services/auth.service.ts   Firebase Auth + API bridge
│       │           ├── store/auth.store.ts        Zustand auth store
│       │           ├── types/auth.types.ts        AuthUser, UserRole, form value types
│       │           └── index.ts                   Public barrel export
│       ├── package.json
│       └── vite.config.ts
│
├── libs/                    Shared libraries (future use)
├── tsconfig.base.json       Root TS config (path aliases)
├── package.json             Root — orchestration scripts only
├── .env.example             All env vars documented
└── AGENT.md                 ← this file
```

---

## Path Aliases

Always use these — never use `../../` relative imports.

| Alias | Resolves to | Use in |
|---|---|---|
| `@web/*` | `apps/web/src/*` | All frontend imports |
| `@api/*` | `apps/api/src/*` | All API imports |

**Examples:**
```typescript
// Frontend
import { useAuth } from '@web/modules/auth';
import { apiRequest } from '@web/services/api.service';
import { env } from '@web/lib/env';

// API
import { getDb } from '@api/core/database/firestore.client';
import { success, error } from '@api/core/utils/response.utils';
import { requireAuth } from '@api/core/middleware/auth.middleware';
```

---

## API Conventions

### Response shape

All endpoints return a consistent envelope. Use the helpers from `@api/core/utils/response.utils`:

```typescript
// Success
res.status(200).json(success(data));
res.status(201).json(success(data, 'Created successfully'));
res.status(200).json(successWithMeta(data, { total: 50 }));

// Error
res.status(400).json(error('Validation failed'));
res.status(404).json(error('Not found', 404));
```

Response shape:
```json
// Success
{ "success": true, "message": "...", "data": {...}, "meta": {...} }

// Error
{ "success": false, "message": "...", "error": "...", "statusCode": 400 }
```

### Module structure (API)

Every module follows: `<entity>.dto.ts` → `<entity>.service.ts` → `<entity>.controller.ts` → `<entity>.routes.ts`

- **DTO**: Input shapes, no logic
- **Service**: All business logic + Firestore access (class-based)
- **Controller**: HTTP adapter — calls service, maps to response (class-based)
- **Routes**: Express Router — wires middleware + controller methods

```typescript
// Route handler pattern — always bind controller method
router.get('/', requireAuth, (req, res) => controller.findAll(req, res));
```

### Adding a new API module

1. Create folder `apps/api/src/modules/<name>/`
2. Add `<name>.dto.ts`, `<name>.service.ts`, `<name>.controller.ts`, `<name>.routes.ts`
3. Add types to `apps/api/src/types/` if shared
4. Register router in `apps/api/src/app.ts` → `this.app.use('/api/<name>', <name>Routes)`
5. Add a migration in `apps/api/src/core/database/migrations/` for any new Firestore collections

### Error handling in controllers

```typescript
async findOne(req: Request, res: Response): Promise<void> {
  try {
    const data = await this.service.findById(req.params.id);
    res.status(200).json(success(data));
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json(error(err.message));
  }
}
```

Throw errors with a `statusCode` property from services:
```typescript
throw Object.assign(new Error('Not found'), { statusCode: 404 });
```

---

## Firestore Migrations

Schema changes are managed via a versioned migration runner.

```bash
# From repo root
npm run migrate          # apply pending migrations
npm run migrate:status   # show applied / pending list
```

### Adding a new migration

1. Create `apps/api/src/core/database/migrations/<NNN>_<description>.ts`
2. Implement the `Migration` interface
3. Register it in `apps/api/src/core/database/migrations/index.ts`

```typescript
// apps/api/src/core/database/migrations/004_create_attendance.ts
import { Migration } from './runner';

export const migration004: Migration = {
  version: '004',
  description: 'Create attendance collection with schema seed',
  async up(db) {
    await db.collection('attendance').doc('__schema__').set({ /* shape */ });
  },
};
```

**Rules:**
- Migrations are append-only — never modify an applied migration
- Use sentinel doc `__schema__` to document the shape of each collection
- Version is zero-padded 3-digit string: `'001'`, `'002'`, etc.

---

## Frontend Module Conventions

### Module structure (web)

Every feature lives under `apps/web/src/modules/<domain>/`:

```
modules/<domain>/
├── api/          <domain>.api.ts     — API calls using apiRequest<T>
├── hooks/        use<Domain>.ts      — React hook (wraps store actions)
├── pages/        <Name>Page.tsx      — Route-level page components
├── services/     <domain>.service.ts — Business logic, Firebase SDK calls
├── store/        <domain>.store.ts   — Zustand store
├── types/        <domain>.types.ts   — Types scoped to this module
└── index.ts                          — Barrel export (public API of the module)
```

### Zustand store pattern

Every module owns its own store. Always use `persist` when the state should survive refresh.

```typescript
// modules/<domain>/store/<domain>.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DomainState {
  items: Item[];
  isLoading: boolean;
  error: string | null;

  setItems: (items: Item[]) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useDomainStore = create<DomainState>()(
  persist(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: 'hcm-<domain>', partialize: (s) => ({ items: s.items }) },
  ),
);
```

### Hook pattern

The hook is the only entry point to a module's state from React components:

```typescript
// modules/<domain>/hooks/use<Domain>.ts
export function useDomain() {
  const { items, isLoading, error, setItems, setLoading, setError } = useDomainStore();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await domainApi.getAll();
      setItems(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  }, [setItems, setLoading, setError]);

  return { items, isLoading, error, fetchAll };
}
```

### API service pattern

```typescript
// modules/<domain>/api/<domain>.api.ts
import { apiRequest } from '@web/services/api.service';
import { Item } from '@web/modules/<domain>/types/<domain>.types';

export const domainApi = {
  getAll: () => apiRequest<Item[]>('/<domain>'),
  getById: (id: string) => apiRequest<Item>(`/<domain>/${id}`),
  create: (body: unknown) => apiRequest<Item>('/<domain>', { method: 'POST', body }),
  update: (id: string, body: unknown) =>
    apiRequest<Item>(`/<domain>/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => apiRequest<null>(`/<domain>/${id}`, { method: 'DELETE' }),
};
```

### Adding a new frontend module

1. Create folder `apps/web/src/modules/<domain>/` with the structure above
2. Write types in `types/<domain>.types.ts`
3. Write Zustand store in `store/<domain>.store.ts`
4. Write API calls in `api/<domain>.api.ts`
5. Write hook in `hooks/use<Domain>.ts`
6. Write pages in `pages/`
7. Export public API from `index.ts`
8. Add route in `apps/web/src/App.tsx`
9. Add nav link in `apps/web/src/components/layout/Sidebar.tsx`

---

## Auth Flow

1. User submits email + password on `LoginPage`
2. `authService.login()` calls Firebase Auth SDK (`signInWithEmailAndPassword`)
3. Firebase returns an ID token; it is sent to `POST /api/auth/login`
4. The API verifies the token with Firebase Admin SDK and returns a custom token + user profile
5. `useAuthStore.setAuth(user, token)` persists the session via Zustand `persist`
6. `AuthGuard` checks `isAuthenticated`; redirects to `/auth/login` if false

Protected routes use `requireAuth` middleware on the API. Role checks use `requireRole('ADMIN')`.

---

## Running the Apps (Standalone)

Both apps are **fully independent** — they run their own `npm install` and dev servers.

```bash
# Root — runs both apps concurrently
npm run dev

# Individual apps
npm run dev:api    # http://localhost:3000
npm run dev:web    # http://localhost:5173  (proxies /api → :3000)

# Database migrations
npm run migrate           # apply pending
npm run migrate:status    # show status

# Build
npm run build:api
npm run build:web
npm run build          # both

# Typecheck
npm run typecheck
```

---

## Firestore Collections

| Collection | Doc ID format | Description |
|---|---|---|
| `users` | Firebase UID | User profiles + schedule |
| `attendance` | auto-id | Punch in/out records |
| `dailySummary` | `{userId}_{YYYY-MM-DD}` | Pre-computed daily totals |
| `_migrations` | migration version | Applied migration log |

---

## File Naming Rules

| Layer | Pattern | Example |
|---|---|---|
| API DTO | `<entity>.dto.ts` | `auth.dto.ts` |
| API service | `<entity>.service.ts` | `auth.service.ts` |
| API controller | `<entity>.controller.ts` | `auth.controller.ts` |
| API routes | `<entity>.routes.ts` | `auth.routes.ts` |
| Web page | `<Name>Page.tsx` | `LoginPage.tsx` |
| Web component | `<Name>.tsx` | `AuthGuard.tsx` |
| Web hook | `use<Name>.ts` | `useAuth.ts` |
| Web API client | `<entity>.api.ts` | `auth.api.ts` |
| Web store | `<entity>.store.ts` | `auth.store.ts` |
| Web types | `<entity>.types.ts` | `auth.types.ts` |

---

## Component Size Limit

Max 400 lines per file. Extract sub-components, columns, or drawers into separate files when approaching this limit.

---

## Git Workflow

**The agent does not commit.** After changes, output the exact commands for the developer to run.

- **Never run `git commit` yourself.**
- **No Co-Authored-By lines** — commits are authored by wardvisual only.
- **One commit per logical change.**
- **Conventional commit format:** `type(scope): description`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`

```bash
# Example
git add apps/api/src/modules/attendance/
git commit -m "feat(api): add attendance punch-in/out module"
```
