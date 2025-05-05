import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'add_your_api_here'
const supabaseAnonKey = 'add_your_nonkey_here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)