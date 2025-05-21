/*
  # Security enhancements for authentication system
  
  1. Security Updates
    - Add rate limiting for sign-in attempts
    - Add last password change tracking
    - Add security audit logging
    - Enhance user profile security
  
  2. Changes
    - Add security-related columns to profiles table
    - Create signin_attempts table for rate limiting
    - Add security audit log table
    - Update RLS policies
*/

-- Add security-related columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_password_change timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS failed_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamptz DEFAULT NULL;

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

-- Update RLS policies for profiles
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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