---
inclusion: always
---

# Database Architecture Overview

> **Purpose**: This file provides an overview of all database-related architectural guidance. Individual patterns are detailed in separate steering files.

## Architecture Files Structure

This workspace uses multiple steering files for different concerns:

- **`architecture-core.md`** - Always included core principles
- **`database-patterns.md`** - Included when working with data layer files
- **`component-patterns.md`** - Included when working with React components
- **`form-handling.md`** - Included when working with forms
- **`testing-patterns.md`** - Manual inclusion for testing guidance

## Quick Reference

### For Database Operations
- Use Repository pattern for data access
- Always validate input with schemas (Zod recommended)
- Use transactions for multi-table operations
- Implement proper error handling and user-friendly messages

### For Components
- Follow Component/Skeleton/Inner pattern for async operations
- Fetch data at leaf components where it's used
- Keep components ≤80 lines, split before 100
- Use server components by default, client only when necessary

### For Forms
- Use uncontrolled forms with server actions
- Validate on both client (UX) and server (security)
- Provide clear error messages and loading states
- Redirect after successful mutations

## File Organization

```
.kiro/steering/
├── architecture-core.md      # Always included
├── database-patterns.md      # Auto-included for data/ files
├── component-patterns.md     # Auto-included for Components/ files
├── form-handling.md          # Auto-included for form files
├── testing-patterns.md       # Manual inclusion (#testing)
└── database-architecture.md  # This overview file
```

## Usage with Kiro

- **Always included**: Core architecture principles are always available
- **File-based inclusion**: Specific patterns load when working with relevant files
- **Manual inclusion**: Use `#testing` in chat to include testing patterns
- **Context-aware**: Kiro will automatically provide relevant guidance based on your current work

This structure ensures you get the right guidance at the right time without overwhelming context.