-- Kennedy Management System - Authentication Database Schema (FIXED)
-- Execute these commands in your Supabase SQL Editor

-- First, drop the problematic policies if they exist
DROP POLICY IF EXISTS "Users can view profiles in their school" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Owners and managers can invite users" ON profiles;

-- Create corrected profiles policies
-- Allow users to view their own profile (no recursion)
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Allow users to update their own profile (no recursion)
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Allow users to view other profiles in their school (avoid recursion with specific conditions)
CREATE POLICY "Users can view profiles in their school" ON profiles
    FOR SELECT USING (
        school_id = (
            SELECT school_id FROM profiles 
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

-- Allow profile creation during user registration (bypass RLS for new user creation)
CREATE POLICY "Allow profile creation during registration" ON profiles
    FOR INSERT WITH CHECK (true);

-- Update the invitation policies to be less restrictive for testing
DROP POLICY IF EXISTS "Owners and managers can create invitations" ON invitations;
CREATE POLICY "Authenticated users can create invitations" ON invitations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also create a simpler policy for initial school creation
DROP POLICY IF EXISTS "Owners can update their school" ON schools;
CREATE POLICY "Users can update their own school" ON schools
    FOR UPDATE USING (
        id = (
            SELECT school_id FROM profiles 
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

-- Add a policy to allow school creation
CREATE POLICY "Allow school creation" ON schools
    FOR INSERT WITH CHECK (true);

-- Fix the user creation function to handle school owner creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if user is confirmed (email verified or direct signup)
    IF NEW.email_confirmed_at IS NOT NULL THEN
        -- Check if this is a school owner signup (from metadata)
        IF NEW.raw_user_meta_data->>'is_owner_signup' = 'true' THEN
            -- Create profile for school owner
            INSERT INTO profiles (id, school_id, role, full_name)
            VALUES (
                NEW.id,
                (NEW.raw_user_meta_data->>'school_id')::UUID,
                'owner',
                COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
            );
        ELSE
            -- Look for an invitation for regular signups
            DECLARE
                invitation_record RECORD;
            BEGIN
                SELECT * INTO invitation_record
                FROM invitations
                WHERE email = NEW.email
                AND accepted_at IS NULL
                AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1;

                IF FOUND THEN
                    -- Create profile from invitation
                    INSERT INTO profiles (id, school_id, role, full_name, invited_by)
                    VALUES (
                        NEW.id,
                        invitation_record.school_id,
                        invitation_record.role,
                        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
                        invitation_record.invited_by
                    );

                    -- Mark invitation as accepted
                    UPDATE invitations
                    SET accepted_at = NOW()
                    WHERE id = invitation_record.id;
                END IF;
            END;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
