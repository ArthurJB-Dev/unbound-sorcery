import React from 'react';
import { GameState, ActiveFocus } from '../types/game';
import { SPELLS, MASTERY_LINES } from '../data/gameData';
import { formatNumber } from '../utils/format';
import { BookOpen, Zap, Brain, Skull, CheckCircle } from 'lucide-react';

interface TabSkillsProps {
  state: GameState;
  trainSkill: (focus: ActiveFocus) => void;
  toggleSpell: (spellId: string) => void;
  setFocus: (focus: ActiveFocus) => void;
}

export const TabSkills: React.FC<TabSkillsProps> = ({ state, trainSkill, toggleSpell, setFocus }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 text-arcana-300 font-display text-xl font-bold border-b border-void-600 pb-4">
        <BookOpen size={24} />
        <h1>MAESTRIA & FEITIÇOS</h1>
      </div>

      {/* Maestria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MASTERY_LINES.map((line) => {
          const level = state.skills.levels[line.id] || 0;
          const cost = Math.floor(10 * Math.pow(1.2, level));
          const isActive = state.skills.activeFocus === line.id;

          return (
            <div
              key={line.id}
              className={`p-4 rounded-xl border ${
                isActive ? 'border-arcana-500 bg-void-700/60' : 'border-void-600 bg-void-800/40'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-bold text-lg">{line.name}</h3>
                <span className="text-arcana-400 font-mono text-sm">Lvl {level}</span>
              </div>
              <p className="text-slate-400 text-xs font-serif mb-4 h-10">{line.description}</p>

              <button
                onClick={() => trainSkill(line.id)}
                disabled={state.economy.knowledge < cost}
                className="w-full bg-void-900 border border-arcana-500/50 py-2 rounded text-arcana-300 font-display text-sm hover:bg-arcana-900 disabled:opacity-50 transition-all"
              >
                Evoluir ({formatNumber(cost)} CA)
              </button>

              <button
                onClick={() => setFocus(line.id)}
                className={`mt-2 w-full py-1 text-[10px] font-display uppercase tracking-widest ${
                  isActive ? 'text-arcana-300' : 'text-slate-600'
                }`}
              >
                {isActive ? 'Foco Ativo' : 'Definir Foco'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feitiços */}
      <div className="bg-void-800/40 border border-void-600 rounded-xl p-6">
        <h2 className="font-display text-lg mb-4 text-slate-200">Grimório de Feitiços</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPELLS.map((spell) => {
            const isEquipped = state.skills.equippedSpells.includes(spell.id);
            const canEquip = state.skills.levels[spell.line] >= spell.level;

            return (
              <div
                key={spell.id}
                className={`p-4 rounded border ${
                  isEquipped ? 'border-arcana-500 bg-void-700/40' : 'border-void-600 bg-void-900/40'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-display font-bold text-sm">{spell.name}</h4>
                  {isEquipped && <CheckCircle size={14} className="text-arcana-400" />}
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{spell.description}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>CD: {spell.cooldown}s</span>
                  <button
                    onClick={() => toggleSpell(spell.id)}
                    disabled={!canEquip}
                    className={`px-2 py-1 rounded ${
                      isEquipped ? 'bg-arcana-600 text-white' : 'bg-void-700 hover:bg-void-600'
                    } ${!canEquip ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isEquipped ? 'Equipado' : canEquip ? 'Equipar' : 'Bloqueado'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
