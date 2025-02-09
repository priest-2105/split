"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "react-hot-toast"
import { createClient, fetchConditions } from "@/lib/supabase"
import { Plus, Trash } from "lucide-react"

interface Condition {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function ConditionManager() {
  const [newCondition, setNewCondition] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
      setIsDialogOpen(false)
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Conditions</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Condition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Condition</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCondition} className="space-y-4">
              <Input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="New condition"
              />
              <Button type="submit" disabled={addConditionMutation.isLoading}>
                {addConditionMutation.isLoading ? "Adding..." : "Add Condition"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conditions.map((condition) => (
            <TableRow key={condition.id}>
              <TableCell>{condition.name}</TableCell>
              <TableCell>{new Date(condition.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCondition(condition.id)}
                  disabled={deleteConditionMutation.isLoading}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

