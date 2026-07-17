import React from "react";
import { motion } from "motion/react";
import { Mail, Instagram, Linkedin, Github, Send, HelpCircle, ArrowUpRight } from "lucide-react";

export default function Contact() {
  const socialLinks = [
    {
      id: "contact-email",
      name: "Email Support",
      value: "nappy0019@gmail.com",
      href: "mailto:nappy0019@gmail.com",
      desc: "Need help with NapPy? Contact our support team for technical assistance, account issues, live class support, assignments, or general queries.",
      icon: Mail,
      btnLabel: "Send Email",
    },
    {
      id: "contact-instagram",
      name: "Instagram",
      value: "@nap__py",
      href: "https://www.instagram.com/nap__py?igsh=eGFnbW5tb2RqMzB3",
      desc: "Follow NapPy for updates, announcements, behind-the-scenes content, student achievements, and community posts.",
      icon: Instagram,
      btnLabel: "Follow on Instagram",
    },
    {
      id: "contact-linkedin",
      name: "LinkedIn",
      value: "Nagappagoud Patil",
      href: "https://www.linkedin.com/in/nagappagoud-patil-146a74372?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      desc: "Connect with the founder of NapPy on LinkedIn for professional updates, collaborations, and networking.",
      icon: Linkedin,
      btnLabel: "Connect on LinkedIn",
    },
    {
      id: "contact-github",
      name: "GitHub",
      value: "github.com/nagappagoud",
      href: "https://github.com/nagappagoud",
      desc: "Explore NapPy development projects, open-source repositories, source code, and future updates.",
      icon: Github,
      btnLabel: "Explore GitHub",
    },
  ];

  return (
    <section id="contact" className="py-24 relative bg-brand-black border-t border-white/5">
      {/* Visual neon ambient spots */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-brand-cyan/2 rounded-full blur-[140px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold text-brand-cyan uppercase tracking-wider"
          >
            <Send className="w-3.5 h-3.5 animate-bounce" />
            <span>Get in Touch</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold font-display text-white mb-4 tracking-tight"
            id="contact-section-title"
          >
            Join Our <span className="text-brand-cyan neon-glow-cyan">Coding Community</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base"
            id="contact-section-subtitle"
          >
            Have questions about live Google Meet sessions or downloading note files? Connect with our team or browse our student channels.
          </motion.p>
        </div>

        {/* Contact Grid layout with ID attribute on each box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto" id="community">
          {socialLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                id={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative glass-morphic rounded-2xl p-8 border border-white/5 hover:border-brand-cyan/15 box-glow-cyan-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/10 flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan/20 group-hover:border-brand-cyan/30 transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-gray-700 text-xs">// SOCIAL_0{idx + 1}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-display text-white mb-2 group-hover:text-brand-cyan transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-brand-cyan font-mono text-sm mb-4">
                    {item.value}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <a
                  href={item.href}
                  target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-xs bg-white/5 hover:bg-brand-cyan hover:text-brand-black border border-white/5 hover:border-brand-cyan text-white hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300 cursor-pointer text-center"
                >
                  <span>{item.btnLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
