import React from 'react';
import useValuationStore from '../../stores/useValuationStore';
import useUIStore from '../../stores/useUIStore';
import FormSection from '../common/FormSection';
import RichTextEditor from '../common/RichTextEditor';
import DynamicTable from '../common/DynamicTable';
import { generateSectionText } from '../../services/geminiService';

const historyColumns = [
  { key: 'year', label: '연도', type: 'text', placeholder: '2020', width: '80px' },
  { key: 'event', label: '주요 연혁', type: 'text', placeholder: '회사 설립 / 기술 개발 착수 등' },
];

const revenuePlanColumns = [
  { key: 'year', label: '연도', type: 'text', placeholder: '2026', width: '80px' },
  { key: 'target', label: '매출 목표 (백만원)', type: 'number', placeholder: '0' },
];

export default function Step5BusinessAnalysis() {
  const { businessAnalysis, updateField, updateNestedField } = useValuationStore();
  const { isGeneratingText, setGeneratingText, geminiApiKey } = useUIStore();

  const handleCompanyInfoChange = (field, value) => {
    updateNestedField('businessAnalysis', `companyInfo.${field}`, value);
  };

  const handleAIGenerate = async (section) => {
    if (!geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
      alert('Gemini API 키를 먼저 입력해주세요. (상단 헤더의 "API 키" 버튼)');
      return;
    }
    setGeneratingText(true);
    try {
      const text = await generateSectionText(section, { businessAnalysis }, geminiApiKey);
      if (text) updateField('businessAnalysis', section, text);
    } catch(e) {
      console.error('AI 생성 실패:', e);
      alert('AI 텍스트 생성 실패: ' + e.message);
    } finally { setGeneratingText(false); }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Step 5. 사업성 분석</h2>
        <p className="text-sm text-gray-500">사업화주체의 역량, 사업 계획, 경쟁력을 분석합니다.</p>
      </div>

      {/* 1. 사업화주체 개요 */}
      <FormSection title="1. 사업화주체의 개요">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">기업체명</label>
            <input type="text" value={businessAnalysis.companyInfo.name} onChange={(e) => handleCompanyInfoChange('name', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">기업규모(형태)</label>
            <select value={businessAnalysis.companyInfo.size} onChange={(e) => handleCompanyInfoChange('size', e.target.value)} className="select-field">
              <option value="대기업">대기업</option>
              <option value="중견기업">중견기업</option>
              <option value="중소기업">중소기업</option>
              <option value="창업기업">창업기업(SPC)</option>
            </select>
          </div>
          <div>
            <label className="label">설립일</label>
            <input type="date" value={businessAnalysis.companyInfo.established} onChange={(e) => handleCompanyInfoChange('established', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">대표자</label>
            <input type="text" value={businessAnalysis.companyInfo.representative} onChange={(e) => handleCompanyInfoChange('representative', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">업종(KSIC)</label>
            <input type="text" value={businessAnalysis.companyInfo.industry} onChange={(e) => handleCompanyInfoChange('industry', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">소재지</label>
            <input type="text" value={businessAnalysis.companyInfo.address} onChange={(e) => handleCompanyInfoChange('address', e.target.value)} className="input-field" />
          </div>
        </div>
        <RichTextEditor content={businessAnalysis.companyOverview} onChange={(html) => updateField('businessAnalysis', 'companyOverview', html)} placeholder="사업화주체 설명 (SPC인 경우 모기업 정보 대리 활용)..." minHeight="120px" />
      </FormSection>

      {/* 주요 연혁 */}
      <FormSection title="주요 연혁">
        <DynamicTable columns={historyColumns} rows={businessAnalysis.history} onChange={(rows) => updateField('businessAnalysis', 'history', rows)} addLabel="+ 연혁 추가" />
      </FormSection>

      {/* 2. 사업화 역량 */}
      <FormSection title="2. 사업화 역량" description="인력/조직, 거래처, IP 보유, 제조/운영, 재무 역량 등">
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('capabilities')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 텍스트 생성'}
          </button>
        </div>
        <RichTextEditor content={businessAnalysis.capabilities} onChange={(html) => updateField('businessAnalysis', 'capabilities', html)} placeholder="인력/조직 역량, 거래처 현황, IP 보유 현황, 재무 역량, 추가 인프라 필요사항..." />
      </FormSection>

      {/* 3. 세부 사업 계획 */}
      <FormSection title="3. 세부 사업 계획">
        <RichTextEditor content={businessAnalysis.businessPlan} onChange={(html) => updateField('businessAnalysis', 'businessPlan', html)} placeholder="사업화 전략, 단계별 추진 계획 (1단계: 범용, 2단계: 프리미엄 등)..." />
        <div className="mt-4">
          <label className="subsection-title">사업 매출 목표</label>
          <DynamicTable columns={revenuePlanColumns} rows={businessAnalysis.revenuePlan} onChange={(rows) => updateField('businessAnalysis', 'revenuePlan', rows)} addLabel="+ 연도 추가" />
        </div>
      </FormSection>

      {/* 4. IP 확보 현황 */}
      <FormSection title="4. 지식재산(IP) 확보 현황">
        <RichTextEditor content={businessAnalysis.ipStatus} onChange={(html) => updateField('businessAnalysis', 'ipStatus', html)} placeholder="등록/출원 특허 목록, 기술 분야별 IP 현황..." minHeight="120px" />
      </FormSection>

      {/* 5. 사업성 검토의견 */}
      <FormSection title="5. 사업성 검토의견">
        <div className="flex justify-end mb-2">
          <button onClick={() => handleAIGenerate('opinion')} disabled={isGeneratingText} className="btn-ai">
            {isGeneratingText ? '생성 중...' : '✨ AI로 의견 생성'}
          </button>
        </div>
        <RichTextEditor content={businessAnalysis.opinion} onChange={(html) => updateField('businessAnalysis', 'opinion', html)} placeholder="사업화주체 구조, 매출 계획, 원가 우위, IP 현황, 시장 수요, 리스크, 종합 결론..." />
      </FormSection>
    </div>
  );
}
