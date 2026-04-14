"use client";
import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { resumeData } from '@/data/resumeData';
import { containerVariants, cardVariants, headingVariants, fireConfetti } from './shared';
import { GlitchSocialLink, CopyableField } from '@/components/ui/cards/ContactFields';
import { AchievementBadge } from '@/components/ui/cards/MetricCards';

const credentials = [
  {
    icon: '🎓',
    title: 'B.S. Computer Science',
    description: `Saint Louis University | GPA: ${resumeData.education.gpa}`,
  },
  {
    icon: '⭐',
    title: 'Smart City Challenge',
    description: 'Certified Participant - 2024',
  },
  {
    icon: '🏆',
    title: 'AI Development',
    description: 'Industry Specialization Certificate',
  },
];

// ── Contact Section Component ──
const ContactSection = memo(function ContactSection() {
  const handleConfettiClick = useCallback(() => {
    fireConfetti();
  }, []);

  return (
    <section id="contact" className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 relative py-20 sm:py-0">
      {/* Floating Stats Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          className="absolute top-10 right-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full border border-cyan-500/20 animate-[spin_20s_linear_infinite]"
        />
        <div
          className="absolute bottom-20 left-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full border border-cyan-500/10 animate-[spin_25s_linear_infinite_reverse]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12"
      >
        {/* LEFT SIDE: Main Contact Terminal */}
        <div className="bg-neutral-950/90 backdrop-blur-xl border border-cyan-900/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.05)] h-fit">
          {/* Terminal Title Bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-neutral-900/60 border-b border-cyan-900/30">
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-500/60 hover:bg-red-500/80 transition-colors" aria-hidden="true" />
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-500/80 transition-colors" aria-hidden="true" />
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-green-500/60 hover:bg-green-500/80 transition-colors" aria-hidden="true" />
            <span className="ml-2 sm:ml-3 text-[10px] sm:text-xs font-mono text-neutral-500 truncate">contact_protocol.sh</span>
          </div>

          {/* Terminal Content */}
          <div className="p-4 sm:p-8 md:p-10">
            <motion.h2 variants={headingVariants} className="text-xl sm:text-2xl font-bold text-cyan-400 mb-2 tracking-wider uppercase font-mono">
              <span className="text-neutral-600" aria-hidden="true">$</span> 06. initiate_protocol
            </motion.h2>
            <motion.p variants={cardVariants} className="text-neutral-500 text-xs font-mono mb-6 sm:mb-8">
              Establish a connection through any channel below.
            </motion.p>

            {/* Social Links Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <GlitchSocialLink
                href="https://github.com/2241812"
                onClick={handleConfettiClick}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                }
                label="GitHub"
                value="@2241812"
              />
              <GlitchSocialLink
                href={resumeData.personalInfo.linkedin}
                onClick={handleConfettiClick}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
                label="LinkedIn"
                value="Narciso III Javier"
              />
            </motion.div>

            {/* Copyable Fields */}
            <motion.div variants={containerVariants} className="space-y-3 mb-6">
              <CopyableField
                label="Email"
                value={resumeData.personalInfo.email}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                }
              />
              <CopyableField
                label="Phone"
                value={resumeData.personalInfo.phone}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                }
              />
            </motion.div>

            {/* Location Pill */}
            <motion.div variants={cardVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/60 border border-cyan-900/20">
              <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-xs font-mono text-neutral-500">{resumeData.personalInfo.location}</span>
            </motion.div>
          </div>
        </div>

        {/* RIGHT SIDE: Credentials & Connect */}
        <div className="flex flex-col gap-8 h-full justify-between">
          <motion.div variants={containerVariants} className="flex flex-col">
            <h2 className="text-xl font-bold text-cyan-400 mb-2 font-mono tracking-wider">
              <span className="text-neutral-600">$</span> credentials
            </h2>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-6">
              Academic Background & Certifications
            </p>
            
            <div className="flex flex-col gap-3">
              {credentials.map((credential, index) => (
                <AchievementBadge
                  key={index}
                  icon={credential.icon}
                  title={credential.title}
                  description={credential.description}
                  delay={index * 0.1}
                />
              ))}
            </div>

            <motion.a
              href={resumeData.personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center w-fit gap-2 mt-4 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors duration-300"
            >
              <span>View LinkedIn Certificates</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Let's Connect CTA Section */}
          <motion.div
            variants={cardVariants}
            className="bg-gradient-to-r from-cyan-900/20 to-cyan-900/5 border border-cyan-900/40 rounded-xl p-6 md:p-8 text-center"
          >
            <h3 className="text-lg font-bold text-cyan-400 mb-2 font-mono">Ready to Connect?</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Let&apos;s collaborate on innovative projects. Download my resume or reach out directly.
            </p>
            <div className="flex flex-col xl:flex-row gap-3 justify-center items-center">
              <motion.a
                href="/Javier, Narciso III C._Resume_.pdf"
                download
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34,211,238,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 w-full lg:w-auto rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-neutral-950 font-semibold transition-all duration-300 font-mono text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Resume
              </motion.a>
              <motion.a
                href={resumeData.personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleConfettiClick}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34,211,238,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 w-full lg:w-auto rounded-lg border border-cyan-400/60 text-cyan-400 hover:text-cyan-300 hover:border-cyan-300/80 font-semibold transition-all duration-300 font-mono text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Connect
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer Bottom elements aligned to bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="w-full max-w-6xl relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500 font-mono mt-16 pt-8 border-t border-cyan-900/30"
      >
        <div>© 2026 Narciso III Javier. Computer Science Student @ SLU.</div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/2241812"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors duration-300"
            aria-label="GitHub"
          >
            GitHub
          </a>
          <span className="text-neutral-700">•</span>
          <a
            href={resumeData.personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors duration-300"
            aria-label="LinkedIn"
          >
            LinkedIn
          </a>
          <span className="text-neutral-700">•</span>
          <a
            href={`mailto:${resumeData.personalInfo.email}`}
            className="hover:text-cyan-400 transition-colors duration-300"
            aria-label="Email"
          >
            Email
          </a>
        </div>
      </motion.div>
    </section>
  );
});

export default ContactSection;


