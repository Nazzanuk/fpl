---
inclusion: fileMatch
fileMatchPattern: "**/data/**"
---

# Database Architecture Patterns

> **Purpose**: Patterns for database operations, data access, and persistence layers.

## Repository Pattern

Structure your data access using the repository pattern:

```typescript
// src/libs/data/repositories/UserRepository.ts
export const UserRepository = {
  async findById(id: string): Promise<User | null> {
    const connection = await getConnection();
    // Database query implementation
  },

  async findByEmail(email: string): Promise<User | null> {
    // Database query implementation
  },

  async create(userData: CreateUserInput): Promise<User> {
    return await withTransaction(async (connection) => {
      // Insert operation with transaction
    });
  },

  async update(id: string, updates: UpdateUserInput): Promise<User> {
    // Update operation
  },

  async delete(id: string): Promise<void> {
    // Delete operation
  }
};
```

## Data Validation Layer

Always validate data before database operations:

```typescript
// src/libs/data/validation/UserValidation.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().min(0).max(150).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const validateCreateUser = (data: unknown): CreateUserInput => {
  return CreateUserSchema.parse(data);
};
```

## Connection Management

```typescript
// src/libs/data/Connection.ts
export const getConnection = async () => {
  // Connection pooling and management
  // Return database connection instance
};

export const withTransaction = async <T>(
  callback: (connection: Connection) => Promise<T>
): Promise<T> => {
  const connection = await getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};
```

## Server Actions for Mutations

```typescript
// src/libs/actions/UserActions.ts
'use server';
import { redirect } from 'next/navigation';
import { UserRepository } from '../data/repositories/UserRepository';
import { validateCreateUser } from '../data/validation/UserValidation';

export async function createUser(prevState: any, formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email'),
      name: formData.get('name'),
    };

    const validatedData = validateCreateUser(rawData);
    const user = await UserRepository.create(validatedData);
    
    redirect(`/users/${user.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create user'
    };
  }
}
```

## Database Security Guidelines

- **Always use parameterized queries** to prevent SQL injection
- **Validate and sanitize all input** before database operations
- **Never expose database connection strings** in client code
- **Implement proper authentication and authorization** for data access
- **Use transactions** for multi-table operations to ensure data consistency

## Performance Best Practices

- **Implement connection pooling** for efficient resource usage
- **Use indexes appropriately** on frequently queried columns
- **Implement query result caching** where beneficial
- **Avoid N+1 query problems** by using proper joins or batch loading
- **Use database-level pagination** for large datasets
- **Monitor query performance** and optimize slow queries