import React from "react";
import { Linkedin, Github, Instagram, Mail, Phone, MapPin, Sparkles } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer id="contact" className="bg-brand-black border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      {/* Visual background noise/grad accent */}
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-cyan/2 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/5">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <a 
              href="#hero" 
              onClick={(e) => handleScroll(e, "#hero")}
              className="flex items-center gap-2 text-2xl font-bold font-display text-white tracking-wider mb-6 group"
              id="footer-logo"
            >
              <span className="bg-gradient-to-r from-brand-cyan to-cyan-400 bg-clip-text text-transparent group-hover:neon-glow-cyan transition-all duration-300">
                NapPy
              </span>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full"></span>
            </a>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              NapPy is a free learning platform where students attend live Google Meet classes, complete assignments, download notes, practice coding, and build real-world projects.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4" id="footer-socials">
              <a 
                href="https://www.linkedin.com/in/nagappagoud-patil-146a74372?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                target="_blank" 
                rel="noreferrer"
                id="footer-social-linkedin"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/20 hover:bg-brand-cyan/5 transition-all duration-300"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/nagappagoud" 
                target="_blank" 
                rel="noreferrer"
                id="footer-social-github"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/20 hover:bg-brand-cyan/5 transition-all duration-300"
                aria-label="GitHub Profile"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/nap__py?igsh=eGFnbW5tb2RqMzB3" 
                target="_blank" 
                rel="noreferrer"
                id="footer-social-instagram"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/20 hover:bg-brand-cyan/5 transition-all duration-300"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold font-display text-sm tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-brand-cyan rounded-full"></span>
              Navigation
            </h4>
            <ul className="space-y-3 font-medium text-sm text-gray-400" id="footer-nav-links">
              <li>
                <a href="#hero" onClick={(e) => handleScroll(e, "#hero")} className="hover:text-brand-cyan transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" onClick={(e) => handleScroll(e, "#features")} className="hover:text-brand-cyan transition-colors">Live Classes</a>
              </li>
              <li>
                <a href="#roadmap" onClick={(e) => handleScroll(e, "#roadmap")} className="hover:text-brand-cyan transition-colors">Curriculum</a>
              </li>
              <li>
                <a href="#community" onClick={(e) => handleScroll(e, "#community")} className="hover:text-brand-cyan transition-colors">Community</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleScroll(e, "#contact")} className="hover:text-brand-cyan transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="lg:col-span-4" id="footer-contact-details">
            <h4 className="text-white font-bold font-display text-sm tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-brand-cyan rounded-full"></span>
              Contact Info
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-cyan shrink-0" />
                <div>
                  <p className="text-white font-semibold">Email Support</p>
                  <a href="mailto:nappy0019@gmail.com" className="hover:text-brand-cyan transition-colors">nappy0019@gmail.com</a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and legal links bar */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500" id="footer-bottom-bar">
          <p>© {currentYear} NapPy Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-6" id="footer-legal-links">
            <a href="#privacy" id="footer-link-privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#terms" id="footer-link-terms" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
