import React from "react";
import { motion } from "motion/react";
import { Video, FileSpreadsheet, Download, Disc, Users } from "lucide-react";

export default function Features() {
  const list = [
    {
      id: "feat-live-classes",
      title: "Live Google Meet Classes",
      description: "Join real-time, interactive lectures directly on Google Meet. Code along with fellow students, ask live questions, and receive instant explanations.",
      icon: Video,
    },
    {
      id: "feat-assignments",
      title: "Assignments",
      description: "Reinforce what you learn in class with carefully structured code assignments, step-by-step challenges, and regular logical milestones.",
      icon: FileSpreadsheet,
    },
    {
      id: "feat-study-notes",
      title: "Study Notes",
      description: "Download a comprehensive library of structured study notes, development handbooks, visual database schemas, and cheat sheets for offline reference.",
      icon: Download,
    },
    {
      id: "feat-recorded-sessions",
      title: "Recorded Sessions",
      description: "Missed a class? No problem. Access our high-definition recorded archives anytime to review past lectures, walkthroughs, and code sessions.",
      icon: Disc,
    },
    {
      id: "feat-community-support",
      title: "Community Support",
      description: "Collaborate, debug, and learn alongside thousands of peers in our dedicated, friendly community space. Get fast support whenever you are stuck.",
      icon: Users,
    },
  ];

  return (
    <section id="features" className="py-24 relative bg-brand-black border-t border-white/5">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-cyan/2 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold text-brand-cyan uppercase tracking-wider"
          >
            <span>Core Benefits</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold font-display text-white mb-4 tracking-tight"
            id="features-section-title"
          >
            Everything You Need to <span className="text-brand-cyan neon-glow-cyan">Succeed</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base"
            id="features-section-subtitle"
          >
            NapPy delivers fully integrated, high-fidelity learning tools to support software development students completely free.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="features-grid">
          {list.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                id={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative glass-morphic rounded-2xl p-8 border border-white/5 hover:border-brand-cyan/25 box-glow-cyan-hover transition-all duration-300"
              >
                {/* Visual Accent */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="mb-6 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/10 flex items-center justify-center group-hover:bg-brand-cyan/20 group-hover:border-brand-cyan/30 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-brand-cyan" />
                  </div>
                  <span className="font-mono text-gray-700 text-xs">// 0{idx + 1}</span>
                </div>

                <h3 className="text-xl font-bold font-display text-white mb-3 group-hover:text-brand-cyan transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
