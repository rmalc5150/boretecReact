import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://iwgzurpghxfxbvnwhlpt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Z3p1cnBnaHhmeGJ2bndobHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1ODg4NTcsImV4cCI6MjAyMDE2NDg1N30.I_pqymOxmVT0fK2oARqZbWrejuGdtOSoy8ycZKYIors'

const supabase = createClient(supabaseUrl, supabaseAnonKey);


export { supabase};