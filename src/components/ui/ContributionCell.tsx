import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { ContributionDay } from '@/hooks/useContributionData';
import { LEVEL_COLORS, LEVEL_GLOWS, CELL_CLASSES } from '@/constants/contributionCalendar';

interface ContributionCellProps {
  day: ContributionDay;
  gameMode: boolean;
  isBroken: boolean;
  isGameOver: boolean;
  levelPoints: number[];
  onClick: (day: ContributionDay) => void;
}

const ContributionCell = memo(function ContributionCell({
  day,
  gameMode,
  isBroken,
  isGameOver,
  levelPoints,
  onClick,
}: ContributionCellProps) {
  const hasData = !!day.date;
  const isInteractive = gameMode && hasData && !isBroken && !isGameOver;

  const cellClassName = `${CELL_CLASSES.base} ${
    isInteractive
      ? `${LEVEL_COLORS[day.level]} ${LEVEL_GLOWS[day.level]} ${CELL_CLASSES.interactive}`
      : isBroken
      ? CELL_CLASSES.broken
      : `${LEVEL_COLORS[day.level]} ${LEVEL_GLOWS[day.level]} ${CELL_CLASSES.default}`
  }`;

  const tooltipText = hasData
    ? `${day.date}: ${day.count} contributions${gameMode ? ` (${levelPoints[day.level]}pts)` : ''}`
    : '';

  return (
    <motion.div
      className={cellClassName}
      title={tooltipText}
      whileHover={isInteractive ? { scale: 2 } : { scale: 1.3 }}
      onClick={() => onClick(day)}
    />
  );
});

export default ContributionCell;
