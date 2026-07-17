import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Live Classes", href: "#features" },
    { name: "Curriculum", href: "#roadmap" },
    { name: "Community", href: "#community" },
    { name: "Contact", href: "#contact" },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    const isHomepage = window.location.pathname === "/";
    if (!isHomepage) {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
      
      // Delay slightly to allow homepage component to mount before scrolling
      setTimeout(() => {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4" id="navbar">
      <div className="max-w-7xl mx-auto glass-morphic rounded-full px-6 py-3 flex items-center justify-between border border-white/5 shadow-lg shadow-black/40">
        {/* Logo */}
        <a 
          href="#hero" 
          onClick={(e) => handleScroll(e, "#hero")}
          className="flex items-center gap-2 text-2xl font-bold font-display text-white tracking-wider group"
          id="nav-logo"
        >
          <span className="bg-gradient-to-r from-brand-cyan to-cyan-400 bg-clip-text text-transparent group-hover:neon-glow-cyan transition-all duration-300">
            NapPy
          </span>
          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse"></span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              id={`nav-link-desktop-${idx}`}
              className="text-sm font-medium text-gray-300 hover:text-brand-cyan transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            id="nav-btn-login"
            onClick={() => navigateTo("/login")}
            className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors duration-200 cursor-pointer"
          >
            Login
          </button>
          <button
            id="nav-btn-join-now"
            onClick={() => navigateTo("/register")}
            className="relative overflow-hidden text-sm font-semibold bg-brand-cyan text-brand-black px-6 py-2.5 rounded-full hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
          >
            Join Now
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="nav-mobile-toggle"
          className="lg:hidden text-gray-300 hover:text-brand-cyan p-1 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            id="nav-mobile-overlay"
            className="absolute top-20 left-4 right-4 glass-morphic rounded-3xl p-6 border border-white/5 flex flex-col gap-6 lg:hidden shadow-2xl shadow-black"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link, idx) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScroll(e, link.href)}
                  id={`nav-link-mobile-${idx}`}
                  className="text-base font-medium text-gray-300 hover:text-brand-cyan py-2 border-b border-white/5 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                id="nav-mobile-btn-login"
                onClick={() => {
                  setIsOpen(false);
                  navigateTo("/login");
                }}
                className="w-full text-center font-medium text-gray-300 hover:text-white py-3 border border-white/10 rounded-xl transition-colors duration-200 cursor-pointer"
              >
                Login
              </button>
              <button
                id="nav-mobile-btn-join"
                onClick={() => {
                  setIsOpen(false);
                  navigateTo("/register");
                }}
                className="w-full text-center font-semibold bg-brand-cyan text-brand-black py-3 rounded-xl hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300 cursor-pointer"
              >
                Join Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
