"use client";
import { Variants } from 'framer-motion';

// ── Shared Animation Variants ──
export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const headingVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// ── Inline confetti burst (no dependency) ──
export const fireConfetti = (() => {
  let container: HTMLDivElement | null = null;

  return () => {
    const colors = ['#22d3ee', '#06b6d4', '#0891b2', '#ffffff', '#a5f3fc'];
    const count = 30;

    if (container) {
      container.remove();
    }

    container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(container);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const x = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 360;
      const delay = Math.random() * 0.3;
      const duration = 1 + Math.random() * 1;
      const drift = (Math.random() - 0.5) * 200;

      el.style.cssText = `
        position:absolute;
        top:-20px;
        left:${x}%;
        width:${size}px;
        height:${size * 0.6}px;
        background:${color};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        transform:rotate(${rotation}deg);
        opacity:1;
      `;
      container.appendChild(el);

      el.animate(
        [
          { transform: `translateY(0) translateX(0) rotate(${rotation}deg)`, opacity: 1 },
          { transform: `translateY(${window.innerHeight + 50}px) translateX(${drift}px) rotate(${rotation + 720}deg)`, opacity: 0 },
        ],
        { duration: duration * 1000, delay: delay * 1000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' }
      );
    }

    setTimeout(() => {
      if (container) {
        container.remove();
        container = null;
      }
    }, 3000);
  };
})();

// ── Shared Types ──
export interface PinnedRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

export interface UnifiedProject {
  title: string;
  description: string;
  language?: string;
  url?: string;
  stars?: number;
  forks?: number;
  source: 'resume' | 'github';
  role?: string;
}

// ── Language Colors ──
export const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dockerfile: '#384d54',
};

// ── Skill-to-Project Mapping ──
export const SKILL_KEYWORD_MAP: Record<string, string[]> = {
  'Python': ['python', 'pyqt6', 'automator', 'contextswitch'],
  'Go': ['go', 'golang', 'microservices'],
  'JavaScript (ES6+)': ['javascript', 'node.js', 'node', 'web'],
  'Node.js': ['node.js', 'node', 'javascript', 'express'],
  'PHP': ['php'],
  'C++': ['c++', 'computer vision', 'opencv'],
  'C#': ['c#', 'unity', 'ar foundation'],
  'Java': ['java'],
  'HTML': ['html', 'web', 'frontend'],
  'CSS': ['css', 'tailwind', 'styling'],
  'Docker': ['docker', 'container', 'containerized'],
  'Docker Compose': ['docker compose', 'docker-compose'],
  'VSCode Remote Containers': ['remote containers', 'devcontainer'],
  'CI/CD Pipelines': ['ci/cd', 'pipeline', 'deploy'],
  'Git/GitHub': ['git', 'github'],
  'PyQt6': ['pyqt6', 'qt', 'desktop'],
  'Unity 3D': ['unity', 'unity 3d', 'ar'],
  'AR Foundation': ['ar foundation', 'augmented reality', 'ar'],
  'AI Frameworks': ['ai', 'cnn', 'model', 'computer vision'],
  'OpenCode': ['opencode', 'ai development'],
};
