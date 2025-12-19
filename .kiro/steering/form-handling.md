---
inclusion: fileMatch
fileMatchPattern: "**/*{Form,form}*"
---

# Form Handling Patterns

> **Purpose**: Best practices for handling forms, validation, and user input with server actions.

## Uncontrolled Forms with Server Actions

Prefer uncontrolled forms with server actions for database operations:

```tsx
// CreateUserForm.tsx
'use client';
import { useActionState } from 'react';
import { createUser } from '../actions/UserActions';

export const CreateUserForm = () => {
  const [state, formAction] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="email">Email</label>
        <input 
          id="email"
          name="email" 
          type="email" 
          required 
          aria-describedby={state?.fieldErrors?.email ? "email-error" : undefined}
        />
        {state?.fieldErrors?.email && (
          <p id="email-error" className={styles.fieldError}>
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name">Name</label>
        <input 
          id="name"
          name="name" 
          type="text" 
          required 
          minLength={1}
          maxLength={100}
        />
        {state?.fieldErrors?.name && (
          <p className={styles.fieldError}>{state.fieldErrors.name}</p>
        )}
      </div>

      <button type="submit" disabled={state?.pending}>
        {state?.pending ? 'Creating...' : 'Create User'}
      </button>

      {state?.error && (
        <p className={styles.formError}>{state.error}</p>
      )}
    </form>
  );
};
```

## Server Action with Validation

```typescript
// src/libs/actions/UserActions.ts
'use server';
import { redirect } from 'next/navigation';
import { UserRepository } from '../data/repositories/UserRepository';
import { CreateUserSchema } from '../data/validation/UserValidation';

export async function createUser(prevState: any, formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    name: formData.get('name'),
  };

  // Validate input
  const validation = CreateUserSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: 'Please check your input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await UserRepository.create(validation.data);
    redirect(`/users/${user.id}`);
  } catch (error) {
    console.error('Failed to create user:', error);
    return {
      error: 'Failed to create user. Please try again.',
    };
  }
}
```

## Edit Form with Default Values

```tsx
// EditUserForm.tsx
import { Suspense } from 'react';
import { getUserById } from '../data/repositories/UserRepository';

export const EditUserForm = (props: { userId: string }) => {
  return (
    <Suspense fallback={<EditUserFormSkeleton />}>
      <EditUserFormInner {...props} />
    </Suspense>
  );
};

const EditUserFormSkeleton = () => (
  <div className={styles.formSkeleton}>
    <div className={styles.skeletonField} />
    <div className={styles.skeletonField} />
    <div className={styles.skeletonButton} />
  </div>
);

const EditUserFormInner = async (props: { userId: string }) => {
  const user = await getUserById(props.userId);
  
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <EditUserFormClient user={user} />
  );
};

// Client component for form interaction
'use client';
const EditUserFormClient = ({ user }: { user: User }) => {
  const [state, formAction] = useActionState(updateUser, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={user.id} />
      
      <input 
        name="email" 
        type="email" 
        defaultValue={user.email}
        required 
      />
      
      <input 
        name="name" 
        type="text" 
        defaultValue={user.name}
        required 
      />
      
      <button type="submit">Update User</button>
      
      {state?.error && <p className={styles.error}>{state.error}</p>}
    </form>
  );
};
```

## Form Validation Patterns

### Client-Side Validation (HTML5)

Use HTML5 validation attributes for immediate feedback:

```tsx
<input 
  name="email"
  type="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  title="Please enter a valid email address"
/>

<input 
  name="age"
  type="number"
  min="0"
  max="150"
  step="1"
/>
```

### Server-Side Validation (Authoritative)

Always validate on the server using schemas:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  age: z.number().min(0, 'Age must be positive').max(150, 'Invalid age').optional(),
});
```

## Form State Management

### Loading States

```tsx
const [state, formAction] = useActionState(createUser, null);

return (
  <form action={formAction}>
    {/* form fields */}
    <button type="submit" disabled={state?.pending}>
      {state?.pending ? 'Saving...' : 'Save'}
    </button>
  </form>
);
```

### Error Handling

```tsx
// Display field-specific errors
{state?.fieldErrors?.email && (
  <p className={styles.fieldError}>{state.fieldErrors.email}</p>
)}

// Display general form errors
{state?.error && (
  <div className={styles.formError}>
    <strong>Error:</strong> {state.error}
  </div>
)}
```

## Form Guidelines

- **Use uncontrolled inputs** with `defaultValue` for better performance
- **Validate on both client and server** - client for UX, server for security
- **Provide clear error messages** that help users fix issues
- **Use semantic HTML** (`fieldset`, `legend`, proper labels)
- **Handle loading states** to provide feedback during submission
- **Redirect after successful mutations** to prevent duplicate submissions