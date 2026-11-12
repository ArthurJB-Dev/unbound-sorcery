/**
 * Formatador numérico exponencial (até 1e100) e conversor de Idade (Anos/Dias).
 * Usa number nativo do JavaScript (suporta até 1.79e308).
 */

const SUFFIXES: { max: number; suffix: string }[] = [
  { max: 1e3, suffix: '' },
  { max: 1e6, suffix: 'K' },
  { max: 1e9, suffix: 'M' },
  { max: 1e12, suffix: 'B' },
  { max: 1e15, suffix: 'T' },
  { max: 1e18, suffix: 'Qa' },
  { max: 1e21, suffix: 'Qt' },
  { max: 1e24, suffix: 'Sx' },
  { max: 1e27, suffix: 'Sp' },
  { max: 1e30, suffix: 'Oc' },
  { max: 1e33, suffix: 'Dc' },
  { max: 1e36, suffix: 'Tg' },
  { max: 1e39, suffix: 'Qdg' },
  { max: 1e42, suffix: 'Qq' },
  { max: 1e45, suffix: 'Ss' },
  { max: 1e48, suffix: 'Se' },
  { max: 1e51, suffix: 'De' },
  { max: 1e54, suffix: 'Do' },
  { max: 1e57, suffix: 'Tr' },
  { max: 1e60, suffix: 'QaT' },
  { max: 1e63, suffix: 'QtT' },
  { max: 1e66, suffix: 'SxT' },
  { max: 1e69, suffix: 'SpT' },
  { max: 1e72, suffix: 'OcT' },
  { max: 1e75, suffix: 'DcT' },
  { max: 1e78, suffix: 'TgT' },
  { max: 1e81, suffix: 'QdgT' },
  { max: 1e84, suffix: 'QqT' },
  { max: 1e87, suffix: 'SsT' },
  { max: 1e90, suffix: 'SeT' },
  { max: 1e93, suffix: 'DeT' },
  { max: 1e96, suffix: 'DoT' },
  { max: 1e99, suffix: 'TrT' },
  { max: 1e102, suffix: 'QaTT' },
];

/** Formata um número para exibição curta com sufixos K, M, B, T... até 1e100. */
export function formatNumber(value: number): string {
  if (!isFinite(value)) return '∞';
  if (value < 0) return '-' + formatNumber(-value);
  if (value < 10_000) return Math.floor(value).toLocaleString('pt-BR');
  let chosen = SUFFIXES[0];
  for (let i = 1; i < SUFFIXES.length; i++) {
    if (value >= SUFFIXES[i].max) chosen = SUFFIXES[i];
    else break;
  }
  const scaled = value / chosen.max;
  const formatted = scaled < 10 ? scaled.toFixed(2) : scaled.toFixed(1);
  return formatted + chosen.suffix;
}

/** Formata como notação científica curta, ex: 1.23e+45 */
export function formatScientific(value: number): string {
  if (!isFinite(value)) return '∞';
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exp);
  return mantissa.toFixed(2) + 'e+' + exp;
}

/** Converte dias em anos + dias, ex: 6570 -> "18a 0d" */
export function formatAge(ageDays: number): string {
  const totalDays = Math.max(0, Math.floor(ageDays));
  const years = Math.floor(totalDays / 365);
  const days = totalDays % 365;
  return `${years}a ${days}d`;
}

/** Fase da vida conforme idade */
export function lifePhase(ageYears: number): string {
  if (ageYears < 35) return 'Jovem';
  if (ageYears < 56) return 'Adulto';
  return 'Ancião';
}

/** Estação do ano conforme dia do ano (ciclo de 365) */
export function season(dayOfYear: number): string {
  const d = ((dayOfYear % 365) + 365) % 365;
  if (d < 91) return 'Primavera';
  if (d < 182) return 'Verão';
  if (d < 273) return 'Outono';
  return 'Inverno';
}

/** Fase da lua conforme dia (ciclo de 28) */
export function moonPhase(dayOfYear: number): string {
  const d = ((dayOfYear % 28) + 28) % 28;
  if (d < 7) return 'Nova';
  if (d < 14) return 'Crescente';
  if (d < 21) return 'Cheia';
  return 'Minguante';
}