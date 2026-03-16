import React from 'react';
import useValuationStore from '../../stores/useValuationStore';
import useUIStore from '../../stores/useUIStore';
import FormSection from '../common/FormSection';
import RichTextEditor from '../common/RichTextEditor';
import NumberInput from '../common/NumberInput';
import DynamicTable from '../common/DynamicTable';
import { generateSectionText } from '../../services/geminiService';

export default function Step4MarketAnalysis() {
  const { marketAnalysis, updateField, updateNestedField } = useValuationStore();
  const { isGeneratingText, setGeneratingText } = useUIStore();

  const handleAIGenerate = async (section) => {
    setGeneratingText(true);
    try {
      const text = await generateSectionText(section, { marketAnalysis });
      if (text) updateField('marketAnalysis', section, text);
    } catch(e) { console.error('AI 생성 실패:', e); }
    finally { setGeneratingText(false); }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Step 4. 시장성 분석</h2>
        <p className="text-sm text-gray-500">목표시장의 정의, 규모, 동향, 경쟁 구도를 분석합니다.</p>
      </div>

      {/* 1. 시장 정의 */}
      <FormSection title="1. 시장 정의" description="평가대상 제품이 속하는 시장, 제품 특징, KSIC 코드">
        <div className="mb-4">
          <label className="label">KSIC 산업분류 코드</label>
          <input type="text" value={marketAnalysis.ksicCode} onChange={(e) => updateField('marketAnalysis', 'ksicCode', e.target.value)} className="input-field w-48" placeholder="예: C20" />
        </div>
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('marketDefinition')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 텍스트 생성'}
          </button>
        </div>
        <RichTextEditor content={marketAnalysis.marketDefinition} onChange={(html) => updateField('marketAnalysis', 'marketDefinition', html)} placeholder="시장 정의, 주요 제조사/제품 현황, 접근 방식, 차별화 포인트..." />
        <div className="mt-4">
          <label className="label">제품 특징 설명</label>
          <RichTextEditor content={marketAnalysis.productFeatures} onChange={(html) => updateField('marketAnalysis', 'productFeatures', html)} placeholder="기술적 특징 3~4가지, 단계별 사업모델..." minHeight="120px" />
        </div>
      </FormSection>

      {/* 2. 시장 동향 */}
      <FormSection title="2. 시장 동향">
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('marketTrend')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 텍스트 생성'}
          </button>
        </div>
        <RichTextEditor content={marketAnalysis.marketTrend} onChange={(html) => updateField('marketAnalysis', 'marketTrend', html)} placeholder="시장 성장 동인, 공급망 현황, 정부 정책, 국내 시장 구조적 특성..." />
      </FormSection>

      {/* 3. 산업분류 및 전후방산업 */}
      <FormSection title="3. 산업분류 및 전후방산업">
        <RichTextEditor content={marketAnalysis.industryStructure} onChange={(html) => updateField('marketAnalysis', 'industryStructure', html)} placeholder="산업구조도, 전후방산업, 가치사슬 분석, 원료 공급/수요처 분석..." />
      </FormSection>

      {/* 4. PEST 분석 */}
      <FormSection title="4. 시장환경분석 (PEST)">
        <div className="grid grid-cols-1 gap-4">
          {[
            { key: 'political', label: 'Political/Policy (정책·규제)', color: 'bg-red-50 border-red-200' },
            { key: 'social', label: 'Social (사회·수요 트렌드)', color: 'bg-green-50 border-green-200' },
            { key: 'economic', label: 'Economic (경제·원가·수급)', color: 'bg-yellow-50 border-yellow-200' },
            { key: 'technological', label: 'Technological (기술·대체)', color: 'bg-blue-50 border-blue-200' },
          ].map(item => (
            <div key={item.key} className={`p-4 rounded-lg border ${item.color}`}>
              <label className="subsection-title">{item.label}</label>
              <RichTextEditor
                content={marketAnalysis.pest[item.key]}
                onChange={(html) => updateNestedField('marketAnalysis', `pest.${item.key}`, html)}
                placeholder={`${item.label} 관련 3~5개 요인을 서술하세요...`}
                minHeight="120px"
              />
            </div>
          ))}
        </div>
      </FormSection>

      {/* 5. 시장규모 */}
      <FormSection title="5. 목표시장규모 현황 및 전망">
        <div className="space-y-4">
          <h4 className="subsection-title">글로벌 시장</h4>
          <div className="grid grid-cols-3 gap-4">
            <NumberInput label="현재 시장규모" value={marketAnalysis.globalMarket.currentSize} onChange={(v) => updateNestedField('marketAnalysis', 'globalMarket.currentSize', v)} />
            <NumberInput label="전망 시장규모" value={marketAnalysis.globalMarket.projectedSize} onChange={(v) => updateNestedField('marketAnalysis', 'globalMarket.projectedSize', v)} />
            <NumberInput label="CAGR" value={marketAnalysis.globalMarket.cagr} onChange={(v) => updateNestedField('marketAnalysis', 'globalMarket.cagr', v)} unit="%" step={0.1} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">기준년도</label>
              <input type="text" value={marketAnalysis.globalMarket.year} onChange={(e) => updateNestedField('marketAnalysis', 'globalMarket.year', e.target.value)} className="input-field" placeholder="2024" />
            </div>
            <div>
              <label className="label">전망년도</label>
              <input type="text" value={marketAnalysis.globalMarket.projectedYear} onChange={(e) => updateNestedField('marketAnalysis', 'globalMarket.projectedYear', e.target.value)} className="input-field" placeholder="2030" />
            </div>
            <div>
              <label className="label">출처</label>
              <input type="text" value={marketAnalysis.globalMarket.source} onChange={(e) => updateNestedField('marketAnalysis', 'globalMarket.source', e.target.value)} className="input-field" placeholder="Grand View Research 등" />
            </div>
          </div>

          <h4 className="subsection-title mt-6">국내 시장</h4>
          <div className="grid grid-cols-3 gap-4">
            <NumberInput label="현재 시장규모" value={marketAnalysis.domesticMarket.currentSize} onChange={(v) => updateNestedField('marketAnalysis', 'domesticMarket.currentSize', v)} />
            <NumberInput label="전망 시장규모" value={marketAnalysis.domesticMarket.projectedSize} onChange={(v) => updateNestedField('marketAnalysis', 'domesticMarket.projectedSize', v)} />
            <NumberInput label="CAGR" value={marketAnalysis.domesticMarket.cagr} onChange={(v) => updateNestedField('marketAnalysis', 'domesticMarket.cagr', v)} unit="%" step={0.1} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">기준년도</label>
              <input type="text" value={marketAnalysis.domesticMarket.year} onChange={(e) => updateNestedField('marketAnalysis', 'domesticMarket.year', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">전망년도</label>
              <input type="text" value={marketAnalysis.domesticMarket.projectedYear} onChange={(e) => updateNestedField('marketAnalysis', 'domesticMarket.projectedYear', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">출처</label>
              <input type="text" value={marketAnalysis.domesticMarket.source} onChange={(e) => updateNestedField('marketAnalysis', 'domesticMarket.source', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>
      </FormSection>

      {/* 6. 시장성 검토 의견 */}
      <FormSection title="6. 시장성 검토 의견">
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('marketOpinion')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 의견 생성'}
          </button>
        </div>
        <RichTextEditor content={marketAnalysis.marketOpinion} onChange={(html) => updateField('marketAnalysis', 'marketOpinion', html)} placeholder="수요 안정성, 성장 분야별 전망, 규제 환경, 원가 리스크, 경쟁 환경, 종합 평가..." />
      </FormSection>
    </div>
  );
}
