"use client"

import { useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
// import { useEffect } from "react"
import Navbar from "./navbar"
import Footer from "./footer"

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  
  // const user = useUser()
  // const router = useRouter()

  // useEffect(() => {
  //   if (user) {
  //     router.push("/dashboard")
  //   }
  // }, [user, router])

  return <>
      <Navbar/>  
      {children}
      <Footer />
  </>
}

export default PublicRoute;