"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { createBrowserClient } from "@supabase/ssr"
import { useNotification } from "@/contexts/NotificationContext"
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/utils/pushNotifications"

export default function SettingsPage() {
  const [pushNotifications, setPushNotifications] = useState(false)
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchUserIdAndPreferences = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      if (user?.id) {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("push_notifications")
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Error fetching user preferences:", error)
        } else if (data) {
          setPushNotifications(data.push_notifications)
        }
      }
    }

    fetchUserIdAndPreferences()
  }, [supabase])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  const handlePushNotificationToggle = async () => {
    setIsTogglingNotifications(true)
    const newValue = !pushNotifications

    try {
      if (newValue) {
        const subscribed = await subscribeToPushNotifications()
        if (!subscribed) {
          addNotification("error", "Failed to enable push notifications")
          return
        }
      } else {
        const unsubscribed = await unsubscribeFromPushNotifications()
        if (!unsubscribed) {
          addNotification("error", "Failed to disable push notifications")
          return
        }
      }

      setPushNotifications(newValue)

      if (userId) {
        const { error } = await supabase
          .from("user_preferences")
          .upsert({ user_id: userId, push_notifications: newValue })

        if (error) {
          addNotification("error", `Failed to update push notification preference: ${error.message}`)
        } else {
          addNotification("success", `Push notifications ${newValue ? "enabled" : "disabled"} successfully!`)
        }
      }
    } catch (error) {
      addNotification("error", `An error occurred: ${error.message}`)
    } finally {
      setIsTogglingNotifications(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      addNotification("success", "Logged out successfully")
      router.push("/signin")
    } catch (error) {
      addNotification("error", `Failed to log out: ${error.message}`)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Theme</h2>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleThemeChange("light")} variant={theme === "light" ? "default" : "outline"}>
              Light
            </Button>
            <Button onClick={() => handleThemeChange("dark")} variant={theme === "dark" ? "default" : "outline"}>
              Dark
            </Button>
            <Button onClick={() => handleThemeChange("system")} variant={theme === "system" ? "default" : "outline"}>
              System
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Push Notifications</h2>
          <div className="flex items-center space-x-2">
            <Switch
              checked={pushNotifications}
              onCheckedChange={handlePushNotificationToggle}
              disabled={isTogglingNotifications}
            />
            <span>{isTogglingNotifications ? "Updating..." : pushNotifications ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

