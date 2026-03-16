import React, { useState, useMemo } from 'react';
import useValuationStore from '../../stores/useValuationStore';
import useUIStore from '../../stores/useUIStore';
import { formatNumber } from '../../engine/techValue';
import { generateReport } from '../../docx/generateReport';

export default function Step7Preview() {
  const store = useValuationStore();
  const { isGeneratingDocx, setGeneratingDocx } = useUIStore();
  const [activeTab, setActiveTab] = useState('summary');
  const result = store.calculationResult;

  const handleDownloadDocx = async () => {
    setGeneratingDocx(true);
    try {
      await generateReport(store);
    } catch (e) {
      console.error('DOCX 생성 실패:', e);
      alert('DOCX 생성 중 오류가 발생했습니다: ' + e.message);
    } finally {
      setGeneratingDocx(false);
    }
  };

  const tabs = [
    { id: 'summary', label: '요약' },
    { id: 'valuation', label: '가치산정' },
    { id: 'details', label: '연도별 상세' },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Step 7. 보고서 미리보기 및 생성</h2>
        <p className="text-sm text-gray-500">입력된 데이터를 검토하고 보고서를 생성합니다.</p>
      </div>

      {/* 다운로드 버튼 */}
      <div className="flex gap-3 mb-6">
        <button onClick={handleDownloadDocx} disabled={isGeneratingDocx || !result} className="btn-primary text-lg px-8 py-3">
          {isGeneratingDocx ? '생성 중...' : '📥 DOCX 보고서 다운로드'}
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id ? 'bg-blue-800 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 요약 탭 */}
      {activeTab === 'summary' && (
        <div className="card">
          <h3 className="section-title">기술가치평가 결과 요약</h3>
          <div className="space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500 mb-1">평가대상기술</div>
                <div className="font-bold">{store.basicInfo.patents[0]?.title || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500 mb-1">평가의뢰기업</div>
                <div className="font-bold">{store.basicInfo.company.name || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500 mb-1">평가목적</div>
                <div className="font-bold">{store.basicInfo.purpose}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500 mb-1">평가기준일</div>
                <div className="font-bold">{store.basicInfo.valuationDate || '-'}</div>
              </div>
            </div>

            {/* 핵심 결과 */}
            {result && (
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 text-white mt-4">
                <div className="text-sm text-blue-200">특허기술 가치평가액</div>
                <div className="text-4xl font-bold mt-1">{formatNumber(result.techValue)} 백만원</div>
                <div className="text-blue-200 mt-1">= {(result.techValue / 100).toFixed(1)}억원</div>
                <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                  <div><div className="text-blue-300">평가방법</div><div className="font-bold">로열티공제법 Ⅰ</div></div>
                  <div><div className="text-blue-300">경제적 수명</div><div className="font-bold">{result.economicLife?.finalEconomicLife}년</div></div>
                  <div><div className="text-blue-300">로열티율</div><div className="font-bold">{(result.royaltyRate?.effectiveRate * 100).toFixed(2)}%</div></div>
                  <div><div className="text-blue-300">할인율(WACC)</div><div className="font-bold">{(result.wacc?.wacc * 100).toFixed(2)}%</div></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 가치산정 탭 */}
      {activeTab === 'valuation' && result && (
        <div className="card">
          <h3 className="section-title">기술가치 산출표</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-3 py-2 text-left">구분</th>
                  {result.yearlyDetails.map(d => (
                    <th key={d.year} className="px-3 py-2 text-right">{d.year}차년도</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="px-3 py-2 font-medium">매출액(A)</td>
                  {result.yearlyDetails.map(d => <td key={d.year} className="px-3 py-2 text-right">{formatNumber(d.revenue)}</td>)}</tr>
                <tr className="border-b bg-gray-50"><td className="px-3 py-2 font-medium">로열티율(B)</td>
                  {result.yearlyDetails.map(d => <td key={d.year} className="px-3 py-2 text-right">{(result.effectiveRoyaltyRate * 100).toFixed(4)}%</td>)}</tr>
                <tr className="border-b"><td className="px-3 py-2 font-medium">로열티수입(C=A×B)</td>
                  {result.yearlyDetails.map(d => <td key={d.year} className="px-3 py-2 text-right">{formatNumber(d.grossRoyalty)}</td>)}</tr>
                <tr className="border-b bg-gray-50"><td className="px-3 py-2 font-medium">법인세비용(D)</td>
                  {result.yearlyDetails.map(d => <td key={d.year} className="px-3 py-2 text-right">{formatNumber(d.corporateTax)}</td>)}</tr>
                <tr className="border-b"><td className="px-3 py-2 font-medium">세후로열티수입(E=C-D)</td>
                  {result.yearlyDetails.map(d => <td key={d.year} className="px-3 py-2 text-right">{formatNumber(d.afterTaxRoyalty)}</td>)}</tr>
                <tr className="border-b bg-gray-50"><td className="px-3 py-2 font-medium">현가계수(F)</td>
                  {result.yearlyDetails.map(d => <td key={d.year} className="px-3 py-2 text-right">{d.discountFactor.toFixed(4)}</td>)}</tr>
                <tr className="border-b font-bold bg-blue-50"><td className="px-3 py-2">현재가치(G=E×F)</td>
                  {result.yearlyDetails.map(d => <td key={d.year} className="px-3 py-2 text-right">{formatNumber(d.presentValue)}</td>)}</tr>
              </tbody>
              <tfoot>
                <tr className="bg-blue-900 text-white font-bold">
                  <td className="px-3 py-2">기술의 가치(H=ΣG)</td>
                  <td colSpan={result.yearlyDetails.length} className="px-3 py-2 text-right text-lg">
                    {formatNumber(result.techValue)} 백만원
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 연도별 상세 탭 */}
      {activeTab === 'details' && result && (
        <div className="card">
          <h3 className="section-title">연도별 상세 내역</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left">연도</th>
                  <th className="px-3 py-2 text-right">매출액</th>
                  <th className="px-3 py-2 text-right">월할비율</th>
                  <th className="px-3 py-2 text-right">로열티(세전)</th>
                  <th className="px-3 py-2 text-right">법인세</th>
                  <th className="px-3 py-2 text-right">로열티(세후)</th>
                  <th className="px-3 py-2 text-right">현가계수</th>
                  <th className="px-3 py-2 text-right">현재가치</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyDetails.map(d => (
                  <tr key={d.year} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{d.year}차년도</td>
                    <td className="px-3 py-2 text-right">{formatNumber(d.revenue)}</td>
                    <td className="px-3 py-2 text-right">{(d.monthRatio * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2 text-right">{formatNumber(d.grossRoyalty)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(d.corporateTax)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(d.afterTaxRoyalty)}</td>
                    <td className="px-3 py-2 text-right">{d.discountFactor.toFixed(4)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatNumber(d.presentValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 font-bold">
                  <td className="px-3 py-2" colSpan={7}>합계 (기술가치)</td>
                  <td className="px-3 py-2 text-right text-blue-900">{formatNumber(result.techValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {!result && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">계산 결과가 없습니다</h3>
          <p className="text-sm text-gray-400">Step 6에서 매출액과 평가변수를 입력하면 자동으로 계산됩니다.</p>
        </div>
      )}
    </div>
  );
}
