"use client"

import { useState, useEffect, memo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useCalendarStore, type Event } from "@/store/calendarStore"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { EventBadge } from "./EventBadge"
import { useSession } from "@supabase/auth-helpers-react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { toast } from "react-hot-toast"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const MemoizedEventBadge = memo(EventBadge)

export default memo(function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const session = useSession()
  const queryClient = useQueryClient()

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery<Event[]>({
    queryKey: ["events", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("user_id", session?.user?.id)
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  const updateEventMutation = useMutation({
    mutationFn: async (updatedEvent: Event) => {
      const { data, error } = await supabase
        .from("events")
        .update({ date: updatedEvent.date })
        .eq("id", updatedEvent.id)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events", session?.user?.id])
    },
  })

  useEffect(() => {
    if (!session?.user?.id) return

    const subscription = supabase
      .channel("events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, (payload) => {
        console.log("Change received!", payload)
        queryClient.invalidateQueries(["events", session?.user?.id])

        if (payload.eventType === "UPDATE") {
          toast.success("An event has been updated!")
        } else if (payload.eventType === "INSERT") {
          toast.success("A new event has been added!")
        } else if (payload.eventType === "DELETE") {
          toast.success("An event has been deleted!")
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [session?.user?.id, queryClient])

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceDate = new Date(result.source.droppableId)
    const destinationDate = new Date(result.destination.droppableId)
    const eventId = result.draggableId

    const eventToUpdate = events.find((event) => event.id === eventId)
    if (eventToUpdate) {
      const updatedEvent = { ...eventToUpdate, date: destinationDate.toISOString() }
      updateEventMutation.mutate(updatedEvent)
    }
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
        <Droppable key={currentDay.toISOString()} droppableId={currentDay.toISOString()}>
          {(provided, snapshot) => (
            <motion.div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`border border-gray-200 h-24 p-1 cursor-pointer overflow-y-auto ${
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
              } ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`}
              onClick={() => handleDateClick(day)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
              role="gridcell"
              aria-selected={isSelected}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDateClick(day)
                }
              }}
            >
              <span className="text-sm font-semibold">{day}</span>
              <AnimatePresence>
                {dayEvents.map((event, index) => (
                  <Draggable key={event.id} draggableId={event.id} index={index}>
                    {(provided) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center space-x-1 text-xs"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MemoizedEventBadge condition={event.condition} />
                        <span className="truncate">{event.title}</span>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </motion.div>
          )}
        </Droppable>,
      )
    }
    return days
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading events</div>

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          className="flex justify-between items-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
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
          className="grid grid-cols-7 gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          role="grid"
          aria-label="Calendar"
        >
          {DAYS.map((day) => (
            <div key={day} className="text-center font-medium py-2" role="columnheader">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </motion.div>
      </div>
    </DragDropContext>
  )
})

