"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCalendarStore, type Event } from "@/store/calendarStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Edit, Trash, Mail, Bell } from "lucide-react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useSession } from "@supabase/auth-helpers-react"
import { EventBadge } from "@/components/EventBadge"
import { useNotification } from "@/contexts/NotificationContext"
import { ConditionManager } from "@/components/ConditionManager"

interface Condition {
  id: string
  name: string
  user_id: string
}

export default function SidePanel() {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("")
  const [notify, setNotify] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [showConditionManager, setShowConditionManager] = useState(false)
  const queryClient = useQueryClient()
  const session = useSession()
  const supabase = createClientComponentClient()
  const { addNotification } = useNotification()

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["events", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("user_id", session?.user?.id)
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  const { data: conditions = [] } = useQuery<Condition[]>({
    queryKey: ["conditions", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("conditions").select("*").eq("user_id", session?.user?.id)
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title)
      setDescription(editingEvent.description)
      setCondition(editingEvent.condition)
      setNotify(editingEvent.notify)
    } else {
      setTitle("")
      setDescription("")
      setCondition("")
      setNotify(false)
    }
  }, [editingEvent])

  const addOrUpdateEventMutation = useMutation({
    mutationFn: async (newEvent: Omit<Event, "id" | "user_id"> & { id?: string }) => {
      if (newEvent.id) {
        const { data, error } = await supabase
          .from("events")
          .update(newEvent)
          .eq("id", newEvent.id)
          .eq("user_id", session?.user?.id)
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert({ ...newEvent, user_id: session?.user?.id })
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events", session?.user?.id])
      setEditingEvent(null)
      addNotification("success", "Event saved successfully!")
    },
    onError: (error) => {
      addNotification("error", `Failed to save event: ${error.message}`)
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().match({ id, user_id: session?.user?.id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events", session?.user?.id])
      addNotification("success", "Event deleted successfully!")
    },
    onError: (error) => {
      addNotification("error", `Failed to delete event: ${error.message}`)
    },
  })

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ event, recipient }: { event: Event; recipient: string }) => {
      const response = await fetch("/api/send-event-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event, recipient }),
      })
      if (!response.ok) {
        throw new Error("Failed to send notification")
      }
      return response.json()
    },
    onSuccess: () => {
      addNotification("success", "Notification sent successfully!")
    },
    onError: (error) => {
      addNotification("error", `Failed to send notification: ${error.message}`)
    },
  })

  if (!selectedDate) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addOrUpdateEventMutation.mutateAsync({
        id: editingEvent?.id,
        title,
        description,
        condition,
        notify,
        date: selectedDate.toISOString(),
      })
      setTitle("")
      setDescription("")
      setCondition("")
      setNotify(false)
    } catch (error) {
      console.error("Error adding/updating event:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEventMutation.mutateAsync(id)
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
  }

  const handleSendNotification = async (event: Event) => {
    if (recipientEmail) {
      try {
        await sendNotificationMutation.mutateAsync({ event, recipient: recipientEmail })
        setRecipientEmail("")
      } catch (error) {
        console.error("Error sending notification:", error)
      }
    } else {
      addNotification("warning", "Please enter a recipient email")
    }
  }

  const dateEvents = events.filter((event) => new Date(event.date).toDateString() === selectedDate.toDateString())

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full sm:w-80 bg-background shadow-lg p-4 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Input placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Select value={condition} onValueChange={setCondition} required>
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((cond) => (
              <SelectItem key={cond.id} value={cond.name}>
                {cond.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch id="notify" checked={notify} onCheckedChange={setNotify} />
          <label
            htmlFor="notify"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Notify me
          </label>
        </div>
        <Button type="button" onClick={() => setShowConditionManager(true)}>
          Manage Conditions
        </Button>
        <Button type="submit" disabled={addOrUpdateEventMutation.isLoading}>
          {addOrUpdateEventMutation.isLoading ? "Saving..." : editingEvent ? "Update Event" : "Add Event"}
        </Button>
      </motion.form>

      <AnimatePresence>
        {showConditionManager && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <ConditionManager />
            <Button className="mt-2" onClick={() => setShowConditionManager(false)}>
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-2">Events for this date:</h3>
        {dateEvents.length === 0 ? (
          <p>No events scheduled.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence>
              {dateEvents.map((event) => (
                <motion.li
                  key={event.id}
                  className="bg-gray-100 p-2 rounded"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <EventBadge condition={event.condition} />
                      <h4 className="font-medium">{event.title}</h4>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        disabled={deleteEventMutation.isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{event.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Bell className={`h-4 w-4 ${event.notify ? "text-blue-500" : "text-gray-400"}`} />
                    <span className="text-sm">{event.notify ? "Notifications enabled" : "Notifications disabled"}</span>
                  </div>
                  <div className="mt-2">
                    <Input
                      placeholder="Recipient Email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="mb-2"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendNotification(event)}
                      disabled={sendNotificationMutation.isLoading}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {sendNotificationMutation.isLoading ? "Sending..." : "Send Notification"}
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
    </motion.div>
  )
}

