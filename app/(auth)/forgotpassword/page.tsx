"use client"

import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const supabase = useSupabaseClient()

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      alert(error.message)
    } else {
      alert("Check your email for the password reset link!")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Reset Password"}
      </Button>
    </form>
  )
}
