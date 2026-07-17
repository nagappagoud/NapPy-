import { motion } from "motion/react";
import { Terminal, Code2, Cpu, Activity, Play, Sparkles } from "lucide-react";

export default function Hero() {
  const codeLines = [
    { text: "import { Class, Project } from 'nappy';", type: "import" },
    { text: "const student = new Student('Future Dev');", type: "const" },
    { text: "student.joinLiveClass('Google Meet');", type: "method" },
    { text: "student.solveAssignment();", type: "method" },
    { text: "student.downloadStudyNotes();", type: "method" },
    { text: "student.buildRealWorldProjects();", type: "method" },
  ];

  return (
    <section 
      id="hero" 
      className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-brand-black"
    >
      {/* Background radial gradient overlay for premium depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,229,255,0.08),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Side: Copy and CTAs */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-4 py-1.5 mb-6 text-xs md:text-sm font-medium text-brand-cyan tracking-wide"
            id="hero-badge"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Learning & Live Classes</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            id="hero-title"
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-[1.1] tracking-tight mb-6"
          >
            <span className="text-white block">Learn. Build.</span>
            <span className="bg-gradient-to-r from-brand-cyan via-cyan-400 to-blue-400 bg-clip-text text-transparent neon-glow-cyan">
              Grow.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="hero-subtitle"
            className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10"
          >
            NapPy is a free learning platform where students attend live Google Meet classes, complete assignments, download notes, practice coding, and build real-world projects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            id="hero-ctas"
          >
            <button
              id="hero-btn-join"
              onClick={() => {
                window.location.href = "/register";
              }}
              className="bg-brand-cyan hover:bg-brand-cyan/90 text-brand-black font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-brand-cyan/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center cursor-pointer"
            >
              Join Now
            </button>
            <button
              id="hero-btn-curriculum"
              onClick={() => {
                const target = document.querySelector("#roadmap");
                if (target) target.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white/5 hover:bg-white/10 text-white font-medium text-base px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-95 text-center cursor-pointer"
            >
              Explore Curriculum
            </button>
          </motion.div>
        </div>

        {/* Right Side: High-Fidelity Multi-Monitor Workspace Simulation */}
        <div className="lg:col-span-6 flex items-center justify-center lg:justify-end w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            id="hero-illustration-container"
            className="relative w-full max-w-[580px] aspect-[4/3] flex items-center justify-center"
          >
            {/* Monitor 1: Primary Developer Monitor (Center Coding Environment) */}
            <div 
              id="illustration-monitor-main"
              className="absolute z-20 w-[78%] h-[68%] glass-morphic border border-white/15 rounded-2xl p-4 shadow-2xl flex flex-col select-none box-glow-cyan transition-all duration-500 hover:scale-[1.02] transform -translate-y-4"
            >
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 text-[10px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                </div>
                <div className="font-mono text-gray-400 bg-white/5 px-3 py-0.5 rounded">App.tsx - NapPy</div>
                <div className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-brand-cyan" />
                </div>
              </div>

              {/* Code Editor Body */}
              <div className="flex-1 font-mono text-xs md:text-sm overflow-hidden flex flex-col justify-center gap-2 px-2 py-1 text-gray-300">
                {codeLines.map((line, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-gray-600 text-[10px] select-none w-4 text-right">0{index + 1}</span>
                    <span className={
                      line.type === 'import' ? 'text-brand-cyan font-semibold' :
                      line.type === 'const' ? 'text-purple-400' :
                      line.type === 'method' ? 'text-blue-300' : 'text-emerald-400 font-medium'
                    }>
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Window Footer / Status */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[10px] font-mono text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping"></span>
                  <span className="text-brand-cyan">Live Class Session</span>
                </div>
                <span>UTF-8</span>
              </div>
            </div>

            {/* Monitor 2: Auxiliary Dashboard Screen (Left Stack - Upcoming Classes list) */}
            <div 
              id="illustration-monitor-left"
              className="absolute z-10 left-0 bottom-[8%] w-[42%] h-[48%] glass-morphic-cyan border border-brand-cyan/20 rounded-xl p-3 shadow-xl flex flex-col transform -rotate-6 translate-x-[-10px] hover:translate-x-0 transition-transform duration-500"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-brand-cyan/10">
                <span className="text-[10px] font-mono font-bold text-brand-cyan flex items-center gap-1">
                  <Activity className="w-3 h-3 text-brand-cyan" /> CLASS ROOM
                </span>
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
              </div>
              
              <div className="flex-1 flex flex-col justify-around font-mono text-[9px] text-gray-400">
                <div className="bg-brand-cyan/5 p-1 rounded border border-brand-cyan/10">
                  <p className="text-brand-cyan font-semibold mb-0.5">📅 CSS Flexbox</p>
                  <p className="text-[10px] text-white">Live via Google Meet</p>
                </div>
                <div className="bg-brand-cyan/5 p-1 rounded border border-brand-cyan/10">
                  <p className="text-cyan-300 font-semibold mb-0.5">📝 JS Scope</p>
                  <p className="text-[10px] text-white">Assignment & Code Practice</p>
                </div>
              </div>
            </div>

            {/* Monitor 3: Auxiliary Study Notes Screen (Right Stack - Notes Vault Preview) */}
            <div 
              id="illustration-monitor-right"
              className="absolute z-10 right-0 top-[10%] w-[44%] h-[50%] glass-morphic border border-white/10 rounded-xl p-3 shadow-xl flex flex-col transform rotate-6 translate-x-[15px] hover:translate-x-0 transition-transform duration-500"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
                <span className="text-[10px] font-semibold text-white flex items-center gap-1 font-display">
                  <Cpu className="w-3.5 h-3.5 text-brand-cyan" /> Study Notes Vault
                </span>
                <span className="text-[9px] text-brand-cyan font-mono">VAULT</span>
              </div>

              <div className="flex-1 flex flex-col gap-1.5 text-[9px] font-mono justify-center">
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5 text-gray-400">
                  <span className="text-white font-semibold">File:</span> CheatSheets.zip
                </div>
                <div className="bg-brand-cyan/5 p-1.5 rounded-lg border border-brand-cyan/10 text-brand-cyan">
                  <span className="font-semibold text-white">Topic:</span> Visual guides, layout architecture grids, and cheat sheets...
                </div>
              </div>
            </div>

            {/* Background elements to anchor the multi-monitor illustration */}
            <div className="absolute bottom-[2%] w-[55%] h-[4%] bg-white/5 rounded-full blur-md"></div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
