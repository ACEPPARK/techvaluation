import React from 'react';
import useValuationStore from '../../stores/useValuationStore';
import useUIStore from '../../stores/useUIStore';
import FormSection from '../common/FormSection';
import RichTextEditor from '../common/RichTextEditor';
import DynamicTable from '../common/DynamicTable';
import { generateSectionText } from '../../services/geminiService';

const COUNTRIES = ['한국', '일본', '미국', 'EP', 'PCT', '중국'];

const priorArtColumns = [
  { key: 'publicationNumber', label: '공개번호(등록번호)', type: 'text', placeholder: '10-2020-0012345' },
  { key: 'applicant', label: '특허권자(출원인)', type: 'text' },
  { key: 'title', label: '발명의 명칭', type: 'text' },
  { key: 'status', label: '권리상태', type: 'select', options: ['등록', '공개', '소멸', '취하'] },
  { key: 'relevance', label: '관련도', type: 'select', options: ['X', 'Y', 'A'] },
];

const comparisonColumns = [
  { key: 'patentNumber', label: '선행특허 번호', type: 'text' },
  { key: 'similarities', label: '유사점', type: 'textarea', placeholder: '유사한 기술적 특징...' },
  { key: 'differences', label: '차이점', type: 'textarea', placeholder: '차별화되는 기술적 특징...' },
  { key: 'conclusion', label: '결론', type: 'select', options: ['무효 가능성 낮음', '무효 가능성 보통', '무효 가능성 높음'] },
];

export default function Step3RightsAnalysis() {
  const { rightsAnalysis, updateField, updateNestedField, basicInfo } = useValuationStore();
  const { isGeneratingText, setGeneratingText, geminiApiKey } = useUIStore();

  const handleCountryToggle = (country) => {
    const current = rightsAnalysis.priorArt.countries || [];
    const updated = current.includes(country)
      ? current.filter(c => c !== country)
      : [...current, country];
    updateNestedField('rightsAnalysis', 'priorArt.countries', updated);
  };

  const handleAIGenerate = async (section) => {
    if (!geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
      alert('Gemini API 키를 먼저 입력해주세요. (상단 헤더의 "API 키" 버튼)');
      return;
    }
    setGeneratingText(true);
    try {
      const text = await generateSectionText(section, { rightsAnalysis, basicInfo }, geminiApiKey);
      if (text) updateField('rightsAnalysis', section, text);
    } catch(e) {
      console.error('AI 생성 실패:', e);
      alert('AI 텍스트 생성 실패: ' + e.message);
    } finally { setGeneratingText(false); }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Step 3. 권리성 분석</h2>
        <p className="text-sm text-gray-500">특허의 권리 안정성, 권리범위, 침해 용이성 등을 분석합니다.</p>
      </div>

      {/* 1. 선행기술조사 기본 */}
      <FormSection title="1. 선행기술조사 조건">
        <div className="mb-4">
          <label className="label">조사대상 국가</label>
          <div className="flex gap-2 flex-wrap">
            {COUNTRIES.map(c => (
              <button key={c}
                onClick={() => handleCountryToggle(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  (rightsAnalysis.priorArt.countries || []).includes(c) ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">조사대상 기간</label>
            <input type="text" value={rightsAnalysis.priorArt.period} onChange={(e) => updateNestedField('rightsAnalysis', 'priorArt.period', e.target.value)} className="input-field" placeholder="최근 20년" />
          </div>
          <div>
            <label className="label">관련 IPC 코드</label>
            <input type="text" value={rightsAnalysis.priorArt.ipcCodes} onChange={(e) => updateNestedField('rightsAnalysis', 'priorArt.ipcCodes', e.target.value)} className="input-field" placeholder="C08L, C08J..." />
          </div>
          <div>
            <label className="label">검색 키워드</label>
            <input type="text" value={rightsAnalysis.priorArt.keywords} onChange={(e) => updateNestedField('rightsAnalysis', 'priorArt.keywords', e.target.value)} className="input-field" placeholder="핵심 키워드..." />
          </div>
          <div>
            <label className="label">검색식</label>
            <input type="text" value={rightsAnalysis.priorArt.searchFormula} onChange={(e) => updateNestedField('rightsAnalysis', 'priorArt.searchFormula', e.target.value)} className="input-field" placeholder="(키워드1 AND 키워드2) OR ..." />
          </div>
        </div>
      </FormSection>

      {/* 2. 검색결과 */}
      <FormSection title="2. 선행기술 검색결과" description="발견된 선행기술 목록을 입력합니다.">
        <DynamicTable
          columns={priorArtColumns}
          rows={rightsAnalysis.priorArtResults}
          onChange={(rows) => updateField('rightsAnalysis', 'priorArtResults', rows)}
          addLabel="+ 선행기술 추가"
        />
      </FormSection>

      {/* 3. 선행기술 비교 분석 */}
      <FormSection title="3. 선행기술 비교 분석" description="각 선행기술과의 유사점/차이점을 분석합니다.">
        <DynamicTable
          columns={comparisonColumns}
          rows={rightsAnalysis.priorArtComparisons}
          onChange={(rows) => updateField('rightsAnalysis', 'priorArtComparisons', rows)}
          addLabel="+ 비교 분석 추가"
        />
      </FormSection>

      {/* 4. 권리 안정성 */}
      <FormSection title="4. 권리 안정성 종합 분석">
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('stabilityAnalysis')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 분석 생성'}
          </button>
        </div>
        <RichTextEditor
          content={rightsAnalysis.stabilityAnalysis}
          onChange={(html) => updateField('rightsAnalysis', 'stabilityAnalysis', html)}
          placeholder="실질적 동일성 검토 결과, 진보성 인정 여부, 최종 결론..."
        />
      </FormSection>

      {/* 5. 권리보호강도 */}
      <FormSection title="5. 권리보호강도">
        <RichTextEditor
          content={rightsAnalysis.protectionStrength}
          onChange={(html) => updateField('rightsAnalysis', 'protectionStrength', html)}
          placeholder="대표 청구항의 구성요소 분석, 핵심 기술적 특징, 권리범위의 적절성..."
          minHeight="150px"
        />
      </FormSection>

      {/* 6. 침해발견 및 입증 용이성 */}
      <FormSection title="6. 침해발견 및 침해입증 용이성">
        <RichTextEditor
          content={rightsAnalysis.infringementDetection}
          onChange={(html) => updateField('rightsAnalysis', 'infringementDetection', html)}
          placeholder="발명 카테고리 분석, 침해 발견 용이성, 침해 입증 비용/노력..."
          minHeight="150px"
        />
      </FormSection>

      {/* 7. 사업 연관성 */}
      <FormSection title="7. 사업 연관성 및 제품적용여부">
        <RichTextEditor
          content={rightsAnalysis.businessRelevance}
          onChange={(html) => updateField('rightsAnalysis', 'businessRelevance', html)}
          placeholder="사업 방향과 특허 기술의 연관성, 비용 절감 기여도, 사업화 추진 기여..."
          minHeight="150px"
        />
      </FormSection>
    </div>
  );
}
