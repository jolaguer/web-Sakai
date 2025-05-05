import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pbwypkopgkrtnlwrbxnh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBid3lwa29wZ2tydG5sd3JieG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDM0NTYsImV4cCI6MjA2MjAxOTQ1Nn0.A7FLjEz-UCTw7lq8Pnij1Ro10pQ7-I3UGLCgUj0dvFM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)