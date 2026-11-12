import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ActiveFocus } from '../types/game';
import { INITIAL_GAME_STATE, ZONES, RECIPES } from '../data/gameData';
import {
  calculateMPS,
  calculateClickPower,
  calculateFatigueCost,
  getCurrentRank,
  getMaxHealth,
  calculateRebirthEA,
  getLineageLevel
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
        console.error('Failed to load save', e);
        return INITIAL_GAME_STATE;
      }
    }
    return INITIAL_GAME_STATE;
  });

  const lastTickRef = useRef<number>(Date.now());

  // Save to localStorage
  const saveGame = useCallback((currentState: GameState) => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...currentState,
        lastSaveTimestamp: Date.now(),
      })
    );
  }, []);

  // Buy permanent Lineage upgrade (Aba 6)
  const buyUpgrade = useCallback((upgradeId: string) => {
    setState(prev => {
      const currentLevel = prev.lineage.upgrades[upgradeId] ?? 0;
      const upgradeRules: Record<string, { baseCost: number; maxLevel: number }> = {
        genetica_arcana: { baseCost: 200, maxLevel: 10 },
        catalisacao_cosmica: { baseCost: 150, maxLevel: 20 },
        memoria_ancestral: { baseCost: 400, maxLevel: 5 },
        apoteose_divina: { baseCost: 100000, maxLevel: 1 },
      };

      const rule = upgradeRules[upgradeId] ?? { baseCost: 200, maxLevel: 20 };
      if (currentLevel >= rule.maxLevel) return prev;
      if (upgradeId === 'apoteose_divina' && prev.rank < 10) return prev;

      const cost = Math.floor(rule.baseCost * Math.pow(1.5, currentLevel));
      if (prev.economy.ancestralEssence < cost) return prev;

      return {
        ...prev,
        economy: {
          ...prev.economy,
          ancestralEssence: prev.economy.ancestralEssence - cost,
        },
        lineage: {
          ...prev.lineage,
          upgrades: {
            ...prev.lineage.upgrades,
            [upgradeId]: currentLevel + 1,
          },
        },
      };
    });
  }, []);

  // Reset/Rebirth
  const rebirth = useCallback(() => {
    setState(prev => {
      const eaGained = calculateRebirthEA(prev, prev.player.ageDays >= prev.player.maxAgeDays);
      const memoriaLvl = getLineageLevel(prev, 'memoria_ancestral');
      const geneticaLvl = getLineageLevel(prev, 'genetica_arcana');

      const retainedKnowledge = prev.economy.knowledge * Math.min(1, memoriaLvl * 0.2);
      const bonusMaxAgeDays = geneticaLvl * 1095; // +3 anos por nível

      const newState: GameState = {
        ...INITIAL_GAME_STATE,
        economy: {
          ...INITIAL_GAME_STATE.economy,
          knowledge: retainedKnowledge,
          ancestralEssence: prev.economy.ancestralEssence + eaGained,
        },
        lineage: prev.lineage,
        player: {
          ...INITIAL_GAME_STATE.player,
          generation: prev.player.generation + 1,
          maxAgeDays: INITIAL_GAME_STATE.player.maxAgeDays + bonusMaxAgeDays,
        },
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

      // Xamã R3+ na Floresta Arcana limpa fadiga ao clicar
      if (
        prev.rank >= 3 &&
        prev.player.classId === 'xama' &&
        prev.exploration.activeZoneId === 'floresta_arcana'
      ) {
        newFatigue = Math.max(0, prev.player.fatigue - 1);
      }

      // Feiticeiro R3 Spec B: imunidade ao colapso
      const immuneToCollapse =
        prev.rank >= 3 &&
        prev.player.classId === 'feiticeiro' &&
        prev.player.specs.rank3 === 'B';

      if (newFatigue >= 100) {
        if (immuneToCollapse) {
          newFatigue = 99.9;
        } else {
          newFatigue = 100;
          newCollapseTimer = 30;
        }
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
        },
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
            [focus]: prev.skills.levels[focus] + 1,
          },
        },
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
            equippedSpells: prev.skills.equippedSpells.filter(id => id !== spellId),
          },
        };
      } else {
        if (prev.skills.equippedSpells.length >= 4) return prev;
        return {
          ...prev,
          skills: {
            ...prev.skills,
            equippedSpells: [...prev.skills.equippedSpells, spellId],
          },
        };
      }
    });
  }, []);

  const craftRecipe = useCallback((recipeId: string) => {
    setState(prev => {
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return prev;

      if (recipe.unlockRank && prev.rank < recipe.unlockRank) return prev;

      const costMult = prev.rank >= 4 ? 0.9 : 1;
      const effectMult = prev.rank >= 9 ? 2 : 1;

      const manaCost = recipe.cost.mana ? Math.ceil(recipe.cost.mana * costMult) : 0;
      const poCost = recipe.cost.poArcano ? Math.ceil(recipe.cost.poArcano * costMult) : 0;
      const seivaCost = recipe.cost.seivaEstelar ? Math.ceil(recipe.cost.seivaEstelar * costMult) : 0;
      const sangueCost = recipe.cost.sangueSombrio ? Math.ceil(recipe.cost.sangueSombrio * costMult) : 0;

      if (prev.economy.mana < manaCost) return prev;
      if (prev.alchemy.resources.poArcano < poCost) return prev;
      if (prev.alchemy.resources.seivaEstelar < seivaCost) return prev;
      if (prev.alchemy.resources.sangueSombrio < sangueCost) return prev;

      let newMana = prev.economy.mana - manaCost;
      let bonusHistMana = 0;
      const newPo = prev.alchemy.resources.poArcano - poCost;
      const newSeiva = prev.alchemy.resources.seivaEstelar - seivaCost;
      const newSangue = prev.alchemy.resources.sangueSombrio - sangueCost;

      let newFatigue = prev.player.fatigue;
      let newHealth = prev.player.health;
      let newAgeDays = prev.player.ageDays;
      let newIsImmortal = prev.player.isImmortal;
      let newSoulDebt = prev.player.soulDebtDays;
      const newBuffs = { ...prev.alchemy.activeBuffs };

      if (recipeId === 'tonico_vigor') {
        newFatigue = Math.max(0, newFatigue - 50 * effectMult);
      } else if (recipeId === 'pocao_sangue') {
        const maxHp = getMaxHealth(prev);
        newHealth = Math.min(maxHp, newHealth + maxHp * 0.4 * effectMult);
      } else if (recipeId === 'sigilo_automacao') {
        newBuffs['sigilo_automacao'] = 300 * effectMult;
      } else if (recipeId === 'effigie_oferenda') {
        newSoulDebt = 0;
        const manaBurst = (calculateMPS(prev) * 60 + calculateClickPower(prev) * 50) * effectMult;
        newMana += manaBurst;
        bonusHistMana += manaBurst;
      } else if (recipeId === 'elixir_juventude') {
        newAgeDays = Math.max(0, newAgeDays - 1825 * effectMult);
      } else if (recipeId === 'elixir_imortalidade') {
        newIsImmortal = true;
      }

      return {
        ...prev,
        economy: {
          ...prev.economy,
          mana: newMana,
          historicalMana: prev.economy.historicalMana + bonusHistMana,
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
        },
      };
    });
  }, []);

  const setFocus = useCallback((focus: ActiveFocus) => {
    setState(prev => ({
      ...prev,
      skills: { ...prev.skills, activeFocus: focus },
    }));
  }, []);

  const startExploration = useCallback((zoneId: string) => {
    setState(prev => ({
      ...prev,
      exploration: { ...prev.exploration, activeZoneId: zoneId, progress: 0 },
    }));
  }, []);

  const castSpell = useCallback((_spellId: string) => {
    setState(prev => {
      if (!prev.exploration.inCombat || !prev.exploration.enemy) return prev;

      const caosLvl = prev.skills.levels.caos || 0;
      const dmg = Math.round(25 * (1 + caosLvl * 0.08));

      const currentEnemy = prev.exploration.enemy;
      const newEnemyHp = Math.max(0, currentEnemy.hp - dmg);
      const updatedEnemy = { ...currentEnemy, hp: newEnemyHp };
      const defeatedBoss = newEnemyHp === 0 && currentEnemy.isBoss ? 1 : 0;

      const newExploration = {
        ...prev.exploration,
        inCombat: newEnemyHp > 0,
        enemy: newEnemyHp > 0 ? updatedEnemy : null,
        bossesDefeated: prev.exploration.bossesDefeated + defeatedBoss,
      };

      return { ...prev, exploration: newExploration };
    });
  }, []);

  // Main Game Loop (1 tick = 1 second, decoupled from StrictMode double-invoke)
  useEffect(() => {
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = Math.min(5, (now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      setState(prev => {
        const mps = calculateMPS(prev);
        const gainedMana = mps * deltaTime;

        let newFatigue = prev.player.fatigue;
        let newCollapseTimer = Math.max(0, prev.player.collapseTimer - deltaTime);

        if (newCollapseTimer === 0 && prev.player.collapseTimer > 0) {
          newFatigue = 50;
        } else if (newCollapseTimer === 0) {
          newFatigue = Math.max(0, newFatigue - 2 * deltaTime);
        }

        const menteLvl = prev.skills.levels.mente || 0;
        const ageSlow = Math.min(0.5, menteLvl * 0.005);
        const newAgeDays = prev.player.isImmortal
          ? prev.player.ageDays
          : Number(prev.player.ageDays) + deltaTime * (1 - ageSlow);

        // Geração base de Conhecimento Arcano (ajustada para fluir bem no Rank 1)
        const rankCaMult = 1 + (prev.rank - 1) * 0.5;
        const magoCaMult = prev.rank >= 3 && prev.player.classId === 'mago' ? 2 : 1;
        const ruinasMagoMult =
          prev.rank >= 3 &&
          prev.player.classId === 'mago' &&
          prev.exploration.activeZoneId === 'ruinas_astrais'
            ? 2
            : 1;

        const baseCa = 0.5 * (1 + menteLvl * 0.15) * rankCaMult * magoCaMult * ruinasMagoMult;
        const gainedKnowledge = baseCa * deltaTime;

        const newBuffs = { ...prev.alchemy.activeBuffs };
        Object.keys(newBuffs).forEach(key => {
          newBuffs[key] -= deltaTime;
          if (newBuffs[key] <= 0) delete newBuffs[key];
        });

        const currentRank = getCurrentRank(prev.economy.historicalMana + gainedMana);

        const newExploration = { ...prev.exploration };
        if (!newExploration.zoneVitality) {
          newExploration.zoneVitality = {};
        }

        Object.keys(newExploration.zoneVitality).forEach(zoneId => {
          if (newExploration.activeZoneId !== zoneId) {
            newExploration.zoneVitality[zoneId] = Math.min(
              100,
              newExploration.zoneVitality[zoneId] + 2 * deltaTime
            );
          }
        });

        let gainedPo = 0;
        let gainedSeiva = 0;
        let gainedSangue = 0;
        let bonusKnowledge = 0;

        if (newExploration.activeZoneId) {
          const zoneDef = ZONES.find(z => z.id === newExploration.activeZoneId);
          if (zoneDef) {
            const speedMult = prev.rank >= 5 ? 1 / 0.7 : 1;
            newExploration.progress += 20 * speedMult * deltaTime;

            if (newExploration.progress >= 100) {
              newExploration.progress = 0;

              const currentVitality = newExploration.zoneVitality[newExploration.activeZoneId] ?? 100;
              const vitalityMult = currentVitality <= 0 ? 0.5 : 1;
              const corpoMult = 1 + (prev.skills.levels.corpo || 0) * 0.05;
              const bruxoDropMult = prev.rank >= 3 && prev.player.classId === 'bruxo' ? 2.5 : 1;
              const yieldMult = vitalityMult * corpoMult * bruxoDropMult;

              if (zoneDef.id === 'floresta_arcana') {
                gainedPo += Math.max(1, Math.round(5 * yieldMult));
                gainedSeiva += Math.max(1, Math.round(3 * yieldMult));
              } else if (zoneDef.id === 'linhas_de_ley') {
                gainedPo += Math.max(1, Math.round(8 * yieldMult));
                bonusKnowledge += 5 * yieldMult;
              } else if (zoneDef.id === 'ruinas_astrais') {
                gainedSeiva += Math.max(1, Math.round(8 * yieldMult));
                bonusKnowledge += 12 * yieldMult;
              } else if (zoneDef.id === 'covil_do_abismo') {
                gainedSangue += Math.max(1, Math.round(5 * yieldMult));
              }

              if (prev.rank < 6) {
                newExploration.zoneVitality[newExploration.activeZoneId] = Math.max(
                  0,
                  currentVitality - 5
                );
              }

              if (Math.random() < 0.3) {
                newExploration.inCombat = true;
                newExploration.enemy = {
                  name: zoneDef.isBossZone ? 'Chefe do Abismo' : 'Criatura',
                  hp: 100 * zoneDef.enemyLevel,
                  maxHp: 100 * zoneDef.enemyLevel,
                  atk: 5 * zoneDef.enemyLevel,
                  isBoss: Boolean(zoneDef.isBossZone),
                };
              }
            }
          }
        }

        const maxHp = getMaxHealth(prev);
        const newPlayer = { ...prev.player, maxHealth: maxHp };

        // Sinergia Linhas de Ley + Feiticeiro (R3+)
        if (
          prev.rank >= 3 &&
          prev.player.classId === 'feiticeiro' &&
          newExploration.activeZoneId === 'linhas_de_ley'
        ) {
          newPlayer.health = Math.min(maxHp, newPlayer.health + 5 * deltaTime);
        }

        if (newExploration.inCombat && newExploration.enemy) {
          const caosLvl = prev.skills.levels.caos || 0;
          const playerDmg = 15 * (1 + caosLvl * 0.08) * deltaTime;
          const enemyObj = { ...newExploration.enemy };
          enemyObj.hp -= playerDmg;

          newPlayer.health = Math.max(0, newPlayer.health - enemyObj.atk * deltaTime);

          if (enemyObj.hp <= 0) {
            newExploration.inCombat = false;
            newExploration.enemy = null;
            if (enemyObj.isBoss) {
              newExploration.bossesDefeated += 1;
              gainedSangue += 5;
            } else {
              gainedPo += 2;
            }
          } else if (newPlayer.health <= 0) {
            // Evita soft-lock em derrota: recua do combate e recupera 50% de HP
            newExploration.inCombat = false;
            newExploration.enemy = null;
            newPlayer.health = Math.round(maxHp * 0.5);
            newFatigue = Math.min(99, newFatigue + 15);
          } else {
            newExploration.enemy = enemyObj;
          }
        } else {
          // Regeneração natural de vida fora de combate
          newPlayer.health = Math.min(maxHp, newPlayer.health + 2 * deltaTime);
        }

        return {
          ...prev,
          economy: {
            ...prev.economy,
            mana: prev.economy.mana + gainedMana,
            historicalMana: prev.economy.historicalMana + gainedMana,
            knowledge: prev.economy.knowledge + gainedKnowledge + bonusKnowledge,
          },
          player: {
            ...newPlayer,
            ageDays: newAgeDays,
            fatigue: newFatigue,
            collapseTimer: newCollapseTimer,
          },
          exploration: newExploration,
          rank: currentRank.id,
          alchemy: {
            ...prev.alchemy,
            resources: {
              poArcano: prev.alchemy.resources.poArcano + gainedPo,
              seivaEstelar: prev.alchemy.resources.seivaEstelar + gainedSeiva,
              sangueSombrio: prev.alchemy.resources.sangueSombrio + gainedSangue,
            },
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
    buyUpgrade,
    saveGame,
  };
}