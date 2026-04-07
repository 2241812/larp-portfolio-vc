"use client";
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { AchievementBadge } from '@/components/ui/cards/MetricCards';
import { containerVariants } from './shared';
import { resumeData } from '@/data/resumeData';

// ── Main Footer Section (Minimalist) ──
const FooterSection = memo(function FooterSection() {
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

  return (
    <footer className="relative py-12 overflow-hidden bg-neutral-950 border-t border-cyan-900/30">
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>

      {/* Minimalist Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        {/* Achievements Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-cyan-400 mb-2 font-mono tracking-wider">
            <span className="text-neutral-600">$</span> credentials
          </h2>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-6">
            Academic Background & Certifications
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

          {/* LinkedIn Certificates Link */}
          <motion.a
            href={resumeData.personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 mt-6 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors duration-300"
          >
            <span>View LinkedIn Certificates</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.a>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-900/30 to-transparent mb-6"></div>

        {/* Footer Bottom - Minimalist */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500 font-mono"
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
      </div>
    </footer>
  );
});

export default FooterSection;
