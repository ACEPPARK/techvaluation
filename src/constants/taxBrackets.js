/**
 * 법인세율 구간표 (단위: 백만원)
 * 2024년 기준 법인세율 + 지방소득세 포함
 */

export const TAX_BRACKETS = [
  {
    min: 0,
    max: 200,
    rate: 0.09,
    localRate: 0.009,
    totalRate: 0.099,
    accumulated: 0,
    description: '2억원 이하',
  },
  {
    min: 200,
    max: 20000,
    rate: 0.19,
    localRate: 0.019,
    totalRate: 0.209,
    accumulated: 19.8,
    description: '2억원 초과 ~ 200억원 이하',
  },
  {
    min: 20000,
    max: 300000,
    rate: 0.21,
    localRate: 0.021,
    totalRate: 0.231,
    accumulated: 4158.0,
    description: '200억원 초과 ~ 3,000억원 이하',
  },
  {
    min: 300000,
    max: Infinity,
    rate: 0.24,
    localRate: 0.024,
    totalRate: 0.264,
    accumulated: 68858.0,
    description: '3,000억원 초과',
  },
];

/**
 * 과세표준에 대한 법인세(지방소득세 포함)를 계산한다.
 * @param {number} taxableIncome - 과세표준 (백만원 단위)
 * @returns {number} 법인세액 (백만원 단위)
 */
export function calculateCorporateTax(taxableIncome) {
  if (taxableIncome <= 0) return 0;

  for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
    const bracket = TAX_BRACKETS[i];
    if (taxableIncome > bracket.min) {
      return bracket.accumulated + (taxableIncome - bracket.min) * bracket.totalRate;
    }
  }
  return 0;
}

/**
 * 과세표준에 대한 실효세율을 계산한다.
 * @param {number} taxableIncome - 과세표준 (백만원 단위)
 * @returns {number} 실효세율 (0~1 사이의 비율)
 */
export function getEffectiveTaxRate(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  const tax = calculateCorporateTax(taxableIncome);
  return tax / taxableIncome;
}
