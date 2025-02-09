import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import webpush from "web-push"

export const dynamic = "force-dynamic"

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Get all events that are scheduled to occur within the next hour and have notifications enabled
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const { data: events, error } = await supabase
    .from("events")
    .select("*, user_preferences(push_endpoint, push_p256dh, push_auth)")
    .gte("date", now.toISOString())
    .lt("date", oneHourFromNow.toISOString())
    .eq("notify", true)

  if (error) {
    console.error("Error fetching upcoming events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }

  for (const event of events) {
    if (event.user_preferences) {
      try {
        await webpush.sendNotification(
          {
            endpoint: event.user_preferences.push_endpoint,
            keys: {
              p256dh: event.user_preferences.push_p256dh,
              auth: event.user_preferences.push_auth,
            },
          },
          JSON.stringify({
            title: "Upcoming Event",
            body: `Your event "${event.title}" is starting soon.`,
          }),
        )
      } catch (error) {
        console.error("Error sending push notification:", error)
      }
    }
  }

  return NextResponse.json({ message: "Notifications sent successfully" })
}

