# Implementation Plan

- [x] 1. Set up foundation and data layer infrastructure
  - Create new directory structure with PascalCase folder names
  - Set up repository pattern interfaces and base implementations
  - Implement data validation schemas using Zod
  - Create caching infrastructure and error handling utilities
  - _Requirements: 1.1, 3.1, 3.3, 3.5, 4.4_

- [ ]* 1.1 Write property test for repository pattern enforcement
  - **Property 1: Repository Pattern Enforcement**
  - **Validates: Requirements 1.1**

- [ ]* 1.2 Write property test for typed API interfaces
  - **Property 9: Typed API Interfaces**
  - **Validates: Requirements 3.1**

- [ ]* 1.3 Write property test for schema validation
  - **Property 11: Schema Validation**
  - **Validates: Requirements 3.5**

- [x] 2. Implement core FPL data repositories
  - Create LeagueRepository with methods for standings, stats, and ownership
  - Create ManagerRepository with methods for details, history, and transfers
  - Create PlayerRepository with methods for details, fixtures, and history
  - Implement proper error handling and caching for all repositories
  - _Requirements: 1.1, 3.2, 3.3, 4.4_

- [x] 2.1 Write property test for consistent error handling
  - **Property 10: Consistent Error Handling**
  - **Validates: Requirements 3.3**

- [ ] 3. Create business logic services layer
  - Implement FPLCalculatorService for live points and bonus calculations
  - Create DifferentialsService for ownership analysis
  - Implement ValidationService for data integrity checks
  - Extract all business logic from existing components into service modules
  - _Requirements: 1.2, 4.3_

- [ ]* 3.1 Write property test for business logic separation
  - **Property 2: Business Logic Separation**
  - **Validates: Requirements 1.2**

- [ ]* 3.2 Write property test for type-safe data transformations
  - **Property 20: Type-Safe Data Transformations**
  - **Validates: Requirements 9.3**

- [x] 4. Standardize component patterns across application
  - Refactor existing components to follow Component/Skeleton/Inner pattern
  - Ensure all async components have colocated Suspense boundaries
  - Create individual CSS modules for each component
  - Implement proper skeleton states that match final content layout
  - _Requirements: 1.3, 2.1, 2.2, 7.2_

- [ ]* 4.1 Write property test for component pattern consistency
  - **Property 3: Component Pattern Consistency**
  - **Validates: Requirements 1.3, 2.1**

- [ ]* 4.2 Write property test for component file structure
  - **Property 5: Component File Structure**
  - **Validates: Requirements 2.2**

- [ ]* 4.3 Write property test for file size limits
  - **Property 8: File Size Limits**
  - **Validates: Requirements 2.5**

- [x] 5. Reorganize file structure and component organization
  - Move shared components to libs/Shared/Components/
  - Move page-specific components to libs/Pages/
  - Organize business logic into libs/Fpl/Services/
  - Separate data access code into libs/Fpl/Data/
  - Create proper type organization in dedicated type files
  - _Requirements: 1.4, 4.1, 4.2, 4.3, 4.5_

- [ ]* 5.1 Write property test for file organization compliance
  - **Property 4: File Organization Compliance**
  - **Validates: Requirements 1.4, 4.1, 4.2**

- [x] 6. Implement new routing structure
  - Create dedicated routes for different views instead of query parameter switching
  - Implement nested dynamic routes for manager and player selection
  - Set up parallel routes and intercepting routes for modal overlays
  - Create logical URL hierarchies that reflect application structure
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - **COMPLETED**: All routes implemented and verified working

- [ ]* 6.1 Write property test for route-based navigation
  - **Property 12: Route-Based Navigation**
  - **Validates: Requirements 5.1**

- [ ]* 6.2 Write property test for nested dynamic routes
  - **Property 13: Nested Dynamic Routes**
  - **Validates: Requirements 5.2**

- [ ]* 6.3 Write property test for URL parameter usage
  - **Property 14: URL Parameter Usage**
  - **Validates: Requirements 5.5**

- [x] 7. Refactor data fetching patterns
  - Ensure data fetching occurs at leaf components where data is consumed
  - Update reusable components to accept explicit props instead of PageProps
  - Implement props-based data flow between components
  - Remove direct API calls from presentation components
  - _Requirements: 2.3, 2.4, 6.2_

- [ ]* 7.1 Write property test for data fetching at leaves
  - **Property 6: Data Fetching at Leaves**
  - **Validates: Requirements 2.3**

- [ ]* 7.2 Write property test for explicit props in reusable components
  - **Property 7: Explicit Props for Reusable Components**
  - **Validates: Requirements 2.4**

- [ ]* 7.3 Write property test for props-based data flow
  - **Property 15: Props-Based Data Flow**
  - **Validates: Requirements 6.2**

- [x] 8. Implement comprehensive error handling
  - Create hierarchical error boundary system with global and data-specific boundaries
  - Implement consistent API error handling with user-friendly messages
  - Add error boundaries around all components that can throw errors
  - Create retry mechanisms for network failures
  - _Requirements: 7.1, 7.3, 7.5_

- [ ]* 8.1 Write property test for error boundary coverage
  - **Property 17: Error Boundary Coverage**
  - **Validates: Requirements 7.5**

- [x] 9. Enhance TypeScript usage and type safety
  - Update all component props to use strict TypeScript interfaces without any types
  - Implement runtime schema validation for all API responses
  - Ensure type safety throughout data transformation pipelines
  - Add proper generic types and constraints to utility functions
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 9.1 Write property test for strict TypeScript usage
  - **Property 18: Strict TypeScript Usage**
  - **Validates: Requirements 9.1**

- [ ]* 9.2 Write property test for runtime schema validation
  - **Property 19: Runtime Schema Validation**
  - **Validates: Requirements 9.2**

- [x] 10. Implement server actions for data mutations
  - Replace client-side mutations with server actions
  - Implement proper revalidation after data updates
  - Add form handling with server actions for user interactions
  - Ensure all data updates go through server-side processing
  - _Requirements: 6.3_

- [ ]* 10.1 Write property test for server actions usage
  - **Property 16: Server Actions for Mutations**
  - **Validates: Requirements 6.3**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Create new page components following standardized patterns
  - Implement LeagueOverview page component with proper async patterns
  - Create ManagerDetail page component with nested routing
  - Build PlayerDetail page component with modal support
  - Implement all tool pages (FDR planner, transfer planner, chip advisor)
  - _Requirements: 1.3, 2.1, 5.2_

- [x] 13. Migrate existing components to new architecture
  - Update Dashboard components to use new data layer
  - Refactor existing async components to follow Component/Skeleton/Inner pattern
  - Update all components to use new routing structure
  - Ensure all components follow new file organization
  - _Requirements: 1.1, 1.3, 2.1, 4.1_

- [ ] 14. Implement caching strategies
  - Set up appropriate cache TTLs for different data types
  - Implement cache invalidation strategies
  - Add cache warming for frequently accessed data
  - Monitor cache hit rates and optimize as needed
  - _Requirements: 3.2_

- [ ] 15. Add comprehensive loading and error states
  - Implement skeleton loading states for all async components
  - Add proper error messages with recovery options
  - Create timeout handling with retry mechanisms
  - Ensure loading states match final content layout
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.