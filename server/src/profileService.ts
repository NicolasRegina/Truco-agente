import { db } from './db';
import { getDailyMissionsForDate, MISSIONS_POOL, MissionDefinition } from './missionsPool';

export interface StoreItem {
  id: string;
  name: string;
  category: 'mate' | 'title' | 'border' | 'cardBack';
  price: number;
  description: string;
}

export const STORE_CATALOG: Record<string, StoreItem> = {
  // Mates
  mate_calabaza: {
    id: 'mate_calabaza',
    name: 'Calabaza Tradicional',
    category: 'mate',
    price: 0,
    description: 'El clásico porongo criollo con virola de aluminio.'
  },
  mate_algarrobo: {
    id: 'mate_algarrobo',
    name: 'Algarrobo Tallado',
    category: 'mate',
    price: 12,
    description: 'Madera noble pulida a mano con vetas doradas. ¡Tu primer gran logro!'
  },
  mate_camionero: {
    id: 'mate_camionero',
    name: 'Camionero de Cuero',
    category: 'mate',
    price: 35,
    description: 'Boca ancha, forrado en cuero vacuno rústico con costuras gruesas.'
  },
  mate_imperial: {
    id: 'mate_imperial',
    name: 'Imperial con Alpaca',
    category: 'mate',
    price: 80,
    description: 'Lujo criollo con virola de alpaca cincelada y cuero labrado.'
  },
  mate_stanley: {
    id: 'mate_stanley',
    name: 'Térmico Moderno',
    category: 'mate',
    price: 110,
    description: 'Acero inoxidable doble capa para que la yerba nunca se lave.'
  },

  // Títulos
  title_novato: {
    id: 'title_novato',
    name: 'Novato de Pulpería',
    category: 'title',
    price: 0,
    description: 'Primeros pasos en la mesa criolla.'
  },
  title_mentiroso: {
    id: 'title_mentiroso',
    name: 'Mentiroso Profesional',
    category: 'title',
    price: 25,
    description: 'Para los que juegan el 4 como si fuera el As de Espadas.'
  },
  title_canchero: {
    id: 'title_canchero',
    name: 'Canchero de Barrio',
    category: 'title',
    price: 50,
    description: 'Conocedor de mañas, guiños y señas rápidas.'
  },
  title_rey_envido: {
    id: 'title_rey_envido',
    name: 'Rey del Envido',
    category: 'title',
    price: 75,
    description: 'Siempre con 31 de mano o cara de piedra.'
  },
  title_terror_falta: {
    id: 'title_terror_falta',
    name: 'El Terror de la Falta Envido',
    category: 'title',
    price: 120,
    description: 'No titubea al poner la partida entera en juego.'
  },
  title_patron: {
    id: 'title_patron',
    name: 'Patrón de Estancia',
    category: 'title',
    price: 250,
    description: 'El máximo respeto en cualquier pulpería del país.'
  },

  // Marcos de Perfil
  border_default: {
    id: 'border_default',
    name: 'Madera Rústica',
    category: 'border',
    price: 0,
    description: 'Borde de lapacho envejecido.'
  },
  border_silver: {
    id: 'border_silver',
    name: 'Alpaca y Plata Cincelada',
    category: 'border',
    price: 60,
    description: 'Relieve metálico tradicional con brillo plateado pulido.'
  },
  border_gold: {
    id: 'border_gold',
    name: 'Oro Sol de Mayo',
    category: 'border',
    price: 140,
    description: 'Biselado dorado con resplandor lumínico de campeón.'
  },
  border_fire: {
    id: 'border_fire',
    name: 'Racha Ardiente',
    category: 'border',
    price: 200,
    description: 'Flama viva criolla que impone respeto en la mesa.'
  },

  // Dorsos de Cartas
  card_clasico: {
    id: 'card_clasico',
    name: 'Cuero & Sol de Mayo',
    category: 'cardBack',
    price: 0,
    description: 'El clásico dorso de cuero legítimo con el Sol de Mayo patrio grabado en oro.'
  },
  card_pampa: {
    id: 'card_pampa',
    name: 'Guarda Pampa Auténtica',
    category: 'cardBack',
    price: 30,
    description: 'Cuero curtido con guarda pampa geométrica en marfil, terracota y oro.'
  },
  card_sol: {
    id: 'card_sol',
    name: 'Albiceleste & Oro Fino',
    category: 'cardBack',
    price: 70,
    description: 'Seda celeste y marfil con filigrana dorada y el gran Sol de Mayo radiante.'
  },
  card_gold: {
    id: 'card_gold',
    name: 'Carbón & Oro Imperial',
    category: 'cardBack',
    price: 130,
    description: 'Cuero azabache obsidian con filigrana barroca en oro puro 24k.'
  },
  card_rojo: {
    id: 'card_rojo',
    name: 'Borgogna & Escudo Real',
    category: 'cardBack',
    price: 180,
    description: 'Rojo carmesí de época con ornatos dorados y el blasón tradicional.'
  }
};

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

