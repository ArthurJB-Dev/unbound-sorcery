import React from 'react';
import { GameState } from '../types/game';
import { LINEAGE_UPGRADES } from '../data/gameData';
import { calculateRebirthEA } from '../engine/calculations';
import { formatNumber } from '../utils/format';
import { RefreshCw } from 'lucide-react';

interface TabRenascimentoProps {
  state: GameState;
  rebirth: () => void;
  buyUpgrade: (id: string) => void;
}

export const TabRenascimento: React.FC<TabRenascimentoProps> = ({ state, rebirth, buyUpgrade }) => {
  const eaGained = calculateRebirthEA(state, state.player.ageDays >= state.player.maxAgeDays);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 text-arcana-300 font-display text-xl font-bold border-b border-void-600 pb-4">
        <RefreshCw size={24} />
        <h1>RENASCIMENTO & LINHAGEM</h1>
      </div>

      <div className="bg-void-800/40 border border-void-600 p-6 rounded-xl text-center">
        <h2 className="text-arcana-200 font-display text-lg mb-2">Essência Ancestral Disponível</h2>
        <div className="text-4xl font-bold text-amber-500 font-mono mb-6">{formatNumber(eaGained)}</div>

        <button
          onClick={rebirth}
          disabled={state.rank < 3 && state.player.ageDays < state.player.maxAgeDays}
          className="bg-arcana-600 hover:bg-arcana-500 text-white font-display px-8 py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {state.player.ageDays >= state.player.maxAgeDays ? 'Renascer por Velhice' : 'Realizar Ritual de Renascimento'}
        </button>
        <p className="text-slate-500 text-xs mt-4">EA: {(state.player.ageDays >= state.player.maxAgeDays ? 'Bônus de Velhice (1.25x)' : 'Reset Antecipado (1.0x)')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LINEAGE_UPGRADES.map((upgrade) => {
            const currentLevel = state.lineage.upgrades[upgrade.id] || 0;
            const cost = upgrade.baseCost * (currentLevel + 1);
            return (
                <div key={upgrade.id} className="bg-void-800/40 p-4 rounded-xl border border-void-600">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-display font-bold text-arcana-200">{upgrade.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">Lv {currentLevel}/{upgrade.maxLevel}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 font-serif">{upgrade.description}</p>
                    <button
                        onClick={() => buyUpgrade(upgrade.id)}
                        disabled={currentLevel >= upgrade.maxLevel || state.economy.ancestralEssence < cost}
                        className="w-full bg-void-900 border border-arcana-500/30 py-2 rounded text-xs hover:bg-arcana-900 disabled:opacity-50"
                    >
                        Comprar ({formatNumber(cost)} EA)
                    </button>
                </div>
            )
        })}
      </div>
    </div>
  );
};
