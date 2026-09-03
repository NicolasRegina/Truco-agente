import { WebSocket } from 'ws';
import { ClientMessage } from './protocol';
import { RoomManager } from './roomManager';

const MAX_MESSAGE_SIZE = 4096; // 4KB max payload size

export function setupSocketHandler(ws: WebSocket, roomManager: RoomManager) {
  let currentRoomId: string | null = null;
  let currentRole: 'p1' | 'p2' | null = null;

  ws.on('message', (rawData: string) => {
    try {
      if (rawData.length > MAX_MESSAGE_SIZE) {
        roomManager.send(ws, {
          type: 'ERROR',
          payload: { message: 'Tamaño de mensaje excedido' }
        });
        return;
      }

      const msg: ClientMessage = JSON.parse(rawData.toString());
      if (!msg || typeof msg.type !== 'string') {
        roomManager.send(ws, {
          type: 'ERROR',
          payload: { message: 'Formato de mensaje inválido' }
        });
        return;
      }

      switch (msg.type) {
        case 'FIND_MATCH': {
          const { playerName, config } = msg.payload || {};
          const safeConfig = {
            maxScore: config?.maxScore === 15 ? 15 : 30,
            withFlor: Boolean(config?.withFlor),
            p1Name: (playerName || 'Jugador 1').slice(0, 20),
            p2Name: 'Esperando...'
          };

          const res = roomManager.findMatch(playerName, safeConfig as any, ws);
          if (res.matched && res.room) {
            currentRoomId = res.room.id;
            currentRole = res.room.p2?.socket === ws ? 'p2' : 'p1';
          }
          break;
        }

        case 'CANCEL_MATCH': {
          roomManager.cancelMatch(ws);
          break;
        }

        case 'CREATE_ROOM': {
          const { playerName, config } = msg.payload || {};
          const safeConfig = {
            maxScore: config?.maxScore === 15 ? 15 : 30,
            withFlor: Boolean(config?.withFlor),
            p1Name: (playerName || 'Jugador 1').slice(0, 20),
            p2Name: 'Esperando...'
          };

          const { room, token } = roomManager.createRoom(playerName, safeConfig as any, ws);
          currentRoomId = room.id;
          currentRole = 'p1';

          roomManager.send(ws, {
            type: 'ROOM_CREATED',
            payload: {
              roomId: room.id,
              playerId: 'p1',
              token,
              config: room.config,
              p1Name: room.p1.name
            }
          });
          break;
        }

        case 'JOIN_ROOM': {
          const { roomId, playerName } = msg.payload || {};
          if (!roomId || typeof roomId !== 'string') {
            roomManager.send(ws, {
              type: 'ERROR',
              payload: { message: 'Código de sala inválido' }
            });
            return;
          }

          const result = roomManager.joinRoom(roomId.trim(), playerName, ws);
          if (!result) {
            roomManager.send(ws, {
              type: 'ERROR',
              payload: { message: 'No se pudo unir a la sala (sala inexistente o completa)' }
            });
            return;
          }

          currentRoomId = result.room.id;
          currentRole = result.playerId;

          roomManager.send(ws, {
            type: 'ROOM_JOINED',
            payload: {
              roomId: result.room.id,
              playerId: result.playerId,
              token: result.token,
              config: result.room.config,
              p1Name: result.room.p1.name,
              p2Name: result.room.p2?.name
            }
          });

          // Broadcast initial state to both players
          roomManager.broadcastState(result.room);
          break;
        }

        case 'RECONNECT': {
          const { roomId, playerId, token } = msg.payload || {};
          if (!roomId || !playerId || !token) {
            roomManager.send(ws, {
              type: 'ERROR',
              payload: { message: 'Datos de reconexión incompletos' }
            });
            return;
          }

          const room = roomManager.reconnect(roomId, playerId, token, ws);
          if (!room) {
            roomManager.send(ws, {
              type: 'ERROR',
              payload: { message: 'Fallo al reconectar (token inválido o expirado)' }
            });
            return;
          }

          currentRoomId = room.id;
          currentRole = playerId;

          roomManager.send(ws, {
            type: 'ROOM_JOINED',
            payload: {
              roomId: room.id,
              playerId,
              token,
              config: room.config,
              p1Name: room.p1.name,
              p2Name: room.p2?.name
            }
          });

          roomManager.broadcastState(room);
          break;
        }

        case 'GAME_ACTION': {
          const session = roomManager.getSessionBySocket(ws);
          if (!session) {
            roomManager.send(ws, { type: 'ERROR', payload: { message: 'No estás en una sala activa' } });
            return;
          }

          const action = msg.payload?.action;
          if (!action || typeof action.type !== 'string') {
            roomManager.send(ws, { type: 'ERROR', payload: { message: 'Acción malformada' } });
            return;
          }

          action.player = session.role; // Authoritative player enforcement
          const res = roomManager.executeAction(session.room.id, session.role, action);

          if (!res.success) {
            roomManager.send(ws, { type: 'ERROR', payload: { message: res.error } });
          }
          break;
        }

        case 'NEXT_HAND': {
          const session = roomManager.getSessionBySocket(ws);
          if (!session) return;
          const res = roomManager.nextHand(session.room.id, session.role);
          if (!res.success) {
            roomManager.send(ws, { type: 'ERROR', payload: { message: res.error } });
          }
          break;
        }

        case 'CHAT_MESSAGE': {
          const session = roomManager.getSessionBySocket(ws);
          if (!session) return;
          const senderName = session.role === 'p1' ? session.room.p1.name : (session.room.p2?.name || 'P2');
          roomManager.broadcastChat(session.room, senderName, String(msg.payload?.text || ''));
          break;
        }
      }
    } catch (err) {
      console.error('[SocketHandler] Error processing message:', err);
    }
  });

  ws.on('close', () => {
    roomManager.handleDisconnect(ws);
  });
}
