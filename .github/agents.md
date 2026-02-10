# Kennedy Management - Copilot Coding Agent Instructions

## Project Context

Multi-tenant SaaS platform for educational institutions (schools, tutoring centers). Each school is an isolated tenant with complete data separation via RLS and application-level filtering.

**Tech Stack:**
- Next.js 16.x (App Router)
- React 18
- TypeScript 5
- Supabase PostgreSQL with Row Level Security
- Tailwind CSS 4.x with shadcn/ui
- SWR for client data fetching

## Before Making Any Changes

1. **Read the target file first** - understand existing patterns before modifying
2. **Check the service layer** - understand the three-layer architecture
3. **Verify imports** - components must NEVER import Supabase directly
4. **Look at similar files** - follow existing patterns in the codebase
5. **Check Supabase logs** when debugging API/database issues

## Architecture Rules (CRITICAL)

### Three-Layer Service Pattern
```
Components → appDataService.js → databaseService.js → Supabase
```

**In components:**
```javascript
// CORRECT
import { studentService } from "@/services/appDataService"
const students = await studentService.getAllStudents()

// FORBIDDEN - Never do this
import { supabase } from "@/lib/supabase"
```

**In services:**
- `databaseService.js` - All Supabase operations, auto-injects `school_id`
- `appDataService.js` - Public API that components import
- `authService.js` - Authentication operations only

### Multi-Tenant Security
- Every query in `databaseService.js` includes `school_id` filter
- Database RLS policies provide secondary enforcement
- `getCurrentUserSchoolId()` retrieves tenant context

### Authentication
- `useAuth()` hook provides auth state to components
- `AuthGuard` component protects routes by role
- Role hierarchy: `owner > manager > receptionist`

## Code Patterns

### Always Do
```typescript
// Defensive returns
return data || []

// Optional chaining
user?.profile?.role

// Parallel loading
const [a, b, c] = await Promise.all([serviceA(), serviceB(), serviceC()])

// Error handling
try {
  const result = await service.getData()
} catch (error) {
  console.error('Context:', error)
  throw error
}
```

### Never Do
- Use emojis in code or commit messages
- Leave console.log statements (use conditional DEBUG)
- Import Supabase directly in components
- Modify SQL schema files without explicit approval
- Modify shadcn/ui components in `/components/ui`

## Payment Status Values

Teacher payouts have three statuses. Both `approved` and `paid` are terminal states:
```typescript
const isPaid = status === 'paid' || status === 'approved'
```

## File Structure

| Directory | Purpose |
|-----------|---------|
| `/app` | Next.js pages (App Router) |
| `/components/tabs` | Feature tab components |
| `/components/ui` | shadcn/ui (do not modify) |
| `/components/auth` | Auth components (AuthGuard, forms) |
| `/services` | Three-layer data access |
| `/contexts` | React contexts (AuthContext) |
| `/hooks` | Custom hooks (useSessionManager, useData) |
| `/sql` | Database schemas (do not modify) |
| `/utils` | Utility functions |

## Common Tasks

### Adding a Service Method
1. Add operation to `databaseService.js` with `school_id` filter
2. Export wrapper in `appDataService.js`
3. Use in components via appDataService import

### Adding a Feature Tab
1. Create `/components/tabs/[Feature]Tab.tsx`
2. Import services from `@/services/appDataService`
3. Add to dashboard page with role protection

### Debugging Database Issues
1. Check Supabase API logs for errors
2. Verify RLS policies allow the operation
3. Check `school_id` is being passed correctly
4. Look for 406 (Not Acceptable) or 400 errors

## Validation Requirements

Before completing any task:
1. Run `npm run build` - must succeed
2. Check for TypeScript errors in modified files
3. Test manually if UI was changed
4. Check Supabase logs for API errors

## Restrictions

**Do NOT modify without discussion:**
- Files in `/sql` directory
- Authentication flow in authService.js
- Database RLS policies
- shadcn/ui components

**Do NOT add:**
- New npm dependencies without approval
- Direct Supabase imports in components
- Console.log statements (except conditional DEBUG)
