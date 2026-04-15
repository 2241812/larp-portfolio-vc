import {
  GameDifficulty,
  DIFFICULTY_SETTINGS,
  ACHIEVEMENTS,
  Achievement,
  LEVEL_POINTS,
  CELL_SIZE,
  VISIBLE_WIDTH,
  BASE_SPEED,
  MAX_SPEED,
  LEVEL_COLORS,
  LEVEL_GLOWS,
} from '@/constants/gameConstants';

describe('GameDifficulty enum', () => {
  it('has all four difficulty levels', () => {
    expect(GameDifficulty.Easy).toBe('easy');
    expect(GameDifficulty.Medium).toBe('medium');
    expect(GameDifficulty.Hard).toBe('hard');
    expect(GameDifficulty.Insane).toBe('insane');
  });
});

describe('DIFFICULTY_SETTINGS', () => {
  it('has settings for all four difficulties', () => {
    expect(DIFFICULTY_SETTINGS[GameDifficulty.Easy]).toBeDefined();
    expect(DIFFICULTY_SETTINGS[GameDifficulty.Medium]).toBeDefined();
    expect(DIFFICULTY_SETTINGS[GameDifficulty.Hard]).toBeDefined();
    expect(DIFFICULTY_SETTINGS[GameDifficulty.Insane]).toBeDefined();
  });

  it('has increasing baseSpeed across difficulties', () => {
    const easy = DIFFICULTY_SETTINGS[GameDifficulty.Easy].baseSpeed;
    const medium = DIFFICULTY_SETTINGS[GameDifficulty.Medium].baseSpeed;
    const hard = DIFFICULTY_SETTINGS[GameDifficulty.Hard].baseSpeed;
    const insane = DIFFICULTY_SETTINGS[GameDifficulty.Insane].baseSpeed;
    expect(easy).toBeLessThan(medium);
    expect(medium).toBeLessThan(hard);
    expect(hard).toBeLessThan(insane);
  });

  it('has increasing pointMultiplier across difficulties', () => {
    const easy = DIFFICULTY_SETTINGS[GameDifficulty.Easy].pointMultiplier;
    const medium = DIFFICULTY_SETTINGS[GameDifficulty.Medium].pointMultiplier;
    const hard = DIFFICULTY_SETTINGS[GameDifficulty.Hard].pointMultiplier;
    const insane = DIFFICULTY_SETTINGS[GameDifficulty.Insane].pointMultiplier;
    expect(easy).toBeLessThan(medium);
    expect(medium).toBeLessThan(hard);
    expect(hard).toBeLessThan(insane);
  });

  it('each setting has required fields', () => {
    Object.values(DIFFICULTY_SETTINGS).forEach((setting) => {
      expect(setting).toHaveProperty('baseSpeed');
      expect(setting).toHaveProperty('pointMultiplier');
      expect(setting).toHaveProperty('label');
      expect(setting).toHaveProperty('color');
      expect(setting).toHaveProperty('borderColor');
      expect(setting).toHaveProperty('glowColor');
    });
  });
});

describe('Achievement conditions', () => {
  describe('FirstBlood', () => {
    const { condition } = ACHIEVEMENTS[Achievement.FirstBlood];

    it('unlocks when score >= 10', () => {
      expect(condition(10, 0)).toBe(true);
      expect(condition(100, 0)).toBe(true);
    });

    it('does not unlock when score < 10', () => {
      expect(condition(9, 0)).toBe(false);
      expect(condition(0, 0)).toBe(false);
    });
  });

  describe('ComboMaster', () => {
    const { condition } = ACHIEVEMENTS[Achievement.ComboMaster];

    it('unlocks when combo >= 50', () => {
      expect(condition(0, 50)).toBe(true);
      expect(condition(0, 100)).toBe(true);
    });

    it('does not unlock when combo < 50', () => {
      expect(condition(0, 49)).toBe(false);
      expect(condition(1000, 0)).toBe(false);
    });
  });

  describe('SpeedRunner', () => {
    const { condition } = ACHIEVEMENTS[Achievement.SpeedRunner];

    it('unlocks on Hard difficulty under 30 seconds', () => {
      expect(condition(29000, GameDifficulty.Hard)).toBe(true);
    });

    it('does not unlock on Hard if time >= 30 seconds', () => {
      expect(condition(30000, GameDifficulty.Hard)).toBe(false);
      expect(condition(60000, GameDifficulty.Hard)).toBe(false);
    });

    it('does not unlock on non-Hard difficulty even if fast', () => {
      expect(condition(10000, GameDifficulty.Easy)).toBe(false);
      expect(condition(10000, GameDifficulty.Medium)).toBe(false);
      expect(condition(10000, GameDifficulty.Insane)).toBe(false);
    });
  });

  describe('PerfectWeek', () => {
    const { condition } = ACHIEVEMENTS[Achievement.PerfectWeek];

    it('unlocks when combo >= 7', () => {
      expect(condition(7)).toBe(true);
      expect(condition(10)).toBe(true);
    });

    it('does not unlock when combo < 7', () => {
      expect(condition(6)).toBe(false);
      expect(condition(0)).toBe(false);
    });
  });

  describe('ThousandPoints', () => {
    const { condition } = ACHIEVEMENTS[Achievement.ThousandPoints];

    it('unlocks when score >= 1000', () => {
      expect(condition(1000)).toBe(true);
      expect(condition(9999)).toBe(true);
    });

    it('does not unlock when score < 1000', () => {
      expect(condition(999)).toBe(false);
      expect(condition(0)).toBe(false);
    });
  });

  describe('GoldenStreak', () => {
    const { condition } = ACHIEVEMENTS[Achievement.GoldenStreak];

    it('unlocks when streak >= 5', () => {
      expect(condition(5)).toBe(true);
      expect(condition(10)).toBe(true);
    });

    it('does not unlock when streak < 5', () => {
      expect(condition(4)).toBe(false);
      expect(condition(0)).toBe(false);
    });
  });

  describe('ModeMastery', () => {
    const { condition } = ACHIEVEMENTS[Achievement.ModeMastery];

    it('unlocks when 4 modes are completed', () => {
      expect(condition(4)).toBe(true);
    });

    it('does not unlock when fewer than 4 modes completed', () => {
      expect(condition(3)).toBe(false);
      expect(condition(0)).toBe(false);
    });
  });
});

describe('Game constants', () => {
  it('CELL_SIZE is a positive number', () => {
    expect(CELL_SIZE).toBeGreaterThan(0);
  });

  it('VISIBLE_WIDTH is a positive number', () => {
    expect(VISIBLE_WIDTH).toBeGreaterThan(0);
  });

  it('BASE_SPEED is a positive number', () => {
    expect(BASE_SPEED).toBeGreaterThan(0);
  });

  it('MAX_SPEED is greater than BASE_SPEED', () => {
    expect(MAX_SPEED).toBeGreaterThan(BASE_SPEED);
  });

  it('LEVEL_POINTS has 5 entries (one per level)', () => {
    expect(LEVEL_POINTS).toHaveLength(5);
  });

  it('LEVEL_COLORS has 5 entries', () => {
    expect(LEVEL_COLORS).toHaveLength(5);
  });

  it('LEVEL_GLOWS has 5 entries', () => {
    expect(LEVEL_GLOWS).toHaveLength(5);
  });

  it('LEVEL_POINTS values are positive', () => {
    LEVEL_POINTS.forEach((points) => {
      expect(points).toBeGreaterThan(0);
    });
  });
});
