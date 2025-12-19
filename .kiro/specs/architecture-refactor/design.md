# Architecture Refactor Design Document

## Overview

This design document outlines a comprehensive architectural refactor of the FPL dashboard application to address current issues with mixed concerns, inconsistent patterns, and poor separation of responsibilities. The refactor will transform the application into a more maintainable, scalable, and developer-friendly codebase while leveraging Next.js App Router capabilities effectively.

The current architecture suffers from several key issues:
- Mixed data fetching and presentation logic in components
- Inconsistent component patterns and file organization
- Over-reliance on query parameters for navigation
- Lack of proper error boundaries and loading states
- Insufficient separation between business logic and presentation

## Architecture

### High-Level Architecture

The refactored application will follow a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   App Router    │  │ Page Components │  │   Shared     │ │
│  │   (Routes)      │  │                 │  │ Components   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Services     │  │   Calculators   │  │  Validators  │ │
│  │                 │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Repositories   │  │     Cache       │  │  API Client  │ │
│  │                 │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Route Structure

The new routing structure will leverage Next.js App Router capabilities:

```
/
├── league/
│   └── [leagueId]/
│       ├── page.tsx                    # League overview/standings
│       ├── layout.tsx                  # League-specific layout
│       ├── manager/
│       │   └── [managerId]/
│       │       ├── page.tsx            # Manager detail
│       │       ├── history/
│       │       │   └── page.tsx        # Manager history
│       │       └── transfers/
│       │           └── page.tsx        # Manager transfers
│       ├── player/
│       │   └── [playerId]/
│       │       └── page.tsx            # Player detail
│       ├── differentials/
│       │   └── page.tsx                # League differentials
│       ├── ownership/
│       │   └── page.tsx                # League ownership
│       ├── trends/
│       │   └── page.tsx                # League trends
│       ├── head-to-head/
│       │   └── page.tsx                # H2H comparison
│       ├── fixtures/
│       │   └── page.tsx                # Fixtures view
│       ├── @modal/
│       │   ├── (.)player/
│       │   │   └── [playerId]/
│       │   │       └── page.tsx        # Player modal
│       │   └── default.tsx
│       └── tools/
│           ├── fdr-planner/
│           │   └── page.tsx            # FDR planner
│           ├── transfer-planner/
│           │   └── page.tsx            # Transfer planner
│           └── chip-advisor/
│               └── page.tsx            # Chip advisor
```

## Components and Interfaces

### Component Organization

The refactored component structure will follow clear separation principles:

```
src/
├── app/                                # Next.js App Router (thin orchestration)
│   └── league/[leagueId]/
│       ├── page.tsx
│       ├── layout.tsx
│       └── ...
├── libs/
│   ├── Shared/                         # Shared across application
│   │   ├── Components/                 # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── DataGrid/
│   │   │   └── LoadingSpinner/
│   │   ├── Hooks/                      # Custom React hooks
│   │   ├── Utils/                      # Utility functions
│   │   └── Types/                      # Shared TypeScript types
│   ├── Fpl/                           # FPL-specific business logic
│   │   ├── Data/                      # Data layer
│   │   │   ├── Repositories/          # Data access abstractions
│   │   │   ├── Cache/                 # Caching strategies
│   │   │   └── Client/                # API client
│   │   ├── Services/                  # Business logic services
│   │   ├── Calculators/               # FPL calculations
│   │   ├── Validators/                # Data validation
│   │   └── Types/                     # FPL-specific types
│   └── Pages/                         # Page-specific components
│       ├── LeagueOverview/
│       ├── ManagerDetail/
│       ├── PlayerDetail/
│       └── ...
```

### Component Patterns

All async components will follow the standardized Component/Skeleton/Inner pattern:

```typescript
// Example: ManagerDetail component
export const ManagerDetail = (props: ManagerDetailProps) => {
  return (
    <Suspense fallback={<ManagerDetailSkeleton />}>
      <ManagerDetailInner {...props} />
    </Suspense>
  );
};

const ManagerDetailSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.headerSkeleton} />
      <div className={styles.statsSkeleton} />
      <div className={styles.teamSkeleton} />
    </div>
  );
};

const ManagerDetailInner = async (props: ManagerDetailProps) => {
  const manager = await managerRepository.getManagerDetail(props.managerId, props.gameweek);
  return (
    <div className={styles.container}>
      <ManagerHeader manager={manager} />
      <ManagerStats stats={manager.stats} />
      <ManagerTeam team={manager.team} />
    </div>
  );
};
```

