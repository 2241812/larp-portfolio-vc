"use client";
import React, { useState, useEffect, memo, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { useGameStats } from '@/hooks/useGameStats';
import AchievementToast from './AchievementToast';
import { GameDifficulty, CELL_SIZE, LEVEL_COLORS, LEVEL_GLOWS } from '@/constants/gameConstants';
import { fetchGitHubContributions } from '@/services/api';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

const ContributionCalendar = memo(forwardRef(function ContributionCalendar({ username = '2241812', onDataLoaded, onGameModeChange }: { username?: string; onDataLoaded?: (data: { date: string; count: number }[]) => void; onGameModeChange?: (isActive: boolean) => void }, ref) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);
  const { ref: sectionRef, isInView } = useInView({ rootMargin: '300px', once: true });

  // Game state
  const [gameMode, setGameMode] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [brokenCells, setBrokenCells] = useState<Set<string>>(new Set());
  const [scrollOffset, setScrollOffset] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; points: number }[]>([]);
  const [gameStartTime, setGameStartTime] = useState(0);
  
  // Stats integration
  const { recordGameResult, newAchievements, clearNewAchievements } = useGameStats();
  
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const BASE_SPEED = 0.3; // pixels per frame at 60fps
  const MAX_SPEED = 4;

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDownInGame = (e: KeyboardEvent) => {
      if (!gameMode) return;
      const key = e.key.toLowerCase();
      
      // Escape to quit game
      if (key === 'escape') {
        exitGame();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDownInGame);
    return () => window.removeEventListener('keydown', handleKeyDownInGame);
  }, [gameMode]);

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    async function handleFetchContributions() {
      try {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setDate(today.getDate() - 364);
        const toDate = today.toISOString().split('T')[0];
        const fromDate = oneYearAgo.toISOString().split('T')[0];
        
        const data = await fetchGitHubContributions(username, fromDate, toDate);
        
        if (cancelled) return;

        // If no contributions returned (API failed), generate placeholder
        if (!data.contributions || data.contributions.length === 0) {
          console.warn('[ContributionCalendar] No contributions data received, using placeholder');
          generatePlaceholderData();
          return;
        }

        interface ContributionData {
          date: string;
          count: number;
        }
        
        const days: ContributionDay[] = data.contributions.map((c: ContributionData) => ({
          date: c.date,
          count: c.count,
          level: c.count === 0 ? 0 : c.count <= 3 ? 1 : c.count <= 6 ? 2 : c.count <= 9 ? 3 : 4,
        }));

        setContributions(days);
        setTotalContributions(days.reduce((sum, d) => sum + d.count, 0));
        onDataLoaded?.(days.map(d => ({ date: d.date, count: d.count })));
      } catch (err) {
        if (cancelled) return;
        console.error('[ContributionCalendar] Failed to fetch contributions:', err);
        // Generate realistic placeholder data on error
        generatePlaceholderData();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    handleFetchContributions();
    return () => { cancelled = true; };
  }, [username, isInView]);

  const generatePlaceholderData = useCallback(() => {
    const placeholder: ContributionDay[] = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      placeholder.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 12),
        level: Math.floor(Math.random() * 5),
      });
    }
    setContributions(placeholder);
    setTotalContributions(placeholder.reduce((sum, d) => sum + d.count, 0));
  }, []);

  const contributionMap = new Map<string, number>();
  contributions.forEach(c => contributionMap.set(c.date, c.count));

  const today = new Date();
  const fullDays: { date: string; count: number; level: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = contributionMap.get(dateStr) ?? 0;
    fullDays.push({
      date: dateStr,
      count,
      level: count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4,
    });
  }

  const weeks: { date: string; count: number; level: number }[][] = [];
  let currentWeek: { date: string; count: number; level: number }[] = [];
  
  fullDays.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: 0, level: 0 });
    }
    weeks.push(currentWeek);
  }

  const totalWidth = weeks.length * CELL_SIZE;

  const levelPoints = [1, 3, 5, 10, 20];

  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Game loop
  useEffect(() => {
    if (!gameMode || gameOver) return;

    const gameLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Scale speed by base settings
      const currentSpeed = Math.min(
        BASE_SPEED + (scoreRef.current / 500) * 0.5, 
        MAX_SPEED
      );
      setGameSpeed(currentSpeed);
      setScrollOffset(prev => {
        const next = prev + currentSpeed * (delta / 16);
        if (next >= totalWidth) {
          setGameOver(true);
          return totalWidth;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameMode, gameOver, totalWidth]);

  // Show hint after entering game mode
  useEffect(() => {
    if (gameMode) {
      setShowHint(true);
      onGameModeChange?.(true);
      const t = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(t);
    } else {
      onGameModeChange?.(false);
    }
  }, [gameMode, onGameModeChange]);

  const handleCellBreak = useCallback((day: { date: string; count: number; level: number }, weekIdx: number, dayIdx: number) => {
    if (!gameMode || gameOver) return;
    if (!day.date) return;
    if (brokenCells.has(day.date)) return;

    const basePoints = levelPoints[day.level];
    const points = Math.floor(basePoints * (1 + combo * 0.1));
    setScore(prev => prev + points);
    setCombo(prev => prev + 1);
    setBrokenCells(prev => new Set([...prev, day.date]));

    // Spawn particles
    const particleId = Date.now() + Math.random();
    const screenX = weekIdx * CELL_SIZE - scrollOffset + 50;
    const screenY = dayIdx * CELL_SIZE + 30;
    setParticles(prev => [...prev, { id: particleId, x: screenX, y: screenY, points }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 800);
  }, [gameMode, gameOver, brokenCells, combo, scrollOffset]);

  const startGame = useCallback(() => {
    if (score > highScore) setHighScore(score);
    setScore(0);
    setCombo(0);
    setBrokenCells(new Set());
    setScrollOffset(0);
    setGameSpeed(1);
    setGameOver(false);
    setGameMode(true);
    setGameStartTime(Date.now());
  }, [score, highScore]);

  const exitGame = useCallback(() => {
    if (score > highScore) setHighScore(score);
    
    // Record game result and stats (using Medium as default difficulty)
    const gameTime = Date.now() - gameStartTime;
    recordGameResult(score, combo, GameDifficulty.Medium, gameTime);
    
    setGameMode(false);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setBrokenCells(new Set());
    setScrollOffset(0);
    setGameSpeed(1);
  }, [score, highScore, combo, gameStartTime, recordGameResult]);

  const toggleGame = useCallback(() => {
    if (gameMode) {
      exitGame();
    } else {
      startGame();
    }
  }, [gameMode, startGame, exitGame]);

  useImperativeHandle(ref, () => ({
    toggleGame,
    startGame,
    exitGame,
    isGameMode: gameMode,
  }), [toggleGame, startGame, exitGame, gameMode]);

  return (
    <div ref={sectionRef} className="w-full">
      {loading && !isInView ? (
        <div className="w-full h-32 bg-neutral-900/50 rounded-lg" />
      ) : loading ? (
        <div className="w-full h-32 bg-neutral-900/50 rounded-lg animate-pulse flex items-center justify-center">
          <svg className="w-6 h-6 text-cyan-900 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          {/* Header row: stats on left, mode button on right */}
          <div className="flex items-center justify-between mb-3 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {!gameMode && (
                <span className="text-xs text-neutral-500 font-mono truncate">
                  {totalContributions} contributions
                </span>
              )}
              {gameMode && (
                <div className="flex items-center gap-3">
                  <motion.span
                    className="text-sm font-bold text-cyan-400 whitespace-nowrap"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: combo > 0 ? Infinity : 0 }}
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    {score.toLocaleString()}
                  </motion.span>
                  {combo > 2 && (
                    <motion.span
                      className="text-[10px] font-mono text-orange-400 whitespace-nowrap"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={combo}
                    >
                      {combo}x
                    </motion.span>
                  )}
                  <span className="text-[10px] text-neutral-600 font-mono whitespace-nowrap">
                    {gameSpeed.toFixed(1)}x
                  </span>
                </div>
              )}
            </div>
            
            {/* Difficulty indicator + mode button */}
            {/* Button removed - game is controlled via "// break" in GitHubStats */}
          </div>

          {/* Grid container: holds both the grid and the right-aligned controls */}
          <div className="relative">
            {/* Right-aligned controls: progress bar only (button moved to GitHubStats) */}
            {gameMode && (
              <div className="absolute -right-1 top-0 flex items-center gap-2 z-10">
                <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min((scrollOffset / totalWidth) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-600 font-mono">
                  {brokenCells.size}
                </span>
              </div>
            )}

            {/* Legend - moved to bottom-left with padding */}
            <div className="absolute -left-4 -bottom-6 flex items-center gap-1.5 z-10">
              <span className="text-[10px] text-neutral-600 font-mono">Less</span>
              {LEVEL_COLORS.map((color, i) => (
                <div key={i} className={`w-[11px] h-[11px] rounded-sm ${color} ${LEVEL_GLOWS[i]}`} />
              ))}
              <span className="text-[10px] text-neutral-600 font-mono">More</span>
            </div>

            {/* Contribution grid with scrolling */}
            <div
              ref={containerRef}
              className="overflow-hidden rounded-lg relative pr-[140px]"
              style={{ height: `${7 * CELL_SIZE + 12}px` }}
            >
              {/* Scroll indicator line */}
              {gameMode && !gameOver && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-400 z-10 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              )}

              <motion.div
                className="flex gap-[3px]"
                style={{
                  transform: `translateX(${-scrollOffset}px)`,
                  transition: gameMode ? 'none' : 'transform 0.3s ease',
                }}
              >
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIdx) => {
                      const isBroken = brokenCells.has(day.date);
                      const hasData = !!day.date;
                      
                      return (
                        <motion.div
                          key={day.date || `empty-${weekIdx}-${dayIdx}`}
                          className={`w-[11px] h-[11px] rounded-sm transition-all duration-150 ${
                            gameMode && hasData && !isBroken && !gameOver
                              ? `${LEVEL_COLORS[day.level]} ${LEVEL_GLOWS[day.level]} cursor-crosshair hover:scale-[2] hover:brightness-150`
                              : isBroken
                              ? 'bg-transparent scale-0'
                              : `${LEVEL_COLORS[day.level]} ${LEVEL_GLOWS[day.level]} cursor-default`
                          }`}
                          title={hasData ? `${day.date}: ${day.count} contributions${gameMode ? ` (${levelPoints[day.level]}pts)` : ''}` : ''}
                          whileHover={gameMode && hasData && !isBroken && !gameOver ? { scale: 2 } : { scale: 1.3 }}
                          onClick={() => handleCellBreak(day, weekIdx, dayIdx)}
                        />
                      );
                    })}
                  </div>
                ))}
              </motion.div>

              {/* Break particles */}
              <AnimatePresence>
                {particles.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute pointer-events-none z-20"
                    style={{
                      left: `${particle.x}px`,
                      top: `${particle.y}px`,
                    }}
                  >
                    {/* Points popup */}
                    <motion.div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-400 whitespace-nowrap"
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.6 }}
                    >
                      +{particle.points}
                    </motion.div>
                    {/* Explosion particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: (Math.random() - 0.5) * 30,
                          y: (Math.random() - 0.5) * 30,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
      
      {/* Achievement Toast Notifications */}
      <AchievementToast
        achievements={newAchievements}
        onDismiss={clearNewAchievements}
      />
    </div>
  );
}));

export default ContributionCalendar;
