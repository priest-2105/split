"use client"

import { motion } from "framer-motion"


export function Preloader() {
  
    
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 sm:p-6 lg:p-8"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex items-center gap-1 sm:gap-2"
        >
          <span className="text-4xl sm:text-5xl lg:text-6xl font-semibold bg-white text-black px-3 sm:px-4">
            kreatify
          </span>
          <span className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white">.app</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

