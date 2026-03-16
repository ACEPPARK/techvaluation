/**
 * 위험프리미엄 매핑 테이블
 * 총점(20~50)에 따른 위험프리미엄(%) 매핑
 */

export const RISK_PREMIUM_MAP = {
  20: 10.01,
  21: 9.33,
  22: 8.72,
  23: 8.15,
  24: 7.62,
  25: 7.14,
  26: 6.68,
  27: 6.25,
  28: 5.84,
  29: 5.46,
  30: 5.10,
  31: 4.75,
  32: 4.42,
  33: 4.10,
  34: 3.80,
  35: 3.51,
  36: 3.24,
  37: 2.97,
  38: 2.71,
  39: 2.46,
  40: 2.22,
  41: 1.99,
  42: 1.76,
  43: 1.55,
  44: 1.33,
  45: 1.13,
  46: 0.93,
  47: 0.73,
  48: 0.54,
  49: 0.36,
  50: 0.18,
};

/**
 * 위험프리미엄 점수(총점)에 해당하는 위험프리미엄(%)을 반환한다.
 * @param {number} score - 위험프리미엄 총점 (10개 항목 합산, 10~50)
 * @returns {number|null} 위험프리미엄 (%), 점수가 20 미만이면 null 반환
 */
export function getRiskPremium(score) {
  if (score < 20) return null;

  // 점수를 정수로 변환 (반올림)
  const roundedScore = Math.round(score);

  // 범위 제한 (20~50)
  const clampedScore = Math.min(50, Math.max(20, roundedScore));

  return RISK_PREMIUM_MAP[clampedScore] ?? null;
}
