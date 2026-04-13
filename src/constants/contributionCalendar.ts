export const CONTRIBUTION_CONFIG = {
  CELL_SIZE: 14, // 11px cell + 3px gap
  VISIBLE_WIDTH: 500,
  BASE_SPEED: 0.3, // pixels per frame at 60fps
  MAX_SPEED: 4,
  HINT_SHOW_DURATION: 4000, // ms
  PARTICLE_LIFETIME: 800, // ms
  LEVEL_POINTS: [1, 3, 5, 10, 20] as const,
} as const;

export const LEVEL_COLORS = [
  'bg-neutral-800/50',
  'bg-cyan-900/60',
  'bg-cyan-700/70',
  'bg-cyan-500/80',
  'bg-cyan-400',
] as const;

export const LEVEL_GLOWS = [
  '',
  'shadow-[0_0_3px_rgba(34,211,238,0.1)]',
  'shadow-[0_0_5px_rgba(34,211,238,0.2)]',
  'shadow-[0_0_8px_rgba(34,211,238,0.3)]',
  'shadow-[0_0_12px_rgba(34,211,238,0.5)]',
] as const;

export const CELL_CLASSES = {
  base: 'w-[11px] h-[11px] rounded-sm transition-all duration-150',
  interactive: 'cursor-crosshair hover:scale-[2] hover:brightness-150',
  broken: 'bg-transparent scale-0',
  default: 'cursor-default',
} as const;

export const ANIMATION_CONFIG = {
  scoreScale: { scale: [1, 1.05, 1] } as const,
  scoreDuration: 0.5,
  comboInitial: { opacity: 0, scale: 0.5 } as const,
  comboAnimate: { opacity: 1, scale: 1 } as const,
  particleInitial: { x: 0, y: 0, opacity: 1, scale: 1 } as const,
  pointsInitial: { opacity: 1, y: 0 } as const,
  pointsAnimate: { opacity: 0, y: -20 } as const,
  pointsDuration: 0.6,
  particleDuration: 0.5,
} as const;
