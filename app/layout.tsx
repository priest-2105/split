import type React from "react"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import ClientProviders from "@/components/ClientProviders"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Footer } from "@/components/public/layout/Footer"
import { Navbar } from "@/components/public/layout/Navbar"
import favicon from "@/public/split-.png"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Split",
  description: "Simplify your schedule with Split",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={favicon.src} type="image/png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientProviders> 
            {children} 
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}

