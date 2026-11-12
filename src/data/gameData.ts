import { RankDef, ClassDef, MasteryLine, SpellDef, RecipeDef, ZoneDef, LineageUpgrade, GameState } from '../types/game';

export const RANKS: RankDef[] = [
  {
    id: 1,
    name: 'Faísca',
    threshold: 0,
    unlocks: ['Aba 1 (Grimório)', 'Aba 2 (Skills)'],
    fatiguePerClick: 2.0,
    mpsMultiplier: 1,
    notes: 'Início da jornada mágica. Canalize mana e treine suas skills.',
  },
  {
    id: 2,
    name: 'Condutor',
    threshold: 1e3,
    unlocks: ['Aba 3 (Alquimia)', 'Aba 4 (Exploração)'],
    fatiguePerClick: 0.8,
    mpsMultiplier: 1.5,
    notes: 'Desbloqueia expedições na Floresta Arcana e receitas alquímicas.',
  },
  {
    id: 3,
    name: 'Tecelão',
    threshold: 1e6,
    unlocks: ['Aba 5 (Classes)', 'Aba 6 (Renascimento)', 'Especialização R3'],
    fatiguePerClick: 0.1,
    mpsMultiplier: 2,
    notes: 'Abre 100% das abas do jogo, escolha de Classe e o Ritual de Renascimento.',
  },
  {
    id: 4,
    name: 'Vigário Arcano',
    threshold: 1e10,
    unlocks: ['Alquimia -10% Custo'],
    fatiguePerClick: 0.08,
    mpsMultiplier: 5,
    notes: 'Custo de receitas alquímicas reduzido em 10%.',
  },
  {
    id: 5,
    name: 'Mestre do Véu',
    threshold: 1e15,
    unlocks: ['Expedição -30% Tempo'],
    fatiguePerClick: 0.05,
    mpsMultiplier: 10,
    notes: 'Acelera explorações de zonas em 30%.',
  },
  {
    id: 6,
    name: 'Soberano Arcano',
    threshold: 1e21,
    unlocks: ['Auto-Expedição & Auto-Coleta', 'Especialização R6'],
    fatiguePerClick: 0.03,
    mpsMultiplier: 25,
    notes: 'Zonas selecionadas operam em auto-loop sem depleção.',
  },
  {
    id: 7,
    name: 'Desvelador',
    threshold: 1e30,
    unlocks: ['Velocidade 2x sem Custo de Idade'],
    fatiguePerClick: 0.02,
    mpsMultiplier: 50,
    notes: 'Dobra a velocidade de produção sem acelerar o envelhecimento.',
  },
  {
    id: 8,
    name: 'Coroa do Éter',
    threshold: 1e45,
    unlocks: ['Elixir da Imortalidade'],
    fatiguePerClick: 0.01,
    mpsMultiplier: 100,
    notes: 'Desbloqueia o mítico Elixir da Imortalidade.',
  },
  {
    id: 9,
    name: 'Paradoxo Vivo',
    threshold: 1e66,
    unlocks: ['Cooldown -50%', 'Efeito Duplo em Poções', 'Especialização R9'],
    fatiguePerClick: 0.005,
    mpsMultiplier: 250,
    notes: 'Reduz cooldown de feitiços pela metade e dobra eficiências de poção.',
  },
  {
    id: 10,
    name: 'Nome Além dos Mundos',
    threshold: 1e100,
    unlocks: ['New Game+ Divino'],
    fatiguePerClick: 0.001,
    mpsMultiplier: 1000,
    notes: 'Habilita o New Game+ Divino (+1000% permanente em tudo).',
  },
];

