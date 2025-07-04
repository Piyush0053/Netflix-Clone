export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define the active_sessions table type
export interface ActiveSessions {
  id: string;
  user_id: string;
  device_info: string | null;
  ip_address: string | null;
  created_at: string | null;
  last_active: string | null;
  user_agent: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string | null
          updated_at: string | null
          last_sign_in: string | null
          last_password_change: string | null
          failed_attempts: number | null
          locked_until: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string | null
          updated_at?: string | null
          last_sign_in?: string | null
          last_password_change?: string | null
          failed_attempts?: number | null
          locked_until?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
          updated_at?: string | null
          last_sign_in?: string | null
          last_password_change?: string | null
          failed_attempts?: number | null
          locked_until?: string | null
        }
      }
      signin_attempts: {
        Row: {
          id: string
          email: string
          ip_address: string | null
          attempt_time: string | null
          success: boolean | null
        }
        Insert: {
          id?: string
          email: string
          ip_address?: string | null
          attempt_time?: string | null
          success?: boolean | null
        }
        Update: {
          id?: string
          email?: string
          ip_address?: string | null
          attempt_time?: string | null
          success?: boolean | null
        }
      }
      security_audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
      },
      active_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_info: string | null;
          ip_address: string | null;
          created_at: string | null;
          last_active: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_info?: string | null;
          ip_address?: string | null;
          created_at?: string | null;
          last_active?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_info?: string | null;
          ip_address?: string | null;
          created_at?: string | null;
          last_active?: string | null;
          user_agent?: string | null;
        };
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
