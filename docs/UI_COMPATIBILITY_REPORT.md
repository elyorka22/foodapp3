# FoodApp UI Compatibility Report — Profile / Customer Shell

**Date:** 2026-06-02  
**Scope:** Guest & authenticated `/profile`, auth sheets, bottom nav, shared customer shell  
**Target devices:** Samsung Galaxy A51 (Android 11–13, Chrome / Samsung Internet) vs newer phones

---

## Executive summary

The profile page looked **dramatically different** on Samsung A51 vs newer devices. Code inspection shows **no OKLCH, Display-P3, `color-mix()`, or relative color syntax** in this repo (Tailwind 3.4 + fixed HEX palette).

The **primary root cause** was **system dark mode** combined with **inconsistent `dark:` styles**:

| Layer | Light-mode intent | What happened in system dark mode (common on A51) |
|--------|-------------------|--------------------------------------------------|
| Page background | `#F5F5F7` / `#F8F8F8` (hardcoded) | Stayed light gray |
| `Card` component | White cards | `dark:bg-zinc-900` → **dark cards** |
| Hero gradient | Orange gradient | Unchanged |
| Inner sections | `bg-white` | Stayed white |
| Bottom nav | `bg-white/95` + blur | Semi-transparent + blur (device-dependent) |
| Text | `text-zinc-*` | Partially overridden by dark globals on `body` |

Result: **patchwork UI** (light page, dark card chrome, white islands, muted/wrong text contrast) — reads as “completely different design,” not a small color shift.

**Secondary contributors** (worse on older Samsung GPUs / browsers):

1. **`backdrop-filter` / `backdrop-blur`** — Often disabled, weak, or falls back to flat color on mid-range Samsung devices.
2. **Tailwind opacity modifiers** (`bg-white/20`, `bg-zinc-900/50`) — Compile to `rgb(... / alpha)`; support is good on Chrome 90+ but compositing differs from solid HEX/rgba.
3. **Three-stop gradients** (`from-brand-500 via-brand-600 to-brand-700`) — Extra banding vs two-stop linear gradients on some Android GPUs.
4. **`grid` + `gap-px`** quick-actions layout — 1px gutters render inconsistently (0px, 2px, or aliased lines) across DPI / browsers.
5. **Parent `opacity-80`** on staff block — Affects entire subtree compositing (icons, text, borders) differently per GPU.

`next-themes` was configured with `defaultTheme="system"` and `enableSystem`, so **OS dark mode on A51 automatically applied `dark` on `<html>`** while most profile markup assumed light theme.

---

## What we did *not* find

| Checked | Result |
|---------|--------|
| OKLCH / OKLab / `color-mix()` / Display-P3 | Not used |
| CSS relative colors | Not used |
| `dvh` / `svh` / `lvh` on profile | Not used (`min(94vh, …)` only on auth sheet) |
| Experimental `@property` animations on profile | Not used |

---

## File-by-file: styles that caused visible differences

### 1. `providers.tsx` — Theme (critical)

```tsx
// Before
<ThemeProvider defaultTheme="system" enableSystem>

// After
<ThemeProvider defaultTheme="light" enableSystem={false}>
```

**Impact:** Stops automatic dark mode from device settings on first load.

### 2. `customer-shell.tsx` — Force light on customer routes

Removes `dark` class from `<html>` while browsing customer pages (profile, cart, home, etc.).

**Impact:** Cards and body no longer flip to dark palette on A51 when system theme is dark.

### 3. `components/ui/card.tsx`

```tsx
// Before
'... dark:border-zinc-800 dark:bg-zinc-900'

// After — customer pages no longer get dark class; tokens use #FFFFFF
'border-border bg-surface shadow-card'
```

**Impact:** Cards stay white with fixed `rgba` shadow on all customer devices.

### 4. `guest-profile-view.tsx` (highest visual weight)

