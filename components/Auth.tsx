"use client"

import { useState } from "react"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const supabase = useSupabaseClient()
  const user = useUser()

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  if (user) {
    return (
      <div>
        <span>Hello, {user.email}</span>
        <Button onClick={handleLogout} disabled={loading}>
          {loading ? "Loading..." : "Logout"}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <a href="/login">Login</a> | <a href="/signup">Sign Up</a>
    </div>
  )
}

