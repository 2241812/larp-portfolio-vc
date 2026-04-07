---
name: 3D Portfolio Workspace Instructions
description: "Customizations and conventions for the 3D portfolio built with Next.js, Three.js, and Framer Motion. Use when working on any component, styling, animations, or GitHub integration features."
---

# 3D Portfolio — Workspace Instructions

This is an interactive 3D portfolio with advanced animations, real-time GitHub integration, and GPU-optimized rendering. Below are the essential conventions and patterns that make this project work smoothly.

## Quick Reference: Build & Run

- **Dev server**: `npm run dev` → http://localhost:3000
- **Build**: `npm run build` + `npm start`
- **Lint**: `npm run lint` (ESLint 9)

## Project Architecture

```
src/
├── app/                      # Next.js App Router (server root, layout metadata)
├── components/
│   ├── 3d/                   # Three.js + React Three Fiber components
│   │   ├── Scene.tsx         # Canvas wrapper with settings
│   │   └── KeyboardModel.tsx # Animated GLTF keyboard
│   └── sections/             # Portfolio content sections (About, Skills, Projects, Contact)
│       └── shared.ts         # Reusable Framer Motion variants & utilities
├── data/
│   └── resumeData.ts         # Single source of truth for portfolio content
└── hooks/
    ├── useGitHubData.ts      # SWR-based GitHub API fetching
    └── useInView.ts          # Scroll visibility detection
```

## Key Conventions

### 1. Client-Side Components (`"use client"`)
- **All interactive components** use the `"use client"` directive (layout, page, sections, 3D components)
- **Why**: Framer Motion animations, Three.js canvas, smooth scroll (Lenis), event listeners
- **Pattern**: Never use Server Components in this project unless explicitly creating API routes

### 2. Component Patterns & Memoization
- **Every section component** is wrapped with `memo()` to prevent unnecessary re-renders
- **Aggressive optimization**: Babel React Compiler in devDependencies handles micro-optimizations
- **Usage pattern**:
  ```tsx
  const AboutSection = memo(function AboutSection() {
    // Component body
  });
  export default AboutSection;
  ```
- **Ref-based state**: Use `useRef` for keyboard tracking (`pressedKeys.current`), animation frame IDs, not for visual state
- **Props pattern**: All components have explicit TypeScript interfaces for props (e.g., `SceneProps`, `CardProps`)

### 3. Animation System (Framer Motion)
- **Centralized variants**: `shared.ts` exports reusable animation variants across all sections
  - `containerVariants` — staggered children animations
  - `cardVariants` — individual card entrance animations
  - `headingVariants` — heading emphasis animations
  - `fireConfetti` — confetti particle burst
- **Scroll-triggered animations**: Use `whileInView={{ visible: true }}` with `viewport={{ once: true, amount: 0.3 }}`
- **Smooth transitions**: All motion animations explicitly set `duration: 0.2` to `0.6` for visual consistency
- **Hover/tap states**: Cards use `whileHover={{ scale: 1.04 }}` + `whileTap={{ scale: 0.97 }}`

### 4. 3D Rendering (Three.js + React Three Fiber)
- **Canvas settings** (Scene.tsx):
  ```tsx
  dpr={[1, 2]}                      // Responsive DPI
  powerPreference="high-performance" // GPU optimization
  antialias: true                    // Anti-aliasing enabled
  frameloop="demand"                 // Only render on frame changes
  ```
- **Performance**: KeyboardModel uses `useFrame` for smooth animations with `THREE.MathUtils.lerp()` interpolation
- **Model loading**: GLTF keyboard stored at `public/models/keyboard.glb` (pre-optimized)
- **Keyboard interaction**: KeyboardModel maps DOM keyboard events (`keydown`, `keyup`) to 3D mesh nodes; typing sequence runs during load phase

### 5. GitHub Integration (SWR + API Routes)
- **Fetch pattern**: `useGitHubData` hook uses SWR with conditional URLs (`isInView ? url : null`)
- **Deduplication**: 60s dedupe interval, 5s refresh interval (SWR defaults)
- **Visibility-based fetching**: Only requests data when section scrolls into view
- **Data source**: `resumeData.ts` provides GitHub username + token (or public API fallback)
- **API route** (optional): `src/app/api/github-stats/route.ts` for server-side aggregation

