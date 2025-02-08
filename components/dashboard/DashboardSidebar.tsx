import Link from "next/link"
import { Calendar, Users, Settings } from "lucide-react"

export function DashboardSidebar() {
  return (
    <div className="bg-white dark:bg-gray-800 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <Calendar className="h-5 w-5" />
          <span>Calendar</span>
        </Link>
        <Link
          href="/dashboard/team"
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <Users className="h-5 w-5" />
          <span>Team</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  )
}

