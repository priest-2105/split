"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { createClient, fetchConditions } from "@/lib/supabase"

interface Condition {
  id: string
  name: string
  user_id: string
}

export function ConditionManager() {
  const [newCondition, setNewCondition] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const queryClient = useQueryClient()
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
    data: conditions = [],
    isLoading,
    isError,
  } = useQuery<Condition[]>({
    queryKey: ["conditions", userId],
    queryFn: () => fetchConditions(userId!),
    enabled: !!userId,
  })

  const addConditionMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("User not authenticated")
      const { data, error } = await supabase.from("conditions").insert({ name, user_id: userId }).single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conditions", userId])
      toast.success("Condition added successfully!")
      setNewCondition("")
    },
    onError: (error) => {
      toast.error(`Failed to add condition: ${error.message}`)
    },
  })

  const deleteConditionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("User not authenticated")
      const { error } = await supabase.from("conditions").delete().eq("id", id).eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conditions", userId])
      toast.success("Condition deleted successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to delete condition: ${error.message}`)
    },
  })

  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCondition.trim()) {
      addConditionMutation.mutate(newCondition.trim())
    }
  }

  const handleDeleteCondition = (id: string) => {
    if (window.confirm("Are you sure you want to delete this condition?")) {
      deleteConditionMutation.mutate(id)
    }
  }

  if (isLoading) return <div>Loading conditions...</div>
  if (isError) return <div>Error loading conditions</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Manage Conditions</h2>
      <form onSubmit={handleAddCondition} className="flex space-x-2">
        <Input
          type="text"
          value={newCondition}
          onChange={(e) => setNewCondition(e.target.value)}
          placeholder="New condition"
          className="flex-grow"
        />
        <Button type="submit" disabled={addConditionMutation.isLoading}>
          {addConditionMutation.isLoading ? "Adding..." : "Add"}
        </Button>
      </form>
      <ul className="space-y-2">
        {conditions.map((condition) => (
          <li key={condition.id} className="flex justify-between items-center">
            <span>{condition.name}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteCondition(condition.id)}
              disabled={deleteConditionMutation.isLoading}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

