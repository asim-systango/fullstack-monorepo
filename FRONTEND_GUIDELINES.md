# Frontend Architecture & Development Guidelines

> **Systango CRM Monorepo — Next.js 15 (`apps/web`) & Design System (`libs/ui`)**

---

## 🏛️ 1. Monorepo Architecture & Directory Structure

Our repository follows an enterprise monorepo pattern using **pnpm workspaces**. Code is cleanly separated into application instances and shared domain libraries.

```
fullstack-monorepo/
├── apps/
│   ├── web/                     # Next.js 15 App Router Frontend (@app/web)
│   │   ├── app/                 # Routes, pages, and layouts
│   │   │   ├── (auth)/          # Unauthenticated auth routes (login, register)
│   │   │   ├── dashboard/       # Protected workspace & management pages
│   │   │   ├── layout.tsx       # Root layout (Fonts, Theme Provider, AppProviders)
│   │   │   └── page.tsx         # Enterprise Landing Page
│   │   ├── components/          # App-specific feature components
│   │   │   ├── auth/            # AuthProvider, ShellHeader, LoginForm
│   │   │   ├── providers/       # Global Redux & Auth context providers
│   │   │   └── dashboard/       # Dashboard widgets, stats cards
│   │   ├── lib/                 # Core utilities & state
│   │   │   ├── api.ts           # Axios apiClient & Auth service methods
│   │   │   ├── constants.ts     # Centralized error & status messages
│   │   │   └── store/           # Redux Toolkit store & typed hooks
│   │   └── styles/              # Global CSS & Tailwind imports
│   └── api/                     # NestJS Backend API Gateway (@app/api - Port 3002)
└── libs/
    ├── ui/                      # Centralized Design System (@shared/ui)
    │   ├── src/components/      # Reusable UI primitives (Button, Card, Field, etc.)
    │   └── src/theme/           # OKLCH ink/paper theme tokens, typography, CSS vars
    ├── api-client/              # Shared Axios client & HTTP error definitions (@shared/api-client)
    └── types/                   # Shared TypeScript interfaces & DTOs (@shared/types)
```

---

## 🎨 2. UI Components & Theme Enforcement (`@shared/ui`)

### **Rule #1: ALWAYS Use `@shared/ui` Components**

Do **NOT** write ad-hoc raw `<button>`, `<input>`, `<div className="border bg-zinc-900...">` elements for standard controls. Always import components directly from `@shared/ui`:

```tsx
// ✅ CORRECT: Import pre-styled, accessible design system components
import { Button, Card, CardBody, CardHeader, CardTitle, Field, TextInput, Alert, Badge } from '@shared/ui';

// ❌ INCORRECT: Creating custom raw controls with inline Tailwind colors
<button className="bg-purple-600 text-white p-2 rounded">Submit</button>
<input className="border border-gray-300 p-2" />
```

### **Available Design System Components**

| Component                                                        | Usage & Import Path                                                                                |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `Button`                                                         | Action buttons with variant (`primary`, `secondary`, `ghost`, `danger`) & built-in `loading` state |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody` | Content cards & containers                                                                         |
| `Field`, `TextInput`, `TextArea`, `Select`                       | Accessible form controls with built-in labels, hints, and error states                             |
| `Checkbox`                                                       | Form check controls                                                                                |
| `Alert`                                                          | Feedback alert banners (`tone="neutral" \| "info" \| "success" \| "danger"`)                       |
| `Badge`                                                          | Status indicators (`tone="neutral" \| "accent" \| "success" \| "danger"`)                          |
| `Spinner`                                                        | Loading spinners and skeletons                                                                     |
| `Dialog`, `Modal`                                                | Overlay dialogs with backdrops                                                                     |
| `Table`, `TableRow`, `TableCell`                                 | Data grid tables                                                                                   |

---

## 🎨 3. Theme Tokens & Global CSS Variables

Our application uses an **OKLCH Ink & Paper** theme system defined in `@shared/ui/theme`. Theme CSS variables are set on `.dark` and globally available in `apps/web/styles/globals.css`.

### **Standard CSS Variables**

When writing custom page containers or layouts, use theme variables instead of hardcoded hex/zinc values:

```css
/* Core Theme Tokens */
var(--background)          /* Primary page background */
var(--foreground)          /* Primary text color */
var(--card)                /* Card background */
var(--card-foreground)     /* Card text color */
var(--muted)               /* Muted element background */
var(--muted-foreground)    /* Muted text color */
var(--border)              /* Border color */
var(--primary)             /* Primary interactive color */
var(--accent)              /* Accent highlight color */
var(--destructive)         /* Error / Danger color */
var(--success)             /* Success indicator color */
```

### **Theme Variable Usage Example**

```tsx
// ✅ CORRECT: Utilizing global theme variables
<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
  <span className="text-[var(--muted-foreground)]">Workspace Settings</span>
</div>
```

---

## 💬 4. Centralized Messages & Constants (`lib/constants.ts`)

### **Rule #2: Zero Hardcoded Error & UI Messages**

User-facing error messages, alerts, and system strings **MUST** be imported from `apps/web/lib/constants.ts`. Technical errors (e.g. `Network Error`, `500 Internal Server Error`) must never be displayed raw to users.

### **Centralized Message Registry (`apps/web/lib/constants.ts`)**

```typescript
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS:
    'The email or password you entered is incorrect. Please try again.',
  REQUIRED_FIELDS: 'Please enter both your work email and password.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNEXPECTED_ERROR: 'An unexpected connection error occurred. Please check your network.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Signed in successfully. Redirecting to workspace...',
  LOGOUT_SUCCESS: 'You have been signed out.',
} as const;
```

### **Error Handling Pattern in Pages & Components**

```tsx
import { ApiClientError } from '@shared/api-client';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';

try {
  await login(email, password);
} catch (err) {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401 || err.statusCode === 400) {
      setError(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    } else {
      setError(AUTH_ERROR_MESSAGES.SERVER_ERROR);
    }
  } else {
    setError(AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
}
```

---

## 📡 5. API Communication & Gateway Routing

### **Rule #3: Use Relative `/api/v1/` Endpoint Paths**

- **Next.js Proxy Rewrite** handles background routing from port `3000` to NestJS port `3002`.
- Base URL is configured via `NEXT_PUBLIC_API_URL=/api/v1` in `.env.local`.
- Use the centralized `apiClient` instance in `apps/web/lib/api.ts` or `@shared/api-client`.

```typescript
// ✅ CORRECT: API call using relative gateway URL
export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};
```

---

## 🔄 6. State Management Standard

1. **Authentication Context (`AuthProvider`)**: Use `useAuth()` hook from `@/components/auth` for user session, active organization, `login()`, and `logout()`.
2. **Global Redux Store (`apps/web/lib/store`)**: For global application state (leads, deals, organizations), use typed hooks:
   ```tsx
   import { useAppDispatch, useAppSelector } from '@/lib/store';
   ```

---

## ✅ Best Practices Checklist

- [ ] **Import `@shared/ui`** for all buttons, inputs, cards, fields, and alerts.
- [ ] **Use CSS theme variables** (`var(--background)`, `var(--foreground)`, `var(--card)`) for layouts.
- [ ] **Use `AUTH_ERROR_MESSAGES`** & `SUCCESS_MESSAGES` from `@/lib/constants` for UI feedback.
- [ ] **Never expose raw 500/404 server stack traces** to the end user.
- [ ] **Verify TypeScript types** cleanly pass `pnpm --filter @app/web typecheck`.
