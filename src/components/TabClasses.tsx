import React from 'react';
import { GameState } from '../types/game';
import { CLASSES } from '../data/gameData';
import { BookOpen, Sparkles, Shield, Sword, Brain, Skull } from 'lucide-react';

interface TabClassesProps {
  state: GameState;
}

export const TabClasses: React.FC<TabClassesProps> = ({ state }) => {
  const currentClassId = state.player.classId;

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 text-arcana-300 font-display text-xl font-bold border-b border-void-600 pb-4">
        <BookOpen size={24} />
        <h1>ARQUÉTIPOS DO DESPERTAR</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CLASSES.map((cls) => {
          const isSelected = currentClassId === cls.id;

          return (
            <div
              key={cls.id}
              className={`p-6 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-void-700/80 border-arcana-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                  : 'bg-void-800/50 border-void-600 hover:border-void-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className={`font-display text-2xl font-bold ${isSelected ? 'text-arcana-300' : 'text-slate-200'}`}>
                  {cls.name}
                </h2>
                {isSelected && <Sparkles className="text-amber-400" size={20} />}
              </div>

              <p className="text-slate-400 font-serif text-sm mb-6 leading-relaxed italic">
                "{cls.description}"
              </p>

              <div className="space-y-4">
                <div className="bg-void-900/50 p-3 rounded-lg border border-void-700">
                  <div className="flex items-center gap-2 text-arcana-400 font-display text-xs mb-1">
                    <Shield size={14} /> PASSIVA
                  </div>
                  <p className="text-slate-300 text-sm font-serif">{cls.passive}</p>
                </div>

                <div className="bg-void-900/50 p-3 rounded-lg border border-void-700">
                  <div className="flex items-center gap-2 text-rose-400 font-display text-xs mb-1">
                    <Sword size={14} /> ATIVA
                  </div>
                  <p className="text-slate-300 text-sm font-serif">{cls.active}</p>
                </div>

                <div className="pt-2">
                  <div className="text-slate-500 font-display text-[10px] uppercase tracking-widest mb-3">
                    Especializações Futuras
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { rank: 'R3', specs: cls.specs.rank3 },
                      { rank: 'R6', specs: cls.specs.rank6 },
                      { rank: 'R9', specs: cls.specs.rank9 },
                    ].map((s) => (
                      <div key={s.rank} className="text-center">
                        <div className="text-[10px] text-slate-600 font-bold mb-1">{s.rank}</div>
                        <div className="space-y-1">
                          <div className="text-[9px] text-arcana-300 bg-void-900 px-1 py-0.5 rounded border border-void-700 truncate">
                            {s.specs.A}
                          </div>
                          <div className="text-[9px] text-arcana-300 bg-void-900 px-1 py-0.5 rounded border border-void-700 truncate">
                            {s.specs.B}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
