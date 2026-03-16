import React, { useMemo } from 'react';
import useValuationStore from '../../stores/useValuationStore';
import FormSection from '../common/FormSection';
import ScoringTable from '../common/ScoringTable';
import NumberInput from '../common/NumberInput';
import DynamicTable from '../common/DynamicTable';
import CalculationPreview from '../common/CalculationPreview';
import { TECH_LIFE_FACTORS, ADJUSTMENT_FACTORS, RISK_PREMIUM_FACTORS } from '../../constants/scoringTables';
import { INDUSTRY_ROYALTY_RATES } from '../../constants/industryData';
import { determineEconomicLife } from '../../engine/economicLife';
import { calculateEffectiveRoyaltyRate, calculateAdjustmentCoefficient } from '../../engine/royaltyRate';
import { calculateWACC } from '../../engine/discountRate';
import { calculateTechValue, formatNumber } from '../../engine/techValue';

const revenueColumns = [
  { key: 'year', label: '연도', type: 'text', placeholder: '2027', width: '80px' },
  { key: 'revenue', label: '매출액 (백만원)', type: 'number', placeholder: '0' },
  { key: 'startMonth', label: '시작월', type: 'number', placeholder: '1' },
  { key: 'endMonth', label: '종료월', type: 'number', placeholder: '12' },
];

const techWeightColumns = [
  { key: 'product', label: '사업화 제품', type: 'text', placeholder: '제품명' },
  { key: 'weightA', label: '비중(A)', type: 'number', placeholder: '0.5' },
  { key: 'techElement', label: '요소기술', type: 'text', placeholder: '핵심기술명' },
  { key: 'weightB', label: '비중(B)', type: 'number', placeholder: '0.8' },
  { key: 'isProtected', label: '보호여부', type: 'select', options: [{ value: true, label: 'O' }, { value: false, label: 'X' }] },
];

