import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Github, Linkedin, Mail, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
// (I'll create these files next)
import Home from './pages/Home';
import Blog from './pages/Blog';
import Post from './pages/Post';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <header className="bg-white border-b border-border-main sticky top-0 z-50 shadow-sm">
      <div className="container h-[70px] flex justify-between items-center">
        <Link to="/" className="text-[1.3rem] font-extrabold tracking-tight flex items-center gap-2 hover:-translate-y-px transition-transform group">
          <div className="w-5.5 h-5.5 bg-gradient-to-br from-primary to-[#818cf8] rounded-[6px] shadow-[0_2px_5px_rgba(37,99,235,0.3)]"></div>
          Qazi Nasir <span className="text-primary font-semibold px-2 py-0.5 bg-primary/10 rounded-md text-[0.8em] uppercase tracking-wider">blogs</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-[30px]">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium text-[0.95rem] transition-colors ${
                location.pathname === link.path ? 'text-primary' : 'text-text-muted hover:text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border-main bg-white absolute w-full shadow-lg"
          >
            <div className="flex flex-col p-5 gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium text-lg ${
                    location.pathname === link.path ? 'text-primary' : 'text-text-muted hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-10 mt-15 border-t border-border-main text-center text-text-muted text-sm">
      <div className="container">
        <div className="flex justify-center gap-5 mb-5 text-text-muted">
          <Link to="#" className="hover:text-primary"><Search size={18} /></Link>
          <Link to="#" className="hover:text-primary"><Linkedin size={18} /></Link>
          <Link to="#" className="hover:text-primary"><Github size={18} /></Link>
          <Link to="mailto:contact@qazinasir.com" className="hover:text-primary"><Mail size={18} /></Link>
        </div>
        <p>&copy; {currentYear} Qazi Nasir. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-15">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blog/:slug" element={<Post />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
