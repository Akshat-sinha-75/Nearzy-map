import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ofrsjlxnwbxzzrhdmvlz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcnNqbHhud2J4enpyaGRtdmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzI0NDUsImV4cCI6MjA5ODkwODQ0NX0.DGHP3ad2g4Rhz1UwPAGJRhQk35ctFnRnl5q3pM2kR54";

export const supabase = createClient(supabaseUrl, supabaseKey);
