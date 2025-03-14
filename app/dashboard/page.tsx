import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import Calendar from "@/components/Calendar"
// import SidePanel from "@/components/SidePanel"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-grow">
          <Calendar />
        </div>
        <div className="w-full lg:w-80">
          {/* <SidePanel /> */}
        </div>
      </div>
    </DashboardLayout>
  )
}

