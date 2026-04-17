import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('Error listing users:', error)
    return
  }
  const users = data.users
  console.log('Users found:', users.map(u => ({ id: u.id, email: u.email })))
}

getUsers()
