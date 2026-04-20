import { motion } from 'framer-motion';

export default function About() {
  const competencies = [
    'Chemical Engineering', 'Machine Learning', 'Thermodynamics', 
    'Process Simulation', 'Python & Data Science', 'Mathematical Modeling'
  ];

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-10 text-center md:text-left">About Me</h1>
      
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0 mx-auto"
        >
          <img 
            src="https://ui-avatars.com/api/?name=Qazi+Nasir&size=400&background=2563eb&color=fff&font-size=0.33" 
            alt="Dr. Qazi Nasir" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-5">Dr. Qazi Nasir</h2>
          <p className="text-lg text-text-muted mb-6 leading-relaxed">
            Hello! I am a researcher deeply passionate about the intersection of classical chemical engineering and modern artificial intelligence.
          </p>
          
          <p className="text-lg text-text-muted mb-6 leading-relaxed">
            My academic journey has focused largely on advanced thermodynamics and process simulation. Today, I build models that leverage machine learning to optimize complex industrial processes, helping reduce energy usage and improve yields.
          </p>
          
          <p className="text-lg text-text-muted mb-10 leading-relaxed">
            Beyond the lab and code, I enjoy sharing my knowledge through writing, which is why I started this blog. Here, I write about my research experiences, tutorials on AI applied to physical sciences, and broader thoughts on technology.
          </p>
          
          <h3 className="text-xl font-bold mb-6">Core Competencies</h3>
          <div className="flex flex-wrap gap-3">
            {competencies.map((skill, idx) => (
              <motion.span 
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="px-4 py-2 bg-white border border-border-main rounded-full text-sm font-semibold shadow-sm hover:border-primary transition-colors cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
