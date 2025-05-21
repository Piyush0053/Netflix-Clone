/*
  # Enhanced Security Schema

  1. New Columns
    - Add security tracking columns to profiles table
      - last_password_change: Track when passwords were last changed
      - failed_attempts: Count failed login attempts
      - locked_until: Timestamp for temporary account locks
  
  2. New Tables
    - signin_attempts: Track login attempts with IP addresses
    - security_audit_log: Audit trail for security-related actions
  
  3. Security
    - Enable RLS on all new tables
    - Add policies for access control
    - Ensure proper data isolation
*/

-- Add security-related columns to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_password_change'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_password_change timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'failed_attempts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN failed_attempts integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'locked_until'
  ) THEN
    ALTER TABLE profiles ADD COLUMN locked_until timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Create table for tracking sign-in attempts
CREATE TABLE IF NOT EXISTS signin_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempt_time timestamptz DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS on signin_attempts
ALTER TABLE signin_attempts ENABLE ROW LEVEL SECURITY;

-- Create security audit log
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Admins can view all signin attempts" ON signin_attempts;
  DROP POLICY IF EXISTS "Users can view their own audit log" ON security_audit_log;
  DROP POLICY IF EXISTS "Admins can view all audit logs" ON security_audit_log;
END $$;

-- Add RLS policies for signin_attempts
CREATE POLICY "Admins can view all signin attempts"
  ON signin_attempts
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Add RLS policies for security audit log
CREATE POLICY "Users can view their own audit log"
  ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');