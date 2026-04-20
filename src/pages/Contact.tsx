import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('sending');
    
    // Simulate form submission
    // Using formsubmit.co like the original script
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetch("https://formsubmit.co/ajax/contact@qazinasir.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setFormState('success');
    } catch (error) {
      console.error(error);
      setFormState('idle');
      alert("Something went wrong. Please try again or email me directly.");
    }
  };

  return (
    <div className="container max-w-xl">
      <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
      <p className="text-text-muted text-lg mb-10 leading-relaxed">
        I'm always open to discussing research, collaboration opportunities, or answering questions. 
        Drop me a message below or email me directly at <a href="mailto:contact@qazinasir.com" className="text-primary font-semibold hover:underline">contact@qazinasir.com</a>.
      </p>

      {formState === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-green-100 p-10 rounded-xl text-center shadow-lg"
        >
          <CheckCircle2 className="mx-auto text-green-500 mb-5" size={60} />
          <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
          <p className="text-text-muted">Thanks for reaching out, Dr. Nasir will get back to you soon.</p>
          <button 
            onClick={() => setFormState('idle')} 
            className="mt-8 text-primary font-semibold hover:underline"
          >
            Send another message
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-border-main p-8 rounded-xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input 
              name="name" type="text" required 
              className="w-full p-3 border border-border-main rounded-md outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Dr. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input 
              name="email" type="email" required 
              className="w-full p-3 border border-border-main rounded-md outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="john@university.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Message</label>
            <textarea 
              name="message" required 
              className="w-full p-3 border border-border-main rounded-md outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px]"
              placeholder="Hello Qazi, I read your paper on..."
            />
          </div>

          <button 
            type="submit" 
            disabled={formState === 'sending'}
            className="w-full btn flex justify-center items-center gap-2"
          >
            {formState === 'sending' ? 'Sending...' : (
              <>
                <Send size={18} /> Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
