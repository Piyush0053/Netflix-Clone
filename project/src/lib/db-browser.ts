// Browser-compatible database module for frontend using Supabase
import { supabase } from './supabase';
import type { Database } from '../types/supabase';

// Type aliases for table rows
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type SigninAttemptRow = Database['public']['Tables']['signin_attempts']['Row'];
type SecurityAuditLogRow = Database['public']['Tables']['security_audit_log']['Row'];

// Export interface for query results
export interface DbResult<T> {
  data: T[] | null;
  error: Error | null;
}

/**
 * Simple SQL-like query execution for Supabase tables
 * Supports basic operations on the profiles, signin_attempts, and security_audit_log tables
 */
export const query = async <T>(text: string, params?: any[]): Promise<DbResult<T>> => {
  try {
    // Parse operation type
    let operation = '';
    if (text.toLowerCase().includes('select')) {
      operation = 'select';
    } else if (text.toLowerCase().includes('insert')) {
      operation = 'insert';
    } else if (text.toLowerCase().includes('update')) {
      operation = 'update';
    } else if (text.toLowerCase().includes('delete')) {
      operation = 'delete';
    } else {
      throw new Error(`Unsupported operation in query: ${text}`);
    }

    // Determine table
    let table = '';
    if (text.toLowerCase().includes('profiles')) {
      table = 'profiles';
    } else if (text.toLowerCase().includes('signin_attempts')) {
      table = 'signin_attempts';
    } else if (text.toLowerCase().includes('security_audit_log')) {
      table = 'security_audit_log';
    } else {
      throw new Error(`Could not identify table in query: ${text}`);
    }

    // Extract data and conditions
    const data: Record<string, any> = {};
    const conditions: Record<string, any> = {};

    if (params && params.length > 0) {
      // Handle INSERT operations
      if (operation === 'insert') {
        const columnsMatch = text.match(/\(([^)]+)\)\s+VALUES\s+\(([^)]+)\)/);
        if (columnsMatch && columnsMatch[1] && columnsMatch[2]) {
          const columns = columnsMatch[1].split(',').map((col: string) => col.trim());
          const values = columnsMatch[2].split(',').map((val: string) => val.trim());
          
          columns.forEach((col: string, i: number) => {
            if (values[i]?.startsWith('$')) {
              const paramIndex = parseInt(values[i].substring(1)) - 1;
              if (paramIndex >= 0 && paramIndex < params.length) {
                data[col] = params[paramIndex];
              }
            }
          });
        }
      }
      
      // Handle UPDATE operations
      else if (operation === 'update') {
        const setPattern = /SET\s+([^\s=]+)\s*=\s*([^,\s]+)/g;
        let match;
        while ((match = setPattern.exec(text)) !== null) {
          const column = match[1].trim();
          const value = match[2].trim();
          
          if (value.startsWith('$')) {
            const paramIndex = parseInt(value.substring(1)) - 1;
            if (paramIndex >= 0 && paramIndex < params.length) {
              data[column] = params[paramIndex];
            }
          }
        }
      }
      
      // Handle WHERE conditions
      const whereMatch = text.match(/WHERE\s+(.+)/i);
      if (whereMatch && whereMatch[1]) {
        const whereClause = whereMatch[1];
        const conditionPattern = /([^\s=]+)\s*=\s*([^\s]+)/g;
        
        let match;
        while ((match = conditionPattern.exec(whereClause)) !== null) {
          const column = match[1].trim();
          const value = match[2].trim();
          
          if (value.startsWith('$')) {
            const paramIndex = parseInt(value.substring(1)) - 1;
            if (paramIndex >= 0 && paramIndex < params.length) {
              conditions[column] = params[paramIndex];
            }
          }
        }
      }
    }

    // Execute the query based on table and operation
    let result;

    // Profiles table operations
    if (table === 'profiles') {
      if (operation === 'select') {
        const query = supabase.from('profiles').select('*');
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query;
      } 
      else if (operation === 'insert') {
        result = await supabase.from('profiles').insert(data).select();
      } 
      else if (operation === 'update') {
        let query = supabase.from('profiles').update(data);
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query.select();
      } 
      else if (operation === 'delete') {
        let query = supabase.from('profiles').delete();
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query.select();
      }
    }
    
    // Signin attempts table operations
    else if (table === 'signin_attempts') {
      if (operation === 'select') {
        const query = supabase.from('signin_attempts').select('*');
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query;
      } 
      else if (operation === 'insert') {
        result = await supabase.from('signin_attempts').insert(data).select();
      } 
      else if (operation === 'update') {
        let query = supabase.from('signin_attempts').update(data);
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query.select();
      } 
      else if (operation === 'delete') {
        let query = supabase.from('signin_attempts').delete();
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query.select();
      }
    }
    
    // Security audit log table operations
    else if (table === 'security_audit_log') {
      if (operation === 'select') {
        const query = supabase.from('security_audit_log').select('*');
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query;
      } 
      else if (operation === 'insert') {
        result = await supabase.from('security_audit_log').insert(data).select();
      } 
      else if (operation === 'update') {
        let query = supabase.from('security_audit_log').update(data);
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query.select();
      } 
      else if (operation === 'delete') {
        let query = supabase.from('security_audit_log').delete();
        
        // Apply WHERE conditions
        for (const [key, value] of Object.entries(conditions)) {
          query.eq(key, value);
        }
        
        result = await query.select();
      }
    }

    if (result?.error) {
      throw result.error;
    }

    return { data: result?.data || [], error: null };
  } catch (error) {
    console.error('Error executing Supabase query:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
};

/**
 * Initialize database connection 
 */
export const initDb = async (): Promise<void> => {
  try {
    // Simple check to see if we can connect to the database
    const { error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Error connecting to Supabase database:', error);
    } else {
      console.log('Connected to Supabase database successfully');
    }
  } catch (error) {
    console.error('Error initializing database connection:', error);
  }
};

// Initialize the database connection when this module is loaded
initDb();
