import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.177.0/node/process.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

    // Get the JWT token from the request headers
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Missing Authorization header")
    }

    const token = authHeader.replace("Bearer ", "")

    // Verify the JWT token
    const {
      data: { user },
      error: jwtError,
    } = await supabase.auth.getUser(token)

    if (jwtError || !user) {
      throw new Error("Invalid token")
    }

    const user_id = user.id

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

