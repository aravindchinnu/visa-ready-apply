// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mlsawasqqdtfcdwoozwo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sc2F3YXNxcWR0ZmNkd29vendvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzQxNDYsImV4cCI6MjA2MDc1MDE0Nn0.L6wVTSCpUxwHqWoUNssxz8D2DuZ9ebDuePeJaA4YrN0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);