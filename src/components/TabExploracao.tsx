import React from "react";
import { GameState } from "../types/game";
import { ZONES, SPELLS } from "../data/gameData";
import { Compass, Swords, Skull, Zap } from "lucide-react";
import { getMaxHealth } from "../engine/calculations";

interface TabExploracaoProps {
  state: GameState;
  startExploration: (zoneId: string) => void;
  castSpell: (spellId: string) => void;
}

export const TabExploracao: React.FC<TabExploracaoProps> = ({
  state,
  startExploration,
  castSpell,
}) => {
  const { activeZoneId, progress, zoneVitality, inCombat, enemy } =
    state.exploration;
  const maxHp = getMaxHealth(state);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 text-arcana-300 font-display text-xl font-bold border-b border-void-600 pb-4">
        <Compass size={24} />
        <h1>EXPLORAÇÃO E COMBATE</h1>
      </div>

      {/* Seção de Zonas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ZONES.map((zone) => {
          const isLocked = state.rank < zone.unlockRank;
          const isActive = activeZoneId === zone.id;
          const vitality = zoneVitality?.[zone.id] ?? 100;
          const description =
            "description" in zone
              ? (zone as any).description
              : "Explore esta zona em busca de recursos.";

          return (
            <div
              key={zone.id}
              className={`p-5 rounded-xl border flex flex-col gap-3 transition-all ${
                isActive
                  ? "border-arcana-500 bg-void-800/80 shadow-lg shadow-arcana-900/20"
                  : "border-void-600 bg-void-800/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-arcana-200 flex items-center gap-2">
                  {zone.isBossZone ? (
                    <Skull size={18} className="text-rose-500" />
                  ) : (
                    <Compass size={18} />
                  )}
                  {zone.name}
                </h3>
                {isLocked ? (
                  <span className="text-[10px] text-rose-500 font-bold uppercase">
                    Rank {zone.unlockRank}+
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    Disponível
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-xs font-serif italic">
                {description}
              </p>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400 font-display">
                  <span>Vitalidade da Zona</span>
                  <span>{Math.floor(vitality)}%</span>
                </div>
                <div className="w-full bg-void-900 h-2 rounded-full overflow-hidden border border-void-700">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${vitality}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto pt-3 border-t border-void-700">
                <div className="text-[10px] text-slate-500">
                  Drops: {zone.drops.join(", ")}
                </div>
                <button
                  onClick={() => startExploration(zone.id)}
                  disabled={isLocked}
                  className={`px-4 py-1.5 rounded text-xs font-display text-white transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 hover:bg-emerald-500 font-bold"
                      : "bg-arcana-600 hover:bg-arcana-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {isActive ? "Expedindo..." : "Explorar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de Progresso da Zona Ativa e Combate */}
      {activeZoneId && (
        <div className="bg-void-800 p-5 rounded-xl border border-void-600 space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-display font-bold text-arcana-300">
              Progresso da Expedição (
              {ZONES.find((z) => z.id === activeZoneId)?.name})
            </div>
            <div className="text-xs text-slate-400">
              {Math.floor(progress)}%
            </div>
          </div>
          <div className="w-full bg-void-900 h-3 rounded-full overflow-hidden border border-void-700">
            <div
              className="bg-arcana-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Área de Combate */}
          {inCombat && enemy ? (
            <div className="mt-6 p-4 rounded-lg bg-rose-950/30 border border-rose-900/50 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-rose-400 flex items-center gap-2">
                  <Swords size={18} /> Combate Ativo: {enemy.name}
                </span>
                <span className="text-xs text-rose-300">ATK: {enemy.atk}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Inimigo HP */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Inimigo HP</span>
                    <span>
                      {Math.floor(enemy.hp)} / {enemy.maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-void-900 h-2.5 rounded-full overflow-hidden border border-void-700">
                    <div
                      className="bg-rose-600 h-full transition-all duration-300"
                      style={{
                        width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Jogador HP */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Seu HP</span>
                    <span>
                      {Math.floor(state.player.health)} / {maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-void-900 h-2.5 rounded-full overflow-hidden border border-void-700">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{
                        width: `${Math.max(0, (state.player.health / maxHp) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Feitiços Táticos Equipados */}
              <div className="pt-3 border-t border-rose-900/40">
                <div className="text-xs font-display text-slate-400 mb-2">
                  Feitiços Táticos Disponíveis:
                </div>
                <div className="flex gap-2 flex-wrap">
                  {state.skills.equippedSpells.length > 0 ? (
                    state.skills.equippedSpells.map((spellId) => {
                      const spell = SPELLS.find((s) => s.id === spellId);
                      if (!spell) return null;
                      return (
                        <button
                          key={spellId}
                          onClick={() => castSpell(spellId)}
                          className="bg-arcana-700 hover:bg-arcana-600 text-white px-3 py-1.5 rounded text-xs font-display flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Zap size={14} /> {spell.name}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Nenhum feitiço equipado nos slots táticos (Aba 3).
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500 py-2">
              Explorando a zona... Em busca de recursos e criaturas.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
