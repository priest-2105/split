// import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const createClient = () =>
  createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

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
  const { data, error } = await supabase
    .from("conditions")
    .select("id, name, user_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching conditions:", error)
    return []
  }
  return data
}

