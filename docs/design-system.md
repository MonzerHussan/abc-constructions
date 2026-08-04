# ABC Design System Foundation

> **Version:** 1.0 — Phase 2 Core Experience  
> **Owner:** Frontend (Programmer 3)  
> **Reviewers:** Programmer 5 (Gatekeeper), Programmers 9 & 10 (Mobile)  
> **Status:** In Progress

This document defines the reusable UI components, navigation patterns, and visual identity rules used across the ABC platform. It is designed to be **cross-platform ready** so the same primitives can be implemented consistently on Web, iOS, and Android.

---

## 1. Design Principles

1. **One brand, one voice.** All components use the ABC Brand Identity v2.0 color palette and typography.
2. **Mobile-first.** Components are built with responsive layouts and touch-friendly sizes.
3. **RTL-first.** The platform supports Arabic, English, and Urdu; directional icons and layouts must adapt automatically.
4. **Accessible.** Components include focus states, aria labels, and semantic HTML.
5. **Composability.** Complex pages are built by combining small, focused primitives.

---

## 2. Brand Identity Reference

### 2.1 Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-500` | `#0A1F44` | Headings, primary text, nav active states, footer |
| `secondary-500` | `#F97316` | Primary CTAs, active highlights, cart badge |
| `accent-500` | `#D4A017` | Premium accents, ratings, flags |
| `surface-0` | `#FFFFFF` | Cards, inputs, backgrounds |
| `surface-50` | `#F5F5F5` | Page backgrounds |
| `surface-900` | `#1A1A1A` | Body text |
| `success-500` | `#22C55E` | Success, in stock, verified |
| `danger-500` | `#EF4444` | Errors, out of stock, remove |
| `warning-500` | `#F59E0B` | Warnings, low stock |
| `info-500` | `#3B82F6` | Information |

### 2.2 Typography

| Use Case | Font (EN) | Font (AR) | Font (UR) | Size | Weight |
|----------|-----------|-----------|-----------|------|--------|
| Headlines | Plus Jakarta Sans | Cairo | Noto Nastaliq Urdu | 48px | 700 |
| Body | Plus Jakarta Sans | Cairo | Noto Nastaliq Urdu | 18px | 400 |
| UI Labels | Plus Jakarta Sans | Cairo | Noto Nastaliq Urdu | 14px | 500 |
| Small/Caption | Plus Jakarta Sans | Cairo | Noto Nastaliq Urdu | 12px | 400 |

### 2.3 Logo

- **Asset:** `public/logo.png` (icon-only)
- **Usage:** Navbar, Login, Home, Mobile app icon
- **Do not** add text next to the mark in these contexts.

---

## 3. Component Library

All components live in `src/components/ui/` and are exported from `src/components/ui/index.ts`.

### 3.1 Button

```tsx
<Button variant="primary" size="md" loading={isSubmitting}>
  Submit
</Button>
```

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `primary \| secondary \| outline \| ghost \| danger \| success \| link` | Visual style |
| `size` | `xs \| sm \| md \| lg \| xl \| icon` | Size |
| `loading` | `boolean` | Shows spinner and disables button |
| `loadingText` | `string` | Text shown while loading |
| `leftIcon` / `rightIcon` | `ReactNode` | Icon nodes |

### 3.2 Input / Select / Textarea

Controlled form controls with consistent focus ring, border, and invalid states.

```tsx
<FormField label="Email" htmlFor="email" error={errors.email} required>
  <Input id="email" type="email" />
</FormField>
```

### 3.3 FormField

Wraps a label, helper text, and error message.

```tsx
<FormField label="Company Name" htmlFor="company" helper="As registered commercially">
  <Input id="company" />
</FormField>
```

### 3.4 Checkbox & Switch

```tsx
<Checkbox label="Remember me" />
<Switch label="Enable notifications" />
```

### 3.5 Card

```tsx
<Card className="p-6">
  <CardTitle>Card Title</CardTitle>
  <CardBody>Card content</CardBody>
</Card>
```

### 3.6 Badge

```tsx
<Badge variant="success">In Stock</Badge>
```

### 3.7 Avatar

```tsx
<Avatar name="ABC Factory" src="/logo.png" size="md" />
```

