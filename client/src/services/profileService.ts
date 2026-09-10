export interface StoreItem {
  id: string;
  name: string;
  category: 'mate' | 'title' | 'border' | 'cardBack';
  price: number;
  description: string;
}

export interface PlayerMissionState {
  id: string;
  category: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerProfile {
  deviceToken: string;
  playerName: string;
  coins: number;
  coinsEarnedToday: number;
  dailyCapRemaining: number;
  equippedTitle: string;
  equippedBorder: string;
  equippedMate: string;
  equippedCardBack: string;
  unlockedItems: string[];
  syncCode: string;
  missions: PlayerMissionState[];
  allMissionsClaimedToday: boolean;
  catalog: StoreItem[];
}

const TOKEN_KEY = 'truco_device_token_v1';
const CACHED_PROFILE_KEY = 'truco_cached_profile_v1';

function getOrCreateDeviceToken(): string {
  if (typeof window === 'undefined') return 'ssr_token';

  // Request storage persistence
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

function resolveServerUrl(): string {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  const wsUrl = import.meta.env.VITE_WS_URL;
  if (wsUrl) {
    return wsUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
  }
  if (import.meta.env.PROD) {
    return 'https://truquero.onrender.com';
  }
  return 'http://localhost:3001';
}

const SERVER_URL = resolveServerUrl();

type ProfileListener = (profile: PlayerProfile) => void;

export const DEFAULT_CATALOG: StoreItem[] = [
  { id: 'mate_calabaza', name: 'Calabaza Tradicional', category: 'mate', price: 0, description: 'El clásico porongo criollo con virola de aluminio.' },
  { id: 'mate_algarrobo', name: 'Algarrobo Tallado', category: 'mate', price: 12, description: 'Madera noble pulida a mano con vetas doradas. ¡Tu primer gran logro!' },
  { id: 'mate_camionero', name: 'Camionero de Cuero', category: 'mate', price: 35, description: 'Boca ancha, forrado en cuero vacuno rústico con costuras gruesas.' },
  { id: 'mate_imperial', name: 'Imperial con Alpaca', category: 'mate', price: 80, description: 'Lujo criollo con virola de alpaca cincelada y cuero labrado.' },
  { id: 'mate_stanley', name: 'Térmico Moderno', category: 'mate', price: 110, description: 'Acero inoxidable doble capa para que la yerba nunca se lave.' },
  { id: 'title_novato', name: 'Novato de Pulpería', category: 'title', price: 0, description: 'Primeros pasos en la mesa criolla.' },
  { id: 'title_mentiroso', name: 'Mentiroso Profesional', category: 'title', price: 25, description: 'Para los que juegan el 4 como si fuera el As de Espadas.' },
  { id: 'title_canchero', name: 'Canchero de Barrio', category: 'title', price: 50, description: 'Conocedor de mañas, guiños y señas rápidas.' },
  { id: 'title_rey_envido', name: 'Rey del Envido', category: 'title', price: 75, description: 'Siempre con 31 de mano o cara de piedra.' },
  { id: 'title_terror_falta', name: 'El Terror de la Falta Envido', category: 'title', price: 120, description: 'No titubea al poner la partida entera en juego.' },
  { id: 'title_patron', name: 'Patrón de Estancia', category: 'title', price: 250, description: 'El máximo respeto en cualquier pulpería del país.' },
  { id: 'border_default', name: 'Madera Rústica', category: 'border', price: 0, description: 'Borde de lapacho envejecido.' },
  { id: 'border_silver', name: 'Alpaca y Plata Cincelada', category: 'border', price: 60, description: 'Relieve metálico tradicional con brillo plateado pulido.' },
  { id: 'border_gold', name: 'Oro Sol de Mayo', category: 'border', price: 140, description: 'Biselado dorado con resplandor lumínico de campeón.' },
  { id: 'border_fire', name: 'Racha Ardiente', category: 'border', price: 200, description: 'Flama viva criolla que impone respeto en la mesa.' },
  { id: 'card_clasico', name: 'Cuero & Sol de Mayo', category: 'cardBack', price: 0, description: 'El clásico dorso de cuero legítimo con el Sol de Mayo patrio grabado en oro.' },
  { id: 'card_pampa', name: 'Guarda Pampa Auténtica', category: 'cardBack', price: 30, description: 'Cuero curtido con guarda pampa geométrica en marfil, terracota y oro.' },
  { id: 'card_sol', name: 'Albiceleste & Oro Fino', category: 'cardBack', price: 70, description: 'Seda celeste y marfil con filigrana dorada y el gran Sol de Mayo radiante.' },
  { id: 'card_gold', name: 'Carbón & Oro Imperial', category: 'cardBack', price: 130, description: 'Cuero azabache obsidian con filigrana barroca en oro puro 24k.' },
  { id: 'card_rojo', name: 'Borgogna & Escudo Real', category: 'cardBack', price: 180, description: 'Rojo carmesí de época con ornatos dorados y el blasón tradicional.' }
];

function createDefaultFallbackProfile(deviceToken: string): PlayerProfile {
  const savedName = typeof localStorage !== 'undefined' ? localStorage.getItem('truco_saved_player_name') || 'Nico' : 'Nico';
  return {
    deviceToken,
    playerName: savedName,
    coins: 5,
    coinsEarnedToday: 0,
    dailyCapRemaining: 20,
    equippedTitle: 'Novato de Pulpería',
    equippedBorder: 'default',
    equippedMate: 'calabaza',
    equippedCardBack: 'clasico',
    unlockedItems: ['mate_calabaza', 'title_novato', 'border_default', 'card_clasico'],
    syncCode: '',
    missions: [
      { id: 'play_3_matches', category: 'Partidas', title: 'Bautismo de Pulpería', description: 'Jugá 3 partidas completas de Truco', target: 3, progress: 0, rewardCoins: 3, completed: false, claimed: false },
      { id: 'win_envido_28', category: 'Envido', title: 'El Secreto del Tanto', description: 'Cantá y ganá un tanto de Envido', target: 1, progress: 0, rewardCoins: 3, completed: false, claimed: false },
      { id: 'win_retruco', category: 'Astucia', title: 'Grito Retruquero', description: 'Ganá una mano con Retruco o Vale Cuatro', target: 1, progress: 0, rewardCoins: 3, completed: false, claimed: false }
    ],
    allMissionsClaimedToday: false,
    catalog: DEFAULT_CATALOG
  };
}

const EVENT_TO_MISSION_ID: Record<string, string> = {
  custom_game: 'mesa_a_medida',
  play_match: 'encuentro_pulperia',
  hard_or_online_match: 'duelo_gaucho',
  win_envido: 'tanto_bravo',
  high_envido: 'envido_primero',
  accept_falta_envido: 'coraje_criollo',
  call_retruco: 'retruco_al_pecho',
  win_covered_card: 'arte_del_engano',
  drink_mate: 'cebate_otro',
  send_emote: 'picardia_criolla'
};

class ProfileClientService {
  private listeners: Set<ProfileListener> = new Set();
  private currentProfile: PlayerProfile;
  private token: string = getOrCreateDeviceToken();

  constructor() {
    let cachedProfile: PlayerProfile | null = null;
    // Load local cached profile first for instantaneous UI render
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(CACHED_PROFILE_KEY);
      if (cached) {
        try {
          cachedProfile = JSON.parse(cached);
        } catch {}
      }
    }
    this.currentProfile = cachedProfile || createDefaultFallbackProfile(this.token);

    // Fetch fresh authoritative state from server
    this.refresh();
  }

  public subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    listener(this.currentProfile);
    return () => this.listeners.delete(listener);
  }

