# Dynamic Survey — Test-Readiness Checklist

> **Owner:** Programmer 3 (Frontend Lead)
> **Status:** Ready for coordination
> **Date:** 2026-08-08
> **Branch:** `feat/dynamic-survey-subcategories`

This checklist validates the full **Register → Login → Onboarding Survey** flow with a real test account before launch.

---

## 0. Prerequisites

- [ ] Feature branch `feat/dynamic-survey-subcategories` is deployed to a staging environment.
- [ ] DB migration `20260808_add_profile_subcategories` has been applied (`npx prisma migrate deploy`).
- [ ] `.env` points to the staging database and `AUTH_SECRET` is set.

> **Blocking gap:** `package.json` references `prisma/seed.ts` (`npm run prisma:seed`) but the file does not exist. A test-account seeder must be created or accounts must be registered through the UI.

---

## 1. Create Test Accounts

Register accounts through the UI (`/auth/register`) — API `POST /api/auth/register`.

| Role | Account type | Notes |
|------|--------------|-------|
| SUPPLIER | Building materials supplier | Main flow below |
| OWNER | Project owner | Verify role-appropriate dashboard after onboarding |

Password must be ≥ 8 characters. Email must be valid. All roles in `SELF_REGISTRATION_ROLES` (OWNER, CONSULTANT, CONTRACTOR, SUBCONTRACTOR, WORKSHOP, FREELANCER, SUPPLIER, TRADER) are allowed.

---

## 2. Login → Onboarding Flow

Flow verified in code:

1. `POST /api/auth/register` creates the user and signs in via `signIn("credentials")`.
2. Login page (`/auth/login`) calls `POST /api/auth/check-credentials`; on success calls `signIn` then `router.push("/onboarding")`.
3. `SmartRouter` (`src/lib/navigation/SmartRouter.tsx`) runs `useSmartNavigation()` on every route change.
4. `useSmartNavigation` fetches `GET /api/v1/entity-registry/me`.
   - `isOnboarded: false` (no Profile row for user) → stays on `/onboarding`.
   - `isOnboarded: true` → redirects to role default route (SUPPLIER → `/marketplace`, OWNER → `/projects`, etc.).

### Test cases

- [ ] **T1 — Fresh user:** After register/login, the user lands on `/onboarding` (Step 1).
- [ ] **T2 — Step navigation:** Back/Next work; Step 1 validation blocks empty profile; Step 2 documents; Step 3 survey.
- [ ] **T3 — Already-onboarded user:** A user with an existing Profile visiting `/onboarding` is auto-redirected to their role dashboard.
- [ ] **T4 — Unauthenticated:** Opening `/onboarding` while logged out redirects to `/auth/login`.

---

## 3. Dynamic Survey (Step 3)

### 3.1 Category selection

- [ ] **S1 — 12 main categories** render as a selectable grid (e.g., "Construction Materials", "Electrical & Low Current", ...).
- [ ] **S2 — Toggle behavior:** Clicking a selected category deselects it and removes its subcategories.
- [ ] **S3 — Validation:** Submit without selecting any category shows required error.

### 3.2 Subcategory selection

- [ ] **S4 — Dynamic panels:** Selecting a category shows its subcategory grid; deselecting hides it.
- [ ] **S5 — All 133 subcategories:** Verify counts per category match `src/lib/data/survey-categories.ts`.
- [ ] **S6 — Selection across categories:** User can pick subcategories from multiple categories simultaneously.
- [ ] **S7 — Validation:** Submit with category selected but no subcategory shows required error.

### 3.3 Remaining survey fields

- [ ] **S8 — Has projects / budget range / urgency / locations** all still render and validate.
- [ ] **S9 — RTL/LTR:** Layout mirrors correctly in AR/EN/UR.

---

## 4. API Payload Verification

On submit, `submitOnboarding` POSTs to `/api/v1/entity-registry/sync-entity-profile`:

```json
{
  "entity": { "entityType": "SUPP", "entitySubtype": "SUPPLIER", "companyName": "...", "contactPerson": "...", "contactEmail": "...", "contactPhone": "...", "languagePreference": "ARABIC", "location": "riyadh", "relationshipStatus": "NEW", "source": "INTERNAL", "sourceDetail": "onboarding", "pilotStatus": "STARTED", "crmClassification": "SUPPLIER" },
  "profile": {
    "businessActivity": "supplier",
    "companySize": "medium",
    "relevantCategories": ["construction-materials"],
    "subcategories": ["portland-cement", "reinforcement-steel"],
    "capabilities": ["riyadh", "jeddah"]
  }
}
```

- [ ] **A1 — 201 Created:** Onboarding submit returns 201 with `entity.entityId`.
- [ ] **A2 — Subcategories persisted:** DB `Profile.subcategories` contains the selected subcategory IDs (not in `capabilities`).
- [ ] **A3 — Capabilities intact:** `Profile.capabilities` contains project locations.
- [ ] **A4 — userId never sent:** Request body contains no `userId`; backend derives it from session (security regression gate).
- [ ] **A5 — `GET /api/v1/entity-registry/me`:** Returns `isOnboarded: true` with `profile` + `entity` after submit.

---

## 5. Success Screen

- [ ] **D1 — Success view:** Shows tracking ID (entityId) and "Go to Dashboard" CTA.
- [ ] **D2 — CTA routing:** CTA routes to `/contractor` (current behavior — confirm intended role landing).

---

## 6. Mobile Coordination (P9 / P10)

Mobile onboarding screen must render the same 12-category / 133-subcategory survey with expandable panels. See `docs/mobile-navigation-guide.md` §9 and `docs/navigation-rules.json` (v1.1).

---

## 7. Sign-off

| Role | Status | Notes |
|------|--------|-------|
| Programmer 3 (Frontend) | Ready | Survey UI + payload complete |
| Programmer 2 (Data) | Migration ready | `20260808_add_profile_subcategories` — apply + verify |
| Programmer 5 (Auth) | Verify | Register/login session flow |
| Programmer 7 (QA) | Pending | Execute T1–T4, S1–S9, A1–A5, D1–D2 |
| CTO | Pending | Final sign-off |