### 3.8 Modal

```tsx
<Modal
  open={isOpen}
  onClose={close}
  title="Confirm"
  footer={<Button onClick={confirm}>Confirm</Button>}
>
  Are you sure?
</Modal>
```

### 3.9 EmptyState

```tsx
<EmptyState
  icon={<Package className="w-8 h-8" />}
  title="No products found"
  description="Try adjusting your filters"
  action={<Button>Browse all</Button>}
/>
```

### 3.10 Skeleton

```tsx
<Skeleton className="h-48 w-full" />
```

### 3.11 Table

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Product</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>...</TableBody>
</Table>
```

### 3.12 Icon (RTL)

```tsx
<Icon icon={ArrowRight} />
```

The `Icon` component auto-flips directional icons in RTL mode.

---

## 4. Smart Navigation Router

### 4.1 Goal

Users should never wonder where to go after signing in. The router decides the destination based on:

1. **Authentication state**
2. **Onboarding completion state**
3. **User role**

### 4.2 Rules

| State | Current Location | Action |
|-------|------------------|--------|
| Unauthenticated | Protected page | Redirect to `/auth/login` with `callbackUrl` |
| Authenticated, not onboarded | Any non-public page | Redirect to `/onboarding` |
| Authenticated, onboarded | `/auth/login`, `/auth/register`, `/onboarding` | Redirect to role default route |
| Authenticated, onboarded | Any other page | Allow |

### 4.3 Role Default Routes

| Role | Default Route |
|------|---------------|
| `ADMIN` / `SUPER_ADMIN` | `/admin` |
| `SUPPLIER` / `TRADER` | `/marketplace` |
| `CONTRACTOR` / `SUBCONTRACTOR` / `WORKSHOP` | `/projects` |
| `CONSULTANT` / `OWNER` | `/projects` |
| `FREELANCER` | `/jobs` |

### 4.4 Implementation

- **API:** `GET /api/v1/entity-registry/me` returns `{ isOnboarded, profile, entity }`.
- **Hook:** `useSmartNavigation()` in `src/lib/navigation/useSmartNavigation.ts`.
- **Component:** `<SmartRouter />` mounted once in `src/app/Providers.tsx`.

### 4.5 Mobile Mapping

Programmers 9 & 10 should mirror the same role-to-route mapping in the native routers. The source of truth is:

```ts
src/lib/navigation/types.ts
```

Use `ROLE_DEFAULT_ROUTE` and `shouldRedirectToOnboarding` / `shouldRedirectToDashboard` helpers.

---

## 5. Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

Components should use `sm:`, `md:`, `lg:` prefixes for layout changes.

---

## 6. File Structure

```
src/components/ui/
  ├── avatar.tsx
  ├── badge.tsx
  ├── button.tsx
  ├── card.tsx
  ├── checkbox.tsx
  ├── empty-state.tsx
  ├── form-field.tsx
  ├── icon.tsx
  ├── index.ts
  ├── input.tsx
  ├── modal.tsx
  ├── select.tsx
  ├── skeleton.tsx
  ├── stat-card.tsx
  ├── status-badge.tsx
  ├── switch.tsx
  ├── table.tsx
  └── textarea.tsx

src/lib/navigation/
  ├── api.ts
  ├── index.ts
  ├── SmartRouter.tsx
  ├── types.ts
  └── useSmartNavigation.ts
```

---

## 7. Next Steps

- [ ] Add Toast / Notification system.
- [ ] Add Breadcrumb and PageHeader components.
- [ ] Add Skeleton screens for every page template.
- [ ] Create a component showcase page at `/design-system` for visual regression testing.
- [ ] Validate touch targets (min 44×44dp) with Programmers 9 & 10.

---

## 8. Cross-Platform Notes

- **Colors:** Export the CSS variables as a JSON token file for mobile teams.
- **Typography:** Use the same font families on iOS/Android where possible; fallback to system fonts.
- **Icons:** Use `lucide-react` on web; use the equivalent Lucide native libraries on mobile.
- **RTL:** Web uses `dir="rtl"` and Tailwind logical properties. Mobile should mirror the same directional logic.

---

> **Maintained by:** Programmer 3 (Frontend)  
> **Last updated:** 2026-08-04
