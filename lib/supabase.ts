import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchEvents(userId: string) {
  const { data, error } = await supabase.from("events").select("*").eq("user_id", userId)

  if (error) throw error
  return data
}

