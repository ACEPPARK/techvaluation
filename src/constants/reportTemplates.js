/**
 * 기술가치평가 보고서 템플릿 문자열
 * 각 함수는 매개변수를 받아 완성된 한국어 보고서 섹션을 반환한다.
 */

/**
 * 1.1 평가 목적 템플릿
 * @param {Object} params
 * @param {string} params.purpose - 평가 목적 (예: '기술이전', '투자유치', '현물출자' 등)
 * @param {string} params.techName - 기술명
 * @param {string} params.companyName - 기업명
 * @param {string} params.evaluationDate - 평가기준일
 * @returns {string}
 */
export function EVALUATION_PURPOSE_TEMPLATE({ purpose, techName, companyName, evaluationDate }) {
  return `1.1 평가 목적

본 평가는 ${companyName}이(가) 보유한 "${techName}" 기술에 대하여, ${purpose}을(를) 목적으로 해당 기술의 경제적 가치를 산정하기 위해 수행되었습니다.

평가기준일은 ${evaluationDate}이며, 본 보고서에 기재된 모든 가치 산정은 평가기준일 현재의 시장 상황, 기술 수준, 산업 환경 등을 종합적으로 고려하여 이루어졌습니다.

본 평가의 결과는 ${purpose}을(를) 위한 의사결정의 참고자료로 활용될 수 있으며, 평가 목적 이외의 용도로 사용되는 경우 그 적정성이 보장되지 않습니다.`;
}

/**
 * 1.2 기술가치평가의 기준 및 원칙 템플릿
 * @returns {string}
 */
export function VALUATION_PRINCIPLES() {
  return `1.2 기술가치평가의 기준 및 원칙

본 기술가치평가는 다음의 기준 및 원칙에 따라 수행되었습니다.

1) 시장가치 기준 (Market Value Standard)
본 평가에서 산정하는 기술의 가치는 시장가치(Market Value)를 기준으로 합니다. 시장가치란 합리적인 판단력과 거래 의사를 가진 독립된 당사자 사이에서, 정상적인 거래 조건하에 성립될 수 있는 가격을 의미합니다.

2) 공정가치 원칙 (Fair Value Principle)
평가 과정에서 특정 당사자의 이해관계에 치우치지 않고, 객관적이고 공정한 관점에서 기술의 가치를 산정합니다. 이를 위해 공인된 평가 방법론과 신뢰할 수 있는 데이터를 활용합니다.

3) 최유효 이용의 원칙 (Best and Highest Use)
평가 대상 기술이 합리적으로 가능한 범위 내에서 최적으로 활용되는 것을 전제로 가치를 산정합니다. 이는 물리적으로 가능하고, 법적으로 허용되며, 재무적으로 실행 가능한 최선의 활용 방안을 의미합니다.

4) 계속기업 가정 (Going Concern Assumption)
평가 대상 기업이 예측 가능한 미래에 사업을 계속 영위할 것이라는 가정하에 기술가치를 산정합니다.

5) 기여의 원칙 (Contribution Principle)
기술의 가치는 해당 기술이 사업 전체에 기여하는 정도에 기반하여 산정됩니다. 기술 외의 자산(자본, 인력, 브랜드 등)의 기여분은 별도로 고려하여 기술의 순수 기여분만을 산정합니다.`;
}

/**
 * 1.4 평가방법 및 절차 템플릿
 * @param {Object} params
 * @param {string} params.method - 평가방법 (예: '로열티공제법')
 * @param {string} params.techName - 기술명
 * @returns {string}
 */
export function EVALUATION_METHOD_TEMPLATE({ method = '로열티공제법', techName }) {
  return `1.4 평가방법 및 절차

본 평가에서는 "${techName}" 기술의 경제적 가치를 산정하기 위하여 수익접근법(Income Approach) 중 ${method}(Relief from Royalty Method)을 적용하였습니다.

${method}은 평가 대상 기술을 제3자로부터 라이선스(license)하여 사용한다고 가정할 때, 지불해야 하는 로열티(royalty)의 현재가치 합계를 기술의 가치로 산정하는 방법입니다.

본 평가는 다음의 절차에 따라 수행되었습니다.

[1단계] 기술 분석
- 평가 대상 기술의 내용, 특성, 기술 수준, 지식재산권 현황 등을 분석합니다.

[2단계] 시장 및 사업성 분석
- 해당 기술이 적용되는 시장의 규모, 성장성, 경쟁 환경 등을 분석합니다.
- 기술 사업화를 통한 매출 전망을 수립합니다.

[3단계] 로열티율 결정
- 업종별 로열티 통계 데이터를 기반으로 적정 로열티율을 산정합니다.
- 기술기여도 보정계수를 적용하여 최종 로열티율을 확정합니다.

[4단계] 기술수명 산정
- 기술수명 영향요인 분석을 통해 기술의 경제적 수명을 산정합니다.

[5단계] 할인율 결정
- 가중평균자본비용(WACC)에 위험프리미엄을 가산하여 기술가치 할인율을 결정합니다.

[6단계] 기술가치 산정
- 예상 매출액에 로열티율을 적용하고, 법인세를 차감한 후 현재가치로 할인하여 기술가치를 산정합니다.`;
}

/**
 * 1.5 평가의 주요조건 및 가정 템플릿
 * @param {Object} params
 * @param {string} params.techName - 기술명
 * @param {string} params.companyName - 기업명
 * @param {string} params.evaluationDate - 평가기준일
 * @returns {string}
 */
