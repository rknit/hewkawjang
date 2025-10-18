import { createClient } from '@supabase/supabase-js';
import TokenStorage from '@/services/token-storage.service';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_PROJ_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      // Disable Supabase's built-in auth, we'll use our own JWT
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => {
      const token = await TokenStorage.getAccessToken();
      return token || '';
    },
  },
);
