"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Calendar, User, Settings, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { createBrowserClient } from "@supabase/ssr"
import { useNotification } from "@/contexts/NotificationContext"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Calendar, label: "Conditions", href: "/dashboard/conditions" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { addNotification } = useNotification()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
    onError: () => {
      router.push("/signin")
    },
  })

  const userName = userData?.user_metadata?.username || userData?.email?.split("@")[0] || "User"

  const openLogoutDialog = () => {
    setIsLogoutDialogOpen(true)
  }

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      addNotification("success", "Logged out successfully")
      router.push("/signin")
    } catch (error) {
      addNotification("error", `Failed to log out: ${error.message}`)
    }
  }

  const LogoutConfirmationDialog = () => (
    <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out? You will need to sign in again to access your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Split</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 ${
                pathname === item.href ? "bg-gray-700" : ""
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button variant="ghost" className="w-full justify-start" onClick={openLogoutDialog}>
            <LogOut className="h-5 w-5 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <motion.nav
        initial={{ transform: "translateX(-100%)" }}
        animate={{ transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-gray-800 text-white p-4 z-50"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Split</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 ${
                pathname === item.href ? "bg-gray-700" : ""
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button variant="ghost" className="w-full justify-start" onClick={openLogoutDialog}>
            <LogOut className="h-5 w-5 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </motion.nav>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <span className="font-semibold">{isUserLoading ? "Loading..." : userName}</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">{children}</main>
        <LogoutConfirmationDialog />
      </div>
    </div>
  )
}

