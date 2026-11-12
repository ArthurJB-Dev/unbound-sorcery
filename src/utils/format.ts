/**
 * Formatador numérico exponencial (até 1e100+) e conversor de Idade (Anos/Dias).
 * Usa number nativo do JavaScript (suporta até 1.79e308).
 */

const SUFFIXES: { value: number; suffix: string }[] = [
  { value: 1e3, suffix: 'K' },     // Mil
  { value: 1e6, suffix: 'M' },     // Milhão
  { value: 1e9, suffix: 'B' },     // Bilhão
  { value: 1e12, suffix: 'T' },    // Trilhão
  { value: 1e15, suffix: 'Qa' },   // Quadrilhão
  { value: 1e18, suffix: 'Qt' },   // Quintilhão
  { value: 1e21, suffix: 'Sx' },   // Sextilhão
  { value: 1e24, suffix: 'Sp' },   // Septilhão
  { value: 1e27, suffix: 'Oc' },   // Octilhão
  { value: 1e30, suffix: 'No' },   // Nonilhão
  { value: 1e33, suffix: 'Dc' },   // Decilhão
  { value: 1e36, suffix: 'Ud' },   // Undecilhão
  { value: 1e39, suffix: 'Dd' },   // Duodecilhão
  { value: 1e42, suffix: 'Td' },   // Tredecilhão
  { value: 1e45, suffix: 'Qad' },  // Quattuordecilhão
  { value: 1e48, suffix: 'Qtd' },  // Quindecilhão
  { value: 1e51, suffix: 'Sxd' },  // Sexdecilhão
  { value: 1e54, suffix: 'Spd' },  // Septendecilhão
  { value: 1e57, suffix: 'Ocd' },  // Octodecilhão
  { value: 1e60, suffix: 'Nod' },  // Novemdecilhão
  { value: 1e63, suffix: 'Vg' },   // Vigintilhão
  { value: 1e66, suffix: 'Uvg' },  // Unvigintilhão
  { value: 1e69, suffix: 'Dvg' },  // Duovigintilhão
  { value: 1e72, suffix: 'Tvg' },  // Trevigintilhão
  { value: 1e75, suffix: 'Qavg' }, // Quattuorvigintilhão
  { value: 1e78, suffix: 'Qtvg' }, // Quinvigintilhão
  { value: 1e81, suffix: 'Sxvg' }, // Sexvigintilhão
  { value: 1e84, suffix: 'Spvg' }, // Septenvigintilhão
  { value: 1e87, suffix: 'Ocvg' }, // Octovigintilhão
  { value: 1e90, suffix: 'Novg' }, // Novemvigintilhão
  { value: 1e93, suffix: 'Tg' },   // Trigintilhão
  { value: 1e96, suffix: 'Utg' },  // Untrigintilhão
  { value: 1e99, suffix: 'Dtg' },  // Duotrigintilhão
  { value: 1e102, suffix: 'Ttg' }, // Tretrigintilhão
];

/** Formata um número para exibição curta com sufixos K, M, B, T... até 1e102. */
export function formatNumber(value: number): string {
  if (!isFinite(value)) return '∞';
  if (value < 0) return '-' + formatNumber(-value);

  if (value < 10_000) {
    if (value > 0 && value < 100 && !Number.isInteger(value)) {
      return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    return Math.floor(value).toLocaleString('pt-BR');
  }

  if (value >= 1e105) {
    return formatScientific(value);
  }

  let index = 0;
  for (let i = 1; i < SUFFIXES.length; i++) {
    if (value >= SUFFIXES[i].value) {
      index = i;
    } else {
      break;
    }
  }

  let scaled = value / SUFFIXES[index].value;
  if (scaled >= 999.95 && index + 1 < SUFFIXES.length) {
    index += 1;
    scaled = value / SUFFIXES[index].value;
  }

  const formatted =
    scaled < 10
      ? scaled.toFixed(2)
      : scaled < 100
      ? scaled.toFixed(1)
      : scaled.toFixed(0);

  return formatted + SUFFIXES[index].suffix;
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