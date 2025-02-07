import { motion } from 'framer-motion';


const FeaturesSection = () => {
  const features = [
    {
      icon: '🚀',
      title: 'Dynamic Scheduling',
      description: 'Adapt your events to changing conditions like weather, availability, and more.',
    },
    {
      icon: '📊',
      title: 'Condition-Based Planning',
      description: 'Set custom rules for your events and let Split handle the rest.',
    },
    {
      icon: '🔗',
      title: 'Real-Time Sync',
      description: 'Seamlessly sync your events across devices with Supabase integration.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold mb-12 text-black dark:text-white"
        >
          Features Included in Every Plan
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            >
              <span className="text-4xl mb-4">{feature.icon}</span>
              <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{feature.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                Learn More
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};




export default FeaturesSection;