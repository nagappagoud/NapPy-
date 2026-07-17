import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowDown, GraduationCap, Code, Layers, FileCode, Blocks, Server, Terminal } from "lucide-react";

export default function Roadmap() {
  const roadmapSteps = [
    {
      id: "roadmap-beginner",
      title: "Beginner",
      desc: "Programming fundamentals, basic logic blocks, syntax concepts, and terminal file structures.",
      icon: GraduationCap,
      badge: "Stage 01",
    },
    {
      id: "roadmap-html",
      title: "HTML",
      desc: "Document semantics, semantic tag layouts, SEO basics, attributes, and core web hierarchies.",
      icon: Code,
      badge: "Stage 02",
    },
    {
      id: "roadmap-css",
      title: "CSS",
      desc: "Responsive web page layout layouts, CSS grid, flexbox alignment, styling variables, and transitions.",
      icon: Layers,
      badge: "Stage 03",
    },
    {
      id: "roadmap-javascript",
      title: "JavaScript",
      desc: "DOM manipulation, logic structures, event handling, promise scopes, asynchronous flows, and API requests.",
      icon: FileCode,
      badge: "Stage 04",
    },
    {
      id: "roadmap-react",
      title: "React",
      desc: "Component structures, state hooks, reactive effects, multi-view rendering, and data integrations.",
      icon: Blocks,
      badge: "Stage 05",
    },
    {
      id: "roadmap-backend",
      title: "Backend",
      desc: "Express server structures, custom API routes, REST constraints, and local server integration.",
      icon: Server,
      badge: "Stage 06",
    },
    {
      id: "roadmap-projects",
      title: "Projects",
      desc: "Full stack production-ready apps, responsive layout styling, code reviews, and public GitHub deploys.",
      icon: Terminal,
      badge: "Stage 07",
    },
  ];

  return (
    <section id="roadmap" className="py-24 relative bg-brand-black/95 border-t border-white/5">
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-cyan/2 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold text-brand-cyan uppercase tracking-wider"
          >
            <span>Roadmap</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold font-display text-white mb-4 tracking-tight"
            id="roadmap-section-title"
          >
            Learning <span className="text-brand-cyan neon-glow-cyan">Roadmap</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base"
            id="roadmap-section-subtitle"
          >
            Step-by-step developer progression. Master each layer of modern web engineering sequentially and free of cost.
          </motion.p>
        </div>

        {/* Desktop Connected Horizontal Timeline */}
        <div className="hidden xl:flex flex-col items-center gap-8 w-full relative pb-10" id="roadmap-desktop-view">
          {/* Continuous connector line */}
          <div className="absolute top-[80px] left-10 right-10 h-0.5 bg-gradient-to-r from-brand-cyan/5 via-brand-cyan/40 to-brand-cyan/5 z-0"></div>

          <div className="grid grid-cols-7 gap-4 w-full relative z-10">
            {roadmapSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  id={`desktop-${step.id}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center group"
                >
                  <span className="font-mono text-[10px] font-bold text-gray-500 mb-2 select-none group-hover:text-brand-cyan transition-colors">
                    {step.badge.toUpperCase()}
                  </span>

                  {/* Connected Orb */}
                  <div className="w-14 h-14 rounded-full bg-brand-black border-2 border-white/10 flex items-center justify-center relative mb-6 group-hover:border-brand-cyan group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300">
                    <StepIcon className="w-6 h-6 text-gray-400 group-hover:text-brand-cyan transition-colors" />
                    {idx < roadmapSteps.length - 1 && (
                      <div className="absolute -right-2.5 top-1/2 transform -translate-y-1/2 text-brand-cyan/30 group-hover:text-brand-cyan transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-display text-white mb-2 group-hover:text-brand-cyan transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-[11px] leading-relaxed max-w-[145px]">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Responsive Mobile / Tablet Vertical Connected Timeline */}
        <div className="xl:hidden flex flex-col gap-10 relative" id="roadmap-mobile-view">
          {/* Vertical connecting line */}
          <div className="absolute top-10 bottom-10 left-[27px] w-0.5 bg-gradient-to-b from-brand-cyan/40 via-brand-cyan/20 to-brand-cyan/5 z-0"></div>

          {roadmapSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.id}
                id={`mobile-${step.id}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex items-start gap-6 relative z-10 group"
              >
                {/* Visual Connected Orb */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-brand-black border-2 border-white/10 flex items-center justify-center group-hover:border-brand-cyan group-hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300">
                    <StepIcon className="w-6 h-6 text-gray-400 group-hover:text-brand-cyan transition-colors" />
                  </div>
                  {idx < roadmapSteps.length - 1 && (
                    <div className="mt-4 text-brand-cyan/20 group-hover:text-brand-cyan transition-colors">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="flex-1 glass-morphic border border-white/5 rounded-2xl p-6 group-hover:border-brand-cyan/10 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold font-display text-white group-hover:text-brand-cyan transition-colors">
                      {step.title}
                    </h3>
                    <span className="font-mono text-xs text-brand-cyan bg-brand-cyan/10 px-2.5 py-0.5 rounded-md">
                      {step.badge.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
