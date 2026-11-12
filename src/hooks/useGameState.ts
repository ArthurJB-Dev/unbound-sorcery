import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ActiveFocus } from '../types/game';
import { INITIAL_GAME_STATE, ZONES, RECIPES } from '../data/gameData';
import {
  calculateMPS,
  calculateClickPower,
  calculateFatigueCost,
  getCurrentRank,
  getMaxHealth,
  calculateRebirthEA
} from '../engine/calculations';

const SAVE_KEY = 'unbound_sorcery_save';

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_GAME_STATE, ...parsed, lastSaveTimestamp: Date.now() };
      } catch (e) {
        console.error("Failed to load save", e);
        return INITIAL_GAME_STATE;
      }
    }
    return INITIAL_GAME_STATE;
  });

  const lastTickRef = useRef<number>(Date.now());

  // Save to localStorage
  const saveGame = useCallback((currentState: GameState) => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      ...currentState,
      lastSaveTimestamp: Date.now()
    }));
  }, []);

  // Reset/Rebirth
  const rebirth = useCallback(() => {
    setState(prev => {
      const eaGained = calculateRebirthEA(prev, prev.player.ageDays >= prev.player.maxAgeDays);

      const newState: GameState = {
        ...INITIAL_GAME_STATE,
        economy: {
          ...INITIAL_GAME_STATE.economy,
          ancestralEssence: prev.economy.ancestralEssence + eaGained,
        },
        lineage: prev.lineage, // Keep permanent upgrades
        player: {
          ...INITIAL_GAME_STATE.player,
          generation: prev.player.generation + 1,
        }
      };
      saveGame(newState);
      return newState;
    });
  }, [saveGame]);

  // Actions
  const clickOrb = useCallback(() => {
    setState(prev => {
      if (prev.player.collapseTimer > 0) return prev;

      const power = calculateClickPower(prev);
      const cost = calculateFatigueCost(prev);

      let newFatigue = prev.player.fatigue + cost;
      let newCollapseTimer = 0;

      if (newFatigue >= 100) {
        newFatigue = 100;
        newCollapseTimer = 30; // 30 seconds penalty
      }

      return {
        ...prev,
        economy: {
          ...prev.economy,
          mana: prev.economy.mana + power,
          historicalMana: prev.economy.historicalMana + power,
        },
        player: {
          ...prev.player,
          fatigue: newFatigue,
          collapseTimer: newCollapseTimer,
        }
      };
    });
  }, []);

  const trainSkill = useCallback((focus: ActiveFocus) => {
    setState(prev => {
      const cost = Math.floor(10 * Math.pow(1.2, prev.skills.levels[focus]));
      if (prev.economy.knowledge < cost) return prev;

      return {
        ...prev,
        economy: { ...prev.economy, knowledge: prev.economy.knowledge - cost },
        skills: {
          ...prev.skills,
          levels: {
            ...prev.skills.levels,
            [focus]: prev.skills.levels[focus] + 1
          }
        }
      };
    });
  }, []);

  const toggleSpell = useCallback((spellId: string) => {
    setState(prev => {
      const isEquipped = prev.skills.equippedSpells.includes(spellId);
      if (isEquipped) {
        return {
          ...prev,
          skills: {
            ...prev.skills,
            equippedSpells: prev.skills.equippedSpells.filter(id => id !== spellId)
          }
        };
      } else {
        if (prev.skills.equippedSpells.length >= 4) return prev;
        return {
          ...prev,
          skills: {
            ...prev.skills,
            equippedSpells: [...prev.skills.equippedSpells, spellId]
          }
        };
      }
    });
  }, []);

  const craftRecipe = useCallback((recipeId: string) => {
    setState(prev => {
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return prev;

      if (recipe.unlockRank && prev.rank < recipe.unlockRank) return prev;

      const cost = recipe.cost;
      if (cost.mana && prev.economy.mana < cost.mana) return prev;
      if (cost.poArcano && prev.alchemy.resources.poArcano < cost.poArcano) return prev;
      if (cost.seivaEstelar && prev.alchemy.resources.seivaEstelar < cost.seivaEstelar) return prev;
      if (cost.sangueSombrio && prev.alchemy.resources.sangueSombrio < cost.sangueSombrio) return prev;

      const newMana = cost.mana ? prev.economy.mana - cost.mana : prev.economy.mana;
      const newPo = cost.poArcano ? prev.alchemy.resources.poArcano - cost.poArcano : prev.alchemy.resources.poArcano;
      const newSeiva = cost.seivaEstelar ? prev.alchemy.resources.seivaEstelar - cost.seivaEstelar : prev.alchemy.resources.seivaEstelar;
      const newSangue = cost.sangueSombrio ? prev.alchemy.resources.sangueSombrio - cost.sangueSombrio : prev.alchemy.resources.sangueSombrio;

      let newFatigue = prev.player.fatigue;
      let newHealth = prev.player.health;
      let newAgeDays = prev.player.ageDays;
      let newIsImmortal = prev.player.isImmortal;
      let newSoulDebt = prev.player.soulDebtDays;
      let newBuffs = { ...prev.alchemy.activeBuffs };

      if (recipeId === 'tonico_vigor') {
        newFatigue = Math.max(0, newFatigue - 50);
      } else if (recipeId === 'pocao_sangue') {
        const maxHp = getMaxHealth(prev);
        newHealth = Math.min(maxHp, newHealth + maxHp * 0.4);
      } else if (recipeId === 'sigilo_automacao') {
        newBuffs['sigilo_automacao'] = 300;
      } else if (recipeId === 'effigie_oferenda') {
        newSoulDebt = 0;
      } else if (recipeId === 'elixir_juventude') {
        newAgeDays = Math.max(0, newAgeDays - 1825);
      } else if (recipeId === 'elixir_imortalidade') {
        newIsImmortal = true;
      }

      return {
        ...prev,
        economy: {
          ...prev.economy,
          mana: newMana,
        },
        player: {
          ...prev.player,
          fatigue: newFatigue,
          health: newHealth,
          ageDays: newAgeDays,
          isImmortal: newIsImmortal,
          soulDebtDays: newSoulDebt,
        },
        alchemy: {
          ...prev.alchemy,
          resources: {
            poArcano: newPo,
            seivaEstelar: newSeiva,
            sangueSombrio: newSangue,
          },
          activeBuffs: newBuffs,
        }
      };
    });
  }, []);

  const setFocus = useCallback((focus: ActiveFocus) => {
    setState(prev => ({
      ...prev,
      skills: { ...prev.skills, activeFocus: focus }
    }));
  }, []);

  const startExploration = useCallback((zoneId: string) => {
    setState(prev => ({
      ...prev,
      exploration: { ...prev.exploration, activeZoneId: zoneId, progress: 0 }
    }));
  }, []);

  const castSpell = useCallback((_spellId: string) => {
    setState(prev => {
      if (!prev.exploration.inCombat || !prev.exploration.enemy) return prev;

      const currentEnemy = prev.exploration.enemy;
      const newEnemyHp = Math.max(0, currentEnemy.hp - 20);
      const updatedEnemy = { ...currentEnemy, hp: newEnemyHp };

      const newExploration = {
        ...prev.exploration,
        inCombat: newEnemyHp > 0,
        enemy: newEnemyHp > 0 ? updatedEnemy : null
      };

      return { ...prev, exploration: newExploration };
    });
  }, []);

  // Main Game Loop (1 tick = 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const deltaTime: number = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        const mps = calculateMPS(prev);
        const gainedMana = mps * deltaTime;

        let newFatigue = prev.player.fatigue;
        let newCollapseTimer = Math.max(0, prev.player.collapseTimer - deltaTime);

        if (newCollapseTimer === 0 && prev.player.collapseTimer > 0) {
          newFatigue = 50;
        } else if (newCollapseTimer === 0) {
          newFatigue = Math.max(0, newFatigue - 2 * deltaTime);
        }

        const newAgeDays: number = Number(prev.player.ageDays) + deltaTime;

        const menteLvl = prev.skills.levels.mente || 0;
        const baseCa = 0.1 * (1 + menteLvl * 0.05);
        const gainedKnowledge = baseCa * deltaTime;

        const newBuffs = { ...prev.alchemy.activeBuffs };
        Object.keys(newBuffs).forEach(key => {
          newBuffs[key] -= deltaTime;
          if (newBuffs[key] <= 0) delete newBuffs[key];
        });

        const currentRank = getCurrentRank(prev.economy.historicalMana + gainedMana);

        let newExploration = { ...prev.exploration };

        if (!newExploration.zoneVitality) {
          newExploration.zoneVitality = {};
        }

        Object.keys(newExploration.zoneVitality).forEach(zoneId => {
          if (newExploration.activeZoneId !== zoneId) {
            newExploration.zoneVitality[zoneId] = Math.min(100, newExploration.zoneVitality[zoneId] + 2 * deltaTime);
          }
        });

        if (newExploration.activeZoneId) {
          const zoneDef = ZONES.find(z => z.id === newExploration.activeZoneId);
          if (zoneDef) {
            newExploration.progress += (20 * deltaTime);

            if (newExploration.progress >= 100) {
              newExploration.progress = 0;

              if (prev.rank < 6) {
                const currentVitality = newExploration.zoneVitality[newExploration.activeZoneId] ?? 100;
                newExploration.zoneVitality[newExploration.activeZoneId] = Math.max(0, currentVitality - 5);
              }

              if (Math.random() < 0.3) {
                newExploration.inCombat = true;
                newExploration.enemy = {
                  name: zoneDef.isBossZone ? 'Chefe do Abismo' : 'Criatura',
                  hp: 100, maxHp: 100, atk: 5, isBoss: Boolean(zoneDef.isBossZone)
                };
              }
            }
          }
        }

        let newPlayer = { ...prev.player };
        if (newExploration.inCombat && newExploration.enemy) {
          const playerDmg = 10;
          const enemyObj = { ...newExploration.enemy };
          enemyObj.hp -= playerDmg;
          
          newPlayer.health = Math.max(0, prev.player.health - enemyObj.atk);

          if (enemyObj.hp <= 0) {
            newExploration.inCombat = false;
            newExploration.enemy = null;
          } else {
            newExploration.enemy = enemyObj;
          }
        }

        return {
          ...prev,
          economy: {
            ...prev.economy,
            mana: prev.economy.mana + gainedMana,
            historicalMana: prev.economy.historicalMana + gainedMana,
            knowledge: prev.economy.knowledge + gainedKnowledge,
          },
          player: {
            ...newPlayer,
            ageDays: newAgeDays,
          },
          exploration: newExploration,
          rank: currentRank.id,
          alchemy: {
            ...prev.alchemy,
            activeBuffs: newBuffs,
          },
          lastSaveTimestamp: now,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Periodic Auto-save
  useEffect(() => {
    const saver = setInterval(() => saveGame(state), 30000);
    return () => clearInterval(saver);
  }, [state, saveGame]);

  return {
    state,
    clickOrb,
    trainSkill,
    toggleSpell,
    setFocus,
    craftRecipe,
    startExploration,
    castSpell,
    rebirth,
    saveGame
  };
}