### Interface Definitions

Key interfaces for the data layer:

```typescript
// Repository interfaces
interface LeagueRepository {
  getLeagueStandings(leagueId: number): Promise<LeagueStandings>;
  getLeagueStats(leagueId: number): Promise<LeagueStats>;
  getLeagueOwnership(leagueId: number): Promise<PlayerOwnership[]>;
}

interface ManagerRepository {
  getManagerDetail(managerId: number, gameweek: number): Promise<ManagerDetail>;
  getManagerHistory(managerId: number): Promise<ManagerHistory>;
  getManagerTransfers(managerId: number): Promise<Transfer[]>;
}

interface PlayerRepository {
  getPlayerDetail(playerId: number): Promise<PlayerDetail>;
  getPlayerFixtures(playerId: number): Promise<Fixture[]>;
  getPlayerHistory(playerId: number): Promise<PlayerHistory>;
}

// Service interfaces
interface FPLCalculatorService {
  calculateLivePoints(picks: ManagerPick[], liveStats: Map<number, LiveElementStats>): number;
  calculateProjectedBonus(liveStats: LiveElementStats[]): Map<number, number>;
  calculateDifferentials(leagueOwnership: PlayerOwnership[], managerTeam: ManagerTeam): Differential[];
}

interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
}
```

## Data Models

### Core Data Models

The refactored data models will provide better type safety and validation:

```typescript
// Enhanced type definitions with validation
interface LeagueStandings {
  readonly league: {
    readonly id: number;
    readonly name: string;
    readonly created: string;
    readonly adminEntry: number;
  };
  readonly standings: ReadonlyArray<ManagerStanding>;
  readonly hasNext: boolean;
  readonly page: number;
}

interface ManagerStanding {
  readonly managerId: number;
  readonly playerName: string;
  readonly teamName: string;
  readonly totalPoints: number;
  readonly rank: number;
  readonly lastRank: number;
  readonly gameweekPoints: number;
  readonly gameweekRank: number;
}

interface ManagerDetail extends ManagerStanding {
  readonly region: string;
  readonly overallRank: number;
  readonly transfers: number;
  readonly transferCost: number;
  readonly teamValue: number;
  readonly bank: number;
  readonly activeChip: string | null;
  readonly captain: PlayerPick;
  readonly viceCaptain: PlayerPick;
  readonly team: ReadonlyArray<PlayerPick>;
}

interface PlayerPick {
  readonly playerId: number;
  readonly position: number;
  readonly multiplier: number;
  readonly isCaptain: boolean;
  readonly isViceCaptain: boolean;
  readonly player: PlayerInfo;
  readonly liveStats: LiveStats;
}

interface PlayerInfo {
  readonly id: number;
  readonly webName: string;
  readonly fullName: string;
  readonly team: TeamInfo;
  readonly position: Position;
  readonly price: number;
  readonly status: PlayerStatus;
}

interface LiveStats {
  readonly minutes: number;
  readonly points: number;
  readonly bonus: number;
  readonly bps: number;
  readonly goals: number;
  readonly assists: number;
  readonly cleanSheets: number;
  readonly saves: number;
  readonly yellowCards: number;
  readonly redCards: number;
}
```

### Data Validation

All data models will include runtime validation using Zod schemas:

