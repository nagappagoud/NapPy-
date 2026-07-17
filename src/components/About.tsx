import React from "react";
import { motion } from "motion/react";
import { Sparkles, BookOpen, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 relative bg-brand-black/95 border-t border-white/5 overflow-hidden">
      {/* Decorative ambient color spots */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-brand-cyan/2 rounded-full blur-[100px] pointer-events-none transform -translate-y-1/2"></div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-brand-cyan uppercase tracking-wider"
          id="about-badge"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>About NapPy</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold font-display text-white mb-6 tracking-tight"
          id="about-title"
        >
          A Dedicated Tech Classroom <span className="text-brand-cyan neon-glow-cyan">Built for Everyone</span>
        </motion.h2>

        {/* Narrative Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-12 space-y-6 text-left sm:text-center"
          id="about-description"
        >
          <p>
            NapPy is an education platform built on a simple principle: <span className="text-white font-semibold">premium software engineering education should be free and accessible to all students.</span> We believe that complex concepts are best mastered through active participation rather than solitary study.
          </p>
          <p>
            By combining live sessions, hands-on assignments, curated offline study materials, and direct community support, we offer a complete, structured pathway to software development excellence. There are no paywalls, hidden subscription models, or financial barriers—just complete focus on writing clean code and building functional applications.
          </p>
        </motion.div>

        {/* Simple core highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left" id="about-highlights">
          <div className="glass-morphic p-6 rounded-2xl border border-white/5 flex gap-4 items-start">
            <div className="p-3 bg-brand-cyan/10 rounded-xl text-brand-cyan shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Structured Tracks</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                A structured roadmap from core variables to production-grade server deployments.
              </p>
            </div>
          </div>

          <div className="glass-morphic p-6 rounded-2xl border border-white/5 flex gap-4 items-start">
            <div className="p-3 bg-brand-cyan/10 rounded-xl text-brand-cyan shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">100% Student Focused</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Zero fees, zero contracts. Our entire classroom operates purely to foster student growth.
              </p>
            </div>
          </div>

          <div className="glass-morphic p-6 rounded-2xl border border-white/5 flex gap-4 items-start">
            <div className="p-3 bg-brand-cyan/10 rounded-xl text-brand-cyan shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Active Coding</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Build real-world web pages and system integrations with live interactive peer support.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
