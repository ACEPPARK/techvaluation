/**
 * 할인율(WACC) 추정
 * CAPM + 규모프리미엄 + 기술사업화 위험프리미엄
 */

import { getRiskPremium } from '../constants/riskPremiumMap.js';

export function calculateRiskPremiumScore(scores) {
  // scores: object with 10 item keys, values 1-5
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + (v || 0), 0);
}

export function calculateWACC({
  capmRate,             // CAPM(상장기업) 또는 비상장CAPM (decimal)
  sizePremium,          // 규모 위험프리미엄 (decimal)
  riskPremiumScores,    // 10 items, 1-5 scale
  equityRatio,          // 자기자본비율 (decimal, 0~1)
  debtCostRate,         // 세전 타인자본비용 (decimal)
  corporateTaxRate,     // 평균 법인세율 (decimal)
}) {
  const totalRiskScore = calculateRiskPremiumScore(riskPremiumScores);
  const riskPremiumPercent = getRiskPremium(totalRiskScore);
  const techRiskPremium = riskPremiumPercent !== null ? riskPremiumPercent / 100 : 0;
  
  const equityCost = capmRate + sizePremium + techRiskPremium;
  const debtRatio = 1 - equityRatio;
  const afterTaxDebtCost = debtCostRate * (1 - corporateTaxRate);
  const wacc = (equityCost * equityRatio) + (afterTaxDebtCost * debtRatio);
  
  return {
    capmRate,
    sizePremium,
    totalRiskScore,
    riskPremiumPercent: riskPremiumPercent || 0,
    techRiskPremium,
    equityCost,
    equityRatio,
    debtRatio,
    debtCostRate,
    afterTaxDebtCost,
    corporateTaxRate,
    wacc,
    waccPercent: wacc * 100,
  };
}
