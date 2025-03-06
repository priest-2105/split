"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "react-hot-toast"
import { AuthNavbar } from "@/components/auth/navbar"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success("Signed in successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error.message || "An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <AuthNavbar/>
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold mb-8">Sign In</h1>
      <form onSubmit={handleSignIn} className="w-full max-w-md space-y-4">
        <Input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
      <div className="mt-4">
        <Link href="/forgot-password" className="text-blue-500 hover:underline">
          Forgot Password?
        </Link>
      </div>
    </div>
    </>
  )
}
