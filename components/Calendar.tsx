"use client"

import { useState, useEffect, memo } from "react"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useCalendarStore } from "@/store/calendarStore"
import { useQuery } from "@tanstack/react-query"
import { EventBadge } from "@/components/EventBadge"
import { createClient } from "@/lib/supabase"
import { DayView } from "@/components/DayView"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const MemoizedEventBadge = memo(EventBadge)

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    fetchUserId()
  }, [supabase])

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events", userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase.from("events").select("*").eq("user_id", userId)
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayIndex = firstDayOfMonth.getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
  }

  const renderCalendarDays = () => {
    const days = []
    for (let i = 0; i < startingDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isSelected =
        selectedDate?.getDate() === day &&
        selectedDate?.getMonth() === currentDate.getMonth() &&
        selectedDate?.getFullYear() === currentDate.getFullYear()
      const dayEvents = events.filter((event) => new Date(event.date).toDateString() === currentDay.toDateString())

      days.push(
        <div
          key={currentDay.toISOString()}
          className={`border border-gray-200 h-24 p-1 cursor-pointer overflow-y-auto ${
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
          }`}
          onClick={() => handleDateClick(day)}
          role="gridcell"
          aria-selected={isSelected}
          tabIndex={0}
        >
          <span className="text-sm font-semibold">{day}</span>
          <AnimatePresence>
            {dayEvents.map((event) => (
              <motion.div
                key={event.id}
                className="flex items-center space-x-1 text-xs"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <MemoizedEventBadge condition={event.condition} />
                <span className="truncate">{event.title}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
      )
    }
    return days
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading events</div>

  if (selectedDate) {
    return (
      <div className="h-full">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => setSelectedDate(null)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
          <h2 className="text-2xl font-semibold">
            {selectedDate.toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
        </div>
        <DayView date={selectedDate} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        className="flex justify-between items-center mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold">
          {currentDate.toLocaleSntring("default", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-7 gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        role="grid"
        aria-label="Calendar"
      >
        {DAYS.map((day) => (
          <div key={day} className="text-center font-medium py-2 hidden sm:block" role="columnheader">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </motion.div>
    </div>
  )
}

export default memo(Calendar)