export const CLASSES: ClassDef[] = [
  {
    id: 'feiticeiro',
    name: 'Feiticeiro',
    description: 'Canalizador bruto de energia mágica interna. Focado em cliques devastadores e sacrifício de vida.',
    passive: '+100% Mana por clique, porém gera 2x mais Fadiga.',
    active: 'Surto de Sangue (CD 60s): Sacrifica 5% de Vida Máxima para ganhar +500% Poder de Clique por 15s.',
    specs: {
      rank3: {
        A: '+1% Dano por cada 1% de Fadiga atual.',
        B: 'Imunidade total ao Colapso Místico.',
      },
      rank6: {
        A: '+300% Ataque enquanto a Vida estiver abaixo de 30%.',
        B: 'Derrotar um inimigo reduz 20% de Fadiga imediatamente.',
      },
      rank9: {
        A: '+200% Dano de Feitiços e Área.',
        B: 'Ressuscita com 50% de HP 1x por vida.',
      },
    },
  },
  {
    id: 'xama',
    name: 'Xamã',
    description: 'Sintonizado com a natureza e vitalidade das zonas. Mantém equilíbrio místico constante.',
    passive: 'MPS multiplicado por (1 + Vitalidade Média das Zonas * 0.5). Clicar na Orbe durante expedições na Floresta limpa Fadiga.',
    active: 'Guardião da Terra (CD 60s): Limpa 50% da Fadiga e restaura +25% de Vitalidade da Zona ativa.',
    specs: {
      rank3: {
        A: 'Golem Astral absorve 60% do dano recebido.',
        B: 'Ataques em combate restauram Vitalidade da Zona.',
      },
      rank6: {
        A: '35% de chance de Atordoar o inimigo por 1 turno.',
        B: '20% do dano causado é convertido em cura de Vida.',
      },
      rank9: {
        A: '+1000% Dano em Zonas com 100% de Vitalidade.',
        B: 'Inimigos causam -50% de Dano.',
      },
    },
  },
  {
    id: 'mago',
    name: 'Mago',
    description: 'Estudioso das constelações e do tempo. Domina o Conhecimento Arcano e ciclos celestes.',
    passive: 'Durante a Lua Cheia, MPS e Clique ganham 4x; na Lua Nova, MPS cai 30%. Gera +100% Conhecimento Arcano.',
    active: 'Estase Temporal (CD 60s): Congela o envelhecimento (ageDays) e ataques inimigos por 15s.',
    specs: {
      rank3: {
        A: 'Mana absorve 100% do dano antes da Vida.',
        B: 'Inimigos iniciam combates congelados por 5s.',
      },
      rank6: {
        A: '4x Dano em todas as fases da Lua Cheia.',
        B: 'Rebobina golpe fatal para 30% HP (CD 180s).',
      },
      rank9: {
        A: 'Ignora 100% da defesa e resiliência inimiga.',
        B: 'Ataca 3 vezes por tick em combate.',
      },
    },
  },
  {
    id: 'bruxo',
    name: 'Bruxo',
    description: 'Realiza pactos sombrios com entidades. Abre mão de MPS passivo em troca de burst e saques abundantes.',
    passive: 'MPS base é 0, mas ganha +150% de drops/recursos. Exige um Sacrifício a cada 30 dias (Dívida de Alma) ou perde 2 anos de vida.',
    active: 'Contrato de Sangue (CD 60s): Gera Mana = 300x Rank atual e quita a Dívida de Alma ao custo de 15% de HP.',
    specs: {
      rank3: {
        A: 'Servo Abissal causa dano automático por tick igual ao Rank * 10.',
        B: 'Inimigos dropam +100% de Mana instantânea.',
      },
      rank6: {
        A: '+5% de Chance Crítica por abate (acumula até 50x).',
        B: 'Executa instantaneamente inimigos abaixo de 30% HP.',
      },
      rank9: {
        A: '+800% Dano por 30s após quitar Dívida de Alma.',
        B: 'Chefes garantem drop máximo e zeram a Dívida.',
      },
    },
  },
];