```typescript
import { z } from 'zod';

const PlayerInfoSchema = z.object({
  id: z.number().positive(),
  webName: z.string().min(1),
  fullName: z.string().min(1),
  team: TeamInfoSchema,
  position: z.enum(['GKP', 'DEF', 'MID', 'FWD']),
  price: z.number().positive(),
  status: z.enum(['a', 'd', 'i', 's', 'u']),
});

const LiveStatsSchema = z.object({
  minutes: z.number().min(0).max(120),
  points: z.number(),
  bonus: z.number().min(0).max(3),
  bps: z.number().min(0),
  goals: z.number().min(0),
  assists: z.number().min(0),
  cleanSheets: z.number().min(0).max(1),
  saves: z.number().min(0),
  yellowCards: z.number().min(0),
  redCards: z.number().min(0).max(1),
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following correctness properties will ensure the architectural refactor meets its requirements:

Property 1: Repository pattern enforcement
*For any* component that needs FPL data, it should access data only through repository interfaces and never directly import the FPL API client
**Validates: Requirements 1.1**

Property 2: Business logic separation
*For any* presentation component, it should not contain business logic calculations and should delegate to service modules
**Validates: Requirements 1.2**

Property 3: Component pattern consistency
*For any* async component, it should follow the Component/Skeleton/Inner pattern with colocated Suspense boundaries
**Validates: Requirements 1.3, 2.1**

Property 4: File organization boundaries
*For any* component, it should be placed in the correct directory based on its usage scope (shared vs page-specific)
**Validates: Requirements 1.4, 4.1, 4.2**

Property 5: Component file structure
*For any* component file, it should export only one component and have a corresponding CSS module
**Validates: Requirements 2.2**

Property 6: Data fetching at leaves
*For any* data fetching operation, it should occur in leaf components where the data is consumed rather than parent components
**Validates: Requirements 2.3**

Property 7: Explicit component props
*For any* reusable component, it should accept explicit props rather than spreading PageProps
**Validates: Requirements 2.4**

Property 8: File size limits
*For any* component file, it should not exceed 100 lines and should be split by concern before reaching this limit
**Validates: Requirements 2.5**

Property 9: API interface typing
*For any* API function, it should have proper TypeScript interfaces and return typed responses
**Validates: Requirements 3.1**

Property 10: Cache strategy consistency
*For any* cached data, it should use appropriate cache TTL and strategy based on data type
**Validates: Requirements 3.2**

Property 11: Error handling consistency
*For any* API call, it should handle errors consistently and return user-friendly error messages
**Validates: Requirements 3.3**

Property 12: Schema validation
*For any* API response, it should be validated against a schema before being used in the application
**Validates: Requirements 3.5, 9.2**

Property 13: Route-based navigation
*For any* view navigation, it should use dedicated routes rather than query parameter switching
**Validates: Requirements 5.1**

Property 14: Nested route structure
*For any* manager or player selection, it should use nested dynamic routes for proper deep linking
**Validates: Requirements 5.2**

Property 15: Modal route implementation
*For any* modal overlay, it should use Next.js parallel routes and intercepting routes
**Validates: Requirements 5.3**

Property 16: URL parameter usage
*For any* URL parameter, it should be used only for filtering and pagination, not for view switching
**Validates: Requirements 5.5**

Property 17: Server-driven state
*For any* application state, it should minimize client-side state and prefer server-driven patterns
**Validates: Requirements 6.1**

Property 18: Props-based data flow
*For any* component that needs shared data, it should receive data through props rather than global state
**Validates: Requirements 6.2**

Property 19: Error boundary containment
*For any* component error, it should be contained by proper error boundaries and not crash the entire application
**Validates: Requirements 7.5**

Property 20: TypeScript strictness
*For any* component props, they should use strict TypeScript interfaces without any types
**Validates: Requirements 9.1**

## Error Handling

The refactored application will implement comprehensive error handling at multiple levels:

### API Error Handling

```typescript
class FPLApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = 'FPLApiError';
  }
}

const handleApiError = (error: unknown, endpoint: string): FPLApiError => {
  if (error instanceof Response) {
    const userMessage = error.status === 404 
      ? 'The requested data could not be found'
      : 'There was a problem loading the data. Please try again.';
    
    return new FPLApiError(
      `API call failed: ${error.status} ${error.statusText}`,
      error.status,
      endpoint,
      userMessage
    );
  }
  
  return new FPLApiError(
    'Network error occurred',
    0,
    endpoint,
    'Unable to connect to FPL servers. Please check your connection and try again.'
  );
};
```

### Component Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ComponentErrorBoundary extends Component<
  PropsWithChildren<{ fallback?: ComponentType<{ error: Error }> }>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{ fallback?: ComponentType<{ error: Error }> }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error caught:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Loading States and Skeletons

All skeleton components will match the layout of their final rendered state:

```typescript
const ManagerDetailSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatarSkeleton} />
        <div className={styles.nameSkeleton} />
        <div className={styles.rankSkeleton} />
      </div>
      <div className={styles.stats}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.statSkeleton} />
        ))}
      </div>
      <div className={styles.team}>
        <div className={styles.pitchSkeleton}>
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className={styles.playerSkeleton} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

## Testing Strategy

The refactored application will implement a comprehensive testing strategy with both unit tests and property-based tests:

### Unit Testing Approach

- **Component Testing**: Test component rendering, user interactions, and prop handling
- **Service Testing**: Test business logic, calculations, and data transformations
- **Repository Testing**: Test data access patterns and API integration
- **Utility Testing**: Test pure functions and helper utilities

### Property-Based Testing Approach

The application will use **fast-check** as the property-based testing library, configured to run a minimum of 100 iterations per property test.

