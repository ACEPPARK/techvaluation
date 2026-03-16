/**
 * 기술의 경제적 수명 계산
 * 기술수명 영향요인 평가표 (모델 II) 기반
 */

// 가중치: [우월성7, 기술경쟁강도4, 대체가능성5, 모방난이도3, 권리보호강도3, 시장진입가능성4, 시장경쟁강도4, 시장경쟁의변화4, 신제품출현가능성3, 예상시장점유율4]
const WEIGHTS = [7, 4, 5, 3, 3, 4, 4, 4, 3, 4];
const MAX_WEIGHTED_SCORE = WEIGHTS.reduce((sum, w) => sum + w * 5, 0); // 205

export function calculateAcquisitionValue(scores) {
  // scores: array of 10 scores (1-5)
  if (!scores || scores.length !== 10) return 0;
  const weightedSum = scores.reduce((sum, score, i) => sum + score * WEIGHTS[i], 0);
  return (weightedSum / MAX_WEIGHTED_SCORE) * 100;
}

export function calculateEconomicLife(tctData, scores, preparationPeriod = 0) {
  // tctData: { q1, q2, q3 } - TCT quartile data
  // scores: array of 10 scores (1-5)
  // preparationPeriod: 사업화 준비기간 (years)
  
  const { q1, q2, q3 } = tctData;
  const acquisitionValue = calculateAcquisitionValue(scores);
  const BASE_VALUE = 60;  // 기준값
  const MIN_VALUE = 20;   // 최소값
  const MAX_VALUE = 100;  // 최대값
  
  let economicLife;
  if (acquisitionValue >= BASE_VALUE) {
    economicLife = q2 + (q3 - q2) * ((acquisitionValue - BASE_VALUE) / (MAX_VALUE - BASE_VALUE));
  } else {
    economicLife = q1 + (q2 - q1) * ((acquisitionValue - MIN_VALUE) / (BASE_VALUE - MIN_VALUE));
  }
  
  // 반올림
  economicLife = Math.round(economicLife);
  // 최소 1년
  economicLife = Math.max(1, economicLife);
  
  return {
    acquisitionValue,
    rawEconomicLife: economicLife,
    economicLife,
  };
}

export function determineEconomicLife(tctData, scores, legalRemainingYears, preparationPeriod = 0) {
  const result = calculateEconomicLife(tctData, scores, preparationPeriod);
  
  // 법적 잔존기간과 비교하여 짧은 쪽 적용 (보수적)
  const finalLife = Math.min(result.rawEconomicLife, legalRemainingYears);
  const cashFlowPeriod = preparationPeriod + finalLife;
  
  return {
    ...result,
    legalRemainingYears,
    finalEconomicLife: finalLife,
    preparationPeriod,
    cashFlowPeriod,
  };
}