export const MASTERY_LINES: MasteryLine[] = [
  {
    id: 'corpo',
    name: 'Linha do Corpo (Somática)',
    description: 'Aprimora o recipiente físico. Aumenta a vida máxima e reduz o estresse biológico por clique.',
    perLevel: {
      fatigueReduction: 0.005, // -0.5% per level
      hpBonus: 10, // +10 max HP per level
      mpsBonus: 0,
      caBonus: 0,
      ageSlow: 0,
      combatDmg: 0,
      critChance: 0,
      cdReduction: 0,
    },
  },
  {
    id: 'mente',
    name: 'Linha da Mente (Mental)',
    description: 'Expande a mente arcana. Aumenta a produção passiva de Mana e Conhecimento, desacelerando a velhice.',
    perLevel: {
      fatigueReduction: 0,
      hpBonus: 0,
      mpsBonus: 0.05, // +5% MPS per level
      caBonus: 0.05, // +5% CA generation per level
      ageSlow: 0.005, // up to -50% age speed (0.5% per level)
      combatDmg: 0,
      critChance: 0,
      cdReduction: 0,
    },
  },
  {
    id: 'caos',
    name: 'Linha do Caos (Obscura)',
    description: 'Canaliza correntes instáveis. Eleva brutalmente o dano em combate, decisividade crítica e cooldowns.',
    perLevel: {
      fatigueReduction: 0,
      hpBonus: 0,
      mpsBonus: 0,
      caBonus: 0,
      ageSlow: 0,
      combatDmg: 0.08, // +8% combat damage per level
      critChance: 0.003, // +0.3% crit chance per level
      cdReduction: 0.005, // -0.5% cooldown reduction per level
    },
  },
];

export const SPELLS: SpellDef[] = [
  {
    id: 'golpe_vital',
    name: 'Golpe Vital',
    line: 'corpo',
    level: 1,
    cooldown: 5,
    description: 'Causa dano direto igual a 2.5x seu Ataque Base ao inimigo.',
  },
  {
    id: 'escudo_etereo',
    name: 'Escudo Etéreo',
    line: 'mente',
    level: 5,
    cooldown: 12,
    description: 'Absorve todo o dano recebido nos próximos 5s consumindo Mana em vez de HP.',
  },
  {
    id: 'purificacao_runica',
    name: 'Purificação Rúnica',
    line: 'corpo',
    level: 10,
    cooldown: 20,
    description: 'Reduz 30% da Fadiga acumulada imediatamente.',
  },
  {
    id: 'dobra_de_ticks',
    name: 'Dobra de Ticks',
    line: 'mente',
    level: 15,
    cooldown: 30,
    description: 'Executa instantaneamente 5 ticks de produção de Mana e dano em combate.',
  },
  {
    id: 'nova_do_caos',
    name: 'Nova do Caos',
    line: 'caos',
    level: 20,
    cooldown: 25,
    description: 'Causa 8x Dano Crítico ao inimigo ao custo de +15% de Fadiga.',
  },
  {
    id: 'estase_biologica',
    name: 'Estase Biológica',
    line: 'mente',
    level: 30,
    cooldown: 60,
    description: 'Congela o envelhecimento e regenera 20% de HP ao longo de 30s.',
  },
];

export const RECIPES: RecipeDef[] = [
  {
    id: 'tonico_vigor',
    name: 'Tônico de Vigor',
    cost: { poArcano: 20, seivaEstelar: 10 },
    effect: 'Limpa 50% da Fadiga imediatamente.',
  },
  {
    id: 'pocao_sangue',
    name: 'Poção de Sangue',
    cost: { sangueSombrio: 15, poArcano: 10 },
    effect: 'Restaura 40% da Saúde Biológica do personagem.',
  },
  {
    id: 'sigilo_automacao',
    name: 'Sigilo de Automação',
    cost: { poArcano: 50, seivaEstelar: 25 },
    effect: 'Executa 5 cliques automáticos por segundo durante 5 minutos.',
  },
  {
    id: 'effigie_oferenda',
    name: 'Efígie de Oferenda',
    cost: { sangueSombrio: 30 },
    effect: 'Quita a Dívida de Alma (Bruxo) e concede um burst de Mana.',
  },
  {
    id: 'elixir_juventude',
    name: 'Elixir da Juventude',
    cost: { seivaEstelar: 100, sangueSombrio: 50 },
    effect: 'Rejuvenesce 5 anos (1.825 dias). Máximo de 3x por vida.',
    limit: 3,
  },
  {
    id: 'elixir_imortalidade',
    name: 'Elixir da Imortalidade',
    unlockRank: 8,
    cost: { poArcano: 1000, seivaEstelar: 1000, sangueSombrio: 1000 },
    effect: 'Ativa Imortalidade: congela a idade biológica permanentemente.',
    limit: 1,
  },
];

