"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useNotification } from "@/contexts/NotificationContext"

interface Task {
  id: string
  title: string
  start_time: string
  end_time: string
  condition: string
  repeat: string
}

interface Condition {
  id: string
  name: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => format(new Date().setHours(i, 0, 0, 0), "HH:mm"))

export function DayView({ date }: { date: Date }) {
  const [newTask, setNewTask] = useState<Partial<Task>>({})
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { addNotification } = useNotification()

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", date.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("date", date.toISOString().split("T")[0])
      if (error) throw error
      return data
    },
  })

  const { data: conditions = [] } = useQuery<Condition[]>({
    queryKey: ["conditions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("conditions").select("*")
      if (error) throw error
      return data
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...task, date: date.toISOString().split("T")[0] })
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", date.toISOString()])
      addNotification("success", "Task created successfully")
      setNewTask({})
    },
    onError: (error) => {
      addNotification("error", `Failed to create task: ${error.message}`)
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const { data, error } = await supabase.from("tasks").update(task).eq("id", task.id).single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", date.toISOString()])
      addNotification("success", "Task updated successfully")
    },
    onError: (error) => {
      addNotification("error", `Failed to update task: ${error.message}`)
    },
  })

  const handleCreateTask = () => {
    createTaskMutation.mutate(newTask as Task)
  }

  const handleUpdateTask = (task: Task) => {
    updateTaskMutation.mutate(task)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{format(date, "MMMM d, yyyy")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          {HOURS.map((hour) => (
            <div key={hour} className="mb-2 p-2 border rounded">
              <h3 className="font-medium">{hour}</h3>
              {tasks
                .filter((task) => task.start_time === hour)
                .map((task) => (
                  <div key={task.id} className="mt-1 p-1 bg-gray-100 rounded">
                    <span>{task.title}</span>
                    <Select
                      value={task.condition}
                      onValueChange={(value) => handleUpdateTask({ ...task, condition: value })}
                    >
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
                ))}
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Create New Task</h2>
          <Input
            placeholder="Task Title"
            value={newTask.title || ""}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="mb-2"
          />
          <Select value={newTask.start_time} onValueChange={(value) => setNewTask({ ...newTask, start_time: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Start Time" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={newTask.end_time} onValueChange={(value) => setNewTask({ ...newTask, end_time: value })}>
            <SelectTrigger>
              <SelectValue placeholder="End Time" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Select value={newTask.repeat} onValueChange={(value) => setNewTask({ ...newTask, repeat: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Repeat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No repeat</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateTask} className="mt-2">
            Create Task
          </Button>
        </div>
      </div>
    </div>
  )
}

