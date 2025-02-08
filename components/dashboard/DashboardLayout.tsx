"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Calendar, User, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher"

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Calendar, label: "Conditions", href: "/dashboard/conditions" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background">
      <motion.nav
        initial={{ transform: "translateX(-100%)" }}
        animate={{ transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 text-white p-4 z-50"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">split</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 ${
                  pathname === item.href ? "bg-gray-700" : ""
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.nav>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <span>User Name</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">{children}</main>
      </div>
    </div>
  )
}

