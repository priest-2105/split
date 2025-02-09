import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)

export async function fetchEvents(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("events").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }
  return data
}

export async function fetchConditions(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("conditions").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching conditions:", error)
    return []
  }
  return data
}

