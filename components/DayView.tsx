"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useNotification } from "@/contexts/NotificationContext"
import { format, addMinutes, parse } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

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
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [showAllConditions, setShowAllConditions] = useState(true)

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

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery<Task[]>({
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

  const { data: conditions = [], isLoading: isConditionsLoading } = useQuery<Condition[]>({
    queryKey: ["conditions", userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase.from("conditions").select("*").eq("user_id", userId)
      if (error) {
        console.error("Error fetching conditions:", error)
        throw error
      }
      return data || []
    },
    enabled: !!userId,
  })

  // Initialize selected conditions with all condition names when conditions are loaded
  useEffect(() => {
    if (conditions.length > 0 && selectedConditions.length === 0) {
      setSelectedConditions(conditions.map((c) => c.name))
    }
  }, [conditions, selectedConditions.length])

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

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions((prev) => {
      if (prev.includes(condition)) {
        return prev.filter((c) => c !== condition)
      } else {
        return [...prev, condition]
      }
    })
    setShowAllConditions(false)
  }

  const handleToggleAllConditions = () => {
    if (showAllConditions) {
      setSelectedConditions([])
    } else {
      setSelectedConditions(conditions.map((c) => c.name))
    }
    setShowAllConditions(!showAllConditions)
  }

  // Filter tasks based on selected conditions
  const filteredTasks = showAllConditions ? tasks : tasks.filter((task) => selectedConditions.includes(task.condition))

  // Find time clashes between tasks
  const findClashes = () => {
    const clashes = new Set<string>()

    for (let i = 0; i < filteredTasks.length; i++) {
      const task1 = filteredTasks[i]
      const start1 = parse(task1.start_time, "HH:mm", new Date())
      const end1 = parse(task1.end_time, "HH:mm", new Date())

      for (let j = i + 1; j < filteredTasks.length; j++) {
        const task2 = filteredTasks[j]
        const start2 = parse(task2.start_time, "HH:mm", new Date())
        const end2 = parse(task2.end_time, "HH:mm", new Date())

        // Check if tasks overlap
        if ((start1 <= end2 && end1 >= start2) || (start2 <= end1 && end2 >= start1)) {
          clashes.add(task1.id)
          clashes.add(task2.id)
        }
      }
    }

    return clashes
  }

  const clashes = findClashes()

  // Generate a color based on the condition string
  const getConditionColor = (condition: string) => {
    let hash = 0
    for (let i = 0; i < condition.length; i++) {
      hash = condition.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash % 360)
    return `hsl(${hue}, 70%, 60%)`
  }

  return (
    <div className="flex h-full gap-4">
      {/* Conditions filter */}
      <div className="w-64 p-4 border-r border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Conditions Filter</h3>

        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox id="all-conditions" checked={showAllConditions} onCheckedChange={handleToggleAllConditions} />
            <Label htmlFor="all-conditions">All Conditions</Label>
          </div>

          {isConditionsLoading ? (
            <div>Loading conditions...</div>
          ) : conditions.length === 0 ? (
            <div className="text-sm text-gray-500">No conditions found</div>
          ) : (
            <div className="space-y-2">
              {conditions.map((condition) => (
                <div key={condition.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition.id}`}
                    checked={selectedConditions.includes(condition.name)}
                    onCheckedChange={() => handleConditionToggle(condition.name)}
                    disabled={showAllConditions}
                  />
                  <Label htmlFor={`condition-${condition.id}`} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getConditionColor(condition.name) }}
                    />
                    {condition.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {clashes.size > 0 && (
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md mb-4">
            <div className="flex items-center text-yellow-800 dark:text-yellow-200 mb-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Time Conflicts</span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              There are {clashes.size} tasks with time conflicts.
            </p>
          </div>
        )}
      </div>

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
            {isTasksLoading ? (
              <div className="p-4">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-4 text-gray-500">No tasks for selected conditions</div>
            ) : (
              filteredTasks.map((task) => {
                const startMinutes =
                  parse(task.start_time, "HH:mm", new Date()).getHours() * 60 +
                  parse(task.start_time, "HH:mm", new Date()).getMinutes()
                const endMinutes =
                  parse(task.end_time, "HH:mm", new Date()).getHours() * 60 +
                  parse(task.end_time, "HH:mm", new Date()).getMinutes()
                const duration = endMinutes - startMinutes
                const top = (startMinutes / 1440) * 100
                const height = (duration / 1440) * 100
                const hasClash = clashes.has(task.id)
                const bgColor = getConditionColor(task.condition)

                return (
                  <div
                    key={task.id}
                    className={`absolute left-0 right-4 rounded-md px-2 py-1 text-sm text-white ${
                      hasClash ? "border-2 border-red-500" : ""
                    }`}
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      minHeight: "20px",
                      backgroundColor: bgColor,
                    }}
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs">
                      {task.start_time} - {task.end_time}
                    </div>
                    <Badge variant="outline" className="bg-white/20 text-white text-xs mt-1">
                      {task.condition}
                    </Badge>
                    {hasClash && (
                      <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center -mt-1 -mr-1">
                        <AlertCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                )
              })
            )}
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
              value={newTask.title || ""}
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
                {isConditionsLoading ? (
                  <SelectItem value="" disabled>
                    Loading conditions...
                  </SelectItem>
                ) : conditions.length === 0 ? (
                  <SelectItem value="" disabled>
                    No conditions available
                  </SelectItem>
                ) : (
                  conditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.name}>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getConditionColor(condition.name) }}
                        />
                        {condition.name}
                      </div>
                    </SelectItem>
                  ))
                )}
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

