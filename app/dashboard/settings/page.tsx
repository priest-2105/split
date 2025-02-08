"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useSession } from "@supabase/auth-helpers-react"
import { useNotification } from "@/contexts/NotificationContext"
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/utils/pushNotifications"

export default function SettingsPage() {
  const [pushNotifications, setPushNotifications] = useState(false)
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false)
  const { theme, setTheme } = useTheme()
  const session = useSession()
  const supabase = createClientComponentClient()
  const { addNotification } = useNotification()

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user preferences from the database
      const fetchPreferences = async () => {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("push_notifications")
          .eq("user_id", session.user.id)
          .single()

        if (error) {
          console.error("Error fetching user preferences:", error)
        } else if (data) {
          setPushNotifications(data.push_notifications)
        }
      }

      fetchPreferences()
    }
  }, [session, supabase])

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

      if (session?.user?.id) {
        const { error } = await supabase
          .from("user_preferences")
          .upsert({ user_id: session.user.id, push_notifications: newValue })

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
      </div>
    </DashboardLayout>
  )
}

