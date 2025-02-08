import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function subscribeToPushNotifications() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js")
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      const supabase = createClientComponentClient()
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        push_endpoint: subscription.endpoint,
        push_p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("p256dh")))),
        push_auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth")))),
      })

      if (error) throw error

      return true
    } catch (error) {
      console.error("Error subscribing to push notifications:", error)
      return false
    }
  }
  return false
}

export async function unsubscribeFromPushNotifications() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()

        const supabase = createClientComponentClient()
        const { error } = await supabase
          .from("user_preferences")
          .update({
            push_endpoint: null,
            push_p256dh: null,
            push_auth: null,
          })
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)

        if (error) throw error
      }
      return true
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error)
      return false
    }
  }
  return false
}

