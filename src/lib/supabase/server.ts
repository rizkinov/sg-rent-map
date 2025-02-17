import { createClient } from '@supabase/supabase-js'

// These environment variables are required
const supabaseUrl = 'https://cnqdthislyimyffgewif.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucWR0aGlzbHlpbXlmZmdld2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTY4MjY2OCwiZXhwIjoyMDU1MjU4NjY4fQ.tVjkKICtkKLU-JSg8M3LPpsyJu24NpwFudNjHxDDWqA'

export const supabase = createClient(supabaseUrl, supabaseKey) 