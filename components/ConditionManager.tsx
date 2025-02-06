"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useSession } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"

interface Condition {
  id: string
  name: string
  user_id: string
}

export function ConditionManager() {
  const [newCondition, setNewCondition] = useState("")
  const session = useSession()
  const queryClient = useQueryClient()

  const {
    data: conditions = [],
    isLoading,
    isError,
  } = useQuery<Condition[]>({
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
      toast.success("Condition added successfully!")
      setNewCondition("")
    },
    onError: (error) => {
      toast.error("Failed to add condition: " + error.message)
    },
  })

  const deleteConditionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conditions").delete().match({ id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conditions", session?.user?.id])
      toast.success("Condition deleted successfully!")
    },
    onError: (error) => {
      toast.error("Failed to delete condition: " + error.message)
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

