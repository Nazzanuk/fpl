# Architecture Guidelines for Next.js Applications

> **Purpose**: Architectural patterns and best practices for Next.js App Router applications. Ensures consistency, maintainability, and optimal performance through server-first patterns.


## Table of Contents

1. [Core Principles](#core-principles)
2. [Component Patterns](#component-patterns)
3. [Key Patterns](#key-patterns)
4. [Anti-Patterns](#anti-patterns)
5. [Decision Trees](#decision-trees)

---

## Core Principles

### 1. Server-First Architecture

- **Default to Server Components** for data fetching, composition, and translations
- Only use `"use client"` in the smallest possible leaf component that truly needs it
- Push interactivity downward to minimal client boundaries

### 2. Async-at-Leaves

- **Fetch data where it's used**, not at parent/composition levels
- Parent components spread `{...props}` only—no awaiting or transforming
- React caches identical fetch calls automatically—duplication is fine
- Enables independent Suspense boundaries and progressive streaming

### 3. Self-Contained Components

- Each async component manages its own Suspense boundary and skeleton
- Each component has its own CSS module (exceptions documented when sharing)
- Target ≤80 lines per file and never exceed 100 lines; split pre-emptively when concerns grow
- One export per file (exception: Component/Skeleton/Inner pattern)

### 4. Declarative Composition

- Favor declarative data/JSX over imperative branching—describe UI with configuration objects and small helpers
- Extract child components into their own files as soon as they gain state, effects, or more than a few JSX nodes
- Promote repeated patterns into typed configuration collections (e.g., arrays of section definitions) and map over them
- Extract each utility into its **own** file (inside a relevant `Utils` directory); never group multiple helpers together, and lift the helper to the highest reasonable scope so other features can reuse it without duplication

### 5. Thin App Folders

- `apps/*/src/app/**` stays minimal—routing entries, layout composition, light styling only
- Move UI, business logic, hooks, and data access into `libs/**` for reusability and testability
- Extract to library if file grows beyond thin orchestration
- Routing files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`) only compose and consume pages/screens/components exported from libraries (e.g. `libs/pdp`, `libs/shared-components`). No domain logic, data fetching, or helpers live directly in `app/**`.

### 6. Code Style

- **Named exports with arrow functions**: `export const Foo = () => {}`
- **Type props directly**: `(props: Props)` not `FC<Props>`
- **One function per utility file**, multiple allowed in Component/Skeleton/Inner pattern
- **camelCase** for CSS selectors, variables, functions
- **PascalCase** for component files and names
- **Don't refactor tests unless explicitly requested**
- **File naming**: All component, screen, hook, utility, and config filenames use PascalCase (e.g. `VehicleTile.tsx`, `PriceCalculator.ts`). Only Next.js routing entry files (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `route.ts`) and framework config files (e.g. `next.config.js`) remain lowercase.

### 7. File Organization

- **Shared Components** (`src/Components/`) - Used across multiple pages (Button, Modal, DataGrid)
- **Page Components** (`src/Pages/{Page}/`) - Page-specific logic and composition
- **Page Sub-Components** (`src/Pages/{Page}/Components/`) - Components used only by that page
- **No barrel files** (`index.ts`/`index.tsx`) — they obscure dependency graphs and block effective code splitting, so always import directly from concrete files

---

## Component Patterns

### Pattern 1: Simple Page (≤ 80 lines, single concern)

```tsx
// ProductDetail.page.tsx
import { Suspense } from 'react';
import type { PageProps } from '../../Types/PageProps';
import styles from './ProductDetail.page.module.css';

export const ProductDetailPage = (props: PageProps) => {
  return (
    <Suspense fallback={<ProductDetailPageSkeleton />}>
      <ProductDetailPageInner {...props} />
    </Suspense>
  );
};

const ProductDetailPageSkeleton = () => {
  return <div className={styles.skeleton} />;
};

const ProductDetailPageInner = async (props: PageProps) => {
  const params = await props.params;
  const data = await fetchData(params);
  return <div className={styles.layout}>{/* Render data */}</div>;
};
```

**Use when:**

- Primarily presentational
- ≤80 lines total (refactor well before 100)
- No independent sections that could stream separately

### Pattern 2: Complex Page (multiple sections, independent data)

```tsx
// ProductDetail.page.tsx (composition only, ~20 lines)
import type { PageProps } from '../../Types/PageProps';
import { ProductDetailHeader } from './Components/ProductDetailHeader';
import { ProductDetailInfo } from './Components/ProductDetailInfo';
import { RelatedProducts } from './Components/RelatedProducts';
import styles from './ProductDetail.page.module.css';

export const ProductDetailPage = (props: PageProps) => {
  return (
    <div className={styles.layout}>
      <ProductDetailHeader {...props} />
      <ProductDetailInfo {...props} />
      <RelatedProducts {...props} />
    </div>
  );
};
```

Each child follows self-contained pattern:

```tsx
// Components/ProductDetailHeader.tsx (~80 lines)
import { Suspense } from 'react';
import type { PageProps } from '../../../Types/PageProps';
import styles from './ProductDetailHeader.module.css';

export const ProductDetailHeader = (props: PageProps) => {
  return (
    <Suspense fallback={<ProductDetailHeaderSkeleton />}>
      <ProductDetailHeaderInner {...props} />
    </Suspense>
  );
};

const ProductDetailHeaderSkeleton = () => {
  return <div className={styles.headerSkeleton} />;
};

const ProductDetailHeaderInner = async (props: PageProps) => {
  const params = await props.params;
  const data = await getProduct(params.id);
  return <div className={styles.headerSection}>{/* Render header */}</div>;
};
```

**Use when:**

- Multiple distinct sections (header, actions, details, vehicles)
- Sections can load independently (progressive streaming)
- Individual sections approach 80 lines (never let a section exceed 100)
- Sections have different data dependencies

### File Organization

```
src/
├── Components/          # Shared across multiple pages
│   ├── Button/
│   └── DataGrid/
└── Pages/              # Page-specific components
    └── ProductDetail/
        ├── ProductDetail.page.tsx
        ├── ProductDetail.page.module.css
        └── Components/     # Page-specific only
            ├── ProductDetailHeader.tsx
            └── ProductDetailHeader.module.css
```

---

## Key Patterns

### Server vs Client Components

**Default: Server Components** for data fetching, composition, translations, pure rendering.

**Client Components (`"use client"`)** only when you strictly need:

- Browser-only APIs (`window`, `localStorage`, `IntersectionObserver`)
- Event handlers and local interactive state
- Animation libraries requiring browser runtime

**When Leaf Must Be Client (Async-at-Leaves Still Applies):**

The client leaf still owns its Suspense boundary and fetches its own data via `use()`:

```tsx
'use client';
import { use, Suspense } from 'react';
import { useState } from 'react';

// ⚠️ Exception: If fetching inside the component causes infinite loops (e.g. due to re-renders),
// you may lift the promise creation outside the component scope, but keep the use() call inside.
const dataPromise = fetchData();

export const InteractiveWidget = (props: PageProps) => {
  return (
    <Suspense fallback={<InteractiveWidgetSkeleton />}>
      <InteractiveWidgetInner {...props} />
    </Suspense>
  );
};

const InteractiveWidgetSkeleton = () => <div className="skeleton-widget" />;

const InteractiveWidgetInner = (props: PageProps) => {
  const params = use(props.params);
  const data = use(dataPromise); // ✅ Leaf fetch + Suspense colocated
  const [state, setState] = useState(data.initial);
  return <div>{/* interactive UI using state & data */}</div>;
};
```

**Translations: Server Only** — Always call `getMessages` in server components, pass strings to client children.

### Async-at-Leaves

**Golden Rule:** Fetch data at the leaf component where it's used, not at parent/composition levels.

```tsx
// ✅ CORRECT: Parent spreads props, child fetches
export const ProductDetailPage = (props: PageProps) => {
  return (
    <div>
      <PricingPanel {...props} />
      <SpecificationsPanel {...props} />
    </div>
  );
};

const PricingPanelInner = async (props: PageProps) => {
  const params = await props.params;
  const data = await getProductData(params.id); // ✅ Fetch at leaf
  return <PanelBox>{/* render */}</PanelBox>;
};

// ❌ WRONG: Parent fetches and passes down
export const ProductDetailPage = async (props: PageProps) => {
  const params = await props.params;
  const product = await getProductData(params.id); // ❌ Too high
  return <PricingPanel product={product} />;
};
```

**Benefits:**

- Progressive streaming (sections load independently)
- Automatic deduplication (React caches identical fetches)
- Better error boundaries (failures isolated)
- Parallel fetching (multiple fetches concurrent, not sequential)

### Self-Contained Suspense

Every unit that performs `await` (either an exported async component or an internal `Inner` function) must be wrapped immediately by a colocated Suspense boundary via the Component/Skeleton/Inner pattern — **no exceptions**.

**Trigger conditions for applying Component/Skeleton/Inner pattern:**

- The exported component itself is marked `async` and awaits.
- OR the exported component delegates to an internal `Inner` function that is `async` / awaits.
- Any usage of `await`, `use()` on a promise, or calls to async functions (`fetch`, `getMessages`, DB/API queries, dynamic imports).

**Scope of enforcement (always apply when triggers met):**

- Page-specific, shared, design system, or client components (when they fetch using `use()`).
- Fetching data, translations, configuration, feature flags — all treated equally.
- Regardless of prop types (`PageProps` or custom).

**Pattern structure:**

```tsx
export const ComponentName = (props: Props) => {
  return (
    <Suspense fallback={<ComponentNameSkeleton />}>
      <ComponentNameInner {...props} />
    </Suspense>
  );
};

const ComponentNameSkeleton = () => {
  return (
    <PanelBox title="Title">
      <div className="skeleton-content" />
    </PanelBox>
  );
};

const ComponentNameInner = async (props: Props) => {
  const data = await fetchData(); // Any await triggers this pattern
  return (
    <PanelBox title="Title">
      <div>{data}</div>
    </PanelBox>
  );
};
```

❌ **NEVER rely on a higher-level ancestor for Suspense of an async leaf:** the boundary must be defined in the same file, directly wrapping the async `Inner`.

```tsx
// ❌ WRONG - Parent managing child's Suspense from outside its file
export const Parent = () => (
  <Suspense fallback={<Loading />}>
    <AsyncChild />
  </Suspense>
);

// ✅ CORRECT - AsyncChild owns its boundary locally
export const AsyncChild = (props: Props) => (
  <Suspense fallback={<AsyncChildSkeleton />}>
    <AsyncChildInner {...props} />
  </Suspense>
);
```

**Important:** Skeletons should be colocated with their components (not extracted to separate files) and **must visually reflect the final rendered state** (layout, dimensions) to prevent layout shift. If a file exceeds 100 lines and contains Component/Skeleton/Inner pattern, extract sub-components or repeated JSX blocks instead of extracting the skeleton.

### CSS Modules

Each component has its own CSS module. Use **camelCase** for selectors (`.wrapper`, `.actionButton`), never kebab-case, and keep palettes/spacing aligned with the surrounding app or library styles so components feel rich and contextual rather than plain. Style variants exclusively with `data-*` attributes (e.g., `[data-variant="danger"]`); defining separate CSS classes per variant is forbidden. Prefer CSS nesting for descendant/variant rules to keep selectors readable and scoped near their parents.

### Minimal Client State & Forms

Client components (forms, interactive widgets) must remain as stateless as possible from a React perspective:

- Prefer uncontrolled form elements and native browser form submission / validation.
- Use server actions / API routes for processing; avoid lifting form state into React unless necessary.
- Introduce client state only for behaviors not achievable via native HTML/DOM (e.g. dynamic cascading selects – see Cascade Create/Edit flow).
- Perform authoritative validation server-side; mirror minimal constraints via HTML attributes (`required`, `pattern`, `min`, `max`).
- Keep logic in the smallest leaf; never bubble form state upward.

Example (uncontrolled + server action):

```tsx
// apps/admin-portal/src/app/cascade/create/page.tsx
import { CascadeCreateScreen } from 'libs/cascade/Create/CascadeCreateScreen';
export default function Page(props: PageProps) {
  return <CascadeCreateScreen {...props} />;
}

// libs/cascade/Create/CascadeCreateScreen.tsx
import { Suspense } from 'react';
export const CascadeCreateScreen = (props: PageProps) => (
  <Suspense fallback={<CascadeCreateScreenSkeleton />}>
    <CascadeCreateScreenInner {...props} />
  </Suspense>
);
const CascadeCreateScreenSkeleton = () => <div className="skeleton-form" />;
const CascadeCreateScreenInner = async (props: PageProps) => {
  const params = await props.params;
  const initial = await fetchCascadeDefaults(params.orgId);
  return (
    <form action={createCascadeAction}>
      <input name="name" defaultValue={initial.name} required />
      <select name="segment" defaultValue={initial.segment} required>
        {initial.segments.map(s => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <button type="submit">Create</button>
    </form>
  );
};
```

### Declarative Composition & Extraction

- Prefer declarative JSX driven by typed configuration arrays/objects over imperative conditionals sprinkled throughout components.
- When declarative config is static, move it into a colocated `*.config.ts`/`*.config.tsx` utility so components stay slim and reuse stays trivial.
- Extract child components into their own files once they gain state, effects, or more than a few JSX nodes; parents should remain orchestration-only.
- Move repeated UI patterns into reusable components fed by typed configuration collections.
- Utilities must live in individual files (one helper per file) for clarity and isolated testing—no utility grab bags. When a helper can serve multiple features, move it up to a shared scope (e.g., feature root or `libs/**/Utils`) so it can be imported broadly.

### PageProps Architecture

```typescript
type PageProps<P extends Params = Params, S extends SearchParams = SearchParams> = {
  params: Promise<P>; // Always present, always resolves to object
  searchParams: Promise<S>; // Always present, always resolves to object
};
```

**PageProps contains ONLY Next.js page primitives.** Everything else fetched at leaf.

**Component Categories:**

| Category                                | Pattern                              | Example                                                                                                                                               |
| --------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page Components** (`app/**/page.tsx`) | Spread props, never await            | `export default function Page(props: PageProps) { return <Layout {...props} />; }`                                                                    |
| **Layout/Composition**                  | Accept PageProps, spread to children | `function Layout(props: PageProps) { return <><Header {...props} /><Main {...props} /></>; }`                                                         |
| **Leaf Server Components**              | Async, await props, fetch data       | `async function DataDisplay(props: PageProps) { const params = await props.params; const data = await fetchData(params); return <div>{data}</div>; }` |
| **Design System/Reusable**              | Explicit props, no PageProps         | `function Button({ onClick, children }: ButtonProps) { return <button onClick={onClick}>{children}</button>; }`                                       |

**Modal Pages:** Use `PageProps` normally—Next.js provides `searchParams` as empty object for modal routes.

---

## Anti-Patterns

| Anti-Pattern                    | Fix                                                               |
| ------------------------------- | ----------------------------------------------------------------- |
| **Data Fetching Too High**      | Each child fetches its own data at leaf level                     |
| **Parent-Managed Suspense**     | Each child manages its own Suspense boundary                      |
| **Shared CSS Modules**          | Create individual CSS module for each component                   |
| **Default Exports**             | Use named exports: `export const Foo = () => {}`                  |
| **FC Type Notation**            | Type props directly: `export const Foo = (props: Props) => {}`    |
| **Async Skeletons**             | Skeleton components must be synchronous, not async                |
| **Imperative Rendering Blocks** | Use declarative config collections and extracted child components |
| **Utility Grab-Bags**           | Create one helper per file, named exports only                    |

---

## Decision Trees

### Should I Split This Component?

- File approaching 80 lines or has multiple concerns? → Split by concern before hitting 100
- Independent sections with different data? → Split into leaf components with own Suspense
- Just hitting line count? → Don't split, maintain cohesion

### Should This Be a Client Component?

- Uses browser APIs (`window`, `localStorage`)? → `'use client'`
- Needs event handlers or local state? → Server parent with client child if possible
- Otherwise → Server component

### Where Should I Fetch Data?

- Shared utility/design system component? → Receive as props
- Otherwise → **Fetch at leaf level where data is used**
- React automatically caches duplicate fetches

---

## Quick Checklist

- [ ] Server-first; `'use client'` only for minimal interactive leaves
- [ ] Data fetching only at leaves (including client leaves via `use()`)
- [ ] Every async unit uses Component/Skeleton/Inner pattern locally
- [ ] Composition layers spread `{...props}` without awaiting
- [ ] Named exports; arrow functions; no default exports (aside from Next.js routing entry files)
- [ ] camelCase CSS selectors; PascalCase component names
- [ ] One CSS module per component; variants via `data-*` attributes
- [ ] Keep files ≤80 lines (hard cap 100); split early
- [ ] Prefer declarative config + mapping over imperative branching
- [ ] One utility per file; promote shared helpers to `libs/**`
- [ ] App router folders contain only routing shells; all screens/components come from `libs/**`
- [ ] All non-routing filenames use PascalCase (routing entry files lowercase)
- [ ] Forms use uncontrolled inputs + server actions; minimal client state
