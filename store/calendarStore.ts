import { create } from "zustand"

export interface Event {
  id: string
  title: string
  description: string
  condition: string
  date: string
  user_id: string
}

type CalendarStore = {
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
}))

