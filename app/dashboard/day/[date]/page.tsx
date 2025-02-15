import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { DayView } from "@/components/DayView"

export default function DayPage({ params }: { params: { date: string } }) {
  const date = new Date(params.date)
  return <DashboardLayout> <DayView date={date} /> </DashboardLayout>
}

