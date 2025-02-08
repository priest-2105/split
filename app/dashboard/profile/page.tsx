"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "@supabase/auth-helpers-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useNotification } from "@/contexts/NotificationContext"

export default function ProfilePage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const session = useSession()
  const supabase = createClientComponentClient()
  const { addNotification } = useNotification()

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingUsername(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { username } })
      if (error) throw error
      addNotification("success", "Username updated successfully!")
    } catch (error) {
      addNotification("error", `Failed to update username: ${error.message}`)
    } finally {
      setIsUpdatingUsername(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      addNotification("error", "Passwords do not match")
      return
    }
    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      addNotification("success", "Password updated successfully!")
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      addNotification("error", `Failed to update password: ${error.message}`)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="space-y-6 max-w-md">
        <form onSubmit={handleUpdateUsername} className="space-y-4">
          <h2 className="text-xl font-semibold">Update Username</h2>
          <Input
            type="text"
            placeholder="New username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={isUpdatingUsername}>
            {isUpdatingUsername ? "Updating..." : "Update Username"}
          </Button>
        </form>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={isUpdatingPassword}>
            {isUpdatingPassword ? "Updating..." : "Change Password"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  )
}

