"use client"

import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      router.push("/dashboard")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </Button>
    </form>
  )
}
