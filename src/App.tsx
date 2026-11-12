import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import { TopBar } from './components/TopBar';
import { TabGrimorio } from './components/TabGrimorio';
import { TabClasses } from './components/TabClasses';
import { TabSkills } from './components/TabSkills';
import { TabAlquimia } from './components/TabAlquimia';
import { TabExploracao } from './components/TabExploracao';
import { TabRenascimento } from './components/TabRenascimento';

export default function App() {
  const {
    state,
    clickOrb,
    trainSkill,
    toggleSpell,
    setFocus,
    craftRecipe,
    startExploration,
    castSpell,
    rebirth,
    buyUpgrade
  } = useGameState();

  const [activeTab, setActiveTab] = useState('grimorio');

  const tabs = [
    { id: 'grimorio', name: 'Grimório', minRank: 1 },
    { id: 'skills', name: 'Skills', minRank: 1 },
    { id: 'alquimia', name: 'Alquimia', minRank: 2 },
    { id: 'exploracao', name: 'Exploração', minRank: 2 },
    { id: 'classes', name: 'Classes', minRank: 3 },
    { id: 'renascimento', name: 'Renascimento', minRank: 3 },
  ];

  return (
    <div className="min-h-screen bg-void-900 text-slate-300 font-serif selection:bg-arcana-500/30">
      <TopBar state={state} />

      <main className="container mx-auto mt-6">
        <nav className="flex flex-wrap gap-1 border-b border-void-600 mb-6 px-4">
          {tabs.map((tab) => {
            const isUnlocked = state.rank >= tab.minRank;

            return (
              <button
                key={tab.id}
                onClick={() => isUnlocked && setActiveTab(tab.id)}
                disabled={!isUnlocked}
                className={`px-4 py-2 font-display text-sm transition-all duration-200 flex items-center gap-1.5 ${
                  !isUnlocked
                    ? 'text-slate-600 cursor-not-allowed opacity-60'
                    : activeTab === tab.id
                    ? 'border-b-2 border-arcana-500 text-arcana-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.name}
                {!isUnlocked && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-void-800 px-1.5 py-0.5 rounded text-slate-500">
                    <Lock size={10} /> R{tab.minRank}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4">
          {activeTab === 'grimorio' && <TabGrimorio state={state} clickOrb={clickOrb} />}
          {activeTab === 'skills' && (
            <TabSkills
              state={state}
              trainSkill={trainSkill}
              toggleSpell={toggleSpell}
              setFocus={setFocus}
            />
          )}
          {activeTab === 'alquimia' && <TabAlquimia state={state} craftRecipe={craftRecipe} />}
          {activeTab === 'exploracao' && (
            <TabExploracao
              state={state}
              startExploration={startExploration}
              castSpell={castSpell}
            />
          )}
          {activeTab === 'classes' && <TabClasses state={state} />}
          {activeTab === 'renascimento' && (
            <TabRenascimento
              state={state}
              rebirth={rebirth}
              buyUpgrade={buyUpgrade}
            />
          )}
        </div>
      </main>
    </div>
  );
}