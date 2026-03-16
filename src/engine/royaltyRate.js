/**
 * 적정 로열티율 산출
 * 로열티공제법 모델 I
 */

export function calculateAdjustmentCoefficient(scores) {
  // scores: object with 15 item keys, values from -2 to +2
  const values = Object.values(scores);
  if (values.length === 0) return 1;
  const totalScore = values.reduce((sum, v) => sum + (v || 0), 0);
  return 1 + (totalScore / 30);
}

export function calculateEffectiveRoyaltyRate({
  baseRoyaltyRate,      // 기준 로열티율 (decimal, e.g., 0.05 for 5%)
  adjustmentScores,     // 15 items, -2 to +2
  techWeight,           // 기술의 비중 (decimal, 0~1)
  pioneerRate,          // 개척률 (decimal, 0.5~1)
}) {
  const adjustmentCoefficient = calculateAdjustmentCoefficient(adjustmentScores);
  const effectiveRate = baseRoyaltyRate * adjustmentCoefficient * techWeight * pioneerRate;
  
  return {
    baseRoyaltyRate,
    adjustmentCoefficient,
    techWeight,
    pioneerRate,
    effectiveRate,
    effectiveRatePercent: effectiveRate * 100,
  };
}
