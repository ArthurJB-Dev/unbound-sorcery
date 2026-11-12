import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { TopBar } from './components/TopBar';
import { TabGrimorio } from './components/TabGrimorio';
import { TabClasses } from './components/TabClasses';
import { TabSkills } from './components/TabSkills';
import { TabAlquimia } from './components/TabAlquimia';
import { TabExploracao } from './components/TabExloracao';
import { TabRenascimento } from './components/TabRenascimento';

export default function App() {
  const { state, clickOrb, trainSkill, toggleSpell, setFocus, craftRecipe, startExploration, castSpell, rebirth, buyUpgrade } = useGameState();
  const [activeTab, setActiveTab] = useState('grimorio');

  const tabs = [
    { id: 'grimorio', name: 'Grimório' },
    { id: 'classes', name: 'Classes' },
    { id: 'skills', name: 'Skills' },
    { id: 'alquimia', name: 'Alquimia' },
    { id: 'exploracao', name: 'Exploração' },
    { id: 'renascimento', name: 'Renascimento' },
  ];

  return (
    <div className="min-h-screen bg-void-900 text-slate-300 font-serif selection:bg-arcana-500/30">
      <TopBar state={state} />

      <main className="container mx-auto mt-6">
        <nav className="flex space-x-1 border-b border-void-600 mb-6 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-display text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-arcana-500 text-arcana-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="px-4">
          {activeTab === 'grimorio' && <TabGrimorio state={state} clickOrb={clickOrb} />}
          {activeTab === 'classes' && <TabClasses state={state} />}
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
