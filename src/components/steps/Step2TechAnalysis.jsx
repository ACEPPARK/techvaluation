import React from 'react';
import useValuationStore from '../../stores/useValuationStore';
import useUIStore from '../../stores/useUIStore';
import FormSection from '../common/FormSection';
import RichTextEditor from '../common/RichTextEditor';
import DynamicTable from '../common/DynamicTable';
import { generateSectionText } from '../../services/geminiService';

const competitorColumns = [
  { key: 'name', label: '기업명', type: 'text', placeholder: 'Company A' },
  { key: 'country', label: '국가', type: 'text', placeholder: '미국' },
  { key: 'field', label: '주력분야', type: 'text', placeholder: '주력 제품/기술' },
  { key: 'features', label: '특징', type: 'text', placeholder: '핵심 경쟁력' },
];

export default function Step2TechAnalysis() {
  const { techAnalysis, updateField, updateNestedField, addArrayItem, removeArrayItem, updateArrayItem, setGeneratedText, generatedTexts } = useValuationStore();
  const { isGeneratingText, setGeneratingText, geminiApiKey } = useUIStore();

  const handleAIGenerate = async (section, prompt) => {
    if (!geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
      alert('Gemini API 키를 먼저 입력해주세요. (상단 헤더의 "API 키" 버튼)');
      return;
    }
    setGeneratingText(true);
    try {
      const text = await generateSectionText(section, { techAnalysis, prompt }, geminiApiKey);
      if (text) {
        updateField('techAnalysis', section, text);
      }
    } catch (e) {
      console.error('AI 생성 실패:', e);
      alert('AI 텍스트 생성 실패: ' + e.message);
    } finally {
      setGeneratingText(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Step 2. 기술성 분석</h2>
        <p className="text-sm text-gray-500">평가대상 기술의 개요, 혁신성, 경쟁력 등을 분석합니다.</p>
      </div>

      {/* 1. 기술 개요 */}
      <FormSection title="1. 기술 개요" description="기술의 정의, 활용분야, 핵심 성능 지표 등을 서술합니다.">
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('overview', '기술 개요')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 텍스트 생성'}
          </button>
        </div>
        <RichTextEditor
          content={techAnalysis.overview}
          onChange={(html) => updateField('techAnalysis', 'overview', html)}
          placeholder="기술의 정의, 활용분야, 핵심 성능 지표, 기존 기술 대비 장점 등을 서술하세요..."
        />
      </FormSection>

      {/* 2. 핵심기술 구성 */}
      <FormSection title="2. 기술 구성 및 핵심기술" description="핵심 기술 요소별 상세 설명, 공정도 등">
        <RichTextEditor
          content={techAnalysis.coretech}
          onChange={(html) => updateField('techAnalysis', 'coretech', html)}
          placeholder="핵심 기술 요소, 개발 배경, 공정도, 각 특허별 기여 등을 서술하세요..."
        />
      </FormSection>

      {/* 3. 기술환경분석 */}
      <FormSection title="3. 기술동향" description="해당 기술분야의 글로벌/국내 기술동향을 서술합니다.">
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('techTrend', '기술동향')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 텍스트 생성'}
          </button>
        </div>
        <RichTextEditor
          content={techAnalysis.techTrend}
          onChange={(html) => updateField('techAnalysis', 'techTrend', html)}
          placeholder="글로벌 기술동향, 공정기술 동향, 국내 R&D 현황 등을 서술하세요..."
        />
      </FormSection>

      {/* 4. 국내외 기업 현황 */}
      <FormSection title="4. 국내외 기업 현황" description="관련 기업들의 현황을 입력합니다.">
        <DynamicTable
          columns={competitorColumns}
          rows={techAnalysis.competitors}
          onChange={(rows) => updateField('techAnalysis', 'competitors', rows)}
          addLabel="+ 기업 추가"
          minRows={0}
        />
      </FormSection>

      {/* 5. 기술의 유용성 분석 */}
      <FormSection title="5. 혁신성 및 활용성" description="기존 기술 대비 혁신적 접근법, 활용성 평가">
        <RichTextEditor
          content={techAnalysis.innovation}
          onChange={(html) => updateField('techAnalysis', 'innovation', html)}
          placeholder="기존 기술 대비 혁신성, 특허 포트폴리오의 커버리지, 핵심 물성 달성 여부 등..."
        />
      </FormSection>

      {/* 6. 파급성 */}
      <FormSection title="6. 파급성" description="범용 시장에서의 파급 효과 및 고부가가치 세그먼트 확장 가능성">
        <RichTextEditor
          content={techAnalysis.rippleEffect}
          onChange={(html) => updateField('techAnalysis', 'rippleEffect', html)}
          placeholder="범용 시장 파급 효과, 고부가가치 확장 가능성, 파급 속도 영향 요인 등..."
        />
      </FormSection>

      {/* 7. 기술사업화환경 */}
      <FormSection title="7. 기술사업화환경" description="시장 수요 트렌드, 정부 정책 부합도, 사업화 준비 상태 등">
        <RichTextEditor
          content={techAnalysis.commercializationEnv}
          onChange={(html) => updateField('techAnalysis', 'commercializationEnv', html)}
          placeholder="시장 수요 부합, 정부 정책 부합, 사업화 준비 상태, 초기 리스크 등..."
        />
      </FormSection>

      {/* 8. 기술의 경쟁성 분석 */}
      <FormSection title="8. 기술의 경쟁성 분석" description="기술경쟁강도, 우월성, 차별성, 대체가능성, 모방난이도, 진부화가능성">
        <div className="space-y-4">
          {[
            { key: 'intensity', label: '4.1 기술경쟁강도', placeholder: '경쟁기술의 수와 경쟁 정도, 대상기술의 경쟁 우위 분석...' },
            { key: 'superiority', label: '4.2 우월성 및 차별성', placeholder: '기존 기술 대비 구체적 성능 비교, 원가/공정/성능 차별성...' },
            { key: 'substitutability', label: '4.3 대체가능성', placeholder: '대체기술 존재 여부 및 대체 가능성, 대체기술의 한계점...' },
            { key: 'imitationDifficulty', label: '4.4 모방난이도', placeholder: '기술 복제의 어려움, 필요 노하우/설비/시간...' },
            { key: 'obsolescence', label: '4.5 진부화가능성', placeholder: '기술 분야 성숙도, 향후 기술 대체 위험, 가치 유지 전망...' },
          ].map(item => (
            <div key={item.key}>
              <label className="subsection-title">{item.label}</label>
              <RichTextEditor
                content={techAnalysis.competitiveness[item.key]}
                onChange={(html) => updateNestedField('techAnalysis', `competitiveness.${item.key}`, html)}
                placeholder={item.placeholder}
                minHeight="120px"
              />
            </div>
          ))}
        </div>
      </FormSection>
    </div>
  );
}
