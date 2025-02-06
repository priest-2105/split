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

const queryClient = new QueryClient()

export default function Home() {
  const { selectedDate } = useCalendarStore()
  const [supabase] = useState(() => createClientComponentClient())
  const user = useUser()

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="min-h-screen bg-background">
            <div className="p-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">Calendar App</h1>
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                <Auth />
              </div>
            </div>
            {user ? (
              <>
                <Calendar />
                <AnimatePresence>{selectedDate && <SidePanel />}</AnimatePresence>
              </>
            ) : (
              <p>Please log in to view your calendar.</p>
            )}
            <Toaster />
          </main>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  )
}

