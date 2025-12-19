---
inclusion: fileMatch
fileMatchPattern: "**/{Components,Pages}/**"
---

# Component Architecture Patterns

> **Purpose**: Patterns for building React components that follow Kiro best practices.

## Simple Data Component Pattern

For components ≤80 lines with single concern:

```tsx
// UserProfile.tsx
import { Suspense } from 'react';
import type { PageProps } from '../../Types/PageProps';
import styles from './UserProfile.module.css';

export const UserProfile = (props: PageProps) => {
  return (
    <Suspense fallback={<UserProfileSkeleton />}>
      <UserProfileInner {...props} />
    </Suspense>
  );
};

const UserProfileSkeleton = () => {
  return <div className={styles.skeleton} />;
};

const UserProfileInner = async (props: PageProps) => {
  const params = await props.params;
  const user = await getUserById(params.id);
  return <div className={styles.layout}>{/* Render user data */}</div>;
};
```

## Complex Data View Pattern

For components with multiple sections and independent queries:

```tsx
// Dashboard.tsx (composition only, ~20 lines)
import type { PageProps } from '../../Types/PageProps';
import { UserStats } from './Components/UserStats';
import { RecentActivity } from './Components/RecentActivity';
import { DataSummary } from './Components/DataSummary';
import styles from './Dashboard.module.css';

export const Dashboard = (props: PageProps) => {
  return (
    <div className={styles.layout}>
      <UserStats {...props} />
      <RecentActivity {...props} />
      <DataSummary {...props} />
    </div>
  );
};
```

## Error Boundaries for Data Components

```tsx
// src/Components/ErrorBoundary/DatabaseErrorBoundary.tsx
export const DatabaseErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div className={styles.errorContainer}>
          <h3>Unable to Load Data</h3>
          <p>Please try again in a moment.</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

## Form Components with Server Actions

```tsx
// src/Components/Forms/UserForm.tsx
'use client';
import { useActionState } from 'react';
import { createUser } from '../../libs/actions/UserActions';

export const UserForm = () => {
  const [state, formAction] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="name" type="text" required />
      <button type="submit">Create User</button>
      {state?.error && <p className={styles.error}>{state.error}</p>}
    </form>
  );
};
```

## CSS Module Patterns

Each component should have its own CSS module:

```css
/* UserProfile.module.css */
.layout {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.skeleton {
  background: #f0f0f0;
  border-radius: 4px;
  height: 200px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Use data attributes for variants */
.card[data-variant="primary"] {
  border-color: blue;
}

.card[data-variant="secondary"] {
  border-color: gray;
}
```

## Component Decision Tree

**Should I split this component?**
- File approaching 80 lines or has multiple concerns? → Split by concern before hitting 100
- Independent sections with different data? → Split into leaf components with own Suspense
- Just hitting line count? → Don't split, maintain cohesion

**Should this be a Client Component?**
- Uses browser APIs (`window`, `localStorage`)? → `'use client'`
- Needs event handlers or local state? → Server parent with client child if possible
- Otherwise → Server component

**Where should I fetch data?**
- Shared utility/design system component? → Receive as props
- Otherwise → **Fetch at leaf level where data is used**