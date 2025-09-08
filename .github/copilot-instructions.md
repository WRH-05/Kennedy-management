# Kennedy Management System - Development Guide

## System Overview
Multi-tenant SaaS platform for educational institutions. Each school operates as isolated tenant with complete data separation and role-based access control.

Core Features:
- Student lifecycle management from enrollment to graduation
- Teacher management with course assignments and payroll
- Course scheduling with attendance tracking
- Financial management including payments revenue and payouts
- Administrative oversight with user management

Current State:
- Email confirmation required for all registrations
- Multi-tenant architecture with school isolation
- Role-based access control with Owner Manager Receptionist roles
- Comprehensive form validation on frontend and database
- Real-time dashboard with financial metrics
- Archive system for soft deletes
- Invitation-based user registration

## Technology Stack
Frontend: Next.js 15.2.4, React 19.0.0, TypeScript 5.x, Tailwind CSS 3.4.17, shadcn/ui
Backend: Supabase PostgreSQL with Auth and Row Level Security
Authentication: Email password with required email confirmation

## Quick Start
Development: `npm run dev` (requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
Build: `npm run build` 
Production: `npm run start`

## User Roles and Permissions
Owner: Full system access, user management, financial oversight
Manager: Operations, financial monitoring, user invitations, attendance management
Receptionist: Student enrollment, course scheduling, attendance entry, no financial access

## Authentication Flow
School Owner Registration: /auth/create-school then fill forms then email confirmation then /manager dashboard
Invited User Registration: Invitation link to /auth/signup then email confirmation then role-based dashboard
Login: /auth/login then credentials then role-based redirect

## Database Architecture

Schema Files in dbSchema folder READ ONLY:
1. 01-extensions-and-types.sql
2. 02-authentication-tables.sql  
3. 03-business-tables.sql
4. 04-authentication-functions.sql
5. 05-row-level-security.sql
6. 06-utility-functions.sql
7. 07-fix-anonymous-signup.sql
8. 08-required-fields-migration.sql

Core Tables:
Authentication tables: schools profiles invitations
Business tables: students teachers course_templates course_instances
Financial tables: student_payments teacher_payouts revenue
Operations tables: attendance archive_requests

Multi-Tenant Security:
- Every table has school_id for isolation
- RLS policies filter all queries by school
- Automatic school_id injection in all operations

## Service Architecture

Three-Tier Design:
1. databaseService.js handles direct Supabase operations with school_id filtering
2. appDataService.js provides business logic wrapper with error handling
3. authService.js manages authentication and session management

Import Rules:
Components should import from appDataService: `import { studentService } from "@/services/appDataService"`
Never import Supabase directly in components
Services use relative paths to import Supabase: `import { supabase } from '../lib/supabase'`

Key Patterns:
- All database operations automatically inject school_id via getCurrentUserSchoolId()
- AuthContext provides user state and role-based access control
- Defensive programming with null checks: `(data || []).filter()`

## Application Structure

Pages:
app/auth handles authentication flow
app/manager handles Owner and Manager dashboard  
app/receptionist handles Receptionist dashboard
app/student/[id] handles individual student management
app/teacher/[id] handles individual teacher management
app/course/[id] handles individual course management

Components:
components/auth contains authentication components
components/tabs contains feature-specific CRUD operations
components/ui contains shadcn/ui base components

## Development Rules

Environment Setup:
- Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Next.js config ignores TypeScript/ESLint errors during builds for rapid development
- Uses unoptimized images for easier deployment

Data Handling:
- Field naming uses name for business entities and full_name for profiles
- Arrays use PostgreSQL TEXT[] or INTEGER[] types
- Defensive programming with data checks like (data || []).filter()
- Error handling with try-catch in all async operations
- School context with automatic school_id filtering

Component Development:
- TypeScript interfaces required for all props
- Default values for array props to prevent crashes
- Use shadcn/ui components for consistency
- Include loading states and error boundaries
- Role checks before rendering sensitive features: `hasRole(['owner', 'manager'])`

Database Operations:
- Reference dbSchema files before any changes
- Use exact field names from schema
- Soft deletes via archive system
- Dual storage for payments and attendance
- School_id filtering automatically applied

Form Validation:
- Use lib/validation.ts for consistent validation patterns
- Composite validation functions like validateUserData, validateSchoolData
- Real-time validation with immediate user feedback

## Critical Rules

Before Making Changes:
1. Reference dbSchema files for exact field names
2. Check existing RLS policies for security requirements
3. Verify multi-tenant implications
4. Test with different user roles and schools
5. Ensure defensive programming for null checks

Common Pitfalls:
- Never import Supabase directly in components
- Never modify dbSchema files they are read-only reference
- Never forget school_id filtering in queries
- Never bypass email confirmation flow
- Never assume arrays exist without null checks
- Never use hard deletes always use archive system

Code Quality Requirements:
- TypeScript for type safety
- Comprehensive error handling
- Loading states for better UX
- Consistent validation patterns
- Meaningful error messages for users

Authentication Patterns:
- All auth flows require email confirmation
- Invitation links: `/auth/signup?token={token}&email={email}`
- Role-based redirects: owner/manager → /manager, receptionist → /receptionist
- Use AuthContext.hasRole() for permission checks
- Session management handled automatically by AuthContext

## Current Capabilities
Multi-tenant school isolation
Email confirmation authentication
Role-based access control
Student teacher course management
Financial tracking and reporting
Archive system for data retention
User invitation system
Comprehensive form validation
Real-time dashboard analytics
Search functionality
Attendance tracking

The system is production-ready with secure multi-tenant architecture and comprehensive school management features.

## Development Workflow
- Use `npm run dev` for development server
- TypeScript/ESLint errors ignored during builds for rapid iteration
- All components use shadcn/ui for consistent styling
- Defensive programming required: `(data || []).filter(item => condition)`
- Multi-parallel data loading: `Promise.all([service1(), service2()])`
- Real-time validation with lib/validation.ts composite functions

## emojis
- never ever use emojis in code or commit messages and if found remove them
- emojis can be used in documentation files not instruction files like this one to enhance readability and convey meaning