# Kennedy Management System - Development Guide

## System Overview
Multi-tenant SaaS platform for educational institutions. Each school operates as isolated tenant with complete data separation and role-based access control.

**Technology Stack:** Next.js 15.2.4, React 19, TypeScript, Supabase PostgreSQL, shadcn/ui
**Authentication:** Email confirmation required, invitation-based registration, role hierarchy: `owner > manager > receptionist`

## Critical Architecture

**Service Layer (NEVER bypass):**
```javascript
// Components: Use appDataService only
import { studentService } from "@/services/appDataService"  

// Services: Use relative paths to Supabase
import { supabase } from '../lib/supabase'

// Multi-tenant security: Every operation auto-injects school_id
const schoolId = await getCurrentUserSchoolId()
return data || []  // Always defensive programming
```

**Database Schema:**
- `db.sql` - Production-ready, consolidated system (DO NOT MODIFY - 855 lines, complete multi-tenant setup)
- Core tables: `schools`, `profiles`, `invitations` (auth), `students`, `teachers`, `courses` (business)
- RLS policies enforce `school_id` filtering automatically - never bypass service layer
- Extensions: `uuid-ossp`, role enum: `owner > manager > receptionist`

**Authentication Flow:**
1. Owner: `/auth/create-school` → email confirmation → `/manager`
2. Invitations: `/auth/signup?token=X&email=Y` → email confirmation → role-based redirect  
3. Auto-redirects: `owner/manager` → `/manager`, `receptionist` → `/receptionist`
4. Session managed by `useSessionManager` hook with 3s debouncing

**Key Service Boundaries:**
```typescript
// appDataService.js - Main API (components import from here)
export const { studentService, teacherService, courseService } = appDataService

// databaseService.js - Direct Supabase operations (services use this)
async function getCurrentUserSchoolId() // Multi-tenant security

// authService.js - Authentication operations
await authService.getCurrentUser() // Returns user + profile + school
```

## Development Patterns

**Required Patterns:**
```typescript
// Role-based access with useAuth hook
const { user, hasRole, canAccess } = useAuth()
if (!hasRole(['owner', 'manager'])) return null

// AuthGuard wrapper for page protection
<AuthGuard requiredRoles={['owner', 'manager']}>
  <FinancialComponent />
</AuthGuard>

// Multi-parallel loading pattern (see StudentsTab.tsx)
const [students, teachers] = await Promise.all([
  studentService.getAllStudents(),
  teacherService.getAllTeachers()
])
```

**Session Management Pattern:**
```typescript
// useSessionManager.ts - Global session with validation debouncing
const { sessionData, isValidating, refreshSession } = useSessionManager()
// AuthContext.tsx wraps this for components
const { user, loading, signIn, signOut } = useAuth()
```

**Critical Rules:**
- NEVER import Supabase directly in components - use appDataService
- NEVER modify `db.sql` (production-ready with RLS policies)
- ALL operations auto-filter by `school_id` via getCurrentUserSchoolId()
- ALL auth flows require email confirmation before profile access
- USE defensive programming: `data || []`, `user?.profile?.role`
- Token cleanup utility runs in development for debugging

**Build Configuration:**
- `next.config.mjs`: TS/ESLint errors ignored for rapid iteration
- Images unoptimized, development-focused configuration
- Development session debugging enabled via DEBUG_SESSION

**Project Structure Patterns:**
- `/app` - Next.js 14 App Router (role-based page routing)
- `/components/tabs/` - Feature components (StudentsTab, TeachersTab, etc.)
- `/components/auth/` - Auth-related components (AuthGuard, forms)
- `/services/` - 3-layer service architecture (app → database → supabase)
- `/contexts/AuthContext.tsx` - Global auth state with session management

**Quick Start:**
```powershell
npm install
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
npm run dev    # Port 3000, session debugging enabled
npm run build  # TS/ESLint errors ignored for rapid iteration
```

System is production-ready with secure multi-tenant architecture, comprehensive RLS policies, and automatic role-based access control. Focus on frontend validation and UX - database security is handled automatically.

## Code Standards
- Never use emojis in code or commit messages - remove if found
- Use defensive programming patterns throughout
- All async operations should handle errors gracefully