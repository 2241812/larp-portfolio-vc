# Narciso III Javier | 3D Portfolio

An interactive 3D portfolio built with Next.js, Three.js, and Framer Motion. Features a 3D keyboard model, matrix rain effects, particle animations, and live GitHub stats integration.

## Features

- **3D Keyboard Model**: Interactive GLTF keyboard with key press animations and scroll-based transformations
- **Matrix Rain Effect**: Canvas-based Japanese character rain animation
- **Particle Effects**: Canvas-based particle burst system
- **GitHub Integration**: Live GitHub profile stats, contribution calendar with interactive mini-game, and recent activity feed
- **Smooth Scrolling**: Lenis-based smooth scroll with section-based navigation
- **Command Interface**: Type commands to navigate to sections (about me, experience, skills, projects, contact)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **3D Rendering**: Three.js + React Three Fiber + Drei
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS v4
- **Smooth Scroll**: React Lenis
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main page with loading/portfolio phases
│   ├── globals.css         # Global styles
│   └── api/github-stats/   # GitHub API route (if needed)
├── components/
│   ├── 3d/
│   │   ├── Scene.tsx       # Three.js canvas wrapper
│   │   └── KeyboardModel.tsx # Interactive keyboard GLTF model
│   └── ui/
│       ├── Sections.tsx    # Portfolio content sections
│       ├── GitHubStats.tsx # GitHub profile and activity display
│       ├── ContributionCalendar.tsx # Contribution grid with mini-game
│       ├── TopBar.tsx      # Navigation header
│       ├── MatrixRain.tsx  # Matrix rain canvas effect
│       └── ParticleBurst.tsx # Particle burst canvas effect
├── data/
│   └── resumeData.ts       # Portfolio content data
└── hooks/
    └── useInView.ts        # Intersection Observer hook

public/
├── models/
│   └── keyboard.glb        # 3D keyboard model
└── logo.jpg                # Portfolio logo
```

## License

Private portfolio project.
