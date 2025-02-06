"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Calendar from "@/components/Calendar"
import SidePanel from "@/components/SidePanel"
import Auth from "@/components/Auth"
import { AnimatePresence } from "framer-motion"
import { useCalendarStore } from "@/store/calendarStore"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionContextProvider, useUser } from "@supabase/auth-helpers-react"
import { ThemeProvider } from "next-themes"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { Toaster } from "react-hot-toast"
import PublicRoute from "@/components/public/layout"
import HeroSection from "@/components/public/pages/landingpage/heroSection"
import HowItWorks from "@/components/public/pages/landingpage/howitworks"
import FeaturesSection from "@/components/public/pages/landingpage/features"

const queryClient = new QueryClient()

export default function Home() {
  const { selectedDate } = useCalendarStore()
  const [supabase] = useState(() => createClientComponentClient())
  const user = useUser()

  return (
   <PublicRoute>
    <HeroSection/>
    <HowItWorks/>
    <FeaturesSection/>
    </PublicRoute>
  )
}

