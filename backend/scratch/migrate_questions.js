import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrate() {
  console.log('Running migration: Add max_questions to interviews')
  // Note: supabase-js doesn't support direct DDL. 
  // We usually do this via dashboard or CLI.
  // But we can check if it exists and maybe use an RPC if one exists.
  // For now, I'll assume the user will run the SQL or I'll just update the code.
  // Actually, I'll try to insert a dummy record with the new field to see if it works?
  // No, that's messy.
  
  console.log('Please run the following SQL in your Supabase SQL Editor:')
  console.log('ALTER TABLE interviews ADD COLUMN IF NOT EXISTS max_questions INTEGER DEFAULT 5;')
  console.log('ALTER TABLE interviews ADD COLUMN IF NOT EXISTS candidate_name TEXT;')
}

migrate()
