export type MissionCategory = 'config' | 'envido' | 'truco' | 'social';

export interface MissionDefinition {
  id: string;
  category: MissionCategory;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  eventKey: string;
}

export const MISSIONS_POOL: MissionDefinition[] = [
  {
    id: 'mesa_a_medida',
    category: 'config',
    title: 'Mesa a medida',
    description: 'Jugá una partida personalizada (15 pts, con Flor o contra el bot)',
    target: 1,
    rewardCoins: 3,
    eventKey: 'custom_game'
  },
  {
    id: 'encuentro_pulperia',
    category: 'config',
    title: 'Encuentro en la Pulpería',
    description: 'Completá 2 partidas en cualquier modalidad',
    target: 2,
    rewardCoins: 3,
    eventKey: 'play_match'
  },
  {
    id: 'duelo_gaucho',
    category: 'config',
    title: 'Duelo Gaucho',
    description: 'Jugá una partida en línea o contra el bot',
    target: 1,
    rewardCoins: 3,
    eventKey: 'hard_or_online_match'
  },
  {
    id: 'tanto_bravo',
    category: 'envido',
    title: 'Tanto Bravo',
    description: 'Cantá y ganá un Envido o Real Envido',
    target: 1,
    rewardCoins: 3,
    eventKey: 'win_envido'
  },
  {
    id: 'envido_primero',
    category: 'envido',
    title: 'El Envido está Primero',
    description: 'Sumá al menos 28 puntos de envido en una mano',
    target: 1,
    rewardCoins: 3,
    eventKey: 'high_envido'
  },
  {
    id: 'coraje_criollo',
    category: 'envido',
    title: 'Coraje Criollo',
    description: 'Aceptá una Falta Envido (¡Quiero!)',
    target: 1,
    rewardCoins: 3,
    eventKey: 'accept_falta_envido'
  },
  {
    id: 'retruco_al_pecho',
    category: 'truco',
    title: '¡Retruco, Carajo!',
    description: 'Cantá Retruco o Vale Cuatro en cualquier mano',
    target: 1,
    rewardCoins: 3,
    eventKey: 'call_retruco'
  },
  {
    id: 'arte_del_engano',
    category: 'truco',
    title: 'El Arte del Engaño',
    description: 'Ganá una mano jugando al menos una carta tapada ("al bulto")',
    target: 1,
    rewardCoins: 3,
    eventKey: 'win_covered_card'
  },
  {
    id: 'cebate_otro',
    category: 'social',
    title: 'Cebate Otro',
    description: 'Tomá 3 mates interactivos durante tus partidas',
    target: 3,
    rewardCoins: 3,
    eventKey: 'drink_mate'
  },
  {
    id: 'picardia_criolla',
    category: 'social',
    title: 'Picardía Criolla',
    description: 'Enviá 2 dichos criollos desde la rueda de chat',
    target: 2,
    rewardCoins: 3,
    eventKey: 'send_emote'
  }
];

/**
 * Deterministic pseudo-random selection based on date string (YYYY-MM-DD).
 * Ensures all players get the exact same 3 daily missions each day.
 */
export function getDailyMissionsForDate(dateStr: string): MissionDefinition[] {
  // Simple integer hash of date string
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  // Group by category to pick diverse missions
  const configGroup = MISSIONS_POOL.filter(m => m.category === 'config');
  const envidoGroup = MISSIONS_POOL.filter(m => m.category === 'envido');
  const trucoSocialGroup = MISSIONS_POOL.filter(m => m.category === 'truco' || m.category === 'social');

  const m1 = configGroup[hash % configGroup.length];
  const m2 = envidoGroup[(hash >> 2) % envidoGroup.length];
  const m3 = trucoSocialGroup[(hash >> 4) % trucoSocialGroup.length];

  return [m1, m2, m3];
}
