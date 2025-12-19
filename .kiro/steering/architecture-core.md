---
inclusion: always
---

# Core Architecture Principles

> **Purpose**: Fundamental architectural patterns for building maintainable, performant applications with Kiro.

## Server-First Architecture

- **Default to Server Components** for data fetching, composition, and business logic
- Only use `"use client"` in the smallest possible leaf component that truly needs it
- Push interactivity downward to minimal client boundaries
- Keep database operations on the server side

## Data-at-Leaves Pattern

- **Fetch data where it's used**, not at parent/composition levels
- Parent components spread `{...props}` only—no awaiting or transforming
- Framework caches identical queries automatically—duplication is fine
- Enables independent loading boundaries and progressive streaming

## Self-Contained Components

- Each async component manages its own loading boundary and skeleton
- Each component has its own CSS module (exceptions documented when sharing)
- Target ≤80 lines per file and never exceed 100 lines; split pre-emptively when concerns grow
- One export per file (exception: Component/Skeleton/Inner pattern)

## Code Style Standards

- **Named exports with arrow functions**: `export const Foo = () => {}`
- **Type props directly**: `(props: Props)` not `FC<Props>`
- **One function per utility file**, multiple allowed in Component/Skeleton/Inner pattern
- **camelCase** for CSS selectors, variables, functions
- **PascalCase** for component files and names
- **No barrel files** (`index.ts`/`index.tsx`) — always import directly from concrete files

## File Organization

```
src/
├── Components/          # Shared across multiple pages
├── Pages/{Page}/       # Page-specific logic and composition
│   └── Components/     # Page-specific components only
├── libs/               # Reusable business logic
│   ├── data/          # Database models, queries
│   ├── actions/       # Server actions
│   └── utils/         # Utility functions
└── app/               # Next.js routing (thin orchestration only)
```

## Component Pattern: Self-Contained Async

Every component that performs async operations must use this pattern:

```tsx
export const ComponentName = (props: Props) => {
  return (
    <Suspense fallback={<ComponentNameSkeleton />}>
      <ComponentNameInner {...props} />
    </Suspense>
  );
};

const ComponentNameSkeleton = () => {
  return <div className={styles.skeleton} />;
};

const ComponentNameInner = async (props: Props) => {
  const data = await fetchData();
  return <div>{/* render data */}</div>;
};
```

## Anti-Patterns to Avoid

- **Data Fetching Too High**: Each child fetches its own data at leaf level
- **Parent-Managed Suspense**: Each child manages its own loading boundary
- **Shared CSS Modules**: Create individual CSS module for each component
- **Default Exports**: Use named exports consistently
- **Utility Grab-Bags**: Create one helper per file, named exports only