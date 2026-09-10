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
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wider text-amber-200 uppercase font-serif">
                Manual de la Pulpería
              </h2>
              <p className="text-[11px] text-amber-400/80">
                Reglas, jerarquía y secretos del Truco Argentino
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-900/50 bg-stone-950 px-2 sm:px-4 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'hierarchy'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            Jerarquía 👑
          </button>
          <button
            onClick={() => setActiveTab('envido')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'envido'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            Envido & Flor 🍷
          </button>
          <button
            onClick={() => setActiveTab('cantos')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cantos'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            Puntos 🪙
          </button>
          <button
            onClick={() => setActiveTab('senas')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-wide border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'senas'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            Señas 🤫
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 text-stone-200 text-xs sm:text-sm custom-scrollbar">
          {/* TAB 1: JERARQUIA */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-2.5">
              <p className="text-stone-300 text-xs">
                En el Truco, las cartas tienen un orden estricto de mayor a menor poder. Las cartas de arriba siempre le ganan a las de abajo:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-950/40 border border-sky-500/50">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sky-400 text-sm">1º</span>
                    <div>
                      <strong className="text-sky-300 block text-xs sm:text-sm">1 de Espada (Macho)</strong>
                      <span className="text-[10px] text-stone-400">La carta más poderosa del juego</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-sky-900/60 text-sky-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Rey Supremo</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/50">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-400 text-sm">2º</span>
                    <div>
                      <strong className="text-emerald-300 block text-xs sm:text-sm">1 de Basto (Hembra)</strong>
                      <span className="text-[10px] text-stone-400">Segunda en jerarquía absoluta</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Matadora</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/30 border border-amber-700/40">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-400 text-sm">3º</span>
                    <div>
                      <strong className="text-amber-200 block text-xs sm:text-sm">7 de Espada (Manilla)</strong>
                      <span className="text-[10px] text-stone-400">La espada brava</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Triunfo Bravo</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/30 border border-amber-700/40">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-400 text-sm">4º</span>
                    <div>
                      <strong className="text-amber-200 block text-xs sm:text-sm">7 de Oro (Manilla)</strong>
                      <span className="text-[10px] text-stone-400">El siete de oro reluciente</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Triunfo Bravo</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-300 text-sm">5º</span>
                    <div>
                      <strong className="text-stone-200 block text-xs sm:text-sm">Todos los 3</strong>
                      <span className="text-[10px] text-stone-400">3 de Espada, Basto, Oro y Copa (empatados entre sí)</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Poderosos</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-300 text-sm">6º</span>
                    <div>
                      <strong className="text-stone-200 block text-xs sm:text-sm">Todos los 2</strong>
                      <span className="text-[10px] text-stone-400">2 de Espada, Basto, Oro y Copa</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Muy Buenos</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-300 text-sm">7º</span>
                    <div>
                      <strong className="text-stone-200 block text-xs sm:text-sm">1 de Oro y 1 de Copa</strong>
                      <span className="text-[10px] text-stone-400">Los "Ases falsos" o perras</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Medios</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-400 text-sm">8º</span>
                    <div>
                      <strong className="text-stone-300 block text-xs sm:text-sm">Todos los 12 (Reyes)</strong>
                      <span className="text-[10px] text-stone-400">12 de cualquier palo</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-850 text-stone-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">Figuras</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-400 text-sm">9º</span>
                    <div>
                      <strong className="text-stone-300 block text-xs sm:text-sm">Todos los 11 (Caballos)</strong>
                      <span className="text-[10px] text-stone-400">11 de cualquier palo</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-850 text-stone-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">Figuras</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-400 text-sm">10º</span>
                    <div>
                      <strong className="text-stone-300 block text-xs sm:text-sm">Todos los 10 (Sotas)</strong>
                      <span className="text-[10px] text-stone-400">10 de cualquier palo</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-850 text-stone-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">Figuras</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 opacity-90">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-500 text-sm">11º</span>
                    <div>
                      <strong className="text-stone-350 block text-xs sm:text-sm">7 de Basto y 7 de Copa</strong>
                      <span className="text-[10px] text-stone-400">Los "Sietes falsos" o comunes</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-850 text-stone-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">Bajas</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 opacity-80">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-500 text-sm">12º</span>
                    <div>
                      <strong className="text-stone-400 block text-xs sm:text-sm">Todos los 6</strong>
                      <span className="text-[10px] text-stone-500">6 de cualquier palo</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-850 text-stone-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">Bajas</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 opacity-70">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-500 text-sm">13º</span>
                    <div>
                      <strong className="text-stone-400 block text-xs sm:text-sm">Todos los 5</strong>
                      <span className="text-[10px] text-stone-500">5 de cualquier palo</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-850 text-stone-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">Bajas</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-500 text-sm">14º</span>
                    <div>
                      <strong className="text-stone-400 block text-xs sm:text-sm">Todos los 4</strong>
                      <span className="text-[10px] text-stone-500">La carta más baja del Truco</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-850 text-stone-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">Mínimas</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENVIDO Y FLOR */}
          {activeTab === 'envido' && (
            <div className="space-y-3.5">
              <div className="bg-stone-900/80 border border-amber-900/50 rounded-2xl p-3.5 space-y-2">
                <h3 className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> ¿Cómo se calcula el Envido?
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  El Envido premia ligar <strong>dos cartas del mismo palo</strong>. Cuando tenés dos cartas del mismo palo, sumás sus valores más <strong>20 puntos extra</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-amber-900/30 text-xs space-y-1">
                  <p className="text-amber-200 font-bold">Valores de las cartas para el Envido:</p>
                  <ul className="list-disc list-inside text-stone-300 space-y-0.5 text-[11px]">
                    <li>Los <strong>1, 2, 3, 4, 5, 6 y 7</strong> valen su propio número.</li>
                    <li>Las figuras (<strong>10, 11 y 12</strong>) valen <strong>0 puntos</strong> de Envido.</li>
                  </ul>
                </div>
                <ul className="text-stone-300 text-xs space-y-1.5 pt-1">
                  <li>Ejemplo 1: <strong>7 de Oro + 6 de Oro</strong> = 7 + 6 + 20 = <strong>33 de Envido</strong> (el máximo posible).</li>
                  <li>Ejemplo 2: <strong>11 de Espada + 7 de Espada</strong> = 0 + 7 + 20 = <strong>27 de Envido</strong>.</li>
                  <li>Ejemplo 3: <strong>10 de Basto + 12 de Basto</strong> = 0 + 0 + 20 = <strong>20 de Envido</strong>.</li>
                  <li>Si tenés tres palos distintos, tu envido es simplemente el valor de tu carta más alta (un 7 vale 7, una figura vale 0).</li>
                </ul>
              </div>

              <div className="bg-stone-900/80 border border-purple-900/50 rounded-2xl p-3.5 space-y-2">
                <h3 className="font-black text-purple-300 text-sm flex items-center gap-1.5">
                  🌸 La Flor (3 cartas del mismo palo)
                </h3>
                <p className="text-stone-300 text-xs">
                  Si la partida se juega <em>Con Flor</em> y te tocan <strong>3 cartas del mismo palo</strong>, tenés Flor. Se suma 20 + el valor de las tres cartas. Otorga 3 puntos automáticos y anula el Envido de esa mano.
                </p>
              </div>

              <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200">
                💡 <strong>Regla Gaucha:</strong> ¡El Envido siempre va primero! Si te cantan Truco y todavía no jugaste ninguna carta, podés cantar Envido antes de responder al Truco.
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
                    <strong className="text-sky-300 block font-black">¡Truco!</strong>
                    <span className="text-[11px] text-stone-300 block">Si se quiere: <strong>2 puntos</strong></span>
                    <span className="text-[10px] text-stone-400 block">Si no se quiere: 1 punto</span>
                  </div>
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-blue-300 block font-black">¡Re-Truco!</strong>
                    <span className="text-[11px] text-stone-300 block">Si se quiere: <strong>3 puntos</strong></span>
                    <span className="text-[10px] text-stone-400 block">Si no se quiere: 2 puntos</span>
                  </div>
                  <div className="p-3 bg-stone-900/80 border border-amber-900/50 rounded-xl">
                    <strong className="text-amber-300 block font-black">¡Vale Cuatro!</strong>
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
                    <span className="text-[10px] text-stone-400 block">¡Define la partida!</span>
                  </div>
                </div>
              </div>

              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-2.5 text-[11px] text-stone-300">
                🤝 <strong>La Parda (Empate):</strong> Si la primera mano empata, gana quien gane la segunda. Si empatan las tres, gana quien sea Mano.
              </div>
            </div>
          )}

          {/* TAB 4: SEÑAS */}
          {activeTab === 'senas' && (
            <div className="space-y-2.5">
              <p className="text-stone-300 text-xs">
                Las señas tradicionales del Truco se usan para comunicarle disimuladamente a tu compañero qué cartas tenés:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">1 de Espada:</strong>
                  <span className="text-stone-300">Levantar ambas cejas.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <strong className="text-amber-300 block">1 de Basto:</strong>
                  <span className="text-stone-300">Guiñar un ojo.</span>
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
