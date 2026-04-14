import { useCallback, useRef, useEffect, useReducer } from 'react';

// Game state reducer
interface GameState {
  gameMode: boolean;
  score: number;
  combo: number;
  highScore: number;
  scrollOffset: number;
  gameSpeed: number;
  gameOver: boolean;
  showHint: boolean;
  brokenCells: Set<string>;
}

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'EXIT_GAME' }
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'SET_COMBO'; payload: number }
  | { type: 'SET_SCROLL_OFFSET'; payload: number }
  | { type: 'SET_GAME_SPEED'; payload: number }
  | { type: 'SET_GAME_OVER'; payload: boolean }
  | { type: 'ADD_BROKEN_CELL'; payload: string }
  | { type: 'UPDATE_HIGH_SCORE'; payload: number };

const initialGameState: GameState = {
  gameMode: false,
  score: 0,
  combo: 0,
  highScore: 0,
  scrollOffset: 0,
  gameSpeed: 1,
  gameOver: false,
  showHint: false,
  brokenCells: new Set(),
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameMode: true,
        gameOver: false,
        score: 0,
        combo: 0,
        scrollOffset: 0,
        gameSpeed: 1,
        brokenCells: new Set(),
      };
    case 'EXIT_GAME':
      return {
        ...state,
        gameMode: false,
        gameOver: false,
        score: 0,
        combo: 0,
        brokenCells: new Set(),
      };
    case 'SET_SCORE':
      return { ...state, score: action.payload };
    case 'SET_COMBO':
      return { ...state, combo: action.payload };
    case 'SET_SCROLL_OFFSET':
      return { ...state, scrollOffset: action.payload };
    case 'SET_GAME_SPEED':
      return { ...state, gameSpeed: action.payload };
    case 'SET_GAME_OVER':
      return { ...state, gameOver: action.payload };
    case 'ADD_BROKEN_CELL':
      return {
        ...state,
        brokenCells: new Set([...state.brokenCells, action.payload]),
      };
    case 'UPDATE_HIGH_SCORE':
      return { ...state, highScore: Math.max(state.highScore, action.payload) };
    default:
      return state;
  }
};

interface UseContributionGameProps {
  totalWidth: number;
  levelPoints: number[];
}

export const useContributionGame = ({ totalWidth, levelPoints }: UseContributionGameProps) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const scoreRef = useRef(state.score);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Game loop
  useEffect(() => {
    if (!state.gameMode || state.gameOver) return;

    const gameLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const currentSpeed = Math.min(0.3 + (scoreRef.current / 500) * 0.5, 4);
      dispatch({ type: 'SET_GAME_SPEED', payload: currentSpeed });
      
      const newOffset = state.scrollOffset + currentSpeed * (delta / 16);
      if (newOffset >= totalWidth) {
        dispatch({ type: 'SET_GAME_OVER', payload: true });
        dispatch({ type: 'UPDATE_HIGH_SCORE', payload: state.score });
      } else {
        dispatch({ type: 'SET_SCROLL_OFFSET', payload: newOffset });
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state.gameMode, state.gameOver, totalWidth, state.scrollOffset, state.score]);

  // Sync score ref
  useEffect(() => {
    scoreRef.current = state.score;
  }, [state.score]);

  // Show hint
  useEffect(() => {
    if (state.gameMode) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_COMBO', payload: state.combo });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.gameMode]);

  const handleCellBreak = useCallback((dateStr: string) => {
    if (!state.gameMode || state.gameOver || state.brokenCells.has(dateStr)) return;

    const basePoints = levelPoints[Math.floor(Math.random() * levelPoints.length)];
    const points = basePoints * (1 + Math.floor(state.combo / 5));

    dispatch({ type: 'SET_SCORE', payload: state.score + points });
    dispatch({ type: 'SET_COMBO', payload: state.combo + 1 });
    dispatch({ type: 'ADD_BROKEN_CELL', payload: dateStr });

    return points;
  }, [state.gameMode, state.gameOver, state.brokenCells, state.combo, state.score, levelPoints]);

  const startGame = useCallback(() => {
    dispatch({ type: 'UPDATE_HIGH_SCORE', payload: state.score });
    dispatch({ type: 'START_GAME' });
  }, [state.score]);

  const exitGame = useCallback(() => {
    dispatch({ type: 'UPDATE_HIGH_SCORE', payload: state.score });
    dispatch({ type: 'EXIT_GAME' });
  }, [state.score]);

  return {
    ...state,
    handleCellBreak,
    startGame,
    exitGame,
  };
};
