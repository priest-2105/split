"use client"

import { motion } from "framer-motion"

const testimonials = [
  {
    content:
      "split has completely transformed how I manage my time. It's intuitive, powerful, and has boosted my productivity significantly.",
    author: "Jane Cooper",
    role: "CEO at ABC Corp",
  },
  {
    content:
      "I've tried many calendar apps, but split stands out with its smart features and user-friendly interface. It's a game-changer!",
    author: "John Doe",
    role: "Freelance Designer",
  },
  {
    content:
      "The team collaboration features in split have made coordinating with my colleagues so much easier. I can't imagine working without it now.",
    author: "Alice Johnson",
    role: "Project Manager at XYZ Solutions",
  },
]

export const TestimonialsSection = () => {
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Loved by users worldwide
          </p>
        </div>
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
              >
                <p className="text-gray-600 dark:text-gray-300 mb-4">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