| Before | Issue | After |
|--------|-------|-------|
| `bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700` | 3-stop banding | `bg-hero-primary` → `linear-gradient(135deg, #FF6B00, #EA580C)` |
| `bg-white/20 backdrop-blur-sm` on avatar | Blur missing → flat; opacity varies | `rgba(255,255,255,0.2)` solid, no blur |
| `text-white/85`, `text-white/90` | Opacity modifiers | Fixed `rgba(255,255,255,0.85/0.9)` |
| `bg-white/10`, `bg-white/5` decor circles | Same | Fixed rgba |
| `grid gap-px bg-zinc-100` quick actions | 1px grid lines unreliable | Explicit `1px solid #EAEAEA` borders |
| `shadow-[0_4px_24px_rgba(234,88,12,0.12)]` | Already rgba ✓ | Kept via `shadows.cardElevated` token |
| `opacity-80` on staff section | Whole subtree faded | Removed |

### 5. `customer-auth-sheet.tsx` & `login-prompt-sheet.tsx`

| Before | Issue | After |
|--------|-------|-------|
| `bg-zinc-900/50 backdrop-blur-sm` overlay | Blur off → different scrim | `rgba(26,26,26,0.5)` no blur |
| `bg-[#F5F5F7]/95 backdrop-blur-md` header | Frosted glass absent on A51 | Solid `#F8F8F8` header |

### 6. `bottom-nav.tsx`

| Before | Issue | After |
|--------|-------|-------|
| `bg-white/95 backdrop-blur-md` | Translucent nav | Solid `#FFFFFF` + `border-border` |

### 7. `tailwind.config.ts` — Design tokens

Standard HEX only:

- Primary `#FF6B00`, hover `#EA580C`
- Surface `#FFFFFF`, background `#F8F8F8`, border `#EAEAEA`
- Text `#1A1A1A` / muted `#6B7280`
- Shadows: fixed `rgba(...)` in `boxShadow` extend

### 8. `globals.css`

- Body background `#F8F8F8` (not `var(--bg)` alone)
- `.bg-hero-primary` / `.customer-page` utility classes with fixed HEX
- `.shadow-card` uses `rgba(0,0,0,0.06)` only

### 9. `button.tsx`

| Before | After |
|--------|-------|
| `shadow-brand-600/25` (opacity modifier) | `shadow-button-primary` → `rgba(234, 88, 12, 0.25)` |
| `bg-brand-600` | `bg-primary` `#FF6B00` |

---

## Browser notes (Samsung A51)

| Feature | Chrome Android | Samsung Internet | Fix applied |
|---------|----------------|------------------|-------------|
| `prefers-color-scheme` dark | Supported | Supported | Customer UI ignores system dark |
| `backdrop-filter` | Often OK, can be slow/disabled | Similar | Removed on profile overlays |
| `linear-gradient` 2-stop | Reliable | Reliable | Replaced 3-stop hero |
| `rgb(R G B / A)` from Tailwind `/50` | Supported | Supported | Replaced with explicit rgba on profile |
| `env(safe-area-inset-*)` | Supported | Supported | Unchanged (required for notches) |

---

## Verification checklist

- [ ] Samsung A51 — Chrome — light system theme — guest profile
- [ ] Samsung A51 — Chrome — **dark** system theme — guest profile (should match light now)
- [ ] Samsung A51 — Samsung Internet — same
- [ ] iPhone Safari — guest profile
- [ ] Desktop Chrome — guest profile
- [ ] Open auth sheet / login prompt — overlay and sheet header
- [ ] Admin `/admin` — dark mode toggle still works (staff routes)

---

## Token reference (`frontend/src/lib/design-tokens.ts`)

```ts
primary: '#FF6B00'
primaryHover: '#EA580C'
surface: '#FFFFFF'
background: '#F8F8F8'
border: '#EAEAEA'
textPrimary: '#1A1A1A'
textSecondary: '#6B7280'
```

Use semantic Tailwind classes (`bg-primary`, `text-foreground-muted`, `shadow-card`) or import `colors` / `shadows` for inline styles when arbitrary values are required.

---

## Remaining customer pages (optional follow-up)

Other routes still use `#F5F5F7`, `backdrop-blur`, or zinc opacity utilities (home, cart, shops). They inherit **forced light mode** from `CustomerShell` but have not been fully migrated to tokens. Profile path is fully migrated.
