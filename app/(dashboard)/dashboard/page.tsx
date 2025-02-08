import { DashboardLayout } from "@/components/dashboard/layout"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h1>
      <p>Here you can manage your calendar, team, and settings.</p>
    </DashboardLayout>
  )
}

