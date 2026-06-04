import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://wgzznqgkqysrcszlwwvz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnenpucWdrcXlzcmNzemx3d3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDQ1ODMsImV4cCI6MjA4MjkyMDU4M30.mCsDlnWVbXF4C8zyICBHKejnKnLVVu5obJ9rfpyOJfE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};