import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
// Get these from your Supabase Project Settings > API
const supabaseUrl = 'https://urcmzszkmbmvrdqwzmgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY216c3prbWJtdnJkcXd6bWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzY3NjEsImV4cCI6MjA3OTgxMjc2MX0.dlCONfeWV0BmUBd3y4iUL-1rh3IXPH_ww2qcXnAk4X8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: typeof window !== 'undefined' ? AsyncStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
