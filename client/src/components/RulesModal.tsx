import React, { useState } from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'envido' | 'cantos' | 'senas'>('hierarchy');

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4 animate-speech">
      <div className="bg-stone-950 border border-amber-500/50 rounded-2xl sm:rounded-3xl max-w-2xl w-full text-amber-100 shadow-2xl flex flex-col h-[84dvh] sm:h-[78vh] max-h-[88dvh] sm:max-h-[82vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-amber-900/60 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 font-headline tracking-wide">
                Manual de la Pulper�a
              </h2>
              <p className="text-[10px] sm:text-[11px] text-amber-200/80">
                Reglas, jerarqu�a y secretos del Truco Argentino
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 border-b border-amber-900/50 bg-stone-900/40 text-[11px] sm:text-xs font-bold shrink-0 text-center">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`py-2 transition-colors border-b-2 ${
              activeTab === 'hierarchy' ? 'border-amber-400 text-amber-300 bg-amber-950/30' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Jerarqu�a ??
          </button>
          <button
            onClick={() => setActiveTab('envido')}
            className={`py-2 transition-colors border-b-2 ${
              activeTab === 'envido' ? 'border-amber-400 text-amber-300 bg-amber-950/30' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Envido & Flor ??
          </button>
          <button
            onClick={() => setActiveTab('cantos')}
            className={`py-2 transition-colors border-b-2 ${
              activeTab === 'cantos' ? 'border-amber-400 text-amber-300 bg-amber-950/30' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Puntos ??
          </button>
          <button
            onClick={() => setActiveTab('senas')}
            className={`py-2 transition-colors border-b-2 ${
              activeTab === 'senas' ? 'border-amber-400 text-amber-300 bg-amber-950/30' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Se�as ??
          </button>
        </div>

        {/* Content Tabs with Smooth Scroll */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 flex-1 min-h-0 overscroll-contain text-xs sm:text-sm">
          {/* TAB 1: JERARQU�A */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-2.5">
              <p className="text-stone-300 text-xs">
                En el Truco, las cartas tienen un orden estricto de mayor a menor poder. Las cartas de arriba siempre le ganan a las de abajo:
              </p>

              <div className="space-y-1.5">
                {[
                  { rank: '1�', name: '1 de Espada (Macho)', desc: 'La carta m�s poderosa del juego', tag: 'Rey supremo', color: 'text-sky-400 border-sky-400/40 bg-sky-950/30' },
                  { rank: '2�', name: '1 de Basto (Hembra)', desc: 'Segunda en jerarqu�a absoluta', tag: 'Matadora', color: 'text-emerald-400 border-emerald-400/40 bg-emerald-950/30' },
                  { rank: '3�', name: '7 de Espada (Manilla)', desc: 'La espada brava', tag: 'Triunfo bravo', color: 'text-amber-400 border-amber-400/40 bg-amber-950/30' },
                  { rank: '4�', name: '7 de Oro (Manilla)', desc: 'El siete de oro reluciente', tag: 'Triunfo bravo', color: 'text-amber-400 border-amber-400/40 bg-amber-950/30' },
                  { rank: '5�', name: 'Todos los 3', desc: '3 de Espada, Basto, Oro y Copa (empatados entre s�)', tag: 'Poderosos', color: 'text-stone-200 border-stone-700 bg-stone-900/60' },
                  { rank: '6�', name: 'Todos los 2', desc: '2 de Espada, Basto, Oro y Copa', tag: 'Muy buenos', color: 'text-stone-200 border-stone-700 bg-stone-900/60' },
                  { rank: '7�', name: '1 de Oro y 1 de Copa', desc: 'Los "Ases falsos" o perras', tag: 'Medios', color: 'text-stone-300 border-stone-700 bg-stone-900/50' },
                  { rank: '8�', name: 'Todos los 12 (Reyes)', desc: '12 de cualquier palo', tag: 'Figuras', color: 'text-stone-300 border-stone-800 bg-stone-900/40' },
                  { rank: '9�', name: 'Todos los 11 (Caballos)', desc: '11 de cualquier palo', tag: 'Figuras', color: 'text-stone-300 border-stone-800 bg-stone-900/40' },
                  { rank: '10�', name: 'Todos los 10 (Sotas)', desc: '10 de cualquier palo', tag: 'Figuras', color: 'text-stone-300 border-stone-800 bg-stone-900/40' },
                  { rank: '11�', name: '7 de Basto y 7 de Copa', desc: 'Los "Sietes falsos" o culones', tag: 'Bajos', color: 'text-stone-400 border-stone-800 bg-stone-900/30' },
                  { rank: '12�', name: 'Todos los 6', desc: '6 de cualquier palo', tag: 'Bajos', color: 'text-stone-400 border-stone-800 bg-stone-900/30' },
                  { rank: '13�', name: 'Todos los 5', desc: '5 de cualquier palo', tag: 'Muy bajos', color: 'text-stone-400 border-stone-800 bg-stone-900/20' },
                  { rank: '14�', name: 'Todos los 4', desc: 'Las cartas m�s bajas del mazo', tag: 'Los cuatro', color: 'text-stone-500 border-stone-800 bg-stone-900/20' }
                ].map((item, i) => (
                  <div key={i} className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${item.color}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs w-6">{item.rank}</span>
                      <div>
                        <strong className="block text-xs sm:text-sm font-bold">{item.name}</strong>
                        <span className="text-[10px] text-stone-400">{item.desc}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10 shrink-0">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ENVIDO Y FLOR */}
          {activeTab === 'envido' && (
            <div className="space-y-3">
              <div className="bg-stone-900/80 border border-amber-900/50 rounded-2xl p-3.5 space-y-2">
                <h3 className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  �C�mo se suma el Envido?
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-stone-300 text-xs">
                  <li>Si ten�s <strong>2 cartas del mismo palo</strong>, sum�s sus valores m�s <strong>20 puntos base</strong>.</li>
                  <li>Las figuras (<strong>10, 11 y 12</strong>) valen <strong>0 puntos</strong> para el Envido.</li>
                  <li>Ejemplo 1: <strong>7 de Oro + 6 de Oro</strong> = 7 + 6 + 20 = <strong>33 de Envido</strong> (el m�ximo posible).</li>
                  <li>Ejemplo 2: <strong>11 de Espada + 7 de Espada</strong> = 0 + 7 + 20 = <strong>27 de Envido</strong>.</li>
                  <li>Ejemplo 3: <strong>10 de Basto + 12 de Basto</strong> = 0 + 0 + 20 = <strong>20 de Envido</strong>.</li>
                  <li>Si ten�s tres palos distintos, tu envido es simplemente el valor de tu carta m�s alta (un 7 vale 7, una figura vale 0).</li>
                </ul>
              </div>

              <div className="bg-stone-900/80 border border-purple-900/50 rounded-2xl p-3.5 space-y-2">
                <h3 className="font-black text-purple-300 text-sm flex items-center gap-1.5">
                  ?? La Flor (3 cartas del mismo palo)
                </h3>
                <p className="text-stone-300 text-xs">
                  Si la partida se juega <em>Con Flor</em> y te tocan <strong>3 cartas del mismo palo</strong>, ten�s Flor. Se suma 20 + el valor de las tres cartas. Otorga 3 puntos autom�ticos y anula el Envido de esa mano.
                </p>
              </div>

              <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200">
                ?? <strong>Regla Gaucha:</strong> �El Envido siempre va primero! Si te cantan Truco y todav�a no jugaste ninguna carta, pod�s cantar Envido antes de responder al Truco.
              </div>
            </div>
          )}

          {/* TAB 3: CANTOS Y PUNTOS */}
          {activeTab === 'cantos' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <h3 className="font-black text-amber-300 text-xs uppercase tracking-wider">
                  Escala de Cantos del Truco
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-sky-300 block font-black">�Truco!</strong>
                    <span className="text-[11px] text-stone-300 block">Si se quiere: <strong>2 puntos</strong></span>
                    <span className="text-[10px] text-stone-400 block">Si no se quiere: 1 punto</span>
                  </div>
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-blue-300 block font-black">�Re-Truco!</strong>
                    <span className="text-[11px] text-stone-300 block">Si se quiere: <strong>3 puntos</strong></span>
                    <span className="text-[10px] text-stone-400 block">Si no se quiere: 2 puntos</span>
                  </div>
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-amber-300 block font-black">�Vale Cuatro!</strong>
                    <span className="text-[11px] text-stone-300 block">Si se quiere: <strong>4 puntos</strong></span>
                    <span className="text-[10px] text-stone-400 block">Si no se quiere: 3 puntos</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-amber-300 text-xs uppercase tracking-wider">
                  Escala de Cantos del Envido
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-amber-400 block font-black">Envido</strong>
                    <span className="text-[11px] text-stone-300 block">Vale <strong>2 puntos</strong></span>
                    <span className="text-[10px] text-stone-400 block">Rechazo: 1 punto</span>
                  </div>
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-amber-400 block font-black">Real Envido</strong>
                    <span className="text-[11px] text-stone-300 block">Vale <strong>3 puntos</strong></span>
                    <span className="text-[10px] text-stone-400 block">Directo no querido: 1 pt</span>
                  </div>
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-amber-400 block font-black">Falta Envido</strong>
                    <span className="text-[11px] text-stone-300 block">Lo que le falta al puntero para ganar</span>
                    <span className="text-[10px] text-stone-400 block">�Define la partida!</span>
                  </div>
                </div>
              </div>

              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-2.5 text-[11px] text-stone-300">
                ?? <strong>La Parda (Empate):</strong> Si la primera mano empata, gana quien gane la segunda. Si empatan las tres, gana quien sea Mano.
              </div>
            </div>
          )}

          {/* TAB 4: SE�AS */}
          {activeTab === 'senas' && (
            <div className="space-y-2.5">
              <p className="text-stone-300 text-xs">
                Las se�as tradicionales del Truco se usan para comunicarle disimuladamente a tu compa�ero qu� cartas ten�s:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">1 de Espada:</strong>
                  <span className="text-stone-300">Levantar ambas cejas.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">1 de Basto:</strong>
                  <span className="text-stone-300">Gui�ar un ojo.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">7 de Espada:</strong>
                  <span className="text-stone-300">Mover la comisura del labio a la derecha.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">7 de Oro:</strong>
                  <span className="text-stone-300">Mover la comisura del labio a la izquierda.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">Cualquier 3:</strong>
                  <span className="text-stone-300">Morderse suavemente el labio inferior.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">Cualquier 2:</strong>
                  <span className="text-stone-300">Hacer un pico con los labios (como tirando un beso).</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">Tanto alto (Envido):</strong>
                  <span className="text-stone-300">Inclinar la cabeza levemente hacia un costado.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">No tengo nada (Mala mano):</strong>
                  <span className="text-stone-300">Cerrar los dos ojos o bostezar disimuladamente.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