Property-based tests will verify:
- Data transformation invariants (e.g., point calculations always return non-negative numbers)
- API response validation (all responses conform to expected schemas)
- Component structure consistency (async components follow required patterns)
- Route generation correctness (URLs are properly formed and navigable)
- Cache behavior (cache keys are consistent and TTLs are respected)

### Testing Configuration

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/libs/(.*)$': '<rootDir>/src/libs/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// Property-based test configuration
import fc from 'fast-check';

fc.configureGlobal({
  numRuns: 100, // Minimum 100 iterations per property
  verbose: true,
});
```

Each property-based test will be tagged with comments referencing the specific correctness property from this design document using the format: **Feature: architecture-refactor, Property {number}: {property_text}**

Based on the prework analysis, I'll now define the correctness properties that can be automatically tested:

### Property Reflection

After reviewing all properties identified in the prework, several can be consolidated:
- Properties 1.1, 1.4, 4.1-4.5 all relate to file organization and can be combined into comprehensive organization properties
- Properties 2.1, 2.2, 2.5 relate to component structure and can be consolidated
- Properties 3.1-3.5 relate to data layer consistency and can be grouped
- Properties 5.1-5.5 relate to routing patterns and can be combined

### Architectural Correctness Properties

**Property 1: Repository Pattern Enforcement**
*For any* component that accesses FPL data, it should only import from repository interfaces, never directly from the API client
**Validates: Requirements 1.1**

**Property 2: Business Logic Separation**
*For any* presentation component, it should not contain FPL calculation logic or direct API calls
**Validates: Requirements 1.2**

**Property 3: Component Pattern Consistency**
*For any* async component, it should follow the Component/Skeleton/Inner pattern with colocated Suspense boundaries
**Validates: Requirements 1.3, 2.1**

**Property 4: File Organization Compliance**
*For any* component file, it should be placed in the correct directory based on its usage scope (shared vs page-specific)
**Validates: Requirements 1.4, 4.1, 4.2**

**Property 5: Component File Structure**
*For any* component file, it should export exactly one component and have a corresponding CSS module
**Validates: Requirements 2.2**

**Property 6: Data Fetching at Leaves**
*For any* data fetching operation, it should occur in leaf components where the data is consumed, not in parent components
**Validates: Requirements 2.3**

**Property 7: Explicit Props for Reusable Components**
*For any* reusable component, it should accept explicit typed props rather than spreading PageProps
**Validates: Requirements 2.4**

**Property 8: File Size Limits**
*For any* component file, it should not exceed 100 lines and should be split by concern when approaching 80 lines
**Validates: Requirements 2.5**

**Property 9: Typed API Interfaces**
*For any* API endpoint function, it should have proper TypeScript return types and parameter types
**Validates: Requirements 3.1**

**Property 10: Consistent Error Handling**
*For any* API call, it should handle errors consistently and return user-friendly error messages
**Validates: Requirements 3.3**

**Property 11: Schema Validation**
*For any* API response, it should be validated against a Zod schema before being used in the application
**Validates: Requirements 3.5**

**Property 12: Route-Based Navigation**
*For any* navigation between views, it should use dedicated routes rather than query parameter switching
**Validates: Requirements 5.1**

**Property 13: Nested Dynamic Routes**
*For any* manager or player selection, it should use proper nested dynamic routes for deep linking
**Validates: Requirements 5.2**

**Property 14: URL Parameter Usage**
*For any* URL parameters, they should only be used for filtering and pagination, not for view switching
**Validates: Requirements 5.5**

**Property 15: Props-Based Data Flow**
*For any* component that needs data, it should receive data through props rather than accessing global state
**Validates: Requirements 6.2**

**Property 16: Server Actions for Mutations**
*For any* data update operation, it should use server actions rather than client-side mutations
**Validates: Requirements 6.3**

**Property 17: Error Boundary Coverage**
*For any* component that can throw errors, it should be wrapped by appropriate error boundaries
**Validates: Requirements 7.5**

**Property 18: Strict TypeScript Usage**
*For any* component props interface, it should use strict TypeScript types without any types
**Validates: Requirements 9.1**

**Property 19: Runtime Schema Validation**
*For any* API response handling, it should validate data against TypeScript schemas at runtime
**Validates: Requirements 9.2**

**Property 20: Type-Safe Data Transformations**
*For any* data transformation pipeline, it should maintain type safety from input to output
**Validates: Requirements 9.3**

## Error Handling

### Error Boundary Strategy

The application will implement a hierarchical error boundary system:

```typescript
// Global error boundary for unhandled errors
export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className={styles.globalError}>
          <h1>Something went wrong</h1>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

