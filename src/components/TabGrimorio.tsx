import React, { useState } from 'react';
import { GameState } from '../types/game';
import { RANKS } from '../data/gameData';
import { formatNumber } from '../utils/format';
import { calculateClickPower } from '../engine/calculations';
import { Sparkles, Trophy, BookOpen, AlertTriangle } from 'lucide-react';

interface TabGrimorioProps {
  state: GameState;
  clickOrb: () => void;
}

export const TabGrimorio: React.FC<TabGrimorioProps> = ({ state, clickOrb }) => {
  const [clicking, setClicking] = useState(false);
  const clickPower = calculateClickPower(state);
  const isCollapsed = state.player.collapseTimer > 0;
  const fatiguePct = Math.min(100, Math.max(0, state.player.fatigue));

  const handleOrbClick = () => {
    if (isCollapsed) return;
    setClicking(true);
    clickOrb();
    setTimeout(() => setClicking(false), 100);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Central Orb Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative">
        <div className="absolute top-0 left-0 text-slate-500 font-cinzel text-xs flex items-center gap-2">
          <BookOpen size={14} /> GRIMÓRIO DO DESPERTAR
        </div>

        {/* The Orb */}
        <button
          onClick={handleOrbClick}
          disabled={isCollapsed}
          className={`relative group transition-all duration-150 ${
            isCollapsed
              ? 'cursor-not-allowed opacity-85'
              : clicking
              ? 'scale-95'
              : 'hover:scale-105'
          }`}
        >
          {/* Outer glow */}
          <div
            className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${
              isCollapsed
                ? 'bg-red-600/30 animate-pulse'
                : 'bg-blue-500/20 group-hover:bg-blue-500/40'
            }`}
          />

          {/* Core Orb */}
          <div
            className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-2 flex items-center justify-center relative overflow-hidden bg-slate-900 transition-colors duration-300 ${
              isCollapsed
                ? 'border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.35)]'
                : 'border-blue-400/30 shadow-[0_0_50px_rgba(59,130,246,0.3)]'
            }`}
          >
            {/* Spinning inner circles */}
            <div
              className={`absolute inset-2 border rounded-full animate-[spin_10s_linear_infinite] ${
                isCollapsed ? 'border-red-500/30' : 'border-blue-500/20'
              }`}
            />
            <div
              className={`absolute inset-6 border rounded-full animate-[spin_15s_linear_infinite_reverse] ${
                isCollapsed ? 'border-amber-500/20' : 'border-cyan-500/10'
              }`}
            />

            <div className="text-center z-10 select-none px-4">
              {isCollapsed ? (
                <>
                  <div className="text-red-400 font-cinzel text-xs tracking-[0.15em] mb-1 flex items-center justify-center gap-1">
                    <AlertTriangle size={14} /> COLAPSO MÍSTICO
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-red-200 font-mono">
                    {Math.ceil(state.player.collapseTimer)}s
                  </div>
                  <div className="text-[10px] text-red-300/70 mt-1 uppercase">
                    Estabilizando núcleo...
                  </div>
                </>
              ) : (
                <>
                  <div className="text-blue-300 font-cinzel text-xs tracking-[0.2em] mb-1">
                    CANALIZAR
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white font-cinzel">
                    +{formatNumber(clickPower)}
                  </div>
                  <div className="text-[10px] text-blue-400/60 mt-1 uppercase">
                    Mana / Clique
                  </div>
                </>
              )}
            </div>

            {/* Pulsing effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr to-transparent opacity-50 ${
                isCollapsed ? 'from-red-600/20' : 'from-blue-600/10'
              }`}
            />
          </div>
        </button>

        {/* Status de Fadiga abaixo da Orbe */}
        <div className="mt-6 w-64">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Fadiga Mística</span>
            <span
              className={`font-mono font-bold ${
                isCollapsed
                  ? 'text-red-400'
                  : fatiguePct >= 90
                  ? 'text-orange-400'
                  : fatiguePct >= 50
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              {fatiguePct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                isCollapsed
                  ? 'bg-red-500'
                  : fatiguePct >= 90
                  ? 'bg-orange-500'
                  : fatiguePct >= 50
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${fatiguePct}%` }}
            />
          </div>
        </div>

        <div className="mt-6 text-center max-w-sm">
          <p className="text-slate-500 text-sm italic">
            {isCollapsed
              ? 'Seu corpo sobrecarregou. Aguarde o contador zerar para voltar a canalizar.'
              : '"A vontade é a primeira faísca. O esforço é o combustível do infinito."'}
          </p>
        </div>
      </div>

      {/* Ranks Table */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 backdrop-blur-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-amber-500 font-cinzel font-bold border-b border-slate-800 pb-2">
          <Trophy size={18} /> PROGRESSÃO DE RANKS
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar space-y-2 flex-1 max-h-[500px]">
          {RANKS.map((rank) => {
            const isUnlocked = state.economy.historicalMana >= rank.threshold;
            const isCurrent = state.rank === rank.id;

            return (
              <div
                key={rank.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : isUnlocked
                    ? 'bg-slate-800/40 border-slate-700 opacity-80'
                    : 'bg-black/20 border-slate-900 opacity-40'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isUnlocked
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rank.id}
                    </span>
                    <h3
                      className={`font-cinzel font-bold text-sm ${
                        isCurrent
                          ? 'text-blue-300'
                          : isUnlocked
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {rank.name}
                    </h3>
                  </div>
                  {!isUnlocked && (
                    <div className="text-[10px] font-mono text-slate-600">
                      Req: {formatNumber(rank.threshold)}
                    </div>
                  )}
                  {isCurrent && <Sparkles size={14} className="text-amber-500 animate-pulse" />}
                </div>

                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {rank.notes}
                </div>

                {isUnlocked && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {rank.unlocks.map((u, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded text-[9px] border border-blue-800/50"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};