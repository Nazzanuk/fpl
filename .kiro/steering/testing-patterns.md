---
inclusion: manual
---

# Testing Patterns

> **Purpose**: Testing strategies and patterns for database applications built with Kiro architecture.

## Unit Testing Components

Test components in isolation with mocked data:

```typescript
// UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

// Mock the data fetching function
jest.mock('../data/repositories/UserRepository', () => ({
  UserRepository: {
    findById: jest.fn(),
  },
}));

describe('UserProfile', () => {
  it('renders user information', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    };

    (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    render(<UserProfile userId="1" />);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles user not found', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue(null);

    render(<UserProfile userId="999" />);

    expect(await screen.findByText('User not found')).toBeInTheDocument();
  });
});
```

## Integration Testing Server Actions

Test server actions with a test database:

```typescript
// UserActions.test.ts
import { createUser } from './UserActions';
import { UserRepository } from '../data/repositories/UserRepository';

// Use test database
beforeEach(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await cleanupTestDatabase();
});

describe('createUser', () => {
  it('creates user with valid data', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('name', 'Test User');

    const result = await createUser(null, formData);

    // Should redirect (no return value)
    expect(result).toBeUndefined();

    // Verify user was created
    const user = await UserRepository.findByEmail('test@example.com');
    expect(user).toBeTruthy();
    expect(user?.name).toBe('Test User');
  });

  it('returns error for invalid data', async () => {
    const formData = new FormData();
    formData.append('email', 'invalid-email');
    formData.append('name', '');

    const result = await createUser(null, formData);

    expect(result).toEqual({
      error: 'Please check your input',
      fieldErrors: {
        email: ['Invalid email format'],
        name: ['Name is required'],
      },
    });
  });
});
```

## Testing Database Repositories

```typescript
// UserRepository.test.ts
import { UserRepository } from './UserRepository';

describe('UserRepository', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('create', () => {
    it('creates user and returns with id', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await UserRepository.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('throws error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await UserRepository.create(userData);

      await expect(UserRepository.create(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const created = await UserRepository.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      const found = await UserRepository.findById(created.id);

      expect(found).toEqual(created);
    });

    it('returns null when not found', async () => {
      const found = await UserRepository.findById('nonexistent');
      expect(found).toBeNull();
    });
  });
});
```

## Testing Form Components

```typescript
// CreateUserForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateUserForm } from './CreateUserForm';

// Mock the server action
jest.mock('../actions/UserActions', () => ({
  createUser: jest.fn(),
}));

describe('CreateUserForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateUserForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith(
        null,
        expect.any(FormData)
      );
    });
  });

  it('displays validation errors', async () => {
    const mockCreateUser = createUser as jest.Mock;
    mockCreateUser.mockResolvedValue({
      error: 'Please check your input',
      fieldErrors: {
        email: ['Invalid email format'],
      },
    });

    const user = userEvent.setup();
    render(<CreateUserForm />);

    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
  });
});
```

## Test Database Setup

```typescript
// test-setup.ts
import { Pool } from 'pg';

let testDb: Pool;

export async function setupTestDatabase() {
  testDb = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  // Run migrations
  await testDb.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function cleanupTestDatabase() {
  await testDb.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
}

export async function teardownTestDatabase() {
  await testDb.end();
}
```

## Testing Guidelines

### What to Test

- **Repository functions** - Database operations and business logic
- **Server actions** - Form handling and validation
- **Component rendering** - UI displays correct data
- **Error handling** - Graceful failure scenarios
- **Integration flows** - End-to-end user workflows

### What Not to Test

- **Framework internals** - Next.js routing, React internals
- **Third-party libraries** - Database drivers, validation libraries
- **Implementation details** - Internal component state, CSS classes

### Test Organization

```
src/
├── Components/
│   ├── UserProfile/
│   │   ├── UserProfile.tsx
│   │   └── UserProfile.test.tsx
├── libs/
│   ├── actions/
│   │   ├── UserActions.ts
│   │   └── UserActions.test.ts
│   └── data/
│       └── repositories/
│           ├── UserRepository.ts
│           └── UserRepository.test.ts
└── __tests__/
    ├── setup.ts
    └── helpers/
```

### Best Practices

- **Use descriptive test names** that explain the scenario
- **Test behavior, not implementation** - Focus on what the user sees
- **Keep tests isolated** - Each test should be independent
- **Use test databases** - Never test against production data
- **Mock external dependencies** - APIs, file systems, etc.
- **Test error scenarios** - Don't just test the happy path