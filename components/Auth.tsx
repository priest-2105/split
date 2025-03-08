"use client"

import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const supabase = useSupabaseClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert(error.message)
    } else {
      const user = data.user
      if (user) {
        const { error: insertError } = await supabase.from('users').upsert([
          { id: user.id, email: user.email }
        ])
        if (insertError) {
          alert(insertError.message)
        } else {
          alert("Check your email for the login link!")
        }
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Send magic link"}
      </Button>
    </form>
  )
}

