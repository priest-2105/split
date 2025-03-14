"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient, fetchConditions } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotification } from "@/contexts/NotificationContext"
import { format, addMinutes, parse, isAfter } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Moon, Sun } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface Task {
  id: string
  title: string
  start_time: string
  end_time: string
  condition: string
  repeat: string
  user_id: string
}

interface Condition {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

interface ValidationErrors {
  title?: string
  start_time?: string
  end_time?: string
  condition?: string
  timeRange?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => format(new Date().setHours(i, 0, 0, 0), "HH:mm"))
const TIME_SLOTS = Array.from({ length: 24 * 3 }, (_, i) => {
  const minutes = i * 20
  const time = addMinutes(new Date().setHours(0, 0, 0, 0), minutes)
  const formattedTime = format(time, "HH:mm")
  return {
    time: formattedTime,
    isHour: minutes % 60 === 0,
  }
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { addNotification } = useNotification()
  const [currentTime, setCurrentTime] = useState(new Date())
  const timeGridRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchUserRecord = async () => {
      // Get authenticated user from auth system first
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        console.error("Auth check failed:", authError)
        return
      }
      // Now query the "users" table using the auth user id for your application-specific data
      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single()
      if (userError) {
        console.error("Error fetching user record:", userError)
      } else if (userRecord) {
        console.log("User record found:", userRecord)
        setUserId(userRecord.id)
      }
    }
    fetchUserRecord()
  }, [supabase])

  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    isError: isTasksError,
    error: tasksError,
  } = useQuery<Task[]>({
    queryKey: ["tasks", date.toISOString(), userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date.toISOString().split("T")[0])
      if (error) {
        console.error("Error fetching tasks:", error)
        throw error
      }
      return data || []
    },
    enabled: !!userId,
  })

  const {
    data: conditions = [],
    isLoading: isConditionsLoading,
    isError: isConditionsError,
    error: conditionsError,
  } = useQuery<Condition[], Error>({
    queryKey: ["conditions", userId],
    queryFn: () => fetchConditions(userId!),
    enabled: !!userId,
  })

  useEffect(() => {
    if (isConditionsError) {
      console.error("Error fetching conditions:", conditionsError)
    }
  }, [isConditionsError, conditionsError])

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
      if (error) {
        console.error("Error creating task:", error)
        throw error
      }
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
      setIsCreateModalOpen(false)
    },
    onError: (error) => {
      console.error("Error in createTaskMutation:", error)
      addNotification("error", `Failed to create task: ${error.message}`)
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      if (!userId) throw new Error("User not authenticated")
      const { data, error } = await supabase.from("tasks").update(task).eq("id", task.id).eq("user_id", userId).single()
      if (error) {
        console.error("Error updating task:", error)
        throw error
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", date.toISOString(), userId])
      addNotification("success", "Task updated successfully")
      setIsEditing(false)
      setSelectedTask(null)
    },
    onError: (error) => {
      console.error("Error in updateTaskMutation:", error)
      addNotification("error", `Failed to update task: ${error.message}`)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("User not authenticated")
      const { data, error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId)
      if (error) {
        console.error("Error deleting task:", error)
        throw error
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", date.toISOString(), userId])
      addNotification("success", "Task deleted successfully")
      setSelectedTask(null)
    },
    onError: (error) => {
      console.error("Error in deleteTaskMutation:", error)
      addNotification("error", `Failed to delete task: ${error.message}`)
    },
  })

  const validateTask = (task: Partial<Task>): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!task.title || task.title.trim() === "") {
      errors.title = "Title is required"
    }

    if (!task.start_time) {
      errors.start_time = "Start time is required"
    }

    if (!task.end_time) {
      errors.end_time = "End time is required"
    }

    if (!task.condition) {
      errors.condition = "Condition is required"
    }

    if (task.start_time && task.end_time) {
      const startTime = parse(task.start_time, "HH:mm", new Date())
      const endTime = parse(task.end_time, "HH:mm", new Date())

      if (isAfter(startTime, endTime) || task.start_time === task.end_time) {
        errors.timeRange = "End time must be after start time"
      }
    }

    return errors
  }

  const handleCreateTask = () => {
    const errors = validateTask(newTask)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    createTaskMutation.mutate(newTask as Task)
  }

  const handleUpdateTask = () => {
    if (!selectedTask) return

    const errors = validateTask(selectedTask)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    updateTaskMutation.mutate(selectedTask)
  }

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id)
  }

  const getConditionColor = (conditionName: string) => {
    const condition = conditions.find((c) => c.name === conditionName)
    return condition?.color || "bg-blue-500" // Default color
  }

  useEffect(() => {
    // Update every minute
    const minuteTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Also update every time the component becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setCurrentTime(new Date())
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(minuteTimer)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const scrollToCurrentTime = useCallback(() => {
    if (timeGridRef.current) {
      const now = new Date()
      const minutes = now.getHours() * 60 + now.getMinutes()
      const percentage = (minutes / 1440) * 100
      const scrollPosition = (percentage / 100) * timeGridRef.current.scrollHeight

      // Scroll with the current time indicator positioned 1/3 from the top of the viewport
      timeGridRef.current.scrollTop = scrollPosition - timeGridRef.current.clientHeight / 3

      // Add a visual flash effect to the current time indicator
      const currentTimeIndicator = timeGridRef.current.querySelector(".current-time-indicator")
      if (currentTimeIndicator) {
        currentTimeIndicator.classList.add("animate-pulse")
        setTimeout(() => {
          currentTimeIndicator.classList.remove("animate-pulse")
        }, 2000)
      }
    }
  }, [])

  useEffect(() => {
    scrollToCurrentTime()
  }, [scrollToCurrentTime])

  const resetTaskForm = () => {
    setNewTask({
      title: "",
      start_time: "",
      end_time: "",
      condition: "",
      repeat: "none",
    })
    setValidationErrors({})
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (isTasksLoading || isConditionsLoading) {
    return <div>Loading...</div>
  }

  if (isTasksError) {
    return <div>Error loading tasks: {tasksError?.message}</div>
  }

  if (isConditionsError) {
    return <div>Error loading conditions: {conditionsError?.message}</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="default" size="sm" onClick={scrollToCurrentTime} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            Now
          </Button>
          <Dialog
            open={isCreateModalOpen}
            onOpenChange={(open) => {
              setIsCreateModalOpen(open)
              if (!open) resetTaskForm()
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to your calendar. Fill in all the required fields.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title"
                    className={cn(validationErrors.title && "border-red-500")}
                  />
                  {validationErrors.title && <p className="text-sm text-red-500">{validationErrors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Select
                      value={newTask.start_time}
                      onValueChange={(value) => setNewTask({ ...newTask, start_time: value })}
                    >
                      <SelectTrigger id="start-time" className={cn(validationErrors.start_time && "border-red-500")}>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={`start-${slot.time}`} value={slot.time || "00:00"}>
                            {slot.time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.start_time && (
                      <p className="text-sm text-red-500">{validationErrors.start_time}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Select
                      value={newTask.end_time}
                      onValueChange={(value) => setNewTask({ ...newTask, end_time: value })}
                    >
                      <SelectTrigger id="end-time" className={cn(validationErrors.end_time && "border-red-500")}>
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={`end-${slot.time}`} value={slot.time || "00:00"}>
                            {slot.time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.end_time && <p className="text-sm text-red-500">{validationErrors.end_time}</p>}
                  </div>
                </div>

                {validationErrors.timeRange && <p className="text-sm text-red-500">{validationErrors.timeRange}</p>}

                <div className="grid gap-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={newTask.condition}
                    onValueChange={(value) => setNewTask({ ...newTask, condition: value })}
                  >
                    <SelectTrigger id="condition" className={cn(validationErrors.condition && "border-red-500")}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.name || `condition-${condition.id}`}>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${condition.color || "bg-blue-500"}`}></div>
                            {condition.name || `Condition ${condition.id.slice(0, 4)}`}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.condition && <p className="text-sm text-red-500">{validationErrors.condition}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="repeat">Repeat</Label>
                  <Select value={newTask.repeat} onValueChange={(value) => setNewTask({ ...newTask, repeat: value })}>
                    <SelectTrigger id="repeat">
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={createTaskMutation.isLoading}>
                  {createTaskMutation.isLoading ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 h-0 gap-4">
        {/* Time grid */}
        <div className="flex-1 overflow-y-auto" ref={timeGridRef}>
          <div className="relative h-[1440px]">
            {/* Time labels */}
            <div className="absolute left-0 top-0 w-16 h-full border-r border-gray-200 dark:border-gray-700">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full"
                  style={{ top: `${((Number.parseInt(hour.split(":")[0]) * 60) / 1440) * 100}%` }}
                >
                  <div className="relative -top-3 pr-2 text-right text-sm text-gray-500 dark:text-gray-400">{hour}</div>
                </div>
              ))}
            </div>

            {/* Hour blocks with alternating backgrounds instead of grid lines */}
            <div className="ml-16 h-full">
              {HOURS.map((hour, index) => {
                const hourNum = Number.parseInt(hour.split(":")[0])
                const top = ((hourNum * 60) / 1440) * 100
                const height = (60 / 1440) * 100

                return (
                  <div
                    key={hour}
                    className={`absolute w-full ${
                      index % 2 === 0 ? "bg-transparent" : "bg-gray-50 dark:bg-gray-900/30"
                    }`}
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                    }}
                  >
                    {/* Hour marker - just a small dot at the start of each hour */}
                    <div
                      className="absolute left-0 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"
                      style={{ top: "0px" }}
                    ></div>
                  </div>
                )
              })}

              {/* Current time indicator */}
              <div
                className="absolute w-full z-10 flex items-center current-time-indicator transition-all duration-300"
                style={{
                  top: `${((currentTime.getHours() * 60 + currentTime.getMinutes()) / 1440) * 100}%`,
                }}
              >
                <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 -mt-1.5 shadow-md shadow-red-500/50"></div>
                <div className="h-0.5 flex-1 bg-red-500 bg-opacity-70"></div>
                <div className="text-xs text-white font-medium px-2 py-0.5 rounded bg-red-500 shadow-sm">
                  {format(currentTime, "HH:mm")}
                </div>
              </div>

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
                const conditionColor = getConditionColor(task.condition)

                return (
                  <div
                    key={task.id}
                    className={`absolute left-0 right-4 rounded-md px-2 py-1 text-sm text-white cursor-pointer shadow-sm hover:shadow-md transition-shadow ${conditionColor}`}
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      minHeight: "20px",
                    }}
                    onClick={() => {
                      setSelectedTask(task)
                      setIsEditing(true)
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

        {/* Task editing panel - only shown when a task is selected */}
        {isEditing && selectedTask && (
          <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Task</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setSelectedTask(null)
                  setValidationErrors({})
                }}
              >
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  placeholder="Task title"
                  className={cn(validationErrors.title && "border-red-500")}
                />
                {validationErrors.title && <p className="text-sm text-red-500">{validationErrors.title}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-start-time">Start Time</Label>
                <Select
                  value={selectedTask.start_time}
                  onValueChange={(value) => setSelectedTask({ ...selectedTask, start_time: value })}
                >
                  <SelectTrigger id="edit-start-time" className={cn(validationErrors.start_time && "border-red-500")}>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={`edit-start-${slot.time}`} value={slot.time || "00:00"}>
                        {slot.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.start_time && <p className="text-sm text-red-500">{validationErrors.start_time}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-end-time">End Time</Label>
                <Select
                  value={selectedTask.end_time}
                  onValueChange={(value) => setSelectedTask({ ...selectedTask, end_time: value })}
                >
                  <SelectTrigger id="edit-end-time" className={cn(validationErrors.end_time && "border-red-500")}>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={`edit-end-${slot.time}`} value={slot.time || "00:00"}>
                        {slot.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.end_time && <p className="text-sm text-red-500">{validationErrors.end_time}</p>}
              </div>

              {validationErrors.timeRange && <p className="text-sm text-red-500">{validationErrors.timeRange}</p>}

              <div className="grid gap-2">
                <Label htmlFor="edit-condition">Condition</Label>
                <Select
                  value={selectedTask.condition}
                  onValueChange={(value) => setSelectedTask({ ...selectedTask, condition: value })}
                >
                  <SelectTrigger id="edit-condition" className={cn(validationErrors.condition && "border-red-500")}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.id} value={condition.name || `condition-${condition.id}`}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${condition.color || "bg-blue-500"}`}></div>
                          {condition.name || `Condition ${condition.id.slice(0, 4)}`}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.condition && <p className="text-sm text-red-500">{validationErrors.condition}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-repeat">Repeat</Label>
                <Select
                  value={selectedTask.repeat}
                  onValueChange={(value) => setSelectedTask({ ...selectedTask, repeat: value })}
                >
                  <SelectTrigger id="edit-repeat">
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

              <Button onClick={handleUpdateTask} className="w-full" disabled={updateTaskMutation.isLoading}>
                {updateTaskMutation.isLoading ? "Updating..." : "Update Task"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Delete Task
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteTask(selectedTask.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