export default function Step6ValuationVariables() {
  const { valuationVariables, updateField, updateNestedField } = useValuationStore();
  const vv = valuationVariables;

  // 1. Economic Life Calculation
  const economicLifeResult = useMemo(() => {
    const scores = TECH_LIFE_FACTORS.map(f => vv.techLifeScores[f.key] || 3);
    return determineEconomicLife(vv.tctData, scores, vv.legalRemainingYears, vv.preparationPeriod);
  }, [vv.tctData, vv.techLifeScores, vv.legalRemainingYears, vv.preparationPeriod]);

  // 2. Royalty Rate Calculation
  const royaltyResult = useMemo(() => {
    const techWeight = vv.techWeightItems.reduce((sum, item) => {
      if (item.isProtected === true || item.isProtected === 'true') {
        return sum + (item.weightA || 0) * (item.weightB || 0);
      }
      return sum;
    }, 0);
    const effectiveTW = techWeight || vv.techWeight;

    return calculateEffectiveRoyaltyRate({
      baseRoyaltyRate: vv.baseRoyaltyRate,
      adjustmentScores: vv.adjustmentScores,
      techWeight: effectiveTW,
      pioneerRate: vv.pioneerRate,
    });
  }, [vv.baseRoyaltyRate, vv.adjustmentScores, vv.techWeight, vv.techWeightItems, vv.pioneerRate]);

  // 3. WACC Calculation
  const waccResult = useMemo(() => {
    return calculateWACC({
      capmRate: vv.capmRate,
      sizePremium: vv.sizePremium,
      riskPremiumScores: vv.riskPremiumScores,
      equityRatio: vv.equityRatio,
      debtCostRate: vv.debtCostRate,
      corporateTaxRate: vv.avgCorporateTaxRate,
    });
  }, [vv.capmRate, vv.sizePremium, vv.riskPremiumScores, vv.equityRatio, vv.debtCostRate, vv.avgCorporateTaxRate]);

  // 4. Tech Value Calculation
  const techValueResult = useMemo(() => {
    if (vv.revenueProjections.length === 0) return null;
    return calculateTechValue({
      revenueProjections: vv.revenueProjections,
      effectiveRoyaltyRate: royaltyResult.effectiveRate,
      wacc: waccResult.wacc,
      preparationPeriod: vv.preparationPeriod,
      cashFlowPeriod: economicLifeResult.cashFlowPeriod,
    });
  }, [vv.revenueProjections, royaltyResult.effectiveRate, waccResult.wacc, vv.preparationPeriod, economicLifeResult.cashFlowPeriod]);

  // Industry selection handler
  const handleIndustryChange = (code) => {
    updateField('valuationVariables', 'selectedIndustryCode', code);
    const industry = INDUSTRY_ROYALTY_RATES[code];
    if (industry) {
      updateField('valuationVariables', 'baseRoyaltyRate', industry.median / 100);
    }
  };

  const handleTechLifeScoreChange = (key, value) => {
    updateNestedField('valuationVariables', `techLifeScores.${key}`, value);
  };

  const handleAdjustmentScoreChange = (key, value) => {
    updateNestedField('valuationVariables', `adjustmentScores.${key}`, value);
  };

  const handleRiskScoreChange = (key, value) => {
    updateNestedField('valuationVariables', `riskPremiumScores.${key}`, value);
  };

  // Store calculation result
  React.useEffect(() => {
    if (techValueResult) {
      useValuationStore.getState().setCalculationResult({
        ...techValueResult,
        economicLife: economicLifeResult,
        royaltyRate: royaltyResult,
        wacc: waccResult,
      });
    }
  }, [techValueResult, economicLifeResult, royaltyResult, waccResult]);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Step 6. 기술가치 산정 변수</h2>
        <p className="text-sm text-gray-500">경제적 수명, 로열티율, 할인율 등 핵심 변수를 입력합니다.</p>
      </div>

      {/* 종합 계산 결과 미리보기 */}
      {techValueResult && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-blue-200 mb-1">기술가치 산정 결과 (실시간)</h3>
          <div className="text-3xl font-bold">{formatNumber(techValueResult.techValue)} 백만원</div>
          <div className="text-blue-200 text-sm mt-1">
            = {(techValueResult.techValue / 100).toFixed(1)}억원
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
            <div><div className="text-blue-300">경제적 수명</div><div className="font-bold">{economicLifeResult.finalEconomicLife}년</div></div>
            <div><div className="text-blue-300">적정 로열티율</div><div className="font-bold">{(royaltyResult.effectiveRate * 100).toFixed(2)}%</div></div>
            <div><div className="text-blue-300">할인율(WACC)</div><div className="font-bold">{(waccResult.wacc * 100).toFixed(2)}%</div></div>
            <div><div className="text-blue-300">현금흐름 기간</div><div className="font-bold">{economicLifeResult.cashFlowPeriod}년</div></div>
          </div>
        </div>
      )}

      {/* 2.2 경제적 수명 */}
      <FormSection title="2.2 기술의 경제적 수명" description="TCT 데이터와 기술수명 영향요인 점수를 기반으로 경제적 수명을 산정합니다.">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="subsection-title">TCT(Technology Cycle Time) 데이터</h4>
            <div className="grid grid-cols-3 gap-3">
              <NumberInput label="Q1 (년)" value={vv.tctData.q1} onChange={(v) => updateNestedField('valuationVariables', 'tctData.q1', v)} unit="년" step={0.5} />
              <NumberInput label="Q2 (중앙값)" value={vv.tctData.q2} onChange={(v) => updateNestedField('valuationVariables', 'tctData.q2', v)} unit="년" step={0.5} />
              <NumberInput label="Q3 (년)" value={vv.tctData.q3} onChange={(v) => updateNestedField('valuationVariables', 'tctData.q3', v)} unit="년" step={0.5} />
            </div>
            <div className="mt-4">
              <NumberInput label="법적 잔존기간" value={vv.legalRemainingYears} onChange={(v) => updateField('valuationVariables', 'legalRemainingYears', v)} unit="년" max={20} />
            </div>
            <div className="mt-4">
              <NumberInput label="사업화 준비기간" value={vv.preparationPeriod} onChange={(v) => updateField('valuationVariables', 'preparationPeriod', v)} unit="년" max={10} />
            </div>
          </div>
          <CalculationPreview
            title="경제적 수명 산정 결과"
            formula="획득값 = (Σ(가중치×점수) / 205) × 100"
            items={[
              { label: '획득값', value: `${economicLifeResult.acquisitionValue.toFixed(1)}점` },
              { label: 'TCT 기반 수명', value: `${economicLifeResult.rawEconomicLife}년` },
              { label: '법적 잔존기간', value: `${vv.legalRemainingYears}년` },
              { label: '최종 경제적 수명', value: `${economicLifeResult.finalEconomicLife}년`, isHighlight: true },
              { label: '현금흐름 추정기간', value: `${economicLifeResult.cashFlowPeriod}년 (준비 ${vv.preparationPeriod}년 + 수명 ${economicLifeResult.finalEconomicLife}년)`, isHighlight: true },
            ]}
          />
        </div>
        <div className="mt-6">
          <h4 className="subsection-title">기술수명 영향요인 평가 (10개 항목)</h4>
          <ScoringTable
            items={TECH_LIFE_FACTORS.map(f => ({
              key: f.key, label: f.label, weight: f.weight, category: f.category,
              criteria: f.criteria ? Object.fromEntries(f.criteria.map(c => [c.score, c.description])) : undefined,
            }))}
            values={vv.techLifeScores}
            onChange={handleTechLifeScoreChange}
            showWeights={true}
            showTotal={true}
          />
        </div>
      </FormSection>

      {/* 2.3 매출액 추정 */}
      <FormSection title="2.3 매출액 추정" description="경제적 수명기간 동안의 연도별 매출액을 입력합니다. (단위: 백만원)">
        <DynamicTable
          columns={revenueColumns}
          rows={vv.revenueProjections}
          onChange={(rows) => updateField('valuationVariables', 'revenueProjections', rows)}
          addLabel="+ 연도 추가"
        />
        <p className="text-xs text-gray-400 mt-2">* 초년도/최종년도의 시작월·종료월을 설정하면 월할 계산이 적용됩니다.</p>
      </FormSection>

      {/* 2.4 적정 로열티율 */}
      <FormSection title="2.4 적정 로열티율 산출">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="subsection-title">(1) 기준 로열티율 선정</h4>
            <div className="mb-3">
              <label className="label">업종 선택</label>
              <select value={vv.selectedIndustryCode} onChange={(e) => handleIndustryChange(e.target.value)} className="select-field">
                {Object.entries(INDUSTRY_ROYALTY_RATES).map(([code, data]) => (
                  <option key={code} value={code}>{data.name} ({code})</option>
                ))}
              </select>
            </div>
            {INDUSTRY_ROYALTY_RATES[vv.selectedIndustryCode] && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-gray-500">Q1</div><div className="font-bold">{INDUSTRY_ROYALTY_RATES[vv.selectedIndustryCode].Q1}%</div></div>
                  <div><div className="text-gray-500">중앙값</div><div className="font-bold text-blue-800">{INDUSTRY_ROYALTY_RATES[vv.selectedIndustryCode].median}%</div></div>
                  <div><div className="text-gray-500">Q3</div><div className="font-bold">{INDUSTRY_ROYALTY_RATES[vv.selectedIndustryCode].Q3}%</div></div>
                </div>
              </div>
            )}
            <div className="mt-3">
              <NumberInput label="기준 로열티율 (직접 입력 가능)" value={vv.baseRoyaltyRate * 100} onChange={(v) => updateField('valuationVariables', 'baseRoyaltyRate', v / 100)} unit="%" step={0.1} />
            </div>
          </div>
          <CalculationPreview
            title="적정 로열티율 산정 결과"
            formula="적정 로열티율 = 기준율 × 조정계수 × 기술비중 × 개척률"
            items={[
              { label: '기준 로열티율', value: `${(vv.baseRoyaltyRate * 100).toFixed(2)}%` },
              { label: '조정계수1', value: royaltyResult.adjustmentCoefficient.toFixed(4) },
              { label: '기술의 비중', value: royaltyResult.techWeight.toFixed(4) },
              { label: '개척률', value: `${(vv.pioneerRate * 100).toFixed(0)}%` },
              { label: '적정 로열티율', value: `${royaltyResult.effectiveRatePercent.toFixed(4)}%`, isHighlight: true },
            ]}
          />
        </div>

        {/* (2) 조정계수1 */}
        <h4 className="subsection-title">(2) 조정계수1 산출 (15개 항목, -2~+2점)</h4>
        <ScoringTable
          items={ADJUSTMENT_FACTORS.map(f => ({
            key: f.key, label: f.label, category: f.category,
            scaleMin: -2, scaleMax: 2,
            criteria: f.criteria,
          }))}
          values={vv.adjustmentScores}
          onChange={handleAdjustmentScoreChange}
          showTotal={true}
        />

        {/* (3) 기술의 비중 */}
        <h4 className="subsection-title mt-6">(3) 기술의 비중(이용률)</h4>
        <DynamicTable
          columns={techWeightColumns}
          rows={vv.techWeightItems}
          onChange={(rows) => updateField('valuationVariables', 'techWeightItems', rows)}
          addLabel="+ 요소기술 추가"
          minRows={1}
        />
        <div className="mt-3 grid grid-cols-2 gap-4">
          <NumberInput label="기술의 비중 (직접 입력)" value={vv.techWeight} onChange={(v) => updateField('valuationVariables', 'techWeight', v)} unit="" step={0.01} max={1} />
          <NumberInput label="(4) 개척률" value={vv.pioneerRate * 100} onChange={(v) => updateField('valuationVariables', 'pioneerRate', v / 100)} unit="%" step={5} min={50} max={100} />
        </div>
      </FormSection>

      {/* 2.6 할인율 */}
      <FormSection title="2.6 할인율(WACC) 추정">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h4 className="subsection-title">(1) WACC 구성 요소</h4>
            <NumberInput label="CAPM (상장/비상장)" value={vv.capmRate * 100} onChange={(v) => updateField('valuationVariables', 'capmRate', v / 100)} unit="%" step={0.1} />
            <NumberInput label="규모 위험프리미엄" value={vv.sizePremium * 100} onChange={(v) => updateField('valuationVariables', 'sizePremium', v / 100)} unit="%" step={0.1} />
            <NumberInput label="자기자본비율" value={vv.equityRatio * 100} onChange={(v) => updateField('valuationVariables', 'equityRatio', v / 100)} unit="%" step={1} />
            <NumberInput label="세전 타인자본비용" value={vv.debtCostRate * 100} onChange={(v) => updateField('valuationVariables', 'debtCostRate', v / 100)} unit="%" step={0.1} />
            <NumberInput label="평균 법인세율" value={vv.avgCorporateTaxRate * 100} onChange={(v) => updateField('valuationVariables', 'avgCorporateTaxRate', v / 100)} unit="%" step={0.1} />
          </div>
          <CalculationPreview
            title="WACC 산정 결과"
            formula="WACC = Ke×We + Kd×Wd×(1-t)"
            items={[
              { label: 'CAPM+규모P', value: `${((vv.capmRate + vv.sizePremium) * 100).toFixed(2)}%` },
              { label: '기술사업화 위험P', value: `${waccResult.riskPremiumPercent.toFixed(2)}%` },
              { label: '자기자본비용(Ke)', value: `${(waccResult.equityCost * 100).toFixed(2)}%` },
              { label: '세후 타인자본비용', value: `${(waccResult.afterTaxDebtCost * 100).toFixed(2)}%` },
              { label: 'WACC', value: `${waccResult.waccPercent.toFixed(2)}%`, isHighlight: true },
            ]}
          />
        </div>

        <h4 className="subsection-title">(2) 기술사업화 위험프리미엄 (10개 항목)</h4>
        <ScoringTable
          items={RISK_PREMIUM_FACTORS.map(f => ({
            key: f.key, label: f.label, category: f.category,
            criteria: f.criteria ? Object.fromEntries(f.criteria.map(c => [c.score, c.description])) : undefined,
          }))}
          values={vv.riskPremiumScores}
          onChange={handleRiskScoreChange}
          showTotal={true}
        />
      </FormSection>
    </div>
  );
}
