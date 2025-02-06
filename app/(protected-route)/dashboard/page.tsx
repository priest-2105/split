"use client"

import ProtectedRoute from "@/components/protected/layout"
import Calendar from "@/components/Calendar"
import SidePanel from "@/components/SidePanel"
import { AnimatePresence } from "framer-motion"
import { useCalendarStore } from "@/store/calendarStore"

export default function Dashboard() {
  const { selectedDate } = useCalendarStore()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <Calendar />
        <AnimatePresence>{selectedDate && <SidePanel />}</AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}
