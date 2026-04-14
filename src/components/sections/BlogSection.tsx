"use client";
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from './shared';
import { useInView } from '@/hooks/useInView';
import { useGistData } from '@/hooks/useGistData';
import { resumeData } from '@/data/resumeData';

const BlogSection = memo(function BlogSection() {
  const { ref, isInView } = useInView({ rootMargin: '300px', once: true });
  const { gists, isLoading, isError, error, retry } = useGistData('2241812', isInView);

  // Filter for gists that have markdown files or specific descriptions to act as "blogs"
  const blogGists = gists.filter(gist => 
    Object.values(gist.files).some(file => file.language === 'Markdown' || file.type === 'text/markdown') || 
    gist.description.toLowerCase().includes('blog')
  ).slice(0, 4);

  // Debug: Log all gists and filter info
  if (gists.length > 0) {
    console.log('Total gists fetched:', gists.length);
    console.log('Gists:', gists);
    console.log('Filtered blog gists:', blogGists.length);
  }

  return (
    <section id="blog" ref={ref} className="min-h-screen py-24 flex items-center justify-center relative z-10 px-8 md:px-12 w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="w-full max-w-6xl relative z-10 grid grid-cols-1 gap-12"
      >
        <div className="flex justify-between items-end border-b border-cyan-900/30 pb-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-cyan-400 mb-2 font-mono tracking-wider">
              <span className="text-neutral-600">$</span> fetch_logs
            </h2>
            <p className="text-sm md:text-base text-neutral-500 font-mono uppercase tracking-widest">
              Live Articles & Notes from GitHub Gists
            </p>
          </div>
          {isLoading && <span className="text-xs text-cyan-500 font-mono animate-pulse">Loading...</span>}
        </div>

        {isError ? (
          <div className="w-full bg-red-950/20 border border-red-500/20 rounded-xl p-8 flex flex-col items-center justify-center">
            <span className="text-red-400 font-mono text-sm mb-2">ERR_CONNECTION_REFUSED</span>
            <span className="text-red-400/70 font-mono text-xs mb-4">{error}</span>
            <button
              onClick={retry}
              className="px-6 py-2 text-xs font-mono text-red-400 border border-red-500/50 bg-red-900/20 rounded-lg hover:bg-red-900/40 hover:border-red-400 transition-all duration-300"
            >
              RETRY FETCH
            </button>
          </div>
        ) : blogGists.length === 0 && !isLoading ? (
          <div className="w-full bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-8 text-center">
             <span className="text-neutral-500 font-mono text-sm">
               {gists.length > 0 
                 ? `Found ${gists.length} gist(s) but none match filter (need .md file or 'blog' in description)`
                 : 'No gists found. Make sure your gist is public and check browser console for errors.'}
             </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {blogGists.map((gist) => {
              const fileKey = Object.keys(gist.files)[0];
              const file = gist.files[fileKey];
              const date = new Date(gist.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              
              return (
                <motion.a
                  key={gist.id}
                  href={gist.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-neutral-900/60 backdrop-blur-sm border border-cyan-900/30 rounded-xl p-6 overflow-hidden hover:border-cyan-400/60 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-cyan-500/5 group-hover:to-cyan-500/20 transition-all duration-500" />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                          </svg>
                          <span className="text-xs text-neutral-500 font-mono">{date}</span>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-900/50 font-mono">
                          {file.language || 'Markdown'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-neutral-200 group-hover:text-cyan-300 transition-colors duration-300 mb-3">
                        {gist.description || file.filename || `Gist #${gist.id.substring(0, 7)}`}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 text-cyan-500 font-mono text-xs group-hover:gap-3 transition-all duration-300">
                      <span>Read Log</span>
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
});

export default BlogSection;