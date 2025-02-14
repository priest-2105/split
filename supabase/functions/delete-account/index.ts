import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/deno.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

    const { user_id } = await req.json()

    // Delete user's conditions
    const { error: conditionsError } = await supabase.from("conditions").delete().eq("user_id", user_id)

    if (conditionsError) throw conditionsError

    // Delete user's events
    const { error: eventsError } = await supabase.from("events").delete().eq("user_id", user_id)

    if (eventsError) throw eventsError

    // Delete user's account
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user_id)

    if (deleteUserError) throw deleteUserError

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})

