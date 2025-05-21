/**
 * Supabase configuration helper for the Netflix clone application
 * This file helps manage connection settings and environment variables
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Extract Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Ensure configuration is properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

module.exports = {
  supabaseUrl,
  supabaseAnonKey,
  migrationDir: path.join(__dirname, 'migrations'),
  seedsDir: path.join(__dirname, 'seeds')
};
