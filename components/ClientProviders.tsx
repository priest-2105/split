"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NotificationProvider } from "@/contexts/NotificationContext"
import type React from "react" // Added import for React

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() =>
    createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  )

  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // handle sign in event
      } else if (event === "SIGNED_OUT") {
        // handle sign out event
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  )
}

