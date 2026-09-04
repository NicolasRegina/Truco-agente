import { useState, useEffect, useRef, useCallback } from 'react';
import {
  applyAction,
  chooseBotAction,
  createInitialGameState,
  GameAction,
  GameState,
  MatchConfig,
  PlayerId,
  startNextHand,
  BotDifficulty,
  loadPlayerStats,
  recordGameResult
} from '@truco/core';

export interface UseGameEngineOptions {
  mode: 'ai' | 'local' | 'online';
  config: MatchConfig;
  aiDifficulty?: BotDifficulty;
  roomId?: string;
  myPlayerId?: PlayerId;
  isMatchmaking?: boolean;
  wsUrl?: string;
}

export function useGameEngine({
  mode,
  config,
  aiDifficulty = 'canchero',
  roomId,
  myPlayerId = 'p1',
  isMatchmaking = false,
  wsUrl = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'wss://truquero.onrender.com' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:3001`)
}: UseGameEngineOptions) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(config));
  const [activePlayerId, setActivePlayerId] = useState<PlayerId>(myPlayerId);
  const [connected, setConnected] = useState(false);
  const [onlineRoomId, setOnlineRoomId] = useState<string | undefined>(roomId);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Sync activePlayerId with myPlayerId prop
  useEffect(() => {
    setActivePlayerId(myPlayerId);
  }, [myPlayerId]);

  // Clean reset when switching to a new offline game
  useEffect(() => {
    if (mode === 'ai' || mode === 'local') {
      setGameState(createInitialGameState(config));
      setIsWaitingForOpponent(false);
      setIsSearchingMatch(false);
    }
  }, [mode, config.maxScore, config.withFlor, config.p1Name, config.p2Name]);

  // Track match end and update stats
  useEffect(() => {
    if (gameState.matchWinner) {
      const stats = loadPlayerStats();
      const didWin = gameState.matchWinner === activePlayerId;
      recordGameResult(stats, didWin);
    }
  }, [gameState.matchWinner, activePlayerId]);

  // ----------------------------------------------------
  // ONLINE WEBSOCKET MODE
  // ----------------------------------------------------
  useEffect(() => {
    if (mode !== 'online') return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
    } catch (e) {
      console.error('Error creating WebSocket connection to', wsUrl, e);
      alert(`No se pudo conectar al servidor de juego en: ${wsUrl}`);
      return;
    }

    ws.onopen = () => {
      setConnected(true);
      if (isMatchmaking) {
        // Public Matchmaking Queue
        setIsSearchingMatch(true);
        setIsWaitingForOpponent(false);
        ws.send(
          JSON.stringify({
            type: 'FIND_MATCH',
            payload: { playerName: config.p1Name || 'Jugador 1', config }
          })
        );
      } else if (roomId) {
        // Join existing room
        setIsWaitingForOpponent(false);
        setIsSearchingMatch(false);
        ws.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            payload: { roomId, playerName: config.p2Name || 'Jugador 2' }
          })
        );
      } else {
        // Create new private room (waiting for P2)
        setIsWaitingForOpponent(true);
        setIsSearchingMatch(false);
        ws.send(
          JSON.stringify({
            type: 'CREATE_ROOM',
            payload: { playerName: config.p1Name || 'Jugador 1', config }
          })
        );
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket connection error on', wsUrl, event);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'SEARCHING_MATCH') {
          setIsSearchingMatch(true);
          setIsWaitingForOpponent(false);
        } else if (msg.type === 'MATCH_FOUND') {
          setIsSearchingMatch(false);
          setOnlineRoomId(msg.payload.roomId);
          if (msg.payload.playerId) {
            setActivePlayerId(msg.payload.playerId);
          }
        } else if (msg.type === 'ROOM_CREATED') {
          setOnlineRoomId(msg.payload.roomId);
          setActivePlayerId('p1');
          setIsWaitingForOpponent(true);
        } else if (msg.type === 'ROOM_JOINED') {
          setOnlineRoomId(msg.payload.roomId);
          if (msg.payload.playerId) {
            setActivePlayerId(msg.payload.playerId);
          }
        } else if (msg.type === 'GAME_STATE') {
          setIsSearchingMatch(false);
          setIsWaitingForOpponent(false); // Game has started!
          if (msg.payload.yourPlayerId) {
            setActivePlayerId(msg.payload.yourPlayerId);
          }
          setGameState(msg.payload);
        } else if (msg.type === 'CHAT_BROADCAST') {
          setGameState((prev) => ({
            ...prev,
            logs: [...prev.logs, { text: `${msg.payload.sender}: ${msg.payload.text}`, type: 'canto' }]
          }));
        } else if (msg.type === 'ERROR') {
          alert(`Error: ${msg.payload.message}`);
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setIsSearchingMatch(false);
    };

    return () => {
      ws.close();
    };
  }, [mode, roomId, isMatchmaking]);

  // ----------------------------------------------------
  // OFFLINE AI TURN LOGIC
  // ----------------------------------------------------
  useEffect(() => {
    if (mode !== 'ai') return;
    if (gameState.phase === 'hand_ended' || gameState.phase === 'match_ended') return;

    // AI is always P2 in AI mode
    if (gameState.turn === 'p2') {
      const timer = setTimeout(() => {
        try {
          const aiAction = chooseBotAction(gameState, 'p2', { difficulty: aiDifficulty });
          setGameState((prev) => applyAction(prev, aiAction));
        } catch (e) {
          console.error('AI error executing action:', e);
        }
      }, 750); // Natural thinking delay

      return () => clearTimeout(timer);
    }
  }, [mode, gameState, aiDifficulty]);

  // Dispatch Action
  const dispatchAction = useCallback(
    (action: GameAction) => {
      if (mode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'GAME_ACTION',
            payload: { action }
          })
        );
      } else {
        setGameState((prev) => applyAction(prev, action));
      }
    },
    [mode]
  );

  // Next Hand
  const handleNextHand = useCallback(() => {
    if (mode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'NEXT_HAND' }));
    } else {
      setGameState((prev) => startNextHand(prev));
    }
  }, [mode]);

  // Restart Match
  const handleRestartMatch = useCallback(() => {
    setGameState(createInitialGameState(config));
  }, [config]);

  // Send Chat / Canto
  const handleSendChat = useCallback(
    (text: string) => {
      if (mode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'CHAT_MESSAGE',
            payload: { text }
          })
        );
      } else {
        setGameState((prev) => ({
          ...prev,
          logs: [
            ...prev.logs,
            { text: `${activePlayerId === 'p1' ? config.p1Name || 'P1' : config.p2Name || 'P2'}: ${text}`, type: 'canto' }
          ]
        }));
      }
    },
    [mode, activePlayerId, config]
  );

  // Cancel Matchmaking
  const cancelMatchmaking = useCallback(() => {
    if (mode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CANCEL_MATCH' }));
    }
    setIsSearchingMatch(false);
  }, [mode]);

  return {
    gameState,
    activePlayerId,
    connected,
    onlineRoomId,
    isWaitingForOpponent,
    isSearchingMatch,
    cancelMatchmaking,
    dispatchAction,
    handleNextHand,
    handleRestartMatch,
    handleSendChat
  };
}
