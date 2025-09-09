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
- `db.sql` - Production-ready, consolidated system (DO NOT MODIFY)
- Core tables: `schools`, `profiles`, `invitations` (auth), `students`, `teachers`, `courses` (business)
- Future: `student_payments`, `teacher_payouts`, `revenue` (financial tracking)

**Authentication Flow:**
1. Owner: `/auth/create-school` → email confirmation → `/manager`
2. Invitations: `/auth/signup?token=X&email=Y` → email confirmation → role-based redirect
3. Auto-redirects: `owner/manager` → `/manager`, `receptionist` → `/receptionist`

## Development Patterns

**Required Patterns:**
```typescript
// Role-based access
const { user, hasRole, canAccess } = useAuth()
if (!hasRole(['owner', 'manager'])) return null

// AuthGuard wrapper
<AuthGuard requiredRoles={['owner', 'manager']}>
  <FinancialComponent />
</AuthGuard>

// Multi-parallel loading
const [students, teachers] = await Promise.all([
  studentService.getAllStudents(),
  teacherService.getAllTeachers()
])
```

**Critical Rules:**
- NEVER import Supabase directly in components
- NEVER modify `db.sql` (production-ready)
- ALL operations auto-filter by `school_id` via RLS
- ALL auth flows require email confirmation
- USE defensive programming: `data || []`, `user?.profile?.role`

**Quick Start:**
```bash
npm run dev    # Port 3000/3001, requires .env.local with Supabase keys
npm run build  # TS/ESLint errors ignored for rapid iteration
```

System is production-ready with secure multi-tenant architecture. Focus on frontend validation and UX - database handles all security automatically.

## emojis
- never ever use emojis in code or commit messages and if found remove them
- emojis can be used in documentation files not instruction files like this one to enhance readability and convey meaning