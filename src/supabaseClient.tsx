import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvcbuwfhagsewfnpkmtg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Y2J1d2ZoYWdzZXdmbnBrbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU5ODgsImV4cCI6MjA2MTc5MTk4OH0.GEmQ6QjKff1AB57ja4vs1X9V67SKTr5Cc4UkYZt5sgA'; // Replace with your real key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
