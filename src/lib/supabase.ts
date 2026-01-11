import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mantpsrmrkgwlmomwegi.supabase.co'

// **Use somente esta chave no frontend**
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbnRwc3Jtcmtnd2xtb213ZWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjU1MDYsImV4cCI6MjA3MDEwMTUwNn0.b6ImsdPGNgPdp7CwL7BhEHyRxZ84uQOq1nxCAsP4s04'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
