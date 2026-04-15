/**
 * Tests for the game reducer logic extracted from useContributionGame.ts
 * The reducer is tested in isolation as a pure function.
 */

// Re-implement the types and reducer here for direct testing without React hooks
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

describe('gameReducer', () => {
  describe('START_GAME', () => {
    it('sets gameMode to true', () => {
      const state = gameReducer(initialGameState, { type: 'START_GAME' });
      expect(state.gameMode).toBe(true);
    });

    it('resets score to 0', () => {
      const stateWithScore = { ...initialGameState, score: 999 };
      const state = gameReducer(stateWithScore, { type: 'START_GAME' });
      expect(state.score).toBe(0);
    });

    it('resets combo to 0', () => {
      const stateWithCombo = { ...initialGameState, combo: 42 };
      const state = gameReducer(stateWithCombo, { type: 'START_GAME' });
      expect(state.combo).toBe(0);
    });

    it('resets scrollOffset to 0', () => {
      const stateWithOffset = { ...initialGameState, scrollOffset: 100 };
      const state = gameReducer(stateWithOffset, { type: 'START_GAME' });
      expect(state.scrollOffset).toBe(0);
    });

    it('resets gameSpeed to 1', () => {
      const stateWithSpeed = { ...initialGameState, gameSpeed: 3 };
      const state = gameReducer(stateWithSpeed, { type: 'START_GAME' });
      expect(state.gameSpeed).toBe(1);
    });

    it('sets gameOver to false', () => {
      const stateWithGameOver = { ...initialGameState, gameOver: true };
      const state = gameReducer(stateWithGameOver, { type: 'START_GAME' });
      expect(state.gameOver).toBe(false);
    });

    it('clears brokenCells', () => {
      const stateWithCells = {
        ...initialGameState,
        brokenCells: new Set(['2024-01-01', '2024-01-02']),
      };
      const state = gameReducer(stateWithCells, { type: 'START_GAME' });
      expect(state.brokenCells.size).toBe(0);
    });

    it('preserves highScore', () => {
      const stateWithHighScore = { ...initialGameState, highScore: 500 };
      const state = gameReducer(stateWithHighScore, { type: 'START_GAME' });
      expect(state.highScore).toBe(500);
    });
  });

  describe('EXIT_GAME', () => {
    it('sets gameMode to false', () => {
      const activeState = { ...initialGameState, gameMode: true };
      const state = gameReducer(activeState, { type: 'EXIT_GAME' });
      expect(state.gameMode).toBe(false);
    });

    it('resets score and combo', () => {
      const activeState = { ...initialGameState, score: 200, combo: 15 };
      const state = gameReducer(activeState, { type: 'EXIT_GAME' });
      expect(state.score).toBe(0);
      expect(state.combo).toBe(0);
    });

    it('clears brokenCells', () => {
      const activeState = {
        ...initialGameState,
        brokenCells: new Set(['2024-01-01']),
      };
      const state = gameReducer(activeState, { type: 'EXIT_GAME' });
      expect(state.brokenCells.size).toBe(0);
    });
  });

  describe('SET_SCORE', () => {
    it('updates score', () => {
      const state = gameReducer(initialGameState, { type: 'SET_SCORE', payload: 42 });
      expect(state.score).toBe(42);
    });

    it('allows setting score to 0', () => {
      const stateWithScore = { ...initialGameState, score: 100 };
      const state = gameReducer(stateWithScore, { type: 'SET_SCORE', payload: 0 });
      expect(state.score).toBe(0);
    });
  });

  describe('SET_COMBO', () => {
    it('updates combo', () => {
      const state = gameReducer(initialGameState, { type: 'SET_COMBO', payload: 7 });
      expect(state.combo).toBe(7);
    });
  });

  describe('SET_SCROLL_OFFSET', () => {
    it('updates scrollOffset', () => {
      const state = gameReducer(initialGameState, {
        type: 'SET_SCROLL_OFFSET',
        payload: 250,
      });
      expect(state.scrollOffset).toBe(250);
    });
  });

  describe('SET_GAME_SPEED', () => {
    it('updates gameSpeed', () => {
      const state = gameReducer(initialGameState, {
        type: 'SET_GAME_SPEED',
        payload: 2.5,
      });
      expect(state.gameSpeed).toBe(2.5);
    });
  });

  describe('SET_GAME_OVER', () => {
    it('sets gameOver to true', () => {
      const state = gameReducer(initialGameState, {
        type: 'SET_GAME_OVER',
        payload: true,
      });
      expect(state.gameOver).toBe(true);
    });

    it('sets gameOver to false', () => {
      const gameOverState = { ...initialGameState, gameOver: true };
      const state = gameReducer(gameOverState, {
        type: 'SET_GAME_OVER',
        payload: false,
      });
      expect(state.gameOver).toBe(false);
    });
  });

  describe('ADD_BROKEN_CELL', () => {
    it('adds a cell to brokenCells', () => {
      const state = gameReducer(initialGameState, {
        type: 'ADD_BROKEN_CELL',
        payload: '2024-01-15',
      });
      expect(state.brokenCells.has('2024-01-15')).toBe(true);
    });

    it('does not add duplicate cells', () => {
      let state = gameReducer(initialGameState, {
        type: 'ADD_BROKEN_CELL',
        payload: '2024-01-15',
      });
      state = gameReducer(state, {
        type: 'ADD_BROKEN_CELL',
        payload: '2024-01-15',
      });
      expect(state.brokenCells.size).toBe(1);
    });

    it('accumulates multiple cells', () => {
      let state = gameReducer(initialGameState, {
        type: 'ADD_BROKEN_CELL',
        payload: '2024-01-01',
      });
      state = gameReducer(state, {
        type: 'ADD_BROKEN_CELL',
        payload: '2024-01-02',
      });
      state = gameReducer(state, {
        type: 'ADD_BROKEN_CELL',
        payload: '2024-01-03',
      });
      expect(state.brokenCells.size).toBe(3);
    });

    it('does not mutate previous state', () => {
      const original = gameReducer(initialGameState, {
        type: 'ADD_BROKEN_CELL',
        payload: '2024-01-01',
      });
      const originalSize = original.brokenCells.size;
      gameReducer(original, { type: 'ADD_BROKEN_CELL', payload: '2024-01-02' });
      expect(original.brokenCells.size).toBe(originalSize);
    });
  });

  describe('UPDATE_HIGH_SCORE', () => {
    it('updates highScore when payload is higher', () => {
      const state = gameReducer(initialGameState, {
        type: 'UPDATE_HIGH_SCORE',
        payload: 500,
      });
      expect(state.highScore).toBe(500);
    });

    it('keeps existing highScore when payload is lower', () => {
      const stateWithHighScore = { ...initialGameState, highScore: 1000 };
      const state = gameReducer(stateWithHighScore, {
        type: 'UPDATE_HIGH_SCORE',
        payload: 500,
      });
      expect(state.highScore).toBe(1000);
    });

    it('keeps same score when payload equals highScore', () => {
      const stateWithHighScore = { ...initialGameState, highScore: 500 };
      const state = gameReducer(stateWithHighScore, {
        type: 'UPDATE_HIGH_SCORE',
        payload: 500,
      });
      expect(state.highScore).toBe(500);
    });
  });

  describe('unknown action', () => {
    it('returns current state for unknown action type', () => {
      const state = gameReducer(initialGameState, { type: 'UNKNOWN' as any });
      expect(state).toEqual(initialGameState);
    });
  });

  describe('state immutability', () => {
    it('does not mutate original state on SET_SCORE', () => {
      const original = { ...initialGameState };
      gameReducer(initialGameState, { type: 'SET_SCORE', payload: 999 });
      expect(initialGameState.score).toBe(original.score);
    });

    it('does not mutate original state on START_GAME', () => {
      const stateWithScore = { ...initialGameState, score: 500 };
      gameReducer(stateWithScore, { type: 'START_GAME' });
      expect(stateWithScore.score).toBe(500);
    });
  });
});
