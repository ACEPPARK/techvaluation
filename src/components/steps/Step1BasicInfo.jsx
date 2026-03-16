import React from 'react';
import useValuationStore from '../../stores/useValuationStore';
import FormSection from '../common/FormSection';
import DynamicTable from '../common/DynamicTable';

const PURPOSE_OPTIONS = [
  '기술이전용', '기술거래용', '담보대출용', '투자유치용', '현물출자용', '소송/분쟁용', '기타'
];

const patentColumns = [
  { key: 'title', label: '발명의 명칭', type: 'text', placeholder: '특허명', width: '20%' },
  { key: 'registrationNumber', label: '등록번호', type: 'text', placeholder: '10-1234567' },
  { key: 'applicationNumber', label: '출원번호', type: 'text', placeholder: '10-2020-0012345' },
  { key: 'applicationDate', label: '출원일', type: 'date' },
  { key: 'registrationDate', label: '등록일', type: 'date' },
  { key: 'expiryDate', label: '존속기간만료일', type: 'date' },
  { key: 'holders', label: '특허권자', type: 'text' },
  { key: 'status', label: '법적상태', type: 'select', options: ['등록', '공개', '출원', '소멸'] },
];

const participantColumns = [
  { key: 'affiliation', label: '소속', type: 'text', placeholder: '기관명' },
  { key: 'position', label: '직위/자격', type: 'text', placeholder: '기술사/박사 등' },
  { key: 'name', label: '성명', type: 'text', placeholder: '홍길동' },
];

export default function Step1BasicInfo() {
  const {
    basicInfo,
    updateField,
    updateNestedField,
    updatePatent,
    addPatent,
    removePatent,
    addArrayItem,
    removeArrayItem,
    updateArrayItem,
  } = useValuationStore();

  const handleCompanyChange = (field, value) => {
    updateNestedField('basicInfo', `company.${field}`, value);
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Step 1. 기본 사항 입력</h2>
        <p className="text-sm text-gray-500">평가대상 특허, 기업 정보 및 평가 목적을 입력합니다.</p>
      </div>

      {/* 평가대상 특허 정보 */}
      <FormSection title="평가대상 특허 정보" description="평가 대상이 되는 특허를 등록합니다. 여러 건을 추가할 수 있습니다.">
        <DynamicTable
          columns={patentColumns}
          rows={basicInfo.patents}
          onChange={(rows) => updateField('basicInfo', 'patents', rows)}
          onAdd={addPatent}
          onRemove={(i) => removePatent(i)}
          addLabel="+ 특허 추가"
          minRows={1}
        />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="label">대표 IPC 코드</label>
            <input type="text" value={basicInfo.representativeIPC} onChange={(e) => updateField('basicInfo', 'representativeIPC', e.target.value)} className="input-field" placeholder="예: C08L 23/00" />
          </div>
          <div>
            <label className="label">목표시장</label>
            <input type="text" value={basicInfo.targetMarket} onChange={(e) => updateField('basicInfo', 'targetMarket', e.target.value)} className="input-field" placeholder="예: 바이오플라스틱 시장" />
          </div>
        </div>
      </FormSection>

      {/* 기업 정보 */}
      <FormSection title="평가 의뢰 기업 정보">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">기업명</label>
            <input type="text" value={basicInfo.company.name} onChange={(e) => handleCompanyChange('name', e.target.value)} className="input-field" placeholder="(주)OO기술" />
          </div>
          <div>
            <label className="label">대표자</label>
            <input type="text" value={basicInfo.company.representative} onChange={(e) => handleCompanyChange('representative', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">기업규모</label>
            <select value={basicInfo.company.size} onChange={(e) => handleCompanyChange('size', e.target.value)} className="select-field">
              <option value="대기업">대기업</option>
              <option value="중견기업">중견기업</option>
              <option value="중소기업">중소기업</option>
              <option value="창업기업">창업기업</option>
            </select>
          </div>
          <div>
            <label className="label">설립일</label>
            <input type="date" value={basicInfo.company.established} onChange={(e) => handleCompanyChange('established', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">업종 (KSIC)</label>
            <input type="text" value={basicInfo.company.industry} onChange={(e) => handleCompanyChange('industry', e.target.value)} className="input-field" placeholder="예: 화학물질 및 화학제품 제조업" />
          </div>
          <div>
            <label className="label">KSIC 코드</label>
            <input type="text" value={basicInfo.company.ksicCode} onChange={(e) => handleCompanyChange('ksicCode', e.target.value)} className="input-field" placeholder="예: C20" />
          </div>
          <div className="col-span-2">
            <label className="label">소재지</label>
            <input type="text" value={basicInfo.company.address} onChange={(e) => handleCompanyChange('address', e.target.value)} className="input-field" placeholder="주소" />
          </div>
        </div>
      </FormSection>

      {/* 평가 정보 */}
      <FormSection title="평가 정보">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">평가 목적·용도</label>
            <select value={basicInfo.purpose} onChange={(e) => updateField('basicInfo', 'purpose', e.target.value)} className="select-field">
              {PURPOSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="label">평가 기준일</label>
            <input type="date" value={basicInfo.valuationDate} onChange={(e) => updateField('basicInfo', 'valuationDate', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">보고서 제출일</label>
            <input type="date" value={basicInfo.reportDate} onChange={(e) => updateField('basicInfo', 'reportDate', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">유효기간</label>
            <input type="text" value={basicInfo.valuationDate ? '발급일로부터 1년' : ''} className="input-field bg-gray-50" readOnly />
          </div>
        </div>
      </FormSection>

      {/* 평가자 정보 */}
      <FormSection title="평가(자문) 참여자" description="평가에 참여한 인원을 입력합니다.">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">대표 평가자</label>
            <input type="text" value={basicInfo.evaluator.name} onChange={(e) => updateNestedField('basicInfo', 'evaluator.name', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">평가기관명</label>
            <input type="text" value={basicInfo.evaluator.organization} onChange={(e) => updateNestedField('basicInfo', 'evaluator.organization', e.target.value)} className="input-field" />
          </div>
        </div>
        <label className="label">참여자 목록</label>
        <DynamicTable
          columns={participantColumns}
          rows={basicInfo.evaluator.participants}
          onChange={(rows) => updateNestedField('basicInfo', 'evaluator.participants', rows)}
          addLabel="+ 참여자 추가"
          minRows={1}
        />
      </FormSection>
    </div>
  );
}
