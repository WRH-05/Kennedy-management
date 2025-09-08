# School Creation Error Debugging Guide

## Error Analysis 🔍

You're seeing empty error objects `{}` in the console, which means the actual error details aren't being displayed properly. This is a common JavaScript issue where Error objects don't serialize correctly.

## Changes Made ✅

### 1. Enhanced Error Logging
- **AuthService**: Added detailed error logging with message, details, hint, and code
- **CreateSchoolForm**: Added comprehensive error display
- **Error Utilities**: Created `utils/error-logging.ts` for consistent error handling

### 2. Better Error Messages
Instead of seeing `{}`, you'll now see:
```javascript
❌ Error in School Creation
Message: [actual error message]
Details: [database error details]
Hint: [database hints if available]
Code: [error code]
Full error: [complete error object]
```

## How to Debug the School Creation Issue 🛠️

### Step 1: Try Creating a School
1. Go to `/auth/create-school`
2. Fill out the form
3. Submit the form
4. Check the console for detailed error messages

### Step 2: Common Issues & Solutions

#### **Database Connection Issues**
```javascript
Error: connect ECONNREFUSED
Code: ECONNREFUSED
```
**Solution**: Check if your Supabase URL and keys are correct in `.env.local`

#### **Database Schema Issues**
```javascript
Error: relation "schools" does not exist
Code: 42P01
```
**Solution**: Database tables haven't been created. Run your migration scripts.

#### **Validation Errors**
```javascript
Error: duplicate key value violates unique constraint
Code: 23505
```
**Solution**: School name or email already exists. Try different values.

#### **Permission Issues**
```javascript
Error: new row violates row-level security policy
Code: 42501
```
**Solution**: RLS policies are blocking the insert. Check your database policies.

#### **Auth Issues**
```javascript
Error: User already registered
Code: 422
```
**Solution**: Email address is already registered. Use a different email.

### Step 3: Test Database Connection

Add this to your browser console to test basic Supabase connectivity:
```javascript
// Test Supabase connection
import { supabase } from '@/lib/supabase'

// Test basic query (this should work even without auth)
supabase.from('schools').select('count').then(console.log).catch(console.error)
```

### Step 4: Check Environment Variables

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Expected Error Flow Now 📱

### Before Fix:
```
Error creating school and owner: {}
School creation error: {}
```

### After Fix:
```
❌ Error in createSchoolAndOwner
Message: duplicate key value violates unique constraint "schools_name_key"
Details: Key (name)=(Test School) already exists.
Hint: null
Code: 23505
Full error: { message: "duplicate...", details: "Key...", code: "23505" }
```

## Next Steps 🚀

1. **Try the school creation form again**
2. **Check the enhanced console output**
3. **Share the detailed error messages** so I can help you fix the specific issue
4. **Check your Supabase dashboard** to see if any data is being created

## Common Fixes by Error Type

### If you see "relation does not exist":
- Your database tables aren't created
- Need to run migration scripts
- Check Supabase dashboard SQL editor

### If you see "duplicate key constraint":
- School name already exists
- Email already registered
- Try different values

### If you see "row-level security policy":
- Database permissions issue
- RLS policies need adjustment
- Check your Supabase policies

### If you see "connect ECONNREFUSED":
- Network connectivity issue
- Wrong Supabase URL
- Check `.env.local` file

The enhanced error logging should now show you exactly what's failing in the school creation process! 🎯
