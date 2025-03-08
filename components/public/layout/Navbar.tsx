"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import Image from "next/image"
import Logo from "@/public/split-.png"
import { createBrowserClient } from "@supabase/ssr"
import { useQuery } from "@tanstack/react-query"

const handleScroll = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: "smooth" })
  }
}

export const Navbar = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute user's display name if available.
  const displayName = userData 
    ? userData.user_metadata?.username || (userData.email ? userData.email.split("@")[0] : "Dashboard")
    : null

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              <Image src={Logo} height={50} width={50} alt="split logo" />
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              href="/#features"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={(e) => {
                e.preventDefault()
                handleScroll("features")
              }}
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={(e) => {
                e.preventDefault()
                handleScroll("pricing")
              }}
            >
              Pricing
            </Link>
            {!isUserLoading && (
              <Link
                href={userData ? "/dashboard" : "/signin"}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                {userData ? "Dashboard" : "Sign In"}
              </Link>
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-4 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

