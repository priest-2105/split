"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export type NotificationType = "success" | "error" | "warning"

export interface Notification {
  id: string
  type: NotificationType
  message: string
}

interface NotificationsProps {
  notifications: Notification[]
  removeNotification: (id: string) => void
}

export function Notifications({ notifications, removeNotification }: NotificationsProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`p-4 rounded-md shadow-lg flex items-center justify-between ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
            } text-white`}
          >
            <p>{notification.message}</p>
            <button onClick={() => removeNotification(notification.id)} className="ml-4 text-white focus:outline-none">
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

