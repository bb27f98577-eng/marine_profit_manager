import { createClient } from '@supabase/supabase-js';

// Safe environment variable access
const getEnvVar = (name, defaultValue = '') => {
  try {
    return import.meta.env?.[name] || defaultValue;
  } catch (error) {
    console.warn(`Failed to access environment variable ${name}:`, error);
    return defaultValue;
  }
};

// Validate environment variables
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Enhanced validation with better error messages
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || supabaseUrl?.trim() === '') {
  throw new Error(
    'Missing or invalid VITE_SUPABASE_URL environment variable. ' +
    'Please check your .env file and ensure VITE_SUPABASE_URL contains a valid Supabase project URL '+ '(format: https://your-project-id.supabase.co)'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key' || supabaseAnonKey?.trim() === '') {
  throw new Error(
    'Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please check your .env file and ensure VITE_SUPABASE_ANON_KEY contains a valid Supabase anonymous key'
  );
}

// URL format validation with better error handling
const validateUrl = (url) => {
  try {
    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
    return urlPattern?.test(url);
  } catch (error) {
    console.error('URL validation error:', error);
    return false;
  }
};

if (!validateUrl(supabaseUrl)) {
  throw new Error(
    `Invalid Supabase URL format: ${supabaseUrl}. ` +
    'Expected format: https://your-project-id.supabase.co'
  );
}

// Safe client creation with error handling
let supabase = null;

try {
  // Create and export the Supabase client with enhanced configuration
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    // Add schema cache refresh options
    db: {
      schema: 'public'
    },
    // Enhanced global options for better error handling
    global: {
      headers: {
        'x-client-info': 'supabase-js-web'
      }
    }
  });
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  throw new Error(`Supabase client initialization failed: ${error?.message || 'Unknown error'}`);
}

// Add connection health check function with better error handling
export const checkConnection = async () => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      ?.from('crew_members')
      ?.select('count')
      ?.limit(1);
      
    if (error) throw error;
    return { connected: true, error: null };
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return { 
      connected: false, 
      error: error?.message || 'Connection check failed'
    };
  }
};

// Add schema refresh function with better error handling
export const refreshSchema = async () => {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized for schema refresh');
      return false;
    }

    // Force a schema refresh by making a simple query
    await supabase?.rpc('get_sample_rows');
    return true;
  } catch (error) {
    console.warn('Schema refresh attempt failed:', error);
    return false;
  }
};

// Safe export with validation
if (!supabase) {
  throw new Error('Supabase client failed to initialize');
}

export { supabase };
export default supabase;