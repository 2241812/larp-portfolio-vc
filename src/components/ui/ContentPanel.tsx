"use client";
import React from 'react';
import { resumeData } from '@/data/resumeData';

interface ContentPanelProps {
  section: string;
}

export default function ContentPanel({ section }: ContentPanelProps) {
  if (!section) return null;

  const renderContent = () => {
    switch (section) {
      case 'about me':
        return (
          <div className="space-y-6 text-neutral-300">
            <p className="text-lg leading-relaxed">
              I am a {resumeData.personalInfo.title} currently studying at {resumeData.education.university}. 
              With a GPA of {resumeData.education.gpa}, I am part of the class of {resumeData.education.classOf}.
            </p>
            <p className="text-lg leading-relaxed">
              I focus on automation and scalable software solutions. I have a demonstrated ability to manage end-to-end technical projects, from AI-integrated tools to multi-service architectures.
            </p>
          </div>
        );
      case 'experience':
      case 'projects':
        return (
          <div className="space-y-8 text-neutral-300">
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="p-6 bg-cyan-950/20 border border-cyan-800/30 rounded-xl hover:border-cyan-500/50 transition-colors">
                <h4 className="text-xl font-bold text-neutral-100">{proj.title}</h4>
                <p className="text-cyan-500 font-mono text-sm mt-1 mb-4">{proj.role}</p>
                <p className="text-base leading-relaxed mb-4">{proj.description}</p>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 text-sm font-mono">
                    View Repository {">"}
                  </a>
                )}
              </div>
            ))}
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-8 text-neutral-300">
            <div>
              <h4 className="text-lg font-bold text-neutral-400 mb-3 uppercase tracking-widest border-b border-cyan-900/50 pb-2">Programming & Web</h4>
              <div className="flex flex-wrap gap-3 mt-4">
                {resumeData.skills.programming.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md text-sm font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-neutral-400 mb-3 uppercase tracking-widest border-b border-cyan-900/50 pb-2">Frameworks & Tools</h4>
              <div className="flex flex-wrap gap-3 mt-4">
                {resumeData.skills.frameworks.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md text-sm font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6 text-neutral-300">
            <div className="space-y-4 font-mono text-lg text-center md:text-left">
              <p><span className="text-neutral-500">Email:</span> <a href={`mailto:${resumeData.personalInfo.email}`} className="text-cyan-400 hover:underline">{resumeData.personalInfo.email}</a></p>
              <p><span className="text-neutral-500">Phone:</span> {resumeData.personalInfo.phone}</p>
              <p><span className="text-neutral-500">Location:</span> {resumeData.personalInfo.location}</p>
              <p><span className="text-neutral-500">LinkedIn:</span> <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Profile Link</a></p>
            </div>
          </div>
        );
      default:
        return <p className="text-neutral-400 font-mono">Data segment not found.</p>;
    }
  };

  return (
    <div className="w-full bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.1)] relative z-10 p-8 md:p-12">
      {renderContent()}
    </div>
  );
}