### 6. Styling & Theming
- **Framework**: Tailwind CSS v4 with Google Fonts (geistSans, orbitron, rajdhani)
- **Color scheme**: Dark theme with cyan accents
  - Background: `bg-neutral-950` (near black)
  - Text: `text-neutral-200` (off-white), `text-cyan-400` (accents)
  - Borders: `border-cyan-900/30` → `border-cyan-400/60` on hover
- **No CSS modules**: All styling via Tailwind + inline Framer Motion styles
- **Custom CSS**: Minimal — mostly handled via Tailwind utility classes
- **Fonts**: Injected in `app/layout.tsx` as CSS custom properties

### 7. State Management
- **Props drilling**: Acceptable for this project (component tree is shallow)
- **No Context API**: Not used; `useRef` handles 3D keyboard state, SWR handles GitHub data
- **Hooks**: `useFrame` (R3F), `useGitHubData` (SWR), `useInView` (custom), `useState` for UI toggles
- **Avoid**: Redux, Zustand, Jotai (overkill for this scale)

### 8. TypeScript Usage
- **All props typed**: Every component has explicit interface or type definition
- **Strict mode**: `tsconfig.json` uses strict TypeScript rules
- **Common types**:
  ```tsx
  interface SectionProps {
    scrollProgress?: number;
  }
  interface CardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
  }
  ```

## Common Workflows

### Adding a New Section
1. Create `src/components/sections/NewSection.tsx`
2. Wrap with `memo()` and use `"use client"` directive
3. Import animation variants from `shared.ts`
4. Use Framer Motion `motion.div` with `whileInView` trigger
5. Export default and add to `Sections.tsx` grid
6. Add content to `resumeData.ts` if data-driven

### Modifying Animations
1. Edit variant definitions in `src/components/sections/shared.ts`
2. Variants apply across all sections (change once, update everywhere)
3. Test with different `duration`, `delay`, `stagger` values
4. Profile with Chrome DevTools (Performance tab) to ensure 60 FPS

### Updating 3D Model Interactions
1. Edit `src/components/3d/KeyboardModel.tsx`
2. Keyboard press events are mapped in `keyDown`/`keyUp` handlers
3. Mesh positions/scales are animated in `useFrame` with `lerp` for smoothness
4. Scale/rotation animations sync with scroll via `useFrame`

### Adding GitHub Stats Widget
1. Use `useGitHubData` hook to fetch data conditionally
2. Call hook with GitHub API endpoint URL
3. SWR handles caching and deduplication automatically
4. Wrap UI in `useInView` hook to defer fetching until visible

## Performance Tips

- **Disable Framer Motion transforms on non-critical elements**: Use `transition={{ duration: 0 }}` for UI that doesn't need smooth animation
- **Use `memo()` for large lists**: Sections with many cards should memoize card components
- **Three.js Canvas**: Always use `frameloop="demand"` (enabled by default) to prevent continuous rendering
- **Intersection Observer**: `useInView` hook uses a custom hook for efficient scroll detection
- **No `animate` on mount**: Use `whileInView` instead of `animate` for scroll-triggered animations to reduce initial load

## Common Pitfalls

- ❌ Forgetting `"use client"` directive on interactive components → hydration mismatch
- ❌ Declaring animation variants inside component body → recreates on every render
- ❌ Using `animate` prop for scroll triggers → animates on initial render (use `whileInView` instead)
- ❌ Not memoizing expensive components → unnecessary re-renders when parent updates
- ❌ Fetching GitHub data on mount → should only fetch when section scrolls into view
- ❌ Tailwind classes with spaces or invalid syntax → Tailwind can't parse; use underscores (`group-hover:text-cyan-300`)

## Debugging

**HMR not working?**
- Restart dev server: `npm run dev`
- Check for syntax errors in component

**Keyboard 3D model not animating?**
- Verify `keyboard.glb` is present at `public/models/`
- Check browser console for Three.js warnings
- Ensure `useFrame` loop is executing (add `console.log` in hook)

**Animations stuttering?**
- Profile with Chrome DevTools → Performance tab
- Reduce animation duration or use `transition={{ duration: 0 }}` for non-critical effects
- Check if Canvas `frameloop` is set to `"demand"` (not continuous)

**GitHub stats not loading?**
- Check API token/public access in `resumeData.ts`
- Verify `isInView` is `true` before SWR triggers request
- Check browser Network tab for API errors

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber Guide](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [Framer Motion API](https://www.framer.com/motion/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Three.js Docs](https://threejs.org/docs/)
- [SWR Documentation](https://swr.vercel.app/)

---

**Last updated**: 2026-04-08 | **Project**: 3D Interactive Portfolio