  private setAndBroadcast(profile: PlayerProfile) {
    this.currentProfile = profile;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(profile));
    }
    this.listeners.forEach(fn => fn(profile));
  }

  public getCached(): PlayerProfile {
    return this.currentProfile;
  }

  public async healServer(profileToSync?: PlayerProfile): Promise<PlayerProfile | null> {
    try {
      const p = profileToSync || this.currentProfile;
      const res = await fetch(`${SERVER_URL}/api/profile/heal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.token,
          playerName: p.playerName,
          coins: p.coins,
          coinsEarnedToday: p.coinsEarnedToday,
          unlockedItems: p.unlockedItems,
          equippedTitle: p.equippedTitle,
          equippedBorder: p.equippedBorder,
          equippedMate: p.equippedMate,
          equippedCardBack: p.equippedCardBack,
          missions: p.missions
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          this.setAndBroadcast(data.profile);
          return data.profile;
        }
      }
    } catch (e) {
      console.warn('Could not heal server profile, keeping local cache', e);
    }
    return null;
  }

  public async refresh(): Promise<PlayerProfile> {
    try {
      const savedName = (typeof localStorage !== 'undefined' && localStorage.getItem('truco_saved_player_name')) || this.currentProfile.playerName || 'Nico';
      const res = await fetch(`${SERVER_URL}/api/profile?token=${encodeURIComponent(this.token)}&name=${encodeURIComponent(savedName)}`);
      if (res.ok) {
        const serverData: PlayerProfile = await res.json();

        // Check if server lost progress (e.g. backend redeployed on Render with ephemeral disk)
        const localCoins = Number(this.currentProfile.coins || 0);
        const serverCoins = Number(serverData.coins || 0);
        const localUnlocked = new Set(this.currentProfile.unlockedItems || []);
        const serverUnlocked = new Set(serverData.unlockedItems || []);
        const hasMissingUnlocked = [...localUnlocked].some(item => !serverUnlocked.has(item));
        const serverLostProgress = (localCoins > serverCoins) || hasMissingUnlocked;

        // Determine clean nickname (ignore accidental default fallbacks)
        const cleanSavedName = (savedName && savedName !== 'Gaucho' && savedName !== 'Leo Messi' && savedName !== 'Jugador 1') ? savedName : '';
        const effectiveName = cleanSavedName || (serverData.playerName && serverData.playerName !== 'Leo Messi' && serverData.playerName !== 'Gaucho' ? serverData.playerName : (this.currentProfile.playerName || 'Nico'));

        if (serverLostProgress) {
          console.warn('[ProfileService] Servidor con progreso inferior al local detectado (posible reinicio de Render). Curando servidor...');
          const mergedUnlocked = Array.from(new Set([...(this.currentProfile.unlockedItems || []), ...(serverData.unlockedItems || [])]));
          const mergedCoins = Math.max(localCoins, serverCoins);
          const mergedEarnedToday = Math.max(this.currentProfile.coinsEarnedToday || 0, serverData.coinsEarnedToday || 0);

          const healedProfile: PlayerProfile = {
            ...serverData,
            playerName: effectiveName,
            coins: mergedCoins,
            coinsEarnedToday: mergedEarnedToday,
            unlockedItems: mergedUnlocked,
            equippedTitle: (this.currentProfile.equippedTitle && mergedUnlocked.includes(this.currentProfile.equippedTitle)) ? this.currentProfile.equippedTitle : serverData.equippedTitle,
            equippedBorder: (this.currentProfile.equippedBorder && mergedUnlocked.includes(this.currentProfile.equippedBorder)) ? this.currentProfile.equippedBorder : serverData.equippedBorder,
            equippedMate: (this.currentProfile.equippedMate && mergedUnlocked.includes(this.currentProfile.equippedMate)) ? this.currentProfile.equippedMate : serverData.equippedMate,
            equippedCardBack: (this.currentProfile.equippedCardBack && mergedUnlocked.includes(this.currentProfile.equippedCardBack)) ? this.currentProfile.equippedCardBack : serverData.equippedCardBack,
          };

          if (typeof localStorage !== 'undefined' && effectiveName) {
            localStorage.setItem('truco_saved_player_name', effectiveName);
          }

          this.setAndBroadcast(healedProfile);
          // Heal the server asynchronously
          this.healServer(healedProfile).catch(() => {});
          return healedProfile;
        }

        // Server has equal or greater progress: accept it, but preserve valid saved player name
        if (effectiveName) {
          serverData.playerName = effectiveName;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('truco_saved_player_name', effectiveName);
          }
        }

        this.setAndBroadcast(serverData);
        return serverData;
      }
    } catch (e) {
      console.warn('Could not refresh profile from server, using local cache / offline fallback', e);
    }
    return this.currentProfile;
  }

  public async recordEvent(eventKey: string, count: number = 1): Promise<void> {
    // 1. Optimistically advance matching mission locally
    const missionId = EVENT_TO_MISSION_ID[eventKey];
    if (missionId && this.currentProfile.missions) {
      let changed = false;
      const updatedMissions = this.currentProfile.missions.map(m => {
        if (m.id === missionId && !m.completed) {
          changed = true;
          const newProgress = Math.min(m.target, m.progress + count);
          return {
            ...m,
            progress: newProgress,
            completed: newProgress >= m.target
          };
        }
        return m;
      });
      if (changed) {
        this.setAndBroadcast({
          ...this.currentProfile,
          missions: updatedMissions
        });
      }
    }

    // 2. Persist to server if online
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/record-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.token,
          eventKey,
          count
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          this.setAndBroadcast(data.profile);
        }
      }
    } catch {
      // Offline fallback: already updated optimistically above
    }
  }

  public async recordMatch(
    won: boolean,
    matchEvents: string[] = [],
    options?: {
      isPrivateRoom?: boolean;
      isForfeit?: boolean;
      totalPointsScored?: number;
    }
  ): Promise<{ coinsEarned: number; capped: boolean } | null> {
    const isPrivate = Boolean(options?.isPrivateRoom);
    const isEarlyForfeit = Boolean(options?.isForfeit && (options?.totalPointsScored ?? 0) < 5);

    try {
      const res = await fetch(`${SERVER_URL}/api/profile/match-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.token,
          won,
          matchEvents,
          isPrivateRoom: isPrivate,
          isForfeit: Boolean(options?.isForfeit),
          totalPointsScored: options?.totalPointsScored ?? 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.setAndBroadcast(data.profile);
        return { coinsEarned: data.coinsEarned, capped: data.capped };
      }
    } catch (e) {
      console.warn('Recording match result locally (offline mode):', e);
      if (isPrivate || isEarlyForfeit) {
        return { coinsEarned: 0, capped: false };
      }

      const earn = won ? 2 : 1;
      const available = Math.max(0, this.currentProfile.dailyCapRemaining);
      const coinsEarned = Math.min(earn, available);
      const newCoins = this.currentProfile.coins + coinsEarned;
      const newCap = available - coinsEarned;

      const eventCounts: Record<string, number> = {};
      for (const ev of matchEvents) {
        eventCounts[ev] = (eventCounts[ev] || 0) + 1;
      }
      eventCounts['play_match'] = Math.max(1, eventCounts['play_match'] || 0);

      const updatedMissions = (this.currentProfile.missions || []).map(m => {
        for (const [ev, mId] of Object.entries(EVENT_TO_MISSION_ID)) {
          if (m.id === mId && eventCounts[ev] && !m.completed) {
            const inc = eventCounts[ev];
            const newProgress = Math.min(m.target, m.progress + inc);
            return {
              ...m,
              progress: newProgress,
              completed: newProgress >= m.target
            };
          }
        }
        return m;
      });

      const updated = {
        ...this.currentProfile,
        coins: newCoins,
        dailyCapRemaining: newCap,
        coinsEarnedToday: this.currentProfile.coinsEarnedToday + coinsEarned,
        missions: updatedMissions
      };
      this.setAndBroadcast(updated);
      return { coinsEarned, capped: earn > available };
    }
    return null;
  }

  public async claimMission(missionId: string): Promise<boolean> {
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/claim-mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, missionId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.setAndBroadcast(data.profile);
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to claim mission:', e);
    }
    return false;
  }

  public async buyItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    const catalogItem = (this.currentProfile.catalog || DEFAULT_CATALOG).find(i => i.id === itemId) ||
      DEFAULT_CATALOG.find(i => i.id === itemId);

    if (!catalogItem) {
      return { success: false, error: 'Artículo no encontrado en el catálogo' };
    }

    if (this.currentProfile.unlockedItems.includes(itemId)) {
      return { success: false, error: 'Ya compraste este artículo' };
    }

    if (this.currentProfile.coins < catalogItem.price) {
      return { success: false, error: 'Monedas insuficientes para esta compra' };
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/profile/buy-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, itemId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.setAndBroadcast(data.profile);
          return { success: true };
        }
        return { success: false, error: data.error };
      }
    } catch {
      // Offline fallback: update profile locally and persist to localStorage
      console.warn('Procesando compra localmente (Modo Offline):', itemId);
      const updatedProfile: PlayerProfile = {
        ...this.currentProfile,
        coins: this.currentProfile.coins - catalogItem.price,
        unlockedItems: [...this.currentProfile.unlockedItems, itemId]
      };
      this.setAndBroadcast(updatedProfile);
      return { success: true };
    }
    return { success: false, error: 'No se pudo completar la compra' };
  }

  public async equipItem(itemId: string): Promise<boolean> {
    const catalogItem = (this.currentProfile.catalog || DEFAULT_CATALOG).find(i => i.id === itemId) ||
      DEFAULT_CATALOG.find(i => i.id === itemId);

    if (!catalogItem) return false;

    // Must be unlocked
    if (!this.currentProfile.unlockedItems.includes(itemId)) return false;

    // Apply equip changes locally immediately (0ms UI latency & offline support)
    const updatedProfile = { ...this.currentProfile };
    if (catalogItem.category === 'title') {
      updatedProfile.equippedTitle = catalogItem.name;
    } else if (catalogItem.category === 'mate') {
      updatedProfile.equippedMate = catalogItem.id.replace('mate_', '');
    } else if (catalogItem.category === 'border') {
      updatedProfile.equippedBorder = catalogItem.id.replace('border_', '');
    } else if (catalogItem.category === 'cardBack') {
      updatedProfile.equippedCardBack = catalogItem.id.replace('card_', '');
    }
    this.setAndBroadcast(updatedProfile);

    // Sync to server in background if online
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/equip-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, itemId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          this.setAndBroadcast(data.profile);
        }
      }
    } catch {
      // Offline mode: already applied locally
      console.warn('Artículo equipado localmente (Modo Offline):', itemId);
    }
    return true;
  }

  public async updatePlayerName(newName: string): Promise<{ success: boolean; error?: string }> {
    const trimmed = (newName || '').trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: false, error: 'El apodo debe tener al menos 2 caracteres' };
    }
    if (trimmed.length > 20) {
      return { success: false, error: 'El apodo no puede exceder 20 caracteres' };
    }

    // 1. Persist to localStorage immediately
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('truco_saved_player_name', trimmed);
    }

    // 2. Optimistic local profile update & broadcast to all components
    const updated: PlayerProfile = {
      ...this.currentProfile,
      playerName: trimmed
    };
    this.setAndBroadcast(updated);

    // 3. Persist to backend database in background
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/update-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, name: trimmed })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          this.setAndBroadcast(data.profile);
        }
      }
    } catch (e) {
      console.warn('Apodo guardado localmente (Modo Offline):', trimmed, e);
    }

    return { success: true };
  }

  public async generateSyncCode(): Promise<{ success: boolean; code?: string; expiresAt?: number; error?: string }> {
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/generate-sync-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
    return { success: false, error: 'No se pudo generar el código' };
  }

  public async requestDeviceLink(code: string): Promise<{ success: boolean; error?: string; status?: string }> {
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, code })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e: any) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
    return { success: false, error: 'No se pudo enviar la solicitud de vinculación' };
  }

  public async checkSyncStatus(code: string): Promise<{ status: string; targetName?: string; expiresAt?: number; profile?: PlayerProfile }> {
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/sync-status?token=${encodeURIComponent(this.token)}&code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          this.setAndBroadcast(data.profile);
        }
        return data;
      }
    } catch (e) {
      console.warn('Failed to check sync status', e);
    }
    return { status: 'unknown' };
  }

  public async resolveSyncRequest(code: string, action: 'mirror' | 'transfer' | 'reject'): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/resolve-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, code, action })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          this.setAndBroadcast(data.profile);
        }
        return { success: Boolean(data.success), error: data.error };
      }
    } catch (e: any) {
      return { success: false, error: 'Error al responder a la vinculación' };
    }
    return { success: false, error: 'No se pudo completar la operación' };
  }

  public async syncDevice(syncCode: string): Promise<{ success: boolean; error?: string }> {
    return this.requestDeviceLink(syncCode);
  }
}

export const profileService = new ProfileClientService();
