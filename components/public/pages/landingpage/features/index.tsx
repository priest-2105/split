import { motion } from 'framer-motion';

export default function FeaturesSection (){
    const features = [
      { icon: '🌦️', title: 'Dynamic Scheduling', description: 'Adapt to changing conditions effortlessly.' },
      { icon: '📊', title: 'Condition-Based Planning', description: 'Set rules for your events.' },
      { icon: '🔗', title: 'Real-Time Sync', description: 'Powered by Supabase for seamless updates.' },
    ];
  
    return (
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-lg"
              >
                <span className="text-4xl mb-4">{feature.icon}</span>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };