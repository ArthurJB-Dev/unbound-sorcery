import React from "react";
import { GameState } from "../types/game";
import {
  formatNumber,
  formatAge,
  lifePhase,
  season,
  moonPhase,
} from "../utils/format";
import {
  getCurrentRank,
  calculateMPS,
  getMaxHealth,
} from "../engine/calculations";
import { Zap, Heart, Brain, Moon, Sun, Wind, Timer } from "lucide-react";

interface TopBarProps {
  state: GameState;
}

export const TopBar: React.FC<TopBarProps> = ({ state }) => {
  const currentRank = getCurrentRank(state.economy.historicalMana);
  const mps = calculateMPS(state);
  const maxHp = getMaxHealth(state);
  const hpPercent = (state.player.health / maxHp) * 100;
  const fatiguePercent = state.player.fatigue;
  const phase = lifePhase(state.player.ageDays / 365);
  const currentSeason = season(state.player.ageDays);
  const currentMoon = moonPhase(state.player.ageDays);

  return (
    <div className="w-full bg-[#0a0c14] border-b border-slate-800 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 sticky top-0 z-50 shadow-2xl">
      {/* Bio & Time */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-500 font-cinzel text-sm font-bold">
          <Zap size={16} />
          <span>GERAÇÃO {state.player.generation}</span>
        </div>
        <div className="text-xl font-cinzel font-bold tracking-tight">
          {formatAge(state.player.ageDays)}
          <span className="text-xs text-slate-500 ml-2 uppercase tracking-widest">
            {phase}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            {currentSeason === "Verão" ? (
              <Sun size={12} className="text-orange-400" />
            ) : (
              <Wind size={12} className="text-blue-300" />
            )}
            {currentSeason}
          </div>
          <div className="flex items-center gap-1">
            <Moon size={12} className="text-purple-400" />
            {currentMoon}
          </div>
        </div>
      </div>

      {/* Vitality & Fatigue */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end text-xs font-cinzel">
          <span className="flex items-center gap-1 text-rose-500">
            <Heart size={14} /> SAÚDE
          </span>
          <span>
            {Math.floor(state.player.health)} / {Math.floor(maxHp)}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-rose-600 transition-all duration-500"
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-end text-xs font-cinzel mt-1">
          <span className="flex items-center gap-1 text-cyan-500">
            <Timer size={14} /> FADIGA
          </span>
          <span
            className={
              state.player.fatigue >= 90 ? "text-rose-500 animate-pulse" : ""
            }
          >
            {Math.floor(state.player.fatigue)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              state.player.fatigue >= 90
                ? "bg-rose-500"
                : state.player.fatigue >= 50
                  ? "bg-amber-500"
                  : "bg-cyan-500"
            }`}
            style={{ width: `${fatiguePercent}%` }}
          />
        </div>
      </div>

      {/* Economy */}
      <div className="flex flex-col justify-center">
        <div className="text-xs text-slate-500 font-cinzel uppercase tracking-widest">
          Mana Reservada
        </div>
        <div className="text-2xl font-bold text-blue-400 font-cinzel drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">
          {formatNumber(state.economy.mana)}
        </div>
        <div className="text-xs text-slate-400">+{formatNumber(mps)}/s</div>
      </div>

      {/* Rank & Knowledge */}
      <div className="flex flex-col justify-center border-l border-slate-800 pl-4">
        <div className="text-xs text-slate-500 font-cinzel uppercase tracking-widest">
          Rank {currentRank.id}: {currentRank.name}
        </div>
        <div className="text-lg font-bold text-amber-500 font-cinzel">
          {formatNumber(state.economy.historicalMana)}{" "}
          <span className="text-[10px] text-slate-500">MANA TOTAL</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Brain size={14} className="text-indigo-400" />
          <span className="text-sm text-indigo-300 font-bold">
            {formatNumber(state.economy.knowledge)} CA
          </span>
        </div>
      </div>

      {/* Collapse Overlay (if fatigue >= 100) */}
      {state.player.collapseTimer > 0 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-rose-500 font-cinzel text-xl font-bold animate-pulse">
              COLAPSO MÍSTICO
            </h2>
            <p className="text-slate-400 text-sm">
              Recuperando equilíbrio... {Math.ceil(state.player.collapseTimer)}s
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
