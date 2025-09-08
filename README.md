# Kennedy Management System

A comprehensive school management platform built with Next.js, TypeScript, and Supabase.

## Features

- **Authentication System**: Secure login/signup with Supabase Auth
- **Role-based Access**: Different interfaces for managers, teachers, receptionists, and students
- **School Management**: Complete school administration and management tools
- **Student Portal**: Dedicated interface for student activities
- **Teacher Dashboard**: Tools for educators to manage their courses and students
- **Course Management**: Create and manage educational courses

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **UI Components**: shadcn/ui
- **State Management**: React Context API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/app` - Next.js 14 app router pages
- `/components` - Reusable UI components
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility libraries and configurations
- `/services` - API service functions
- `/types` - TypeScript type definitions
- `/utils` - Utility functions