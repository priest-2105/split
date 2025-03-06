"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import Image from "next/image"
import Logo from "@/public/split-.png"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"


export const AuthNavbar = () => {
 
      const [mounted, setMounted] = useState(false)
      const { theme, setTheme } = useTheme()
      const [isLoggedIn, setIsLoggedIn] = useState(false)
    
    
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
        
            {/* <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-4 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </button> */}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

