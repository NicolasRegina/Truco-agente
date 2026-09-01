import React, { useState } from 'react';
import { ThemeId, ThemeDefinition } from '../themes/types';
import { getAllThemes, getTheme } from '../themes/themeRegistry';
import { CardView } from './CardView';
import { Card } from '@truco/core';
import { Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/soundController';

interface ThemeStoreModalProps {
  currentThemeId: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onClose: () => void;
}

export const ThemeStoreModal: React.FC<ThemeStoreModalProps> = ({
  currentThemeId,
  onSelectTheme,
  onClose
}) => {
  const themes = getAllThemes();
  const [selectedPreviewId, setSelectedPreviewId] = useState<ThemeId>(currentThemeId);
  const previewTheme = getTheme(selectedPreviewId);

  // Sample cards for live 3D preview
  const sampleAsEspada: Card = { id: 'sample_as', suit: 'espada', value: 1, rank: 14, envidoValue: 1 };
  const sampleReyCopa: Card = { id: 'sample_rey', suit: 'copa', value: 12, rank: 7, envidoValue: 0 };
  const sampleSieteOro: Card = { id: 'sample_siete', suit: 'oro', value: 7, rank: 11, envidoValue: 7 };

  const handleEquip = (id: ThemeId) => {
    soundFx.playScoreTally();
    onSelectTheme(id);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-speech overflow-y-auto">
      <div className="bg-wood-border border-2 border-amber-500/70 rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-amber-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-serif">Tienda de Temas & Skins</h2>
              <p className="text-xs text-stone-300">Personalizá las cartas, los palos, las figuras y la mesa de juego.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2-Column Grid (Theme List & Live Preview) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left: Theme Cards Selector (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">Colecciones Disponibles</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map((t: ThemeDefinition) => {
                const isSelected = selectedPreviewId === t.id;
                const isEquipped = currentThemeId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedPreviewId(t.id);
                      soundFx.playCardFlick();
                    }}
                    className={`
                      p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden
                      ${isSelected
                        ? 'border-amber-400 bg-amber-950/70 shadow-lg scale-102 ring-2 ring-amber-400/40'
                        : 'border-stone-800 bg-black/40 hover:bg-stone-900/60'}
                    `}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {t.badge}
                      </span>
                      {isEquipped && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Equipado
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="text-sm font-black text-amber-200 font-serif">{t.name}</h4>
                      <p className="text-[11px] text-stone-300 mt-0.5 line-clamp-2">{t.tagline}</p>
                    </div>

                    {/* Palos preview mini */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-amber-900/40">
                      <span className="text-[9px] text-stone-400">Palos:</span>
                      <div className="flex items-center gap-1.5">
                        {t.suits.espada.mini}
                        {t.suits.basto.mini}
                        {t.suits.oro.mini}
                        {t.suits.copa.mini}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Future Collaboration Callout */}
            <div className="mt-2 p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-purple-300 block">Próximamente: Colaboraciones Especiales</span>
                <span className="text-stone-300 text-[11px]">League of Legends, Pokémon, streamers y clubes del fútbol argentino.</span>
              </div>
            </div>
          </div>

          {/* Right: Live Thematic Arena & Card Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">Vista Previa en Vivo</span>

            {/* Felt Simulation Box */}
            <div className={`p-4 rounded-2xl ${previewTheme.colors.tableFelt} border-2 border-amber-500/50 shadow-inner flex flex-col items-center justify-center gap-3 relative min-h-[260px] overflow-hidden`}>
              <span className="text-xs font-bold text-white/90 drop-shadow">
                Mazo: {previewTheme.name}
              </span>

              {/* 3 Sample Cards Hand */}
              <div className="flex items-center justify-center -space-x-4 sm:-space-x-5 py-2">
                <div className="-rotate-12 hover:-translate-y-2 transition-transform">
                  <CardView card={sampleAsEspada} size="sm" themeId={selectedPreviewId} />
                </div>
                <div className="z-10 hover:-translate-y-2 transition-transform">
                  <CardView card={sampleReyCopa} size="sm" themeId={selectedPreviewId} />
                </div>
                <div className="rotate-12 hover:-translate-y-2 transition-transform">
                  <CardView card={sampleSieteOro} size="sm" themeId={selectedPreviewId} />
                </div>
                <div className="rotate-6 hover:-translate-y-2 transition-transform">
                  <CardView isFlipped={true} size="sm" themeId={selectedPreviewId} />
                </div>
              </div>

              {/* Special badges breakdown */}
              <div className="w-full bg-black/50 p-2 rounded-xl border border-white/10 text-[10px] text-stone-200 grid grid-cols-2 gap-1 text-center">
                <div>Ancho Espada: <strong className="text-amber-300">{previewTheme.trumpBadges.anchoEspada}</strong></div>
                <div>Ancho Basto: <strong className="text-amber-300">{previewTheme.trumpBadges.anchoBasto}</strong></div>
              </div>
            </div>

            {/* Equip Button */}
            <button
              onClick={() => handleEquip(selectedPreviewId)}
              disabled={currentThemeId === selectedPreviewId}
              className={`
                w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl
                ${currentThemeId === selectedPreviewId
                  ? 'bg-stone-800 text-stone-400 border border-stone-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-stone-950 border border-amber-300'}
              `}
            >
              {currentThemeId === selectedPreviewId ? (
                <>
                  <Check className="w-4 h-4" />
                  Tema Actualmente Equipado
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  Equipar {previewTheme.name}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