export const ZONES: ZoneDef[] = [
  {
    id: 'floresta_arcana',
    name: 'Floresta Arcana',
    unlockRank: 2,
    drops: ['poArcano', 'seivaEstelar'],
    enemyLevel: 1,
    isBossZone: false,
    synergyClass: 'xama',
    synergyNote: 'Clicar na Orbe durante a expedição limpa Fadiga.',
  },
  {
    id: 'linhas_de_ley',
    name: 'Linhas de Ley & Cumes',
    unlockRank: 4,
    drops: ['poArcano', 'knowledge'],
    enemyLevel: 2,
    isBossZone: false,
    synergyClass: 'feiticeiro',
    synergyNote: 'Regenera +5 HP por tick ao explorar esta área.',
  },
  {
    id: 'ruinas_astrais',
    name: 'Ruínas Astrais',
    unlockRank: 5,
    drops: ['seivaEstelar', 'knowledge'],
    enemyLevel: 3,
    isBossZone: false,
    synergyClass: 'mago',
    synergyNote: 'Ganha +100% Conhecimento Arcano nesta expedição.',
  },
  {
    id: 'covil_do_abismo',
    name: 'Covil do Abismo',
    unlockRank: 6,
    drops: ['sangueSombrio'],
    enemyLevel: 4,
    isBossZone: true,
    synergyClass: 'bruxo',
    synergyNote: 'Possui Chefes (Bosses) e drop extra de Sangue Sombrio.',
  },
];

export const LINEAGE_UPGRADES: LineageUpgrade[] = [
  {
    id: 'genetica_arcana',
    name: 'Genética Arcana',
    maxLevel: 10,
    baseCost: 200,
    description: '+3 anos de expectativa de vida base e -5% taxa de fadiga por nível.',
  },
  {
    id: 'catalisacao_cosmica',
    name: 'Catalisação Cósmica',
    maxLevel: 20,
    baseCost: 150,
    description: '+25% de MPS e Poder de Clique global por nível.',
  },
  {
    id: 'memoria_ancestral',
    name: 'Memória Ancestral',
    maxLevel: 5,
    baseCost: 400,
    description: 'Inicia novas vidas retendo +20% de Conhecimento Arcano por nível.',
  },
  {
    id: 'apoteose_divina',
    name: 'Apoteose Divina',
    maxLevel: 1,
    baseCost: 100000,
    description: 'Desbloqueia New Game+ Divino (+1000% permanente em todas as métricas).',
  },
];

export const INITIAL_GAME_STATE: GameState = {
  player: {
    name: 'Arquimago',
    generation: 1,
    classId: 'feiticeiro',
    specs: {
      rank3: null,
      rank6: null,
      rank9: null,
    },
    ageDays: 6570, // 18 anos
    maxAgeDays: 21900, // 60 anos
    isImmortal: false,
    health: 100,
    maxHealth: 100,
    fatigue: 0,
    collapseTimer: 0,
    soulDebtDays: 0,
  },
  economy: {
    mana: 0,
    historicalMana: 0,
    knowledge: 0,
    ancestralEssence: 0,
  },
  rank: 1,
  skills: {
    activeFocus: 'corpo',
    levels: {
      corpo: 0,
      mente: 0,
      caos: 0,
    },
    equippedSpells: ['golpe_vital'],
  },
  alchemy: {
    resources: {
      poArcano: 0,
      seivaEstelar: 0,
      sangueSombrio: 0,
    },
    activeBuffs: {},
  },
  exploration: {
    activeZoneId: null,
    progress: 0,
    zoneVitality: {
      floresta_arcana: 100,
      linhas_de_ley: 100,
      ruinas_astrais: 100,
      covil_do_abismo: 100,
    },
    inCombat: false,
    enemy: null,
    bossesDefeated: 0,
  },
  lineage: {
    upgrades: {},
  },
  lastSaveTimestamp: Date.now(),
};