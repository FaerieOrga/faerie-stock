import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
// Note : Si tu utilises Vite, c'est import.meta.env. Si tu utilises Create React App, c'est process.env
const supabaseUrl = 'https://wgzznqgkqysrcszlwwvz.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnenpucWdrcXlzcmNzemx3d3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDQ1ODMsImV4cCI6MjA4MjkyMDU4M30.mCsDlnWVbXF4C8zyICBHKejnKnLVVu5obJ9rfpyOJfE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL ou Anon Key manquante dans le fichier .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true, // Garde l'utilisateur connecté après un refresh
    autoRefreshToken: true, // Rafraîchit le jeton automatiquement
    detectSessionInUrl: true,
  },
});

/**
 * Fonction utilitaire pour vérifier si l'utilisateur est connecté
 * Utilisée pour protéger certaines routes ou actions
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};
