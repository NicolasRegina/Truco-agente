import { GameAction, GameState, MatchConfig, PlayerId } from '@truco/core';

export type ClientMessageType =
  | 'CREATE_ROOM'
  | 'JOIN_ROOM'
  | 'RECONNECT'
  | 'GAME_ACTION'
  | 'START_GAME'
  | 'NEXT_HAND'
  | 'CHAT_MESSAGE'
  | 'LEAVE_ROOM';

export interface CreateRoomPayload {
  playerName: string;
  config: MatchConfig;
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
}

export interface ReconnectPayload {
  roomId: string;
  playerId: PlayerId;
  token: string;
}

export interface GameActionPayload {
  action: GameAction;
}

export interface ChatMessagePayload {
  text: string;
}

export interface ClientMessage {
  type: ClientMessageType;
  payload?: any;
}

export type ServerMessageType =
  | 'ROOM_CREATED'
  | 'ROOM_JOINED'
  | 'GAME_STATE'
  | 'PLAYER_DISCONNECTED'
  | 'PLAYER_RECONNECTED'
  | 'CHAT_BROADCAST'
  | 'ERROR'
  | 'TURN_TIMER';

export interface RoomJoinedPayload {
  roomId: string;
  playerId: PlayerId;
  token: string;
  config: MatchConfig;
  p1Name: string;
  p2Name?: string;
}

export interface ServerMessage {
  type: ServerMessageType;
  payload: any;
}
