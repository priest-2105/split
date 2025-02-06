import { render, screen, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import Calendar from "../components/Calendar"

// Mock the supabase client
const mockSupabase = {
  auth: {
    onAuthStateChange: jest.fn(),
  },
}

// Mock the useQuery hook
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}))

describe("Calendar Component", () => {
  const queryClient = new QueryClient()

  const renderCalendar = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={mockSupabase as any}>
          <Calendar />
        </SessionContextProvider>
      </QueryClientProvider>,
    )
  }

  it("renders without crashing", () => {
    renderCalendar()
    expect(screen.getByRole("grid")).toBeInTheDocument()
  })

  it("displays the current month and year", () => {
    renderCalendar()
    const currentDate = new Date()
    const monthYear = currentDate.toLocaleString("default", { month: "long", year: "numeric" })
    expect(screen.getByText(monthYear)).toBeInTheDocument()
  })

  it("has previous and next month buttons", () => {
    renderCalendar()
    expect(screen.getByLabelText("Previous month")).toBeInTheDocument()
    expect(screen.getByLabelText("Next month")).toBeInTheDocument()
  })

  it("changes month when clicking next/previous buttons", () => {
    renderCalendar()
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleString("default", { month: "long" })

    fireEvent.click(screen.getByLabelText("Next month"))
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toLocaleString("default", {
      month: "long",
    })
    expect(screen.getByText(nextMonth, { exact: false })).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("Previous month"))
    fireEvent.click(screen.getByLabelText("Previous month"))
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toLocaleString("default", {
      month: "long",
    })
    expect(screen.getByText(prevMonth, { exact: false })).toBeInTheDocument()
  })

  it("renders correct number of days", () => {
    renderCalendar()
    const days = screen.getAllByRole("gridcell")
    expect(days.length).toBeGreaterThanOrEqual(28) // Minimum days in a month
    expect(days.length).toBeLessThanOrEqual(42) // Maximum cells in a 6-week calendar view
  })
})

