import {
  applyAction,
  createInitialGameState,
  GameAction,
  GameState,
  getAvailableActions,
  MatchConfig,
  PlayerId,
  startNextHand
} from '@truco/core';
import { WebSocket } from 'ws';
import { ServerMessage } from './protocol';

export interface PlayerSession {
  id: PlayerId;
  name: string;
  token: string;
  socket?: WebSocket;
  connected: boolean;
  disconnectTimeout?: NodeJS.Timeout;
}

export interface GameRoom {
  id: string;
  config: MatchConfig;
  createdAt: number;
  lastActivity: number;
  p1: PlayerSession;
  p2?: PlayerSession;
  gameState?: GameState;
  spectators: { id: string; socket: WebSocket }[];
  turnTimer?: NodeJS.Timeout;
  turnExpiresAt?: number;
}

const TURN_TIMEOUT_MS = 30000; // 30s per turn
const DISCONNECT_GRACE_MS = 30000; // 30s grace period for reconnects
const ROOM_MAX_IDLE_MS = 1000 * 60 * 60; // 1 hour room GC

export interface QueuedPlayer {
  socket: WebSocket;
  playerName: string;
  config: MatchConfig;
  joinedAt: number;
}

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private matchmakingQueue: QueuedPlayer[] = [];

  constructor() {
    // Background garbage collection for inactive rooms
    setInterval(() => this.cleanupInactiveRooms(), 60000);
  }

  public findMatch(playerName: string, config: MatchConfig, socket: WebSocket): { matched: boolean; room?: GameRoom } {
    // Clean queue of disconnected sockets
    this.matchmakingQueue = this.matchmakingQueue.filter(
      q => q.socket.readyState === WebSocket.OPEN && q.socket !== socket
    );

    if (this.matchmakingQueue.length > 0) {
      const waiting = this.matchmakingQueue.shift()!;

      const matchConfig: MatchConfig = {
        maxScore: config.maxScore === 15 ? 15 : 30,
        withFlor: Boolean(config.withFlor),
        p1Name: waiting.playerName,
        p2Name: (playerName || 'Jugador 2').slice(0, 20)
      };

      const { room, token: p1Token } = this.createRoom(waiting.playerName, matchConfig, waiting.socket);
      const joinRes = this.joinRoom(room.id, playerName, socket);

      (waiting.socket as any).currentRoomId = room.id;
      (waiting.socket as any).currentRole = 'p1';
      (socket as any).currentRoomId = room.id;
      (socket as any).currentRole = 'p2';

      // Notify Player 1
      this.send(waiting.socket, {
        type: 'MATCH_FOUND',
        payload: {
          roomId: room.id,
          playerId: 'p1',
          token: p1Token,
          config: room.config,
          p1Name: room.p1.name,
          p2Name: joinRes?.room.p2?.name
        }
      });

      // Notify Player 2
      this.send(socket, {
        type: 'MATCH_FOUND',
        payload: {
          roomId: room.id,
          playerId: 'p2',
          token: joinRes!.token,
          config: room.config,
          p1Name: room.p1.name,
          p2Name: joinRes?.room.p2?.name
        }
      });

      // Start state for both players
      this.broadcastState(room);

      return { matched: true, room };
    } else {
      this.matchmakingQueue.push({
        socket,
        playerName: (playerName || 'Jugador 1').slice(0, 20),
        config,
        joinedAt: Date.now()
      });

      this.send(socket, {
        type: 'SEARCHING_MATCH',
        payload: { message: 'Buscando rival online...' }
      });

      return { matched: false };
    }
  }

  public cancelMatch(socket: WebSocket) {
    this.matchmakingQueue = this.matchmakingQueue.filter(q => q.socket !== socket);
  }

  public createRoom(p1Name: string, config: MatchConfig, socket: WebSocket): { room: GameRoom; token: string } {
    const roomId = this.generateRoomId();
    const token = this.generateToken();

    const room: GameRoom = {
      id: roomId,
      config,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      p1: {
        id: 'p1',
        name: (p1Name || 'Jugador 1').slice(0, 20),
        token,
        socket,
        connected: true
      },
      spectators: []
    };

    (socket as any).currentRoomId = roomId;
    (socket as any).currentRole = 'p1';

    this.rooms.set(roomId, room);
    return { room, token };
  }

  public joinRoom(roomId: string, p2Name: string, socket: WebSocket): { room: GameRoom; token: string; playerId: PlayerId } | null {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) return null;

    if (!room.p2) {
      const token = this.generateToken();
      room.p2 = {
        id: 'p2',
        name: (p2Name || 'Jugador 2').slice(0, 20),
        token,
        socket,
        connected: true
      };
      room.lastActivity = Date.now();

      (socket as any).currentRoomId = roomId;
      (socket as any).currentRole = 'p2';

      // Auto start game when 2nd player joins
      room.config.p1Name = room.p1.name;
      room.config.p2Name = room.p2.name;
      room.gameState = createInitialGameState(room.config);

      this.resetTurnTimer(room);

      return { room, token, playerId: 'p2' };
    }

    return null;
  }

  public reconnect(roomId: string, playerId: PlayerId, token: string, socket: WebSocket): GameRoom | null {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) return null;

    const player = playerId === 'p1' ? room.p1 : room.p2;
    if (!player || player.token !== token) return null;

    if (player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
      player.disconnectTimeout = undefined;
    }

    (socket as any).currentRoomId = roomId;
    (socket as any).currentRole = playerId;

    player.socket = socket;
    player.connected = true;
    room.lastActivity = Date.now();

    return room;
  }

  public handleDisconnect(socket: WebSocket): { room?: GameRoom; player?: PlayerSession } {
    this.cancelMatch(socket);
    for (const room of this.rooms.values()) {
      if (room.p1.socket === socket) {
        room.p1.connected = false;
        room.p1.socket = undefined;
        this.scheduleDisconnectForfeit(room, 'p1');
        return { room, player: room.p1 };
      }
      if (room.p2 && room.p2.socket === socket) {
        room.p2.connected = false;
        room.p2.socket = undefined;
        this.scheduleDisconnectForfeit(room, 'p2');
        return { room, player: room.p2 };
      }
    }
    return {};
  }

  private scheduleDisconnectForfeit(room: GameRoom, disconnectedPlayer: PlayerId) {
    const player = disconnectedPlayer === 'p1' ? room.p1 : room.p2!;
    const otherPlayer = disconnectedPlayer === 'p1' ? room.p2 : room.p1;

    player.disconnectTimeout = setTimeout(() => {
      if (!player.connected && room.gameState && !room.gameState.matchWinner) {
        const winner = disconnectedPlayer === 'p1' ? 'p2' : 'p1';
        room.gameState.matchWinner = winner;
        room.gameState.phase = 'match_ended';
        room.gameState.logs.push({
          text: `Partida finalizada por desconexión de ${player.name}. Ganador: ${otherPlayer?.name || 'Oponente'}.`,
          type: 'info'
        });
        this.clearTurnTimer(room);
        this.broadcastState(room);
      }
    }, DISCONNECT_GRACE_MS);
  }

  public executeAction(roomId: string, playerId: PlayerId, action: GameAction): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      return { success: false, error: 'Partida no iniciada' };
    }

    if (room.gameState.phase === 'hand_ended' || room.gameState.phase === 'match_ended') {
      return { success: false, error: 'La mano o partida ya finalizó' };
    }

    if (room.gameState.turn !== playerId) {
      return { success: false, error: 'No es tu turno' };
    }

    // Authoritative check: verify action is in getAvailableActions
    const available = getAvailableActions(room.gameState, playerId);
    if (!available.includes(action.type)) {
      return { success: false, error: `Acción ilegal (${action.type}) en este momento` };
    }

    try {
      room.gameState = applyAction(room.gameState, action);
      room.lastActivity = Date.now();

      if (room.gameState.phase === 'hand_ended' || room.gameState.phase === 'match_ended') {
        this.clearTurnTimer(room);
      } else {
        this.resetTurnTimer(room);
      }

      this.broadcastState(room);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Jugada inválida' };
    }
  }

  public nextHand(roomId: string, _playerId: PlayerId): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) return { success: false, error: 'Partida no encontrada' };

    if (room.gameState.phase !== 'hand_ended') {
      return { success: false, error: 'La mano actual todavía no ha terminado' };
    }

    try {
      room.gameState = startNextHand(room.gameState);
      room.lastActivity = Date.now();
      this.resetTurnTimer(room);
      this.broadcastState(room);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  private resetTurnTimer(room: GameRoom) {
    this.clearTurnTimer(room);

    if (!room.gameState || room.gameState.phase === 'hand_ended' || room.gameState.phase === 'match_ended') {
      return;
    }

    const currentTurn = room.gameState.turn;
    room.turnExpiresAt = Date.now() + TURN_TIMEOUT_MS;

    room.turnTimer = setTimeout(() => {
      // Auto-fold (irse al mazo) on timeout
      if (room.gameState && room.gameState.turn === currentTurn && room.gameState.phase !== 'hand_ended' && room.gameState.phase !== 'match_ended') {
        const actingName = currentTurn === 'p1' ? room.p1.name : (room.p2?.name || 'P2');
        room.gameState.logs.push({
          text: `Tiempo agotado para ${actingName}. Se va al mazo automáticamente.`,
          type: 'info'
        });

        try {
          room.gameState = applyAction(room.gameState, { type: 'IRSE_AL_MAZO', player: currentTurn });
          this.clearTurnTimer(room);
          this.broadcastState(room);
        } catch (e) {
          console.error('Error handling turn timeout fold', e);
        }
      }
    }, TURN_TIMEOUT_MS);
  }

  private clearTurnTimer(room: GameRoom) {
    if (room.turnTimer) {
      clearTimeout(room.turnTimer);
      room.turnTimer = undefined;
      room.turnExpiresAt = undefined;
    }
  }

  public getSessionBySocket(socket: WebSocket): { room: GameRoom; role: PlayerId } | null {
    // 1. Direct socket metadata
    const metaRoomId = (socket as any).currentRoomId;
    const metaRole = (socket as any).currentRole;
    if (metaRoomId && metaRole) {
      const room = this.rooms.get(metaRoomId.toUpperCase());
      if (room) {
        return { room, role: metaRole };
      }
    }

    // 2. Authoritative room scan
    for (const room of this.rooms.values()) {
      if (room.p1.socket === socket) {
        (socket as any).currentRoomId = room.id;
        (socket as any).currentRole = 'p1';
        return { room, role: 'p1' };
      }
      if (room.p2 && room.p2.socket === socket) {
        (socket as any).currentRoomId = room.id;
        (socket as any).currentRole = 'p2';
        return { room, role: 'p2' };
      }
    }
    return null;
  }

  public broadcastState(room: GameRoom) {
    if (!room.gameState) return;

    // Send personalized state to P1 (hiding P2's hidden hand cards)
    if (room.p1.socket && room.p1.connected) {
      const p1View = this.sanitizeStateForPlayer(room.gameState, 'p1');
      this.send(room.p1.socket, { type: 'GAME_STATE', payload: { ...p1View, yourPlayerId: 'p1' } });
    }

    // Send personalized state to P2 (hiding P1's hidden hand cards)
    if (room.p2?.socket && room.p2.connected) {
      const p2View = this.sanitizeStateForPlayer(room.gameState, 'p2');
      this.send(room.p2.socket, { type: 'GAME_STATE', payload: { ...p2View, yourPlayerId: 'p2' } });
    }
  }

  public sanitizeStateForPlayer(gameState: GameState, viewingPlayer: PlayerId): GameState {
    const copy: GameState = JSON.parse(JSON.stringify(gameState));
    const opponent: PlayerId = viewingPlayer === 'p1' ? 'p2' : 'p1';

    // Mask opponent's remaining private hand cards (send only count/placeholders unless game/hand ended)
    if (copy.phase !== 'hand_ended' && copy.phase !== 'match_ended') {
      copy.hands[opponent] = copy.hands[opponent].map((c, idx) => ({
        id: `hidden_card_${idx}`,
        suit: 'copa',
        value: 4,
        rank: 14,
        envidoValue: 4
      }));
    }

    return copy;
  }

  public broadcastChat(room: GameRoom, senderName: string, text: string) {
    // Sanitize chat string
    const cleanText = text.slice(0, 150).trim();
    if (!cleanText) return;

    const msg: ServerMessage = {
      type: 'CHAT_BROADCAST',
      payload: { sender: senderName, text: cleanText, timestamp: Date.now() }
    };

    if (room.p1.socket && room.p1.connected) this.send(room.p1.socket, msg);
    if (room.p2?.socket && room.p2.connected) this.send(room.p2.socket, msg);
  }

  public send(socket: WebSocket, message: ServerMessage) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }

  private cleanupInactiveRooms() {
    const now = Date.now();
    for (const [id, room] of this.rooms.entries()) {
      if (now - room.lastActivity > ROOM_MAX_IDLE_MS) {
        this.clearTurnTimer(room);
        if (room.p1.disconnectTimeout) clearTimeout(room.p1.disconnectTimeout);
        if (room.p2?.disconnectTimeout) clearTimeout(room.p2.disconnectTimeout);
        this.rooms.delete(id);
      }
    }
  }

  private generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
