import { PlayerStats } from './types';

const STATS_STORAGE_KEY = 'truco_argentino_player_stats_v1';

export function getDefaultPlayerStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    bluffsAttempted: 0,
    bluffsSuccessful: 0,
    faltaEnvidoWon: 0,
    currentStreak: 0,
    maxStreak: 0
  };
}

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STATS_STORAGE_KEY) : null;
    if (raw) {
      return { ...getDefaultPlayerStats(), ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading player stats:', e);
  }
  return getDefaultPlayerStats();
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    }
  } catch (e) {
    console.error('Error saving player stats:', e);
  }
}

export function recordGameResult(stats: PlayerStats, won: boolean): PlayerStats {
  const newStats: PlayerStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
    gamesLost: won ? stats.gamesLost : stats.gamesLost + 1,
    currentStreak: won ? stats.currentStreak + 1 : 0,
    maxStreak: won ? Math.max(stats.maxStreak, stats.currentStreak + 1) : stats.maxStreak
  };
  savePlayerStats(newStats);
  return newStats;
}
