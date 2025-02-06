import { motion } from 'framer-motion';

export default function HowItWorks (){
    const steps = [
      { icon: '📅', text: 'Add an event' },
      { icon: '⚙️', text: 'Set a condition' },
      { icon: '🔄', text: 'Split adapts your schedule' },
    ];
  
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg"
              >
                <span className="text-4xl mb-4">{step.icon}</span>
                <p className="text-xl">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };