import React from 'react';
import { GameState } from '../types/game';
import { RECIPES } from '../data/gameData';
import { formatNumber } from '../utils/format';
import { FlaskConical } from 'lucide-react';

interface TabAlquimiaProps {
  state: GameState;
  craftRecipe: (recipeId: string) => void;
}

export const TabAlquimia: React.FC<TabAlquimiaProps> = ({ state, craftRecipe }) => {
  const { resources } = state.alchemy;

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 text-arcana-300 font-display text-xl font-bold border-b border-void-600 pb-4">
        <FlaskConical size={24} />
        <h1>MESA DE TRANSMUTAÇÃO</h1>
      </div>

      {/* Recursos */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-void-800 p-4 rounded-lg border border-void-600 text-center">
          <div className="text-arcana-400 font-display text-sm">Pó Arcano</div>
          <div className="text-xl font-bold">{formatNumber(resources.poArcano)}</div>
        </div>
        <div className="bg-void-800 p-4 rounded-lg border border-void-600 text-center">
          <div className="text-amber-400 font-display text-sm">Seiva Estelar</div>
          <div className="text-xl font-bold">{formatNumber(resources.seivaEstelar)}</div>
        </div>
        <div className="bg-void-800 p-4 rounded-lg border border-void-600 text-center">
          <div className="text-rose-500 font-display text-sm">Sangue Sombrio</div>
          <div className="text-xl font-bold">{formatNumber(resources.sangueSombrio)}</div>
        </div>
      </div>

      {/* Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECIPES.map((recipe) => {
          const isLocked = recipe.unlockRank && state.rank < recipe.unlockRank;

          return (
            <div key={recipe.id} className="bg-void-800/40 p-5 rounded-xl border border-void-600 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-arcana-200">{recipe.name}</h3>
                {isLocked && <span className="text-[10px] text-rose-500 font-bold uppercase">Rank {recipe.unlockRank}+</span>}
              </div>
              <p className="text-slate-400 text-xs font-serif italic">{recipe.effect}</p>

              <div className="flex justify-between items-center mt-auto pt-3 border-t border-void-700">
                <div className="text-[10px] text-slate-500">
                  Custo: {Object.entries(recipe.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
                </div>
                <button
                  onClick={() => craftRecipe(recipe.id)}
                  disabled={Boolean(isLocked)}
                  className="bg-arcana-600 hover:bg-arcana-500 disabled:opacity-50 px-3 py-1 rounded text-xs font-display text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Transmutar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};