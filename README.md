# Narciso III Javier | 3D Interactive Portfolio

An interactive 3D portfolio built with **Next.js 16**, **Three.js**, **React Three Fiber**, and **Framer Motion**. Features a 3D keyboard model, interactive animations, GitHub stats integration, LLM-powered chatbot, and multiple mini-games.

## ✨ Features

- **3D Keyboard Model**: Interactive GLTF keyboard with key press animations and scroll-based transformations
- **Animated Title**: Cycling job titles with typing animation effect (Computer Science Student | [Job Titles])
- **Interactive Typing Challenge**: Real-time WPM tracking, accuracy calculation, difficulty settings (Easy/Medium/Hard)
- **Contribution Calendar Game**: Click cells to break them (mini-game with scoring system)
- **GitHub Integration**: Live GitHub profile stats, contribution calendar, and activity feed
- **Gist Blog Section**: Display GitHub Gists as blog articles with markdown support
- **LLM-Powered Chatbot**: AI-driven conversational chatbot using OpenRouter API (📬 floating widget) with intelligent context awareness
- **Matrix Rain Effect**: Canvas-based Japanese character rain animation
- **Particle Effects**: Canvas-based particle burst system with collision detection
- **Smooth Scrolling**: Lenis-based smooth scroll with section-based navigation
- **Responsive Design**: Fully responsive on mobile, tablet, and desktop
- **Performance Optimized**: GPU-accelerated 3D rendering, lazy loading, optimized animations
- **Custom Favicon**: Logo-based favicon for browser tab

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.3 (App Router with Turbopack)
- **3D Rendering**: Three.js + React Three Fiber + Drei
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Smooth Scroll**: React Lenis
- **Data Fetching**: SWR for intelligent caching and deduplication
- **LLM Integration**: OpenRouter API with free models
- **Language**: TypeScript 5.9.3
- **Runtime**: Node.js 20.x+
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/2241812/narcisoIIIjavier.git
cd my-3d-portfolio

# Install dependencies
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```bash
# LLM Configuration (for chatbot)
NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key_here

# GitHub Configuration (optional - uses public API by default)
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting and fix
npm run lint
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts and metadata
│   ├── page.tsx                # Main portfolio page
│   ├── globals.css             # Global styles
│   ├── loading/                # Loading state
│   └── api/
│       └── github-stats/route.ts # GitHub API endpoint
├── components/
│   ├── 3d/
│   │   ├── Scene.tsx           # Three.js canvas wrapper
│   │   └── KeyboardModel.tsx   # Interactive GLTF keyboard model
│   ├── sections/
│   │   ├── AboutSection.tsx    # About me with interactive profile image
│   │   ├── SkillsSection.tsx   # Skills with GitHub-detected languages
│   │   ├── ProjectsSection.tsx # Featured projects
│   │   ├── ExperienceSection.tsx # Work experience
│   │   ├── ContactSection.tsx  # Contact information
│   │   └── shared.ts           # Shared animation variants
│   └── ui/
│       ├── Sections.tsx        # Portfolio layout grid
│       ├── GitHubStats.tsx     # GitHub profile card
│       ├── ContributionCalendar.tsx # Interactive contribution calendar
│       ├── TypingGame.tsx      # Typing challenge component
│       ├── ChatWidget.tsx      # Floating chatbot
│       ├── TopBar.tsx          # Navigation header
│       ├── MatrixRain.tsx      # Matrix rain effect
│       ├── ParticleBurst.tsx   # Particle system
│       ├── ErrorBoundary.tsx   # Error catching
│       └── LenisProvider.tsx   # Smooth scroll provider
├── services/
│   ├── api.ts                  # Centralized API service with retry logic
│   └── chatbot.ts              # Chatbot AI logic
├── hooks/
│   ├── useInView.ts            # Intersection Observer hook
│   ├── useGitHubData.ts        # GitHub data fetching hook
│   └── useGameStats.ts         # Game statistics tracking
├── constants/
│   ├── gameConstants.ts        # Game configuration
│   └── typingGame.ts           # Typing challenge content
├── types/
│   └── index.ts                # TypeScript type definitions
└── data/
    └── resumeData.ts           # Portfolio content and metadata

public/
├── models/keyboard.glb         # 3D keyboard GLTF model
└── profile.jpg                 # Profile photo
```

