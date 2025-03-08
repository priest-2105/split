"use client"

import type React from "react"
import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "react-hot-toast"
import { AuthNavbar } from "@/components/auth/navbar"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setIsLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password reset email sent. Please check your inbox.")
    }
  }

  return (
     <>
      <AuthNavbar/>
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold mb-8">Forgot Password</h1>
      <form onSubmit={handleResetPassword} className="w-full max-w-md space-y-4">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Reset Password"}
        </Button>
      </form>
    </div>
    </>
  )
}

