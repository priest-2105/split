# Split – The Conditional Event Calendar

## Overview

Split is an innovative conditional event calendar designed as a web application built using Next.js, Supabase, TypeScript, and Tailwind CSS. It allows users to create and manage events that occur based on specific manually inputted conditions. The app provides a modern and interactive way for users to track events dynamically instead of using a traditional static calendar.

## Key Features

### 📆 Interactive Calendar Grid
- Displays a responsive calendar layout that dynamically updates as users switch between months.
- Uses React and Tailwind CSS for a clean and modern UI.
- Inspired by Google Calendar, ensuring an intuitive user experience.

### ⚡ Conditional Events
- Users can assign conditions to specific dates or months.
- Events are only triggered when conditions are met.
- Conditions can be manually inputted (e.g., "If it's raining, schedule a backup meeting").

### 🔄 Dynamic Month Navigation
- Users can navigate between months using arrow buttons.
- The calendar dynamically adjusts to show the correct days of the month.

### 👤 User Authentication with Supabase
- Sign Up, Login, and Forgot Password pages are implemented.
- Uses Supabase Auth for user authentication, ensuring a secure login experience.
- Displays the user's name at the top when logged in.

### 📊 Data Storage & Backend
- Supabase is used to store:
  - User events and conditions
  - Authentication data
- AWS S3 is used instead of Supabase storage for file uploads.

### 🌗 Dark Mode Support
- The app supports light mode and dark mode for accessibility and better user experience.

## How It Works
1. Users log in or sign up using Supabase authentication.
2. The home page displays the calendar, showing the current month and any assigned conditional events.
3. Users can navigate between months using arrow buttons, and the calendar dynamically updates.
4. Users add events and assign conditions (e.g., "Schedule gym session if it’s sunny").
5. The system checks conditions to determine which events are displayed.
6. Events are stored in Supabase, ensuring persistence across sessions.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** AWS S3 (for handling user uploads)
- **Styling:** Tailwind CSS, Dark Mode support

## Future Features
- 📌 **Event Notifications** – Notify users when their conditions are met.
- 📅 **Google Calendar Integration** – Sync events with Google Calendar.
- 🎨 **Customizable Themes** – Allow users to personalize the look and feel.
- 📍 **Location-based Conditions** – Events can depend on location-based factors like weather or traffic.

This description summarizes Split in detail, covering its functionality, features, and technical foundation. 🚀 Let me know if you need any modifications!