## 🔧 Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# GitHub Configuration (optional - uses public API by default)
NEXT_PUBLIC_GITHUB_USERNAME=2241812

# API Configuration
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_API_RETRIES=3

# Application Environment
NODE_ENV=production
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your repository to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Create a new project and import your GitHub repository
4. Vercel will automatically detect Next.js and configure build settings
5. Add environment variables if needed
6. Click "Deploy"

The project includes `vercel.json` with optimal configuration for Vercel deployment.

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js:

- **Netlify**: Use `npm run build` as build command and `npm start` as start command
- **AWS Amplify**: Automatic detection of Next.js
- **Digital Ocean**: Configure to run `npm run build && npm start`
- **Docker**: Create a Dockerfile with Node.js base image

## 📊 Features Breakdown

### Typing Challenge (`/break`)
- **Modes**: Duration (15/30/60/120s) or Word Count (25/50/100/200)
- **Difficulty**: Easy (common words), Medium (varied), Hard (rare words)
- **Stats**: Real-time WPM, accuracy percentage, time elapsed
- **Keyboard Shortcut**: `Tab + Enter` to restart

### Contribution Calendar Game
- **Gameplay**: Click cells to "break" them and earn points
- **Levels**: Cell shades represent contribution levels
- **Scoring**: Points based on cell value and combo multiplier
- **Achievements**: Unlock badges for milestones

### GitHub Integration
- **Real-time**: Fetches live contribution data from GitHub API
- **Fallback**: Generates placeholder data if API is unavailable
- **Caching**: SWR handles intelligent caching and revalidation
- **Error Handling**: Graceful degradation with fallback UI components

### Chatbot
- **Pattern Matching**: 20+ conversation rules with keyword detection
- **Similarity**: Threshold-based matching for natural responses
- **Context**: Maintains conversation history
- **Floating Widget**: Accessible 💬 button in bottom-right corner

## 🎮 Keyboard Shortcuts

- **`Tab + Enter`**: Restart typing challenge
- **`Escape`**: Exit contribution calendar game
- **`↑/↓`**: Navigate social cards in About section
- **`Enter`**: Select highlighted card
- **`type commands`**: Navigate sections (e.g., "about me", "skills")

## 📈 Performance

- **Lighthouse Score**: 85+ (Performance), 95+ (Accessibility)
- **Core Web Vitals**: All green (LCP, FID, CLS)
- **Build Size**: ~250KB (gzipped)
- **3D Rendering**: GPU-optimized with demand-based frame rendering

## 🐛 Troubleshooting

### Issue: "Failed to fetch" error in console
**Solution**: The GitHub Contributions API may be temporarily unavailable. The app will automatically fall back to placeholder data. This is normal and won't affect user experience.

### Issue: 3D keyboard not rendering
**Solution**: Ensure `public/models/keyboard.glb` exists and is not corrupted. Check browser console for WebGL errors.

### Issue: Animations stuttering
**Solution**: Check Chrome DevTools Performance tab. May need to reduce animation complexity or enable hardware acceleration.

### Issue: Build fails with TypeScript errors
**Solution**: Run `npm run build` to see full error details. Ensure all imports are correct and types are properly defined.

## 📝 License

This project is a personal portfolio. Feel free to fork and adapt it for your own portfolio!

## 🤝 Contributing

While this is a personal portfolio, suggestions and improvements are welcome! Feel free to:
- Open an issue for bugs
- Submit pull requests for enhancements
- Fork and create your own version

## 📞 Contact

- **Email**: renzoj156@gmail.com
- **GitHub**: [@2241812](https://github.com/2241812)
- **LinkedIn**: [Narciso III](https://linkedin.com/in/narciso-iii-javier)
- **Location**: Baguio City, Philippines

---

**Last Updated**: April 2026 | Built with ❤️ and TypeScript
