import React, { useState, useEffect } from 'react';
import { PlayerProfile, profileService, StoreItem } from '../services/profileService';
import { loadPlayerStats } from '@truco/core';
import {
  User,
  Target,
  ShoppingBag,
  Coins,
  Check,
  Sparkles,
  X,
  Copy,
  Smartphone,
  CheckCircle2,
  Lock,
  Clock,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { soundFx } from '../utils/soundController';
import { MatePreview, CardBackPreview, BorderPreview, TitlePreview } from './BazarVisualPreviews';

interface ProfileBazarModalProps {
  profile: PlayerProfile;
  initialTab?: 'profile' | 'missions' | 'bazar';
  onClose: () => void;
}

export const ProfileBazarModal: React.FC<ProfileBazarModalProps> = ({
  profile,
  initialTab = 'profile',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'missions' | 'bazar'>(initialTab);
  const [bazarFilter, setBazarFilter] = useState<'all' | 'mate' | 'title' | 'border' | 'cardBack'>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync state (5-minute ephemeral codes with Opción C confirmation)
  const [activeSyncCode, setActiveSyncCode] = useState<string | null>(null);
  const [syncExpiresAt, setSyncExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [incomingSyncRequest, setIncomingSyncRequest] = useState<{ code: string; targetName: string } | null>(null);

  // Target device state (entering a code from another device)
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [targetWaiting, setTargetWaiting] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [syncStatusType, setSyncStatusType] = useState<'info' | 'success' | 'error'>('info');

  const stats = loadPlayerStats();
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  // Countdown timer effect
  useEffect(() => {
    if (!syncExpiresAt) return;

    const interval = setInterval(() => {
      const sec = Math.max(0, Math.round((syncExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(sec);

      if (sec <= 0) {
        setActiveSyncCode(null);
        setSyncExpiresAt(null);
        setIncomingSyncRequest(null);
        setSyncStatusMsg('El código de vinculación expiró. Podés generar uno nuevo con un clic.');
        setSyncStatusType('info');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [syncExpiresAt]);

  // Polling effect on source device while active code is open
  useEffect(() => {
    if (!activeSyncCode || incomingSyncRequest) return;

    const poller = setInterval(async () => {
      const res = await profileService.checkSyncStatus(activeSyncCode);
      if (res.status === 'requested') {
        soundFx.playCardFlick();
        setIncomingSyncRequest({
          code: activeSyncCode,
          targetName: res.targetName || 'Dispositivo Remoto'
        });
      } else if (res.status === 'expired') {
        setActiveSyncCode(null);
        setSyncExpiresAt(null);
      }
    }, 2000);

    return () => clearInterval(poller);
  }, [activeSyncCode, incomingSyncRequest]);

  // Polling effect on target device waiting for confirmation
  useEffect(() => {
    if (!targetWaiting || !inputSyncCode) return;

    const poller = setInterval(async () => {
      const res = await profileService.checkSyncStatus(inputSyncCode);
      if (res.status === 'approved_mirror' || res.status === 'approved_transfer') {
        setTargetWaiting(false);
        setSyncStatusMsg('¡Dispositivo vinculado con éxito! Perfil sincronizado.');
        setSyncStatusType('success');
        soundFx.playScoreTally();
        setTimeout(() => setSyncStatusMsg(null), 5000);
      } else if (res.status === 'rejected') {
        setTargetWaiting(false);
        setSyncStatusMsg('La solicitud de vinculación fue rechazada en el otro celular.');
        setSyncStatusType('error');
        setTimeout(() => setSyncStatusMsg(null), 5000);
      } else if (res.status === 'expired') {
        setTargetWaiting(false);
        setSyncStatusMsg('El código ingresado expiró.');
        setSyncStatusType('error');
        setTimeout(() => setSyncStatusMsg(null), 5000);
      }
    }, 2000);

    return () => clearInterval(poller);
  }, [targetWaiting, inputSyncCode]);

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    setSyncStatusMsg(null);
    setIncomingSyncRequest(null);

    const res = await profileService.generateSyncCode();
    setIsGeneratingCode(false);

    if (res.success && res.code && res.expiresAt) {
      setActiveSyncCode(res.code);
      setSyncExpiresAt(res.expiresAt);
      setRemainingSeconds(Math.max(0, Math.round((res.expiresAt - Date.now()) / 1000)));
      soundFx.playCardFlick();
    } else {
      setSyncStatusMsg(res.error || 'No se pudo generar el código temporal');
      setSyncStatusType('error');
    }
  };

  const handleCopyCode = () => {
    if (!activeSyncCode) return;
    navigator.clipboard.writeText(activeSyncCode);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2000);
  };

  const handleResolveSync = async (action: 'mirror' | 'transfer' | 'reject') => {
    if (!incomingSyncRequest) return;
    const res = await profileService.resolveSyncRequest(incomingSyncRequest.code, action);
    if (res.success) {
      soundFx.playScoreTally();
      setIncomingSyncRequest(null);
      setActiveSyncCode(null);
      setSyncExpiresAt(null);
      if (action === 'mirror') {
        setSyncStatusMsg('¡Ambos dispositivos quedaron sincronizados en modo Espejo!');
        setSyncStatusType('success');
      } else if (action === 'transfer') {
        setSyncStatusMsg('Perfil migrado al nuevo dispositivo. Esta sesión se ha reiniciado.');
        setSyncStatusType('info');
      } else {
        setSyncStatusMsg('Solicitud de vinculación rechazada.');
        setSyncStatusType('info');
      }
      setTimeout(() => setSyncStatusMsg(null), 5000);
    } else {
      setActionError(res.error || 'Error al procesar la vinculación');
    }
  };

  const handleTargetLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSyncCode.trim()) return;

    setSyncStatusMsg(null);
    setTargetWaiting(true);

    const res = await profileService.requestDeviceLink(inputSyncCode);
    if (!res.success) {
      setTargetWaiting(false);
      setSyncStatusMsg(res.error || 'Código incorrecto o no encontrado');
      setSyncStatusType('error');
    }
  };

  const handleClaim = async (missionId: string) => {
    soundFx.playScoreTally();
    await profileService.claimMission(missionId);
  };

  const handleBuy = async (item: StoreItem) => {
    setActionError(null);
    const res = await profileService.buyItem(item.id);
    if (res.success) {
      soundFx.playScoreTally();
    } else if (res.error) {
      setActionError(res.error);
    }
  };

  const handleEquip = async (item: StoreItem) => {
    soundFx.playCardFlick();
    await profileService.equipItem(item.id);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredCatalog = profile.catalog.filter(item => {
    if (bazarFilter === 'all') return true;
    return item.category === bazarFilter;
  });

  const getBorderClasses = (borderId: string) => {
    switch (borderId) {
      case 'silver':
        return 'border-slate-300 ring-2 ring-slate-300/60 shadow-[0_0_15px_rgba(203,213,225,0.5)]';
      case 'gold':
        return 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.7)]';
      case 'fire':
        return 'border-orange-500 ring-2 ring-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.8)]';
      default:
        return 'border-amber-700/60';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4 animate-speech">
      <div className="bg-stone-950 border-2 border-amber-500/60 rounded-3xl max-w-2xl w-full text-amber-100 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-amber-900/60 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300 font-headline tracking-wide">
                Perfil & Bazar Criollo
              </h2>
              <span className="text-[11px] text-amber-200/80 flex items-center gap-1 font-mono">
                <span>Saldo:</span>
                <strong className="text-amber-300 flex items-center gap-0.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {profile.coins} monedas
                </strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-amber-900/50 bg-stone-900/40 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mi Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('missions')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 relative ${
              activeTab === 'missions'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Misiones Diarias</span>
            {profile.missions.some(m => m.completed && !m.claimed) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 right-4"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bazar')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'bazar'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bazar Criollo</span>
          </button>
        </div>

        {/* Error Alert Toast */}
        {actionError && (
          <div className="px-4 py-2 bg-red-950/80 border-b border-red-800 text-red-200 text-xs flex items-center justify-between">
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Tab 1: Mi Perfil */}
        {activeTab === 'profile' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Identity Banner */}
            <div className="bg-stone-900/80 border border-amber-900/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-950/60 border-2 ${getBorderClasses(profile.equippedBorder)} flex items-center justify-center text-3xl shadow-inner`}>
                🧉
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl font-black text-amber-200 font-headline">{profile.playerName}</h3>
                <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">
                  {profile.equippedTitle}
                </span>
                <p className="text-[11px] text-stone-400 mt-1.5">
                  Mate en mesa: <strong className="text-stone-200 capitalize">{profile.equippedMate}</strong> • Dorso: <strong className="text-stone-200 capitalize">{profile.equippedCardBack}</strong>
                </p>
              </div>

              <div className="bg-black/40 border border-amber-900/40 rounded-xl p-3 text-center sm:text-right shrink-0">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Monedas Criollas</span>
                <span className="text-2xl font-black text-amber-300 flex items-center justify-center sm:justify-end gap-1 font-mono">
                  <Coins className="w-5 h-5 text-amber-400 fill-amber-400" /> {profile.coins}
                </span>
                <span className="text-[9px] text-stone-400 block mt-0.5">
                  Hoy por jugar: {profile.coinsEarnedToday}/20 🪙
                </span>
              </div>
            </div>

            {/* Stats Overview */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2 block">
                Historial de Juego
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-stone-900/60 border border-amber-950 rounded-xl p-2.5">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Partidas</span>
                  <span className="text-lg font-black text-white font-mono">{stats.gamesPlayed}</span>
                </div>
                <div className="bg-stone-900/60 border border-amber-950 rounded-xl p-2.5">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">% Victorias</span>
                  <span className="text-lg font-black text-emerald-300 font-mono">{winRate}%</span>
                </div>
                <div className="bg-stone-900/60 border border-amber-950 rounded-xl p-2.5">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Racha Actual</span>
                  <span className="text-lg font-black text-amber-200 font-mono">{stats.currentStreak} 🔥</span>
                </div>
                <div className="bg-stone-900/60 border border-amber-950 rounded-xl p-2.5">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">Mentiras</span>
                  <span className="text-lg font-black text-purple-300 font-mono">{stats.bluffsSuccessful} 🃏</span>
                </div>
              </div>
            </div>

            {/* Sync / Transfer Code Section (5-min Ephemeral & On-Demand) */}
            <div className="bg-stone-900/50 border border-amber-900/40 rounded-2xl p-4 text-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Vincular con otro Dispositivo</span>
                </div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> Códigos seguros de 5 minutos
                </span>
              </div>

              {/* POP-UP CONFIRMATION (OPCIÓN C) */}
              {incomingSyncRequest && (
                <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-2 border-amber-400 rounded-2xl shadow-2xl space-y-3 animate-speech">
                  <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                    <Smartphone className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span>¡Solicitud de Vinculación Recibida!</span>
                  </div>
                  <p className="text-xs text-stone-200 leading-relaxed">
                    Un nuevo dispositivo (<strong className="text-amber-300">{incomingSyncRequest.targetName}</strong>) ingresó tu código temporal y solicita acceso a tu perfil de Truco.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleResolveSync('mirror')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                    >
                      <span>🔗 Mantener sincronizados (Espejo)</span>
                    </button>
                    <button
                      onClick={() => handleResolveSync('transfer')}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-600/60 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <span>📦 Transferir y cerrar sesión aquí</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleResolveSync('reject')}
                    className="w-full text-center text-[11px] text-stone-400 hover:text-red-400 pt-1 transition-colors"
                  >
                    ✕ Rechazar vinculación
                  </button>
                </div>
              )}

              {/* ACTIVE CODE VIEW */}
              {activeSyncCode && !incomingSyncRequest ? (
                <div className="bg-black/60 p-3.5 rounded-xl border border-amber-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-300">
                      Código temporal generado para exportar:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-400/40 text-amber-300 font-mono font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{formatTimer(remainingSeconds)}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-mono text-amber-300 tracking-widest font-black">
                      {activeSyncCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-colors"
                    >
                      {copiedSyncCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSyncCode ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-stone-400">
                    Ingresá este código en tu otro dispositivo. Cuando lo hagas, aparecerá aquí un pop-up para autorizarlo.
                  </p>
                </div>
              ) : !incomingSyncRequest && (
                /* BUTTON TO GENERATE CODE */
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-stone-800">
                  <div>
                    <span className="text-[11px] font-bold text-stone-200 block">¿Querés jugar en otro celular o tablet?</span>
                    <span className="text-[10px] text-stone-400 block">Generá un código único con vencimiento de 5 minutos.</span>
                  </div>
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition-colors shadow active:scale-95 shrink-0 flex items-center gap-1.5"
                  >
                    {isGeneratingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                    <span>Generar Código</span>
                  </button>
                </div>
              )}

              {/* INPUT CODE ON RECEIVING DEVICE */}
              <div className="pt-1">
                <span className="text-[10px] text-stone-400 block mb-1">
                  O si tenés un código generado desde otro celular, ingresalo acá:
                </span>
                <form onSubmit={handleTargetLinkSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: TRUCO-XXXX"
                    value={inputSyncCode}
                    onChange={(e) => setInputSyncCode(e.target.value.toUpperCase())}
                    disabled={targetWaiting}
                    className="flex-1 bg-black/60 border border-amber-900/50 rounded-xl px-3 py-1.5 text-xs text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={targetWaiting || !inputSyncCode.trim()}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                  >
                    {targetWaiting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" /> : null}
                    <span>{targetWaiting ? 'Esperando...' : 'Vincular'}</span>
                  </button>
                </form>
              </div>

              {/* STATUS MESSAGES */}
              {targetWaiting && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2 text-[11px] text-amber-200 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <span>Esperando confirmación en el celular emisor. Por favor aceptá la solicitud en la otra pantalla.</span>
                </div>
              )}

              {syncStatusMsg && !targetWaiting && (
                <p className={`text-[11px] font-medium p-2 rounded-xl border ${
                  syncStatusType === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : syncStatusType === 'error'
                    ? 'bg-red-950/40 border-red-500 text-red-300'
                    : 'bg-stone-900 border-stone-700 text-amber-300'
                }`}>
                  {syncStatusMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Misiones Diarias */}
        {activeTab === 'missions' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  3 Desafíos de la Pulpería
                </h3>
                <p className="text-[11px] text-stone-400">Completalos antes de la medianoche para ganar monedas.</p>
              </div>
              {profile.allMissionsClaimedToday && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Día Perfecto (+2 🪙)
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {profile.missions.map((m) => {
                const isClaimable = m.completed && !m.claimed;
                const progressPercent = Math.min(100, Math.round((m.progress / m.target) * 100));

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      m.claimed
                        ? 'bg-stone-900/40 border-stone-800/80 opacity-70'
                        : isClaimable
                        ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40'
                        : 'bg-stone-900/70 border-amber-900/40'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded bg-stone-800 text-amber-400">
                          {m.category}
                        </span>
                        <h4 className="text-sm font-bold text-amber-200">{m.title}</h4>
                      </div>
                      <p className="text-[11px] text-stone-300">{m.description}</p>

                      {/* Progress bar */}
                      <div className="w-full max-w-xs flex items-center gap-2 pt-1">
                        <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                          <div
                            className={`h-full transition-all duration-500 ${
                              m.completed ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 shrink-0">
                          {m.progress}/{m.target}
                        </span>
                      </div>
                    </div>

                    {/* Action / Status */}
                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-0.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> +{m.rewardCoins}
                      </span>

                      {m.claimed ? (
                        <span className="px-3 py-1 bg-stone-800 text-stone-400 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Reclamada
                        </span>
                      ) : isClaimable ? (
                        <button
                          onClick={() => handleClaim(m.id)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-lg animate-pulse transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-current" />
                          <span>Reclamar</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-stone-800/80 text-stone-400 text-xs font-medium rounded-xl">
                          En curso
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Bazar Criollo (With Rich Visual Graphic Previews) */}
        {activeTab === 'bazar' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'mate', label: 'Mates 🧉' },
                { id: 'title', label: 'Títulos 📜' },
                { id: 'border', label: 'Marcos 🖼️' },
                { id: 'cardBack', label: 'Dorsos 🃏' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBazarFilter(f.id as any)}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    bazarFilter === f.id
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredCatalog.map(item => {
                const isUnlocked = profile.unlockedItems.includes(item.id);
                
                // Check if currently equipped
                let isEquipped = false;
                if (item.category === 'mate') isEquipped = profile.equippedMate === item.id.replace('mate_', '');
                else if (item.category === 'title') isEquipped = profile.equippedTitle === item.name;
                else if (item.category === 'border') isEquipped = profile.equippedBorder === item.id.replace('border_', '');
                else if (item.category === 'cardBack') isEquipped = profile.equippedCardBack === item.id.replace('card_', '');

                const canAfford = profile.coins >= item.price;
                const isQuickWin = item.id === 'mate_algarrobo';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                        : isUnlocked
                        ? 'bg-stone-900/80 border-stone-700'
                        : 'bg-stone-950/90 border-amber-950/70 hover:border-amber-800/80'
                    }`}
                  >
                    <div>
                      {/* Visual Item Preview + Metadata */}
                      <div className="flex items-start gap-3 mb-2">
                        {/* Graphical Preview Container */}
                        <div className="shrink-0 p-2 rounded-2xl bg-black/50 border border-amber-900/40 flex items-center justify-center min-w-[70px] min-h-[70px]">
                          {item.category === 'mate' && <MatePreview mateId={item.id} className="w-14 h-16" />}
                          {item.category === 'cardBack' && <CardBackPreview cardId={item.id} className="w-12 h-16" />}
                          {item.category === 'border' && <BorderPreview borderId={item.id} className="w-14 h-14" />}
                          {item.category === 'title' && (
                            <div className="text-3xl flex items-center justify-center">📜</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                              {item.category === 'mate' ? 'Mate de Mesa' : item.category === 'title' ? 'Título' : item.category === 'border' ? 'Marco' : 'Dorso'}
                            </span>
                            {isQuickWin && !isUnlocked && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                ⭐ ¡Primer Mate!
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-amber-200 leading-tight">{item.name}</h4>
                          <p className="text-[11px] text-stone-300 mt-1 leading-snug line-clamp-2">{item.description}</p>
                        </div>
                      </div>

                      {/* Title ribbon if category is title */}
                      {item.category === 'title' && (
                        <div className="mt-1 mb-2">
                          <TitlePreview titleName={item.name} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-stone-800/80">
                      {isUnlocked ? (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Desbloqueado
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-black text-amber-300 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {item.price}
                        </span>
                      )}

                      {isEquipped ? (
                        <span className="px-3 py-1 bg-emerald-600/30 border border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Check className="w-3 h-3" /> Equipado
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleEquip(item)}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-600/40 text-xs font-bold rounded-xl transition-all active:scale-95"
                        >
                          Equipar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford}
                          className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow active:scale-95 cursor-pointer'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>Comprar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
