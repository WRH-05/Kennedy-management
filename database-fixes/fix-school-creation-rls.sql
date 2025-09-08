-- Fix for School Creation RLS Issue
-- This creates a secure function that allows school creation during owner registration

-- Create a secure function for school creation that bypasses RLS
CREATE OR REPLACE FUNCTION create_school_for_registration(
    school_name TEXT,
    school_address TEXT DEFAULT NULL,
    school_phone TEXT DEFAULT NULL,
    school_email TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with elevated privileges
SET search_path = public
AS $$
DECLARE
    new_school_id UUID;
    result jsonb;
BEGIN
    -- Insert the school (bypasses RLS due to SECURITY DEFINER)
    INSERT INTO schools (name, address, phone, email)
    VALUES (school_name, school_address, school_phone, school_email)
    RETURNING id INTO new_school_id;
    
    -- Return the school data
    SELECT row_to_json(schools.*) INTO result
    FROM schools 
    WHERE id = new_school_id;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN jsonb_build_object(
            'error', true,
            'message', SQLERRM,
            'code', SQLSTATE
        );
END;
$$;

-- Grant execute permission to anonymous users (for registration)
GRANT EXECUTE ON FUNCTION create_school_for_registration(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_school_for_registration(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION create_school_for_registration IS 'Allows anonymous users to create schools during owner registration process. Used only for initial school setup.';
