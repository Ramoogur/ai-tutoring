
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrzupbzycsfeoczcxyxo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyenVwYnp5Y3NmZW9jemN4eXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjI3MTQsImV4cCI6MjA2NTQ5ODcxNH0.4rnBJ01cPNFUg1WmZ0y8xkBK_hCx5Gr2LYf-4OikZyw'
export const supabase = createClient(supabaseUrl, supabaseKey)
