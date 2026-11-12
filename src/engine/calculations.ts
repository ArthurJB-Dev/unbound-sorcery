import { GameState, RankDef, Season, MoonPhase } from '../types/game';
import { RANKS, MASTERY_LINES } from '../data/gameData';
import { season, moonPhase } from '../utils/format';

/**
 * Calculates current rank from historical mana
 */
export function getCurrentRank(historicalMana: number): RankDef {
  let current = RANKS[0];
  for (const rankDef of RANKS) {
    if (historicalMana >= rankDef.threshold) {
      current = rankDef;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Calculates max health based on base HP + Lineage + Mastery
 */
export function getMaxHealth(state: GameState): number {
  const baseHp = 100;
  const corpoLevel = state.skills.levels.corpo || 0;
  const corpoHpBonus = corpoLevel * MASTERY_LINES[0].perLevel.hpBonus;
  return baseHp + corpoHpBonus;
}

/**
 * Calculates celestial multipliers based on season and moon phase
 */
export function getCelestialMultipliers(ageDays: number) {
  const s = season(ageDays) as Season;
  const m = moonPhase(ageDays) as MoonPhase;

  let mpsMult = 1.0;
  let clickMult = 1.0;

  if (m === 'Cheia') {
    mpsMult *= 1.5;
    clickMult *= 1.5;
  } else if (m === 'Nova') {
    mpsMult *= 0.85;
  }

  if (s === 'Primavera') {
    mpsMult *= 1.1;
  } else if (s === 'Verão') {
    clickMult *= 1.15;
  } else if (s === 'Inverno') {
    mpsMult *= 0.9;
  }

  return { mpsMult, clickMult, season: s, moon: m };
}

/**
 * Lineage level helper
 */
export function getLineageLevel(state: GameState, upgradeId: string): number {
  return state.lineage.upgrades[upgradeId] || 0;
}

/**
 * Calculates global MPS (Mana Per Second)
 */
export function calculateMPS(state: GameState): number {
  const rankDef = getCurrentRank(state.economy.historicalMana);
  const hasClass = rankDef.id >= 3;

  let baseMps = Math.pow(rankDef.id, 2) * rankDef.mpsMultiplier;

  // Bruxo base MPS is 0 (applies only after Classes unlock at Rank 3)
  if (hasClass && state.player.classId === 'bruxo') {
    baseMps = 0;
  }

  // Mastery Line (Mente): +8% linear + 10% compounding per level
  const menteLvl = state.skills.levels.mente || 0;
  const menteMpsBonus = (1 + menteLvl * 0.08) * Math.pow(1.1, menteLvl);
  baseMps *= menteMpsBonus;

  // Mastery Line (Caos): +5% global arcane resonance per level
  const caosLvl = state.skills.levels.caos || 0;
  baseMps *= 1 + caosLvl * 0.05;

  // Rank 7 perk: 2x production speed without aging cost
  if (rankDef.id >= 7) {
    baseMps *= 2.0;
  }

  // Lineage bonus (Catalisação Cósmica: +25% per level)
  const cosmicLevel = getLineageLevel(state, 'catalisacao_cosmica');
  const cosmicBonus = 1 + cosmicLevel * 0.25;
  baseMps *= cosmicBonus;

  // Celestial Multiplier
  const { mpsMult, moon } = getCelestialMultipliers(state.player.ageDays);
  baseMps *= mpsMult;

  // Class Mago Passive (Rank 3+): Lua Cheia 4x, Lua Nova -30%
  if (hasClass && state.player.classId === 'mago') {
    if (moon === 'Cheia') {
      baseMps *= 4.0;
    } else if (moon === 'Nova') {
      baseMps *= 0.7;
    }
  }

  // Class Xamã Passive (Rank 3+): MPS * (1 + averageZoneVitality * 0.5)
  if (hasClass && state.player.classId === 'xama') {
    const vitValues = Object.values(state.exploration.zoneVitality);
    const avgVit = vitValues.length > 0 ? vitValues.reduce((a, b) => a + b, 0) / vitValues.length : 100;
    baseMps *= 1 + (avgVit / 100) * 0.5;
  }

  // Active Buff: Sigilo de Automação (2x MPS resonance + 5 auto-clicks/sec)
  if (state.alchemy.activeBuffs['sigilo_automacao'] && state.alchemy.activeBuffs['sigilo_automacao'] > 0) {
    baseMps = baseMps * 2.0 + calculateClickPower(state) * 5;
  }

  // Divine Apotheosis (NG+)
  if (getLineageLevel(state, 'apoteose_divina') > 0) {
    baseMps *= 11.0; // +1000%
  }

  return Math.max(0, baseMps);
}

/**
 * Calculates Power per Click
 */
export function calculateClickPower(state: GameState): number {
  const rankDef = getCurrentRank(state.economy.historicalMana);
  const hasClass = rankDef.id >= 3;

  let power = 1 * Math.pow(rankDef.id, 2.2);

  // Mastery Line (Corpo): +12% linear + 8% compounding click power per level
  const corpoLvl = state.skills.levels.corpo || 0;
  power *= (1 + corpoLvl * 0.12) * Math.pow(1.08, corpoLvl);

  // Mastery Line (Caos): +5% click resonance per level
  const caosLvl = state.skills.levels.caos || 0;
  power *= 1 + caosLvl * 0.05;

  // Feiticeiro Passive (Rank 3+): +100% mana per click
  if (hasClass && state.player.classId === 'feiticeiro') {
    power *= 2.0;
  }

  // Lineage Catalisação Cósmica: +25% per level
  const cosmicLevel = getLineageLevel(state, 'catalisacao_cosmica');
  power *= 1 + cosmicLevel * 0.25;

  // Celestial Multipliers
  const { clickMult, moon } = getCelestialMultipliers(state.player.ageDays);
  power *= clickMult;

  if (hasClass && state.player.classId === 'mago' && moon === 'Cheia') {
    power *= 4.0;
  }

  // Active Buff: Surto de Sangue (Feiticeiro Active)
  if (state.alchemy.activeBuffs['surto_de_sangue'] && state.alchemy.activeBuffs['surto_de_sangue'] > 0) {
    power *= 6.0; // +500%
  }

  // Divine Apotheosis
  if (getLineageLevel(state, 'apoteose_divina') > 0) {
    power *= 11.0;
  }

  // Fatigue Penalties/Bonus
  if (state.player.fatigue >= 100) {
    power = 0;
  } else if (state.player.fatigue >= 90) {
    power *= 0.1; // 10% efficiency
  } else if (state.player.fatigue >= 50) {
    power *= 0.5; // 50% efficiency
  }

  // Feiticeiro R3 Spec A: +1% damage/power per 1% fatigue
  if (hasClass && state.player.classId === 'feiticeiro' && state.player.specs.rank3 === 'A') {
    power *= 1 + state.player.fatigue * 0.01;
  }

  return Math.max(0, power);
}

/**
 * Calculates fatigue cost per click
 */
export function calculateFatigueCost(state: GameState): number {
  const rankDef = getCurrentRank(state.economy.historicalMana);
  const hasClass = rankDef.id >= 3;

  let cost = rankDef.fatiguePerClick;

  // Feiticeiro passive (Rank 3+): 2x fatigue
  if (hasClass && state.player.classId === 'feiticeiro') {
    cost *= 2.0;
  }

  // Mastery Corpo: -0.5% per level
  const corpoLvl = state.skills.levels.corpo || 0;
  cost *= Math.max(0.2, 1 - corpoLvl * 0.005);

  // Lineage Genetica Arcana: -5% per level
  const geneticaLvl = getLineageLevel(state, 'genetica_arcana');
  cost *= Math.max(0.1, 1 - geneticaLvl * 0.05);

  return cost;
}

/**
 * Calculates Ancestral Essence (EA) gained on Rebirth
 */
export function calculateRebirthEA(state: GameState, isNaturalDeath: boolean = false): number {
  const histMana = state.economy.historicalMana;
  const rank = getCurrentRank(histMana).id;
  const bosses = state.exploration.bossesDefeated || 0;

  const baseEa = Math.cbrt(histMana) * 0.1 + rank * 500 + bosses * 1000;
  const ageMultiplier = isNaturalDeath ? 1.25 : 1.0;

  return Math.floor(baseEa * ageMultiplier);
}