// Data-specific error boundary for API failures
export const DataErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className={styles.dataError}>
          <h3>Unable to load data</h3>
          <p>Please check your connection and try again.</p>
          <button onClick={resetError}>Retry</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### API Error Handling

All API calls will implement consistent error handling:

```typescript
export class FPLApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'FPLApiError';
  }
}

export const handleApiError = (error: unknown, endpoint: string): FPLApiError => {
  if (error instanceof Response) {
    const userMessage = error.status === 404 
      ? 'The requested data could not be found'
      : 'Unable to load data at this time';
    
    return new FPLApiError(
      `API call failed: ${error.status} ${error.statusText}`,
      error.status,
      endpoint,
      userMessage
    );
  }
  
  return new FPLApiError(
    'Network error occurred',
    0,
    endpoint,
    'Please check your internet connection and try again'
  );
};
```

### Loading States

All async components will implement skeleton loading states that match the final content layout:

```typescript
const ManagerDetailSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.headerSkeleton}>
        <div className={styles.avatarSkeleton} />
        <div className={styles.nameSkeleton} />
        <div className={styles.statsSkeleton} />
      </div>
      <div className={styles.teamSkeleton}>
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} className={styles.playerSkeleton} />
        ))}
      </div>
    </div>
  );
};
```

## Testing Strategy

### Dual Testing Approach

The refactored application will implement both unit testing and property-based testing:

**Unit Testing:**
- Component rendering with different props
- Business logic functions with specific inputs
- Error handling scenarios
- User interaction flows

**Property-Based Testing:**
- Data transformation correctness across random inputs
- API response validation with generated data
- Component behavior consistency with various prop combinations
- Route generation and parsing with random parameters

### Testing Framework Selection

The application will use:
- **Jest** for unit testing framework
- **React Testing Library** for component testing
- **fast-check** for property-based testing (JavaScript/TypeScript)
- **MSW (Mock Service Worker)** for API mocking

### Property-Based Test Configuration

Each property-based test will run a minimum of 100 iterations to ensure thorough coverage:

```typescript
import fc from 'fast-check';

// Example property test
describe('FPL Calculator Service', () => {
  it('should maintain point totals when recalculating', () => {
    fc.assert(fc.property(
      fc.array(managerPickArbitrary),
      fc.dictionary(fc.integer(), liveStatsArbitrary),
      (picks, liveStats) => {
        const total1 = calculateLivePoints(picks, liveStats);
        const total2 = calculateLivePoints(picks, liveStats);
        return total1 === total2; // Calculation should be deterministic
      }
    ), { numRuns: 100 });
  });
});
```

### Test Organization

Tests will be colocated with source files using `.test.ts` suffix:

```
src/
├── libs/
│   ├── Fpl/
│   │   ├── Services/
│   │   │   ├── FPLCalculator.ts
│   │   │   ├── FPLCalculator.test.ts
│   │   │   └── FPLCalculator.property.test.ts
│   │   └── Data/
│   │       ├── Repositories/
│   │       │   ├── ManagerRepository.ts
│   │       │   └── ManagerRepository.test.ts
```

## Implementation Phases

The refactor will be implemented in phases to minimize disruption:

### Phase 1: Foundation (Data Layer)
- Implement repository pattern interfaces
- Create data validation schemas
- Set up caching infrastructure
- Implement error handling utilities

### Phase 2: Component Standardization
- Refactor existing components to follow Component/Skeleton/Inner pattern
- Implement proper file organization
- Add error boundaries and loading states

### Phase 3: Routing Restructure
- Implement new route structure
- Create parallel and intercepting routes for modals
- Update navigation to use proper URLs

### Phase 4: Business Logic Extraction
- Extract business logic into service modules
- Implement FPL calculation services
- Add comprehensive validation

### Phase 5: Testing and Optimization
- Add comprehensive test coverage
- Implement property-based tests
- Performance optimization and monitoring

## Migration Strategy

The migration will be done incrementally:

1. **Parallel Implementation**: New architecture components will be built alongside existing ones
2. **Feature Flagging**: New routes and components will be feature-flagged for gradual rollout
3. **Data Compatibility**: Ensure new data layer is compatible with existing components during transition
4. **Gradual Cutover**: Replace components one at a time, starting with leaf components
5. **Cleanup**: Remove old code and patterns after successful migration

This approach ensures the application remains functional throughout the refactor process while allowing for thorough testing of new patterns before full adoption.