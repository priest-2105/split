"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { AuthNavbar } from "@/components/auth/navbar"
import Link from "next/link"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      const user = data.user
      if (user) {
        const { error: insertError } = await supabase.from('users').insert([
          { id: user.id, email: user.email, username }
        ])
        if (insertError) {
          toast.error(insertError.message)
        } else {
          toast.success("Sign up successful! Please check your email to confirm your account.")
          router.push("/signin")
        }
      }
    }
  }

  return (
    <>   
    <AuthNavbar/>
     <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Sign Up</h1>
      <form onSubmit={handleSignUp} className="w-full max-w-md space-y-4">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
      <div className="mt-4">
        <span>
          Already Have an Account? 
          <Link href="/signin" className="text-blue-500 ml-2 hover:underline">
          Sign in
        </Link>
        </span>
      </div>
    </div>
    </>
  )
}