export interface PlayerProfileDTO {
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

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TRUCO-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class ProfileService {
  public static ensurePlayer(deviceToken: string, playerName: string = 'Gaucho'): any {
    const today = getTodayDateString();
    let player = db.prepare('SELECT * FROM players WHERE device_token = ?').get(deviceToken) as any;

    if (!player) {
      const defaultUnlocked = JSON.stringify(['mate_calabaza', 'title_novato', 'border_default', 'card_clasico']);
      let syncCode = generateSyncCode();
      // Ensure sync code uniqueness
      while (db.prepare('SELECT 1 FROM players WHERE sync_code = ?').get(syncCode)) {
        syncCode = generateSyncCode();
      }

      const now = Date.now();
      db.prepare(`
        INSERT INTO players (
          device_token, player_name, coins, coins_earned_today, last_earn_date,
          equipped_title, equipped_border, equipped_mate, equipped_card_back,
          unlocked_items, sync_code, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        deviceToken,
        playerName,
        5, // 5 welcome bonus coins to get started
        0,
        today,
        'Novato de Pulpería',
        'default',
        'calabaza',
        'clasico',
        defaultUnlocked,
        syncCode,
        now,
        now
      );

      player = db.prepare('SELECT * FROM players WHERE device_token = ?').get(deviceToken) as any;
    } else if (player.last_earn_date !== today) {
      // New day: reset daily coins earned
      db.prepare(`
        UPDATE players
        SET coins_earned_today = 0, last_earn_date = ?, updated_at = ?
        WHERE device_token = ?
      `).run(today, Date.now(), deviceToken);
      player.coins_earned_today = 0;
      player.last_earn_date = today;
    }

    // Ensure today's missions exist for this player
    this.ensureMissions(deviceToken, today);

    return player;
  }

  private static ensureMissions(deviceToken: string, today: string) {
    const existing = db.prepare('SELECT * FROM player_missions WHERE device_token = ? AND date = ?').all(deviceToken, today);

    if (existing.length === 0) {
      const dailyDefs = getDailyMissionsForDate(today);
      for (const m of dailyDefs) {
        db.prepare(`
          INSERT INTO player_missions (device_token, date, mission_id, progress, target, completed, claimed)
          VALUES (?, ?, ?, 0, ?, 0, 0)
        `).run(deviceToken, today, m.id, m.target);
      }
    }
  }

  public static getProfile(deviceToken: string, playerName?: string): PlayerProfileDTO {
    const player = this.ensurePlayer(deviceToken, playerName);
    const today = getTodayDateString();

    const rawMissions = db.prepare(`
      SELECT pm.*
      FROM player_missions pm
      WHERE pm.device_token = ? AND pm.date = ?
    `).all(deviceToken, today) as any[];

    const missions: PlayerMissionState[] = rawMissions.map(rm => {
      const def = MISSIONS_POOL.find(m => m.id === rm.mission_id);
      return {
        id: rm.mission_id,
        category: def ? def.category : 'general',
        title: def ? def.title : rm.mission_id,
        description: def ? def.description : '',
        target: rm.target,
        progress: rm.progress,
        rewardCoins: def ? def.rewardCoins : 3,
        completed: rm.completed === 1,
        claimed: rm.claimed === 1
      };
    });

    const allClaimed = missions.length === 3 && missions.every(m => m.claimed);
    const unlocked = JSON.parse(player.unlocked_items || '[]');

    return {
      deviceToken: player.device_token,
      playerName: player.player_name,
      coins: player.coins,
      coinsEarnedToday: player.coins_earned_today,
      dailyCapRemaining: Math.max(0, 20 - player.coins_earned_today),
      equippedTitle: player.equipped_title,
      equippedBorder: player.equipped_border,
      equippedMate: player.equipped_mate,
      equippedCardBack: player.equipped_card_back,
      unlockedItems: unlocked,
      syncCode: player.sync_code,
      missions,
      allMissionsClaimedToday: allClaimed,
      catalog: Object.values(STORE_CATALOG)
    };
  }

  public static recordMatchResult(
    deviceToken: string,
    won: boolean,
    matchEvents: string[] = []
  ): { profile: PlayerProfileDTO; coinsEarned: number; capped: boolean } {
    const player = this.ensurePlayer(deviceToken);
    const today = getTodayDateString();

    // 1. Calculate coins with daily cap of 20
    const rawEarn = won ? 2 : 1;
    const availableCap = Math.max(0, 20 - player.coins_earned_today);
    const actualCoinsEarned = Math.min(rawEarn, availableCap);
    const isCapped = rawEarn > availableCap;

    const newCoins = player.coins + actualCoinsEarned;
    const newEarnedToday = player.coins_earned_today + actualCoinsEarned;

    db.prepare(`
      UPDATE players
      SET coins = ?, coins_earned_today = ?, last_earn_date = ?, updated_at = ?
      WHERE device_token = ?
    `).run(newCoins, newEarnedToday, today, Date.now(), deviceToken);

    // 2. Advance matching daily missions
    // Implicit events for any completed match
    const eventsSet = new Set(matchEvents);
    eventsSet.add('play_match');

    const rawMissions = db.prepare(`
      SELECT pm.*
      FROM player_missions pm
      WHERE pm.device_token = ? AND pm.date = ? AND pm.completed = 0
    `).all(deviceToken, today) as any[];

    for (const rm of rawMissions) {
      const def = MISSIONS_POOL.find(m => m.id === rm.mission_id);
      if (def && eventsSet.has(def.eventKey)) {
        const newProgress = Math.min(rm.target, rm.progress + 1);
        const isDone = newProgress >= rm.target ? 1 : 0;
        db.prepare(`
          UPDATE player_missions
          SET progress = ?, completed = ?
          WHERE device_token = ? AND date = ? AND mission_id = ?
        `).run(newProgress, isDone, deviceToken, today, rm.mission_id);
      }
    }

    const updatedProfile = this.getProfile(deviceToken);
    return {
      profile: updatedProfile,
      coinsEarned: actualCoinsEarned,
      capped: isCapped
    };
  }

  public static claimMission(deviceToken: string, missionId: string): { success: boolean; profile: PlayerProfileDTO; bonusAwarded: boolean } {
    const today = getTodayDateString();
    const mission = db.prepare(`
      SELECT * FROM player_missions
      WHERE device_token = ? AND date = ? AND mission_id = ?
    `).get(deviceToken, today, missionId) as any;

    if (!mission || mission.completed !== 1 || mission.claimed === 1) {
      return { success: false, profile: this.getProfile(deviceToken), bonusAwarded: false };
    }

    // Mark as claimed
    db.prepare(`
      UPDATE player_missions
      SET claimed = 1
      WHERE device_token = ? AND date = ? AND mission_id = ?
    `).run(deviceToken, today, missionId);

    // Add +3 coins
    let coinsToAdd = 3;

    // Check if this was the last of the 3 daily missions for the "Día Perfecto" bonus (+2 coins)
    const allMissions = db.prepare(`
      SELECT * FROM player_missions
      WHERE device_token = ? AND date = ?
    `).all(deviceToken, today) as any[];

    let bonusAwarded = false;
    if (allMissions.length === 3 && allMissions.every(m => m.claimed === 1 || m.mission_id === missionId)) {
      coinsToAdd += 2; // Bonus
      bonusAwarded = true;
    }

    db.prepare(`
      UPDATE players
      SET coins = coins + ?, updated_at = ?
      WHERE device_token = ?
    `).run(coinsToAdd, Date.now(), deviceToken);

    return {
      success: true,
      profile: this.getProfile(deviceToken),
      bonusAwarded
    };
  }

  public static buyItem(deviceToken: string, itemId: string): { success: boolean; error?: string; profile: PlayerProfileDTO } {
    const item = STORE_CATALOG[itemId];
    if (!item) {
      return { success: false, error: 'Artículo no encontrado', profile: this.getProfile(deviceToken) };
    }

    const player = this.ensurePlayer(deviceToken);
    const unlocked = JSON.parse(player.unlocked_items || '[]') as string[];

    if (unlocked.includes(itemId)) {
      return { success: false, error: 'Ya tenés este artículo desbloqueado', profile: this.getProfile(deviceToken) };
    }

    if (player.coins < item.price) {
      return { success: false, error: `Te faltan ${item.price - player.coins} monedas`, profile: this.getProfile(deviceToken) };
    }

    const newCoins = player.coins - item.price;
    unlocked.push(itemId);

    db.prepare(`
      UPDATE players
      SET coins = ?, unlocked_items = ?, updated_at = ?
      WHERE device_token = ?
    `).run(newCoins, JSON.stringify(unlocked), Date.now(), deviceToken);

    return {
      success: true,
      profile: this.getProfile(deviceToken)
    };
  }

  public static equipItem(deviceToken: string, itemId: string): { success: boolean; profile: PlayerProfileDTO } {
    const item = STORE_CATALOG[itemId];
    if (!item) {
      return { success: false, profile: this.getProfile(deviceToken) };
    }

    const player = this.ensurePlayer(deviceToken);
    const unlocked = JSON.parse(player.unlocked_items || '[]') as string[];

    if (!unlocked.includes(itemId)) {
      return { success: false, profile: this.getProfile(deviceToken) };
    }

    let field = '';
    let val = '';

    if (item.category === 'title') {
      field = 'equipped_title';
      val = item.name;
    } else if (item.category === 'mate') {
      field = 'equipped_mate';
      val = item.id.replace('mate_', '');
    } else if (item.category === 'border') {
      field = 'equipped_border';
      val = item.id.replace('border_', '');
    } else if (item.category === 'cardBack') {
      field = 'equipped_card_back';
      val = item.id.replace('card_', '');
    }

    if (field) {
      db.prepare(`UPDATE players SET ${field} = ?, updated_at = ? WHERE device_token = ?`).run(val, Date.now(), deviceToken);
    }

    return {
      success: true,
      profile: this.getProfile(deviceToken)
    };
  }

  // Rate limiting for device pairing attempts (max 5 failed attempts per 10 minutes)
  private static failedAttempts = new Map<string, { count: number; firstAttempt: number }>();

  private static checkRateLimit(key: string): boolean {
    const now = Date.now();
    const record = this.failedAttempts.get(key);
    if (!record) return true;
    if (now - record.firstAttempt > 10 * 60 * 1000) {
      this.failedAttempts.delete(key);
      return true;
    }
    return record.count < 5;
  }

  private static recordFailedAttempt(key: string) {
    const now = Date.now();
    const record = this.failedAttempts.get(key);
    if (!record || now - record.firstAttempt > 10 * 60 * 1000) {
      this.failedAttempts.set(key, { count: 1, firstAttempt: now });
    } else {
      record.count++;
    }
  }

  private static clearFailedAttempts(key: string) {
    this.failedAttempts.delete(key);
  }

  public static generateEphemeralSyncCode(sourceDeviceToken: string): { success: boolean; code?: string; expiresAt?: number; error?: string } {
    this.ensurePlayer(sourceDeviceToken);
    const now = Date.now();

    // Purge expired tokens
    db.prepare('DELETE FROM sync_tokens WHERE expires_at < ?').run(now);
    // Invalidate any previous token for this source device
    db.prepare('DELETE FROM sync_tokens WHERE source_device_token = ?').run(sourceDeviceToken);

    // Generate clean 6-character code (TRUCO-XXXX)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TRUCO-';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const expiresAt = now + 5 * 60 * 1000; // 5 minutes
    db.prepare(`
      INSERT INTO sync_tokens (code, source_device_token, target_device_token, status, expires_at, created_at)
      VALUES (?, ?, NULL, 'pending', ?, ?)
    `).run(code, sourceDeviceToken, expiresAt, now);

    return {
      success: true,
      code,
      expiresAt
    };
  }

  public static requestDeviceLink(targetDeviceToken: string, code: string): { success: boolean; error?: string; status?: string } {
    const cleanCode = code.trim().toUpperCase();
    const now = Date.now();

    if (!this.checkRateLimit(targetDeviceToken)) {
      return { success: false, error: 'Demasiados intentos fallidos. Por seguridad, esperá 10 minutos.' };
    }

    this.ensurePlayer(targetDeviceToken);

    const tokenRecord = db.prepare('SELECT * FROM sync_tokens WHERE code = ?').get(cleanCode) as any;
    if (!tokenRecord || now > tokenRecord.expires_at) {
      this.recordFailedAttempt(targetDeviceToken);
      return { success: false, error: 'Código inválido o expirado. Generá uno nuevo en tu otro dispositivo.' };
    }

    if (tokenRecord.source_device_token === targetDeviceToken) {
      return { success: false, error: 'No podés vincular tu dispositivo consigo mismo.' };
    }

    if (tokenRecord.status !== 'pending') {
      return { success: false, error: 'Este código ya está en proceso o ya fue utilizado.' };
    }

    this.clearFailedAttempts(targetDeviceToken);

    // Update token status to requested
    db.prepare(`
      UPDATE sync_tokens
      SET target_device_token = ?, status = 'requested'
      WHERE code = ?
    `).run(targetDeviceToken, cleanCode);

    return {
      success: true,
      status: 'requested'
    };
  }

  public static checkSyncStatus(deviceToken: string, code: string): { status: string; targetName?: string; expiresAt?: number; profile?: PlayerProfileDTO } {
    const cleanCode = code.trim().toUpperCase();
    const now = Date.now();

    const tokenRecord = db.prepare('SELECT * FROM sync_tokens WHERE code = ?').get(cleanCode) as any;
    if (!tokenRecord) {
      return { status: 'expired' };
    }

    if (now > tokenRecord.expires_at) {
      db.prepare('DELETE FROM sync_tokens WHERE code = ?').run(cleanCode);
      return { status: 'expired' };
    }

    let targetName = undefined;
    if (tokenRecord.target_device_token) {
      const targetPlayer = db.prepare('SELECT player_name FROM players WHERE device_token = ?').get(tokenRecord.target_device_token) as any;
      targetName = targetPlayer?.player_name || 'Nuevo Dispositivo';
    }

    // If target device checks and status is approved, return updated profile and delete consumed token
    if (tokenRecord.target_device_token === deviceToken && (tokenRecord.status === 'approved_mirror' || tokenRecord.status === 'approved_transfer')) {
      const updatedProfile = this.getProfile(deviceToken);
      // Consume token immediately
      db.prepare('DELETE FROM sync_tokens WHERE code = ?').run(cleanCode);
      return {
        status: tokenRecord.status,
        expiresAt: tokenRecord.expires_at,
        profile: updatedProfile
      };
    }

    return {
      status: tokenRecord.status,
      targetName,
      expiresAt: tokenRecord.expires_at
    };
  }

  public static resolveSyncRequest(
    sourceDeviceToken: string,
    code: string,
    action: 'mirror' | 'transfer' | 'reject'
  ): { success: boolean; error?: string; profile?: PlayerProfileDTO } {
    const cleanCode = code.trim().toUpperCase();
    const now = Date.now();

    const tokenRecord = db.prepare('SELECT * FROM sync_tokens WHERE code = ? AND source_device_token = ?').get(cleanCode, sourceDeviceToken) as any;
    if (!tokenRecord || now > tokenRecord.expires_at) {
      return { success: false, error: 'Código no encontrado o expirado' };
    }

    if (tokenRecord.status !== 'requested' || !tokenRecord.target_device_token) {
      return { success: false, error: 'No hay ninguna solicitud pendiente para este código' };
    }

    const targetDeviceToken = tokenRecord.target_device_token;
    const sourcePlayer = db.prepare('SELECT * FROM players WHERE device_token = ?').get(sourceDeviceToken) as any;
    if (!sourcePlayer) {
      return { success: false, error: 'Perfil de origen no encontrado' };
    }

    if (action === 'reject') {
      db.prepare(`UPDATE sync_tokens SET status = 'rejected' WHERE code = ?`).run(cleanCode);
      return {
        success: true,
        profile: this.getProfile(sourceDeviceToken)
      };
    }

    if (action === 'mirror') {
      // Both devices share the same profile data
      db.prepare(`
        UPDATE players
        SET coins = ?, equipped_title = ?, equipped_border = ?, equipped_mate = ?, equipped_card_back = ?, unlocked_items = ?, updated_at = ?
        WHERE device_token = ?
      `).run(
        sourcePlayer.coins,
        sourcePlayer.equipped_title,
        sourcePlayer.equipped_border,
        sourcePlayer.equipped_mate,
        sourcePlayer.equipped_card_back,
        sourcePlayer.unlocked_items,
        Date.now(),
        targetDeviceToken
      );

      db.prepare(`UPDATE sync_tokens SET status = 'approved_mirror' WHERE code = ?`).run(cleanCode);

      return {
        success: true,
        profile: this.getProfile(sourceDeviceToken)
      };
    }

    if (action === 'transfer') {
      // 1. Copy data to target device
      db.prepare(`
        UPDATE players
        SET coins = ?, equipped_title = ?, equipped_border = ?, equipped_mate = ?, equipped_card_back = ?, unlocked_items = ?, updated_at = ?
        WHERE device_token = ?
      `).run(
        sourcePlayer.coins,
        sourcePlayer.equipped_title,
        sourcePlayer.equipped_border,
        sourcePlayer.equipped_mate,
        sourcePlayer.equipped_card_back,
        sourcePlayer.unlocked_items,
        Date.now(),
        targetDeviceToken
      );

      // 2. Reset old device to fresh novato account
      const defaultUnlocked = JSON.stringify(['mate_calabaza', 'title_novato', 'border_default', 'card_clasico']);
      db.prepare(`
        UPDATE players
        SET coins = 0,
            coins_earned_today = 0,
            equipped_title = 'Novato de Pulpería',
            equipped_border = 'default',
            equipped_mate = 'calabaza',
            equipped_card_back = 'clasico',
            unlocked_items = ?,
            updated_at = ?
        WHERE device_token = ?
      `).run(defaultUnlocked, Date.now(), sourceDeviceToken);

      db.prepare(`UPDATE sync_tokens SET status = 'approved_transfer' WHERE code = ?`).run(cleanCode);

      return {
        success: true,
        profile: this.getProfile(sourceDeviceToken)
      };
    }

    return { success: false, error: 'Acción no válida' };
  }

  // Backward compatibility alias
  public static syncWithCode(currentDeviceToken: string, syncCode: string): { success: boolean; error?: string; profile: PlayerProfileDTO } {
    return { success: false, error: 'Por favor utilizá el sistema de códigos temporales de 5 minutos.', profile: this.getProfile(currentDeviceToken) };
  }
}
