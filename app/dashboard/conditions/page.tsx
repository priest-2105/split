"use client"

import { useState, type React } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useSession } from "@supabase/auth-helpers-react"
import { useNotification } from "@/contexts/NotificationContext"
import { Plus, Edit, Trash } from "lucide-react"

interface Condition {
  id: string
  name: string
  user_id: string
}

export default function ConditionsPage() {
  const [newCondition, setNewCondition] = useState("")
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient()
  const session = useSession()
  const supabase = createClientComponentClient()
  const { addNotification } = useNotification()

  const { data: conditions = [], isLoading } = useQuery<Condition[]>({
    queryKey: ["conditions", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("conditions").select("*").eq("user_id", session?.user?.id)
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })

  const addConditionMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from("conditions").insert({ name, user_id: session?.user?.id }).single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conditions", session?.user?.id])
      addNotification("success", "Condition added successfully!")
      setNewCondition("")
    },
    onError: (error) => {
      addNotification("error", `Failed to add condition: ${error.message}`)
    },
  })

  const updateConditionMutation = useMutation({
    mutationFn: async (condition: Condition) => {
      const { data, error } = await supabase
        .from("conditions")
        .update({ name: condition.name })
        .eq("id", condition.id)
        .eq("user_id", session?.user?.id)
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conditions", session?.user?.id])
      addNotification("success", "Condition updated successfully!")
      setEditingCondition(null)
    },
    onError: (error) => {
      addNotification("error", `Failed to update condition: ${error.message}`)
    },
  })

  const deleteConditionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conditions").delete().eq("id", id).eq("user_id", session?.user?.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conditions", session?.user?.id])
      addNotification("success", "Condition deleted successfully!")
    },
    onError: (error) => {
      addNotification("error", `Failed to delete condition: ${error.message}`)
    },
  })

  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCondition.trim()) {
      addConditionMutation.mutate(newCondition.trim())
    }
  }

  const handleUpdateCondition = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCondition) {
      updateConditionMutation.mutate(editingCondition)
    }
  }

  const handleDeleteCondition = (id: string) => {
    if (window.confirm("Are you sure you want to delete this condition?")) {
      deleteConditionMutation.mutate(id)
    }
  }

  const filteredConditions = conditions.filter((condition) =>
    condition.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Conditions</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          placeholder="Search conditions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
        <form onSubmit={handleAddCondition} className="flex gap-2">
          <Input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="New condition"
            className="w-full sm:w-48"
          />
          <Button type="submit" disabled={addConditionMutation.isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </form>
      </div>
      {isLoading ? (
        <p>Loading conditions...</p>
      ) : (
        <ul className="space-y-2">
          {filteredConditions.map((condition) => (
            <li
              key={condition.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
            >
              {editingCondition?.id === condition.id ? (
                <form
                  onSubmit={handleUpdateCondition}
                  className="flex-grow flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
                >
                  <Input
                    type="text"
                    value={editingCondition.name}
                    onChange={(e) => setEditingCondition({ ...editingCondition, name: e.target.value })}
                    className="flex-grow"
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={updateConditionMutation.isLoading}>
                      Save
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingCondition(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="mb-2 sm:mb-0">{condition.name}</span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCondition(condition)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCondition(condition.id)}
                      disabled={deleteConditionMutation.isLoading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </DashboardLayout>
  )
}

