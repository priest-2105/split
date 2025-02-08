import fetch from "node-fetch"

async function checkUpcomingEvents() {
  try {
    const response = await fetch("http://localhost:3000/api/check-upcoming-events")
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error("Error checking upcoming events:", error)
  }
}

// Run the check every minute
setInterval(checkUpcomingEvents, 60000)

console.log("Started checking for upcoming events...")
checkUpcomingEvents()

