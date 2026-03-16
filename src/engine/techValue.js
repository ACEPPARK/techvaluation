/**
 * 기술가치 산출 - 로열티공제법 모델 I
 * 기술가치 = Σ[매출액t × 적정로열티율 × (1-세율)] / (1+r)^t
 * (적정로열티율 = 기준로열티율 × 조정계수 × 기술비중 × 개척률)
 */

import { calculateProgressiveTax } from './progressiveTax.js';

export function calculateTechValue({
  revenueProjections,   // array of { year, revenue (백만원), startMonth?, endMonth? }
  effectiveRoyaltyRate, // decimal (e.g., 0.025)
  wacc,                 // decimal (e.g., 0.15)
  preparationPeriod,    // years (사업화 준비기간)
  cashFlowPeriod,       // total years
}) {
  const yearlyDetails = [];
  let totalPresentValue = 0;
  
  for (let t = 1; t <= cashFlowPeriod; t++) {
    const year = t;
    let revenue = 0;
    let monthRatio = 1.0;
    
    if (t <= preparationPeriod) {
      // 사업화 준비기간: 매출 없음
      revenue = 0;
    } else {
      const revenueIndex = t - preparationPeriod - 1;
      if (revenueIndex < revenueProjections.length) {
        const proj = revenueProjections[revenueIndex];
        revenue = proj.revenue || 0;
        
        // 월할 계산 (초년도/최종년도)
        const startMonth = proj.startMonth || 1;
        const endMonth = proj.endMonth || 12;
        monthRatio = (endMonth - startMonth + 1) / 12;
        revenue = revenue * monthRatio;
      }
    }
    
    // 로열티 수입 (세전)
    const grossRoyalty = revenue * effectiveRoyaltyRate;
    
    // 법인세 (누진세율 적용)
    const { tax: corporateTax, effectiveRate: effectiveTaxRate } = calculateProgressiveTax(grossRoyalty);
    
    // 세후 로열티 수입
    const afterTaxRoyalty = grossRoyalty - corporateTax;
    
    // 현가계수
    const discountFactor = 1 / Math.pow(1 + wacc, t);
    
    // 현재가치
    const presentValue = afterTaxRoyalty * discountFactor;
    
    totalPresentValue += presentValue;
    
    yearlyDetails.push({
      year: t,
      revenue: Math.round(revenue * 100) / 100,
      monthRatio,
      grossRoyalty: Math.round(grossRoyalty * 100) / 100,
      corporateTax: Math.round(corporateTax * 100) / 100,
      effectiveTaxRate,
      afterTaxRoyalty: Math.round(afterTaxRoyalty * 100) / 100,
      discountFactor: Math.round(discountFactor * 10000) / 10000,
      presentValue: Math.round(presentValue * 100) / 100,
    });
  }
  
  return {
    techValue: Math.round(totalPresentValue * 100) / 100,
    yearlyDetails,
    effectiveRoyaltyRate,
    wacc,
    cashFlowPeriod,
  };
}

// 특허별 가치 배분
export function allocatePatentValues(totalValue, patents) {
  // patents: array of { id, name, weight }
  const totalWeight = patents.reduce((sum, p) => sum + (p.weight || 0), 0);
  if (totalWeight === 0) return patents.map(p => ({ ...p, value: 0 }));
  
  return patents.map(p => ({
    ...p,
    value: Math.round((totalValue * (p.weight || 0) / totalWeight) * 100) / 100,
    ratio: ((p.weight || 0) / totalWeight) * 100,
  }));
}

// 금액 포맷팅 (백만원)
export function formatCurrency(millions) {
  if (millions >= 1000) {
    return `${(millions / 1000).toFixed(1)}십억원`;
  }
  if (millions >= 100) {
    return `${(millions / 100).toFixed(1)}억원`;
  }
  return `${millions.toFixed(0)}백만원`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(num));
}