export function EVALUATION_CONDITIONS_TEMPLATE({ techName, companyName, evaluationDate }) {
  return `1.5 평가의 주요조건 및 가정

본 평가는 다음의 주요 조건 및 가정에 기반하여 수행되었습니다.

1) 평가기준일
- 본 평가의 기준일은 ${evaluationDate}이며, 모든 가치 산정은 이 시점을 기준으로 합니다.

2) 기술의 범위
- 평가 대상 기술은 ${companyName}이(가) 보유한 "${techName}" 기술 및 이와 관련된 지식재산권 일체를 포함합니다.

3) 정보의 신뢰성
- 평가에 사용된 기술 정보, 재무 정보, 시장 정보 등은 ${companyName}으로부터 제공받은 자료 및 공개된 자료에 기반하며, 해당 정보가 정확하고 완전한 것으로 가정합니다.

4) 시장 환경
- 평가기준일 현재의 시장 환경, 경쟁 구조, 규제 환경 등이 예측 기간 동안 급격한 변화 없이 합리적으로 변동할 것으로 가정합니다.

5) 계속기업 가정
- ${companyName}은(는) 예측 가능한 미래에 사업을 계속 영위할 것으로 가정합니다.

6) 법률 및 규제
- 현행 법률 및 규제 체계가 유지되며, 기술의 사업화에 중대한 영향을 미치는 법률 변경은 없을 것으로 가정합니다.

7) 세금
- 법인세율은 평가기준일 현재 시행 중인 세율을 적용합니다.`;
}

/**
 * 2.1 로열티공제법 모델 산식 설명 템플릿
 * @returns {string}
 */
export function VALUATION_FORMULA_TEXT() {
  return `2.1 로열티공제법 모델 Ⅰ 산식

로열티공제법에 의한 기술가치 산정 산식은 다음과 같습니다.

                    n
    V = Σ  [ S_t × R × (1 - τ) ] / (1 + r)^t
                   t=1

여기서,
  V   : 기술가치 (Technology Value)
  S_t : t기의 예상 매출액 (Projected Sales in year t)
  R   : 로열티율 (Royalty Rate)
  τ   : 법인세 실효세율 (Effective Corporate Tax Rate)
  r   : 할인율 (Discount Rate) = WACC + 위험프리미엄
  n   : 기술수명 (Technology Life, 연수)
  t   : 기간 (year, 1 ~ n)

[로열티율 산정]
로열티율은 업종별 로열티 통계 데이터에서 산출된 업종 기준 로열티율에 기술기여도 보정계수를 곱하여 산정합니다.

  적용 로열티율(R) = 업종 기준 로열티율 × (1 + 기술기여도 보정계수)

기술기여도 보정계수는 15개 평가항목(-2 ~ +2)의 합산 점수를 기반으로 산출됩니다.

[할인율 산정]
할인율은 가중평균자본비용(WACC)에 기술 고유의 위험프리미엄을 가산하여 산정합니다.

  할인율(r) = WACC + 위험프리미엄

  WACC = Ke × E/(E+D) + Kd × (1-τ) × D/(E+D)

여기서,
  Ke : 자기자본비용 (Cost of Equity)
  Kd : 타인자본비용 (Cost of Debt)
  E  : 자기자본 비율
  D  : 타인자본 비율
  τ  : 법인세율

위험프리미엄은 10개 위험 평가항목(1~5점)의 합산 점수에 따라 매핑 테이블을 통해 결정됩니다.`;
}

/**
 * 면책 조항 (Disclaimer) 템플릿
 * @param {Object} params
 * @param {string} params.companyName - 기업명
 * @param {string} params.evaluationDate - 평가기준일
 * @returns {string}
 */
export function DISCLAIMER_TEXT({ companyName, evaluationDate }) {
  return `면책 조항 (Disclaimer)

1. 본 보고서는 ${evaluationDate} 기준으로 작성되었으며, 평가기준일 이후의 상황 변화는 반영되어 있지 않습니다.

2. 본 평가 결과는 평가 목적에 한하여 참고자료로 활용될 수 있으며, 평가 목적 이외의 용도로 사용될 경우 그 적정성이 보장되지 않습니다.

3. 본 보고서에 포함된 미래 예측(매출 전망, 시장 전망 등)은 ${companyName} 및 공개 자료에 기반한 추정치이며, 실제 결과는 예측과 상이할 수 있습니다.

4. 본 평가에 사용된 정보 및 자료는 ${companyName}으로부터 제공받았거나 공개된 자료에 기반한 것으로, 해당 정보의 정확성과 완전성에 대한 독립적인 검증은 수행하지 않았습니다.

5. 본 보고서의 내용은 전체로서 의미를 가지며, 보고서의 일부만을 발췌하여 사용할 경우 내용이 왜곡될 수 있습니다.

6. 본 평가 결과는 특정 거래의 가격을 제시하거나 보증하는 것이 아니며, 실제 거래 가격은 거래 당사자 간의 협상에 의해 결정됩니다.

7. 평가자는 본 보고서의 사용으로 인해 발생하는 어떠한 직접적, 간접적 손해에 대해서도 책임을 지지 않습니다.

8. 본 보고서는 저작권법의 보호를 받으며, 평가 의뢰인의 사전 동의 없이 제3자에게 제공하거나 공개할 수 없습니다.`;
}
