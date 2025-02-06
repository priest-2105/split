"use client"

import { useEffect } from "react"
import { useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
