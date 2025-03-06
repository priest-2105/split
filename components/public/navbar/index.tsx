import { ThemeSwitcher } from "../../ThemeSwitcher"
import { Bell, User } from "lucide-react"

export function PublicNavbar() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center">
            <ThemeSwitcher />
            <button className="ml-4 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            <button className="ml-4 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">User menu</span>
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

