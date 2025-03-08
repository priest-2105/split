"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  Workflow,
  BarChart3,
  ShieldCheckIcon,
  Users2,
  Puzzle,
  HeadsetIcon,
  Building2,
  DollarSign,
  Calendar,
  Moon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/public/layout/Footer"
import { Preloader } from "@/components/public/preloader/index"
import { createBrowserClient } from "@supabase/ssr"

const blink = {
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0 },
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCountUp } from "@/hooks/useCountUp"
import TypeWriter from "@/components/type-writer"
import { Navbar } from "@/components/public/layout/Navbar"
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)


export default function Home() {
  const router = useRouter()
  const targetRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const featuresRef = useRef<HTMLDivElement>(null)

  const gridX = useSpring(mouseX, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
  })
  const gridY = useSpring(mouseY, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      mouseX.set(((e.clientX - centerX) / centerX) * 20)
      mouseY.set(((e.clientY - centerY) / centerY) * 20)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const projectsCount = useCountUp(1234)
  const deploymentCount = useCountUp(5678)
  const securityCount = useCountUp(99)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const [userCount, setUserCount] = useState(0)
  const [eventCount, setEventCount] = useState(0)
  const revenueGenerated = Math.floor(Math.random() * 1000) + 500000 

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      const { count: eventCount, error: eventError } = await supabase
        .from('conditions')
        .select('*', { count: 'exact', head: true })

      if (!userError && userCount !== undefined) setUserCount(userCount || 0)
      if (!eventError && eventCount !== undefined) setEventCount(eventCount || 0)
    }

    fetchCounts()
  }, [])

  return (
    <div ref={targetRef} className="min-h-screen bg-transparent text-black dark:text-white overflow-hidden select-none">
      <Navbar/>
      {/* <Preloader /> */}
      <motion.div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-white dark:bg-black" />
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px)",
            x: gridX,
            y: gridY,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10">
        <motion.section className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 lg:py-60">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-[90%] sm:max-w-3xl mx-auto space-y-6 sm:space-y-8"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-2"
            >
              <span className="bg-black dark:bg-white text-white dark:text-black px-2">SpliT</span>
              <span className="flex items-center">
                <TypeWriter text=".app" delay={150} />
                <span className="w-[2px] h-[1em] bg-black dark:bg-white animate-[blink_1s_ease-in-out_infinite]" />
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-400 max-w-2xl mx-auto px-4"
            >
              Split is an innovative conditional event calendar that allows you to create and manage events based on specific conditions. 
              Whether it's weather, time, or custom conditions, Split ensures your events are always relevant and timely.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto mt-4 sm:mt-8 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 ease-in-out text-base px-6 py-4 h-auto bg-transparent"
                onClick={() => {
                  if (featuresRef.current) {
                    featuresRef.current.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto mt-4 sm:mt-8 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out text-base px-6 py-4 h-auto"
                onClick={() => router.push("/signup")}
              >
                Get Started 
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section  className="py-18 sm:py-16 px-4 sm:px-6 lg:px-8 mx-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto space-y-12"
          >
            <div className="text-center px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
              >
                Our Impact in Numbers
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
              >
                See how we are transforming businesses around the world
              </motion.p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <Users2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{userCount.toLocaleString()}</div>
                <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-base">Active Users</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {eventCount.toLocaleString()}
                </div>
                <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-base">Events/Conditions Created</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 text-center"
              >
                <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4 mx-auto" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  ${revenueGenerated.toLocaleString()}
                </div>
                <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-base">Revenue Generated</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section ref={featuresRef} id="features" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 px-4 text-gray-900 dark:text-white">
                Powerful Features for Your Business
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Everything you need to dynamically manage your events and stay organized.
              </motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants} custom={index}>
                  <Card
                    role="button"
                    tabIndex={0}
                    className="p-4 sm:p-6 bg-white dark:bg-transparent backdrop-blur-2xl border-gray-500 text-black dark:text-white blur-[0.4px] transition-transform duration-300 hover:scale-105 cursor-pointer h-full"
                  >
                    <feature.icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <motion.section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Simple and Transparent Pricing
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Choose the perfect plan for your needs. Always know what you'll pay.
              </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Free Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-200 font-bold">Free</CardTitle>
                    <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-base">Ideal for getting started</p>
                  </CardHeader> 
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl text-gray-500 font-bold">$0</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ month</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-400">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Basic Funnel Builder
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Test Funnel Builder
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        24/7 Live Chat
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => router.push("/register")}
                      className="w-full text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Pro Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-200 font-bold">Pro</CardTitle>
                    <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-base">For growing teams</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl text-gray-500 sm:text-4xl font-bold">$4.99</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ month</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-400">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        All Free Features
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Scalable Funnel Builder
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Facebook Ads Analysis
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Priority Support
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        const userData = localStorage.getItem("userData")
                        if (userData) {
                          router.push("/payment?plan=pro")
                        } else {
                          router.push("/login?redirect=/payment?plan=pro")
                        }
                      }}
                      className="w-full text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out"
                    >
                      Upgrade to Pro
                      <Zap className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Premium Plan */}
              <motion.div variants={itemVariants}>
                <Card className="relative p-4 sm:p-6 bg-transparent backdrop-blur-2xl border-gray-500 text-white h-full">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-200 font-bold">Premium</CardTitle>
                    <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-base">For advanced users</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl sm:text-4xl text-gray-500 font-bold">$29.99</span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/ month</span>
                    </div>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-400">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        All Pro Features
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Competitor Insights
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Advanced Prompts and Queries
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        24/7 Priority Support
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-white flex-shrink-0" />
                        Personal Account Manager
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        const userData = localStorage.getItem("userData")
                        if (userData) {
                          router.push("/payment?plan=premium")
                        } else {
                          router.push("/login?redirect=/payment?plan=premium")
                        }
                      }}
                      className="w-full text-sm sm:text-lg py-4 sm:py-6 px-4 sm:px-8 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out"
                    >
                      Get Premium
                      <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>
      <Footer/>
      </div>
    </div>
  )
}

const features = [
  {
    title: "Interactive Calendar Grid",
    description: "Displays a responsive calendar layout that dynamically updates as users switch between months.",
    icon: Calendar,
  },
  {
    title: "Conditional Events",
    description: "Users can assign conditions to specific dates or months. Events are only triggered when conditions are met.",
    icon: Zap,
  },
  {
    title: "Dynamic Month Navigation",
    description: "Navigate between months using arrow buttons. The calendar dynamically adjusts to show the correct days of the month.",
    icon: ArrowRight,
  },
  {
    title: "User Authentication",
    description: "Sign Up, Login, and Forgot Password pages are implemented using Supabase Auth for secure login experience.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Data Storage & Backend",
    description: "Supabase is used to store user events and conditions, and AWS S3 is used for file uploads.",
    icon: BarChart3,
  },
  {
    title: "Dark Mode Support",
    description: "The app supports light mode and dark mode for accessibility and better user experience.",
    icon: Moon,
  },
]

