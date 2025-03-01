"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotification } from "@/contexts/NotificationContext"
import { format, addMinutes, parse } from "date-fns"

interface Task {
  id: string
  title: string
  start_time: string
  end_time: string
  condition: string
  repeat: string
  user_id: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => format(new Date().setHours(i, 0, 0, 0), "HH:mm"))
const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const minutes = i * 15
  const time = addMinutes(new Date().setHours(0, 0, 0, 0), minutes)
  return format(time, "HH:mm")
})

export function DayView({ date }: { date: Date }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    start_time: "",
    end_time: "",
    condition: "",
    repeat: "none",
  })
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    fetchUserId()
  }, [supabase])

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", date.toISOString(), userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date.toISOString().split("T")[0])
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  const { data: conditions = [] } = useQuery({
    queryKey: ["conditions", userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase.from("conditions").select("*").eq("user_id", userId)
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  const createTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      if (!userId) throw new Error("User not authenticated")
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...task,
          user_id: userId,
          date: date.toISOString().split("T")[0],
        })
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", date.toISOString(), userId])
      addNotification("success", "Task created successfully")
      setNewTask({
        title: "",
        start_time: "",
        end_time: "",
        condition: "",
        repeat: "none",
      })
    },
    onError: (error) => {
      addNotification("error", `Failed to create task: ${error.message}`)
    },
  })

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.start_time || !newTask.end_time || !newTask.condition) {
      addNotification("error", "Please fill in all required fields")
      return
    }
    createTaskMutation.mutate(newTask as Task)
  }

  return (
    <div className="flex h-full gap-4">
      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-[1440px]">
          {/* Time labels */}
          <div className="absolute left-0 top-0 w-16 h-full border-r border-gray-200">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full"
                style={{ top: `${((Number.parseInt(hour) * 60) / 1440) * 100}%` }}
              >
                <div className="relative -top-3 pr-2 text-right text-sm text-gray-500">{hour}</div>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className="ml-16">
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="absolute w-full border-t border-gray-100"
                style={{
                  top: `${((parse(time, "HH:mm", new Date()).getTime() - new Date().setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000)) * 100}%`,
                }}
              />
            ))}

            {/* Tasks */}
            {tasks.map((task) => {
              const startMinutes =
                parse(task.start_time, "HH:mm", new Date()).getHours() * 60 +
                parse(task.start_time, "HH:mm", new Date()).getMinutes()
              const endMinutes =
                parse(task.end_time, "HH:mm", new Date()).getHours() * 60 +
                parse(task.end_time, "HH:mm", new Date()).getMinutes()
              const duration = endMinutes - startMinutes
              const top = (startMinutes / 1440) * 100
              const height = (duration / 1440) * 100

              return (
                <div
                  key={task.id}
                  className="absolute left-0 right-4 rounded-md px-2 py-1 text-sm bg-blue-500 text-white"
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    minHeight: "20px",
                  }}
                >
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs">
                    {task.start_time} - {task.end_time}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Task creation form */}
      <div className="w-80 p-4 border-l border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <Select value={newTask.start_time} onValueChange={(value) => setNewTask({ ...newTask, start_time: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <Select value={newTask.end_time} onValueChange={(value) => setNewTask({ ...newTask, end_time: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <Select value={newTask.condition} onValueChange={(value) => setNewTask({ ...newTask, condition: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition.id} value={condition.name}>
                    {condition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Repeat</label>
            <Select value={newTask.repeat} onValueChange={(value) => setNewTask({ ...newTask, repeat: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select repeat option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreateTask} className="w-full" disabled={createTaskMutation.isLoading}>
            {createTaskMutation.isLoading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </div>
    </div>
  )
}

