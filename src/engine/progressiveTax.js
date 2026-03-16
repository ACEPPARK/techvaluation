/**
 * 한국 법인세 누진세율 계산 (지방소득세 포함)
 * 금액 단위: 백만원
 */

const TAX_BRACKETS = [
  { min: 0, max: 200, totalRate: 0.099 },
  { min: 200, max: 20000, totalRate: 0.209 },
  { min: 20000, max: 300000, totalRate: 0.231 },
  { min: 300000, max: Infinity, totalRate: 0.264 },
];

export function calculateProgressiveTax(incomeMillions) {
  if (incomeMillions <= 0) return { tax: 0, effectiveRate: 0 };
  
  let totalTax = 0;
  let remaining = incomeMillions;
  
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    totalTax += taxableInBracket * bracket.totalRate;
    remaining -= taxableInBracket;
  }
  
  return {
    tax: totalTax,
    effectiveRate: totalTax / incomeMillions,
  };
}
