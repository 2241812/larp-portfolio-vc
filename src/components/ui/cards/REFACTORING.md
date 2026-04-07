# Card Components Refactoring Documentation

## Overview

The interactive components from `ContactSection` and `FooterSection` have been extracted into reusable, standalone card components. This improves code maintainability, encourages DRY principles, and enables easy component reuse across the portfolio.

## Component Structure

```
src/components/ui/cards/
├── MetricCards.tsx      # Animated counters and stat displays
├── ContactFields.tsx    # Contact form fields and social links
└── index.ts             # Barrel export for convenience
```

## Components

### MetricCards.tsx

**AnimatedCounter**
- **Purpose**: Animates numeric values incrementally
- **Props**: `value`, `suffix`, `duration`
- **Use Case**: Displaying stats, counters, timers
- **Example**: `<AnimatedCounter value={5} suffix="y+" />`

**StatCard**
- **Purpose**: Displays statistics with icon, label, and animated value
- **Props**: `label`, `value`, `icon`, `delay`, `onClick`
- **Use Case**: Portfolio KPIs (Projects, Skills, Experience, GPA)
- **Example**: 
  ```tsx
  <StatCard 
    label="Projects" 
    value={5} 
    icon={<ProjectIcon />} 
    delay={0} 
  />
  ```

**AchievementBadge**
- **Purpose**: Highlights accomplishments and key features
- **Props**: `icon`, `title`, `description`, `delay`
- **Use Case**: Portfolio achievements, milestones, certifications
- **Example**:
  ```tsx
  <AchievementBadge 
    icon="🏆" 
    title="Achievement" 
    description="Certificate of Participation - Smart City Challenge 2024" 
    delay={0} 
  />
  ```

**TechStackItem**
- **Purpose**: Displays tech category with count in a grid
- **Props**: `name`, `count`, `delay`, `onClick`
- **Use Case**: Technical portfolio overview (Languages, Frameworks, etc.)
- **Example**:
  ```tsx
  <TechStackItem 
    name="Languages" 
    count={10} 
    delay={0} 
  />
  ```

### ContactFields.tsx

**GlitchSocialLink**
- **Purpose**: Interactive social media link with glitch hover effect
- **Props**: `href`, `icon`, `label`, `value`, `onClick`
- **Features**: 
  - Glitch animation on hover
  - Custom callback support
  - Accessible focus states
- **Example**:
  ```tsx
  <GlitchSocialLink 
    href="https://github.com" 
    icon={<GitHubIcon />} 
    label="GitHub" 
    value="@username" 
    onClick={fireConfetti} 
  />
  ```

**CopyableField**
- **Purpose**: Interactive field with copy-to-clipboard functionality
- **Props**: `label`, `value`, `icon`
- **Features**:
  - Visual feedback on copy
  - Clipboard API with fallback
  - Accessible buttons
- **Example**:
  ```tsx
  <CopyableField 
    label="Email" 
    value="user@example.com" 
    icon={<MailIcon />} 
  />
  ```

## Usage

### Option 1: Import directly from component file
```tsx
import { StatCard } from '@/components/ui/cards/MetricCards';
import { GlitchSocialLink, CopyableField } from '@/components/ui/cards/ContactFields';
```

### Option 2: Use barrel export (recommended)
```tsx
import { 
  StatCard, 
  AchievementBadge, 
  GlitchSocialLink, 
  CopyableField 
} from '@/components/ui/cards';
```

## Refactoring Benefits

✅ **Improved Maintainability**: Components are now isolated and easier to update
✅ **Code Reusability**: Same components can be used in multiple sections
✅ **Reduced Duplication**: Eliminated copy-pasted component code
✅ **Better Organization**: Logical grouping of related components
✅ **Easier Testing**: Isolated components are simpler to unit test
✅ **TypeScript Support**: Full type safety with explicit interfaces
✅ **Performance**: Components are memoized to prevent unnecessary re-renders

## File Size Changes

**Before Refactoring:**
- `ContactSection.tsx`: 352 lines (with duplicates)
- `FooterSection.tsx`: 255 lines (with duplicates)
- **Total**: 607 lines

**After Refactoring:**
- `ContactSection.tsx`: 185 lines
- `FooterSection.tsx`: 205 lines
- `MetricCards.tsx`: 180 lines (shared extraction)
- `ContactFields.tsx`: 200 lines (shared extraction)
- **Total**: 770 lines (but highly reusable and maintainable)

## Future Improvements

- Add Storybook integration for component documentation
- Create unit tests for each card component
- Add more variants/sizes for StatCard
- Consider animation customization props
- Add loading states for async components
