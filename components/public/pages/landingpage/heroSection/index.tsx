import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="bg-white dark:bg-black py-20 items-center">
      <div className="container mx-auto text-center items-center py-28">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-4 text-black dark:text-white"
        >
          Plan Smarter with Split
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl mb-8 text-gray-600 dark:text-gray-400"
        >
          The Conditional Event Calendar for modern scheduling.
        </motion.p>
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-800 transition-colors"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-lg border border-black hover:bg-gray-100 transition-colors"
          >
            Get Demo
          </motion.button>
        </div>
      </div>
    </section>
  );
};


export default HeroSection;
