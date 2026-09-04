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

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

type ProfileListener = (profile: PlayerProfile) => void;

class ProfileClientService {
  private listeners: Set<ProfileListener> = new Set();
  private currentProfile: PlayerProfile | null = null;
  private token: string = getOrCreateDeviceToken();

  constructor() {
    // Load local cached profile first for instantaneous UI render
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(CACHED_PROFILE_KEY);
      if (cached) {
        try {
          this.currentProfile = JSON.parse(cached);
        } catch {}
      }
    }
    // Fetch fresh authoritative state from server
    this.refresh();
  }

  public subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    if (this.currentProfile) {
      listener(this.currentProfile);
    }
    return () => this.listeners.delete(listener);
  }

  private setAndBroadcast(profile: PlayerProfile) {
    this.currentProfile = profile;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(profile));
    }
    this.listeners.forEach(fn => fn(profile));
  }

  public getCached(): PlayerProfile | null {
    return this.currentProfile;
  }

  public async refresh(): Promise<PlayerProfile | null> {
    try {
      const savedName = localStorage.getItem('truco_saved_player_name') || 'Nico';
      const res = await fetch(`${SERVER_URL}/api/profile?token=${encodeURIComponent(this.token)}&name=${encodeURIComponent(savedName)}`);
      if (res.ok) {
        const data = await res.json();
        this.setAndBroadcast(data);
        return data;
      }
    } catch (e) {
      console.warn('Could not refresh profile from server, using local cache', e);
    }
    return this.currentProfile;
  }

  public async recordMatch(won: boolean, matchEvents: string[] = []): Promise<{ coinsEarned: number; capped: boolean } | null> {
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/match-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.token,
          won,
          matchEvents
        })
      });

      if (res.ok) {
        const data = await res.json();
        this.setAndBroadcast(data.profile);
        return { coinsEarned: data.coinsEarned, capped: data.capped };
      }
    } catch (e) {
      console.error('Failed to record match on server:', e);
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
    } catch (e: any) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
    return { success: false, error: 'No se pudo completar la compra' };
  }

  public async equipItem(itemId: string): Promise<boolean> {
    try {
      const res = await fetch(`${SERVER_URL}/api/profile/equip-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, itemId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.setAndBroadcast(data.profile);
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to equip item:', e);
    }
    return false;
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
