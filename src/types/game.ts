export type ClassId = 'feiticeiro' | 'xama' | 'mago' | 'bruxo';
export type RankId = 'A' | 'B';
export type ActiveFocus = 'corpo' | 'mente' | 'caos';
export type Season = 'Primavera' | 'Verão' | 'Outono' | 'Inverno';
export type MoonPhase = 'Nova' | 'Crescente' | 'Cheia' | 'Minguante';

export interface Player {
  name: string;
  generation: number;
  classId: ClassId;
  specs: {
    rank3: RankId | null;
    rank6: RankId | null;
    rank9: RankId | null;
  };
  ageDays: number;
  maxAgeDays: number;
  isImmortal: boolean;
  health: number;
  maxHealth: number;
  fatigue: number; // 0..100
  collapseTimer: number; // remaining seconds of block if fatigue >= 100
  soulDebtDays: number; // Bruxo tribute counter
}

export interface Economy {
  mana: number; // spendable
  historicalMana: number; // lifetime total -> defines Rank & Prestige
  knowledge: number; // CA for Skills
  ancestralEssence: number; // permanent Prestige currency
}

export interface Skills {
  activeFocus: ActiveFocus;
  levels: { corpo: number; mente: number; caos: number }; // 0..100
  equippedSpells: string[]; // up to 4 spell ids
}

export interface Alchemy {
  resources: {
    poArcano: number;
    seivaEstelar: number;
    sangueSombrio: number;
  };
  activeBuffs: Record<string, number>; // buffId -> remaining seconds
}

export interface Exploration {
  activeZoneId: string | null;
  progress: number; // 0..100
  zoneVitality: Record<string, number>; // 0..100
  inCombat: boolean;
  enemy: {
    name: string;
    hp: number;
    maxHp: number;
    atk: number;
    isBoss: boolean;
  } | null;
  bossesDefeated: number;
}

export interface Lineage {
  upgrades: Record<string, number>; // upgradeId -> permanent level
}

export interface GameState {
  player: Player;
  economy: Economy;
  rank: number; // 1..10
  skills: Skills;
  alchemy: Alchemy;
  exploration: Exploration;
  lineage: Lineage;
  lastSaveTimestamp: number;
}

// Catalog interfaces
export interface RankDef {
  id: number;
  name: string;
  threshold: number; // historicalMana threshold
  unlocks: string[];
  fatiguePerClick: number;
  mpsMultiplier: number;
  notes: string;
}

export interface ClassDef {
  id: ClassId;
  name: string;
  description: string;
  passive: string;
  active: string;
  specs: {
    rank3: { A: string; B: string };
    rank6: { A: string; B: string };
    rank9: { A: string; B: string };
  };
}

export interface MasteryLine {
  id: ActiveFocus;
  name: string;
  description: string;
  perLevel: {
    fatigueReduction: number; // -0.5% per level
    hpBonus: number; // +10 per level
    mpsBonus: number; // +5% per level
    caBonus: number; // +5% per level
    ageSlow: number; // up to -50%
    combatDmg: number; // +8% per level
    critChance: number; // +0.3% per level
    cdReduction: number;
  };
}

export interface SpellDef {
  id: string;
  name: string;
  line: ActiveFocus;
  level: number;
  cooldown: number;
  description: string;
}

export interface RecipeDef {
  id: string;
  name: string;
  cost: {
    mana?: number;
    poArcano?: number;
    seivaEstelar?: number;
    sangueSombrio?: number;
  };
  effect: string;
  unlockRank?: number;
  limit?: number; // per life
}

export interface ZoneDef {
  id: string;
  name: string;
  unlockRank: number;
  drops: string[];
  enemyLevel: number;
  isBossZone: boolean;
  synergyClass: ClassId;
  synergyNote: string;
}

export interface LineageUpgrade {
  id: string;
  name: string;
  maxLevel: number;
  baseCost: number;
  description: string;
}