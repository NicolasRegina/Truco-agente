export type Suit = 'espada' | 'basto' | 'oro' | 'copa';

export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;

export interface Card {
  readonly id: string; // e.g. "1_espada"
  readonly suit: Suit;
  readonly value: CardValue;
  readonly rank: number; // 1 (lowest = 4s) to 14 (highest = 1 de espada)
  readonly envidoValue: number; // 0 for 10,11,12; face value for 1-7
  readonly isCovered?: boolean; // True if played face-down ("Al bulto / tapada")
}

export type PlayerId = 'p1' | 'p2';

export type TrucoBetLevel = 'none' | 'truco' | 'retruco' | 'vale_cuatro';

export type EnvidoCallType =
  | 'envido'
  | 'real_envido'
  | 'falta_envido'
  | 'envido_envido';

export type FlorCallType =
  | 'flor'
  | 'contraflor'
  | 'contraflor_al_resto';

export type TrickWinner = PlayerId | 'parda';

export interface PlayedCard {
  readonly player: PlayerId;
  readonly card: Card;
  readonly isCovered?: boolean;
}

export interface Trick {
  readonly number: 1 | 2 | 3;
  readonly cards: PlayedCard[];
  readonly winner?: TrickWinner;
}

export type GamePhase =
  | 'waiting_action'
  | 'envido_pending'
  | 'flor_pending'
  | 'truco_pending'
  | 'hand_ended'
  | 'match_ended';

export type ActionType =
  | 'PLAY_CARD'
  | 'CALL_ENVIDO'
  | 'CALL_REAL_ENVIDO'
  | 'CALL_FALTA_ENVIDO'
  | 'CALL_FLOR'
  | 'CALL_CONTRAFLOR'
  | 'CALL_CONTRAFLOR_AL_RESTO'
  | 'CALL_TRUCO'
  | 'CALL_RETRUCO'
  | 'CALL_VALE_CUATRO'
  | 'QUIERO'
  | 'NO_QUIERO'
  | 'IRSE_AL_MAZO';

export interface GameAction {
  type: ActionType;
  player: PlayerId;
  card?: Card;
  isCovered?: boolean;
}

export interface ScoreState {
  p1: number;
  p2: number;
}

export interface EnvidoState {
  isResolved: boolean;
  history: EnvidoCallType[];
  currentCall: EnvidoCallType | null;
  caller: PlayerId | null;
  challengedPlayer: PlayerId | null;
  acceptedValue: number; // Points staked if accepted
  declinedValue: number; // Points awarded if rejected
  winner?: PlayerId;
  pointsAwarded?: number;
}

export interface FlorState {
  isResolved: boolean;
  history: FlorCallType[];
  currentCall: FlorCallType | null;
  caller: PlayerId | null;
  challengedPlayer: PlayerId | null;
  acceptedValue: number;
  declinedValue: number;
  winner?: PlayerId;
  pointsAwarded?: number;
}

export interface TrucoState {
  currentLevel: TrucoBetLevel;
  caller: PlayerId | null;
  challengedPlayer: PlayerId | null;
  pendingLevel: TrucoBetLevel | null;
  lastAcceptedBy: PlayerId | null;
}

export interface MatchConfig {
  maxScore: 15 | 30;
  withFlor: boolean;
  p1Name?: string;
  p2Name?: string;
}

export interface HandLogEntry {
  text: string;
  player?: PlayerId;
  type: 'canto' | 'play' | 'score' | 'info';
}

export interface GameState {
  config: MatchConfig;
  score: ScoreState;
  handNumber: number;
  dealer: PlayerId; // The player who deals (hand is opposite)
  mano: PlayerId;   // Hand player (plays first in trick 1 and breaks ties)
  turn: PlayerId;   // Whose turn it is to act/respond
  phase: GamePhase;

  // Cards
  hands: Record<PlayerId, Card[]>;
  playedCards: Record<PlayerId, Card[]>;

  // Tricks of the current hand
  tricks: Trick[];
  currentTrickIndex: number; // 0, 1, 2

  // Betting states
  envido: EnvidoState;
  flor: FlorState;
  truco: TrucoState;

  // Hand / Match outcome
  handWinner: PlayerId | null;
  matchWinner: PlayerId | null;
  
  // History log for UI
  logs: HandLogEntry[];
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  bluffsAttempted: number;
  bluffsSuccessful: number;
  faltaEnvidoWon: number;
  currentStreak: number;
  maxStreak: number;
}
