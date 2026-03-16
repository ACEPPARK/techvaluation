import { Document, Packer, PageBreak, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { docStyles, FONT_NAME } from './styles';
import { createCoverPage } from './coverPage';
import { heading1, heading2, heading3, p, emptyLine, keyValuePair, bulletItem, createSimpleTable, htmlToDocxParagraphs, formatNum } from './helpers';
import { EVALUATION_PURPOSE_TEMPLATE, EVALUATION_METHOD_TEMPLATE, EVALUATION_CONDITIONS_TEMPLATE, VALUATION_PRINCIPLES, VALUATION_FORMULA_TEXT, DISCLAIMER_TEXT } from '../constants/reportTemplates';

export async function generateReport(storeData) {
  const bi = storeData.basicInfo;
  const ta = storeData.techAnalysis;
  const ra = storeData.rightsAnalysis;
  const ma = storeData.marketAnalysis;
  const ba = storeData.businessAnalysis;
  const vv = storeData.valuationVariables;
  const result = storeData.calculationResult;
  const primaryPatent = bi.patents[0] || {};

  const children = [];

  // ========= 표지 =========
  children.push(...createCoverPage(storeData));

  // ========= 제출문 =========
  children.push(heading1('제출문'));
  children.push(p(`${bi.company.name || '[평가의뢰인]'} 귀하`, { size: 26, bold: true }));
  children.push(emptyLine());
  children.push(p(`본 보고서를 「${primaryPatent.title || '[대표 발명의 명칭]'}(등록특허 ${primaryPatent.registrationNumber || '[등록번호]'}) ${bi.patents.length > 1 ? `외 ${bi.patents.length - 1}건` : ''}」에 관한 기술가치평가보고서로 제출합니다.`));
  children.push(emptyLine());

  if (bi.evaluator.participants.length > 0) {
    children.push(heading3('평가(자문) 참여자'));
    children.push(createSimpleTable(
      ['소속', '직위/자격', '성명'],
      bi.evaluator.participants.map(pp => [pp.affiliation || '-', pp.position || '-', pp.name || '-']),
    ));
  }
  children.push(emptyLine());
  children.push(p(`보고서 제출일: ${bi.reportDate || '[날짜]'}`));
  children.push(p(`평가기관: ${bi.evaluator.organization || '[기관명]'}`, { bold: true }));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========= Ⅰ. 요약 =========
  children.push(heading1('Ⅰ. 요약'));

  // 1. 기술가치평가 개요
  children.push(heading2('1. 기술가치평가 개요'));
  children.push(heading3('1.1 평가 목적'));
  const purposeText = EVALUATION_PURPOSE_TEMPLATE({ purpose: bi.purpose, techName: primaryPatent.title, companyName: bi.company.name, evaluationDate: bi.valuationDate });
  children.push(p(purposeText));

  children.push(heading3('1.2 평가대상 및 범위'));
  children.push(p(`본 평가의 대상기술은 ${bi.company.name}이(가) 보유한 '${primaryPatent.title}' 관련 특허기술이며, 1차 목표시장은 ${bi.targetMarket || '-'}입니다.`));
  if (bi.patents.length > 0) {
    children.push(createSimpleTable(
      ['명칭', '특허권자', '출원번호', '등록번호', '법적상태', '존속기간만료일'],
      bi.patents.map(pat => [pat.title, pat.holders, pat.applicationNumber, pat.registrationNumber || '-', pat.status, pat.expiryDate || '-']),
    ));
  }

  children.push(heading3('1.3 평가기준일 등'));
  children.push(createSimpleTable(
    ['구분', '내용'],
    [['평가기준일', bi.valuationDate || '-'], ['유효기간', '평가기준일로부터 1년']],
  ));

  children.push(heading3('1.4 평가방법 및 절차'));
  const methodText = EVALUATION_METHOD_TEMPLATE({ method: '로열티공제법 모델 Ⅰ', techName: primaryPatent.title });
  children.push(p(methodText));

  children.push(heading3('1.5 평가의 주요조건 및 가정'));
  const condText = EVALUATION_CONDITIONS_TEMPLATE({ techName: primaryPatent.title, companyName: bi.company.name, evaluationDate: bi.valuationDate });
  children.push(p(condText));

  // 2~5. 분석 요약
  const summaryTexts = [
    { num: '2', title: '기술성 분석 요약', content: ta.overview },
    { num: '3', title: '권리성 분석 요약', content: ra.stabilityAnalysis },
    { num: '4', title: '시장성 분석 요약', content: ma.marketOpinion },
    { num: '5', title: '사업성 분석 요약', content: ba.opinion },
  ];
  for (const s of summaryTexts) {
    children.push(heading2(`${s.num}. ${s.title}`));
    children.push(...htmlToDocxParagraphs(s.content));
  }

  // 6. 기술가치 산정 요약
  children.push(heading2('6. 기술가치 산정'));
  if (result) {
    const headers = ['구분', ...result.yearlyDetails.map(d => `${d.year}차년도`)];
    const rows = [
      ['매출액(A)', ...result.yearlyDetails.map(d => formatNum(d.revenue))],
      ['로열티율(B)', ...result.yearlyDetails.map(() => `${(result.effectiveRoyaltyRate * 100).toFixed(4)}%`)],
      ['로열티수입(C=A×B)', ...result.yearlyDetails.map(d => formatNum(d.grossRoyalty))],
      ['법인세비용(D)', ...result.yearlyDetails.map(d => formatNum(d.corporateTax))],
      ['세후로열티수입(E)', ...result.yearlyDetails.map(d => formatNum(d.afterTaxRoyalty))],
      ['현가계수(F)', ...result.yearlyDetails.map(d => d.discountFactor.toFixed(4))],
      ['현재가치(G=E×F)', ...result.yearlyDetails.map(d => formatNum(d.presentValue))],
    ];
    children.push(createSimpleTable(headers, rows));
    children.push(emptyLine());
    children.push(p(`기술의 가치(H=ΣG): ${formatNum(result.techValue)} 백만원`, { bold: true, size: 26, color: '1B3A6B' }));
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========= Ⅱ. 기술성 분석 =========
  children.push(heading1('Ⅱ. 기술성 분석'));
  children.push(heading2('1. 기술 개요'));
  children.push(heading3('1.1 기술의 개요 및 활용분야'));
  children.push(...htmlToDocxParagraphs(ta.overview));
  children.push(heading3('1.2 기술 구성 및 핵심기술'));
  children.push(...htmlToDocxParagraphs(ta.coretech));
  children.push(heading2('2. 기술환경분석'));
  children.push(heading3('2.1 기술동향'));
  children.push(...htmlToDocxParagraphs(ta.techTrend));
  children.push(heading3('2.2 국내외 기업 현황'));
  if (ta.competitors.length > 0) {
    children.push(createSimpleTable(
      ['기업명', '국가', '주력분야', '특징'],
      ta.competitors.map(c => [c.name, c.country, c.field, c.features]),
    ));
  }
  children.push(heading2('3. 기술의 유용성 분석'));
  children.push(heading3('3.1 혁신성 및 활용성'));
  children.push(...htmlToDocxParagraphs(ta.innovation));
  children.push(heading3('3.2 파급성'));
  children.push(...htmlToDocxParagraphs(ta.rippleEffect));
  children.push(heading3('3.3 기술사업화환경'));
  children.push(...htmlToDocxParagraphs(ta.commercializationEnv));
  children.push(heading2('4. 기술의 경쟁성 분석'));
  const compItems = [
    { key: 'intensity', title: '4.1 기술경쟁강도' },
    { key: 'superiority', title: '4.2 우월성 및 차별성' },
    { key: 'substitutability', title: '4.3 대체가능성' },
    { key: 'imitationDifficulty', title: '4.4 모방난이도' },
    { key: 'obsolescence', title: '4.5 진부화가능성' },
  ];
  for (const ci of compItems) {
    children.push(heading3(ci.title));
    children.push(...htmlToDocxParagraphs(ta.competitiveness[ci.key]));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========= Ⅲ. 권리성 분석 =========
  children.push(heading1('Ⅲ. 권리성 분석'));
  children.push(heading2('1. 평가대상특허 개요'));
  bi.patents.forEach((pat, i) => {
    children.push(heading3(`1.${i + 1} 평가대상특허 ${i + 1}`));
    children.push(createSimpleTable(
      ['항목', '내용'],
      [
        ['명칭', pat.title], ['특허권자', pat.holders], ['출원번호(출원일)', `${pat.applicationNumber} (${pat.applicationDate})`],
        ['등록번호(등록일)', `${pat.registrationNumber || '-'} (${pat.registrationDate || '-'})`],
        ['법적상태', pat.status], ['존속기간만료일', pat.expiryDate || '-'], ['IPC', pat.ipc || '-'],
      ],
    ));
  });
  children.push(heading2('2. 권리 안정성'));
  children.push(heading3('2.1 선행기술조사'));
  if (ra.priorArtResults.length > 0) {
    children.push(createSimpleTable(
      ['No.', '공개번호', '출원인', '발명의 명칭', '관련도'],
      ra.priorArtResults.map((r, i) => [i + 1, r.publicationNumber, r.applicant, r.title, r.relevance]),
    ));
  }
  children.push(heading3('2.2 권리 안정성'));
  children.push(...htmlToDocxParagraphs(ra.stabilityAnalysis));
  children.push(heading2('3. 권리범위의 광협'));
  children.push(heading3('3.1 권리보호강도'));
  children.push(...htmlToDocxParagraphs(ra.protectionStrength));
  children.push(heading3('3.2 침해발견 및 침해입증용이성'));
  children.push(...htmlToDocxParagraphs(ra.infringementDetection));
  children.push(heading2('4. 사업 연관성 및 제품적용여부'));
  children.push(...htmlToDocxParagraphs(ra.businessRelevance));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========= Ⅳ. 시장성 분석 =========
  children.push(heading1('Ⅳ. 시장성 분석'));
  children.push(heading2('1. 시장 개요'));
  children.push(heading3('1.1 시장 정의'));
  children.push(...htmlToDocxParagraphs(ma.marketDefinition));
  children.push(...htmlToDocxParagraphs(ma.productFeatures));
  children.push(heading3('1.2 시장 동향'));
  children.push(...htmlToDocxParagraphs(ma.marketTrend));
  children.push(heading3('1.3 산업분류 및 전후방산업'));
  children.push(...htmlToDocxParagraphs(ma.industryStructure));
  children.push(heading2('2. 시장환경분석 (PEST)'));
  ['political', 'economic', 'social', 'technological'].forEach(key => {
    const labels = { political: 'Political/Policy', economic: 'Economic', social: 'Social', technological: 'Technological' };
    children.push(heading3(labels[key]));
    children.push(...htmlToDocxParagraphs(ma.pest[key]));
  });
  children.push(heading2('3. 목표시장규모 현황 및 전망'));
  if (ma.globalMarket.currentSize) {
    children.push(heading3('글로벌 시장'));
    children.push(createSimpleTable(
      ['구분', '시장규모(백만원)', 'CAGR', '출처'],
      [[`${ma.globalMarket.year}년`, formatNum(ma.globalMarket.currentSize), `${ma.globalMarket.cagr}%`, ma.globalMarket.source],
       [`${ma.globalMarket.projectedYear}년(전망)`, formatNum(ma.globalMarket.projectedSize), '', '']],
    ));
  }
  if (ma.domesticMarket.currentSize) {
    children.push(heading3('국내 시장'));
    children.push(createSimpleTable(
      ['구분', '시장규모(백만원)', 'CAGR', '출처'],
      [[`${ma.domesticMarket.year}년`, formatNum(ma.domesticMarket.currentSize), `${ma.domesticMarket.cagr}%`, ma.domesticMarket.source],
       [`${ma.domesticMarket.projectedYear}년(전망)`, formatNum(ma.domesticMarket.projectedSize), '', '']],
    ));
  }
  children.push(heading2('4. 시장성 검토 의견'));
  children.push(...htmlToDocxParagraphs(ma.marketOpinion));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========= Ⅴ. 사업성 분석 =========
  children.push(heading1('Ⅴ. 사업성 분석'));
  children.push(heading2('1. 사업화 기반 역량 및 제품 경쟁력'));
  children.push(heading3('1.1 사업화주체의 개요'));
  children.push(createSimpleTable(
    ['항목', '내용'],
    [
      ['기업체명', ba.companyInfo.name], ['기업규모', ba.companyInfo.size],
      ['설립일', ba.companyInfo.established], ['대표자', ba.companyInfo.representative],
      ['업종', ba.companyInfo.industry], ['소재지', ba.companyInfo.address],
    ],
  ));
  children.push(...htmlToDocxParagraphs(ba.companyOverview));
  if (ba.history.length > 0) {
    children.push(heading3('주요 연혁'));
    children.push(createSimpleTable(['연도', '주요 연혁'], ba.history.map(h => [h.year, h.event])));
  }
  children.push(heading3('1.2 사업화 역량'));
  children.push(...htmlToDocxParagraphs(ba.capabilities));
  children.push(heading3('1.3 세부 사업 계획'));
  children.push(...htmlToDocxParagraphs(ba.businessPlan));
  if (ba.revenuePlan.length > 0) {
    children.push(createSimpleTable(['연도', '매출 목표(백만원)'], ba.revenuePlan.map(r => [r.year, formatNum(r.target)])));
  }
  children.push(heading2('2. 사업성 검토의견'));
  children.push(...htmlToDocxParagraphs(ba.opinion));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========= Ⅵ. 기술가치 산정 =========
  children.push(heading1('Ⅵ. 기술가치 산정'));
  children.push(heading2('1. 기술가치 산정 결과'));
  children.push(heading3('1.1 기술가치평가 대상'));
  if (bi.patents.length > 0) {
    children.push(createSimpleTable(
      ['명칭', '등록번호', '출원일', '법적상태'],
      bi.patents.map(pat => [pat.title, pat.registrationNumber || '-', pat.applicationDate, pat.status]),
    ));
  }
  children.push(heading3('1.2 기술가치평가의 기준 및 원칙'));
  children.push(p(VALUATION_PRINCIPLES()));
  children.push(heading3('1.3 기술가치 산정'));
  if (result) {
    const valHeaders = ['구분', ...result.yearlyDetails.map(d => `${d.year}차년도`)];
    const valRows = [
      ['매출액(A)', ...result.yearlyDetails.map(d => formatNum(d.revenue))],
      ['적정로열티율(B)', ...result.yearlyDetails.map(() => `${(result.effectiveRoyaltyRate * 100).toFixed(4)}%`)],
      ['로열티수입(C=A×B)', ...result.yearlyDetails.map(d => formatNum(d.grossRoyalty))],
      ['법인세비용(D)', ...result.yearlyDetails.map(d => formatNum(d.corporateTax))],
      ['세후로열티수입(E=C-D)', ...result.yearlyDetails.map(d => formatNum(d.afterTaxRoyalty))],
      ['현가계수(F)', ...result.yearlyDetails.map(d => d.discountFactor.toFixed(4))],
      ['현재가치(G=E×F)', ...result.yearlyDetails.map(d => formatNum(d.presentValue))],
    ];
    children.push(createSimpleTable(valHeaders, valRows));
    children.push(emptyLine());
    children.push(p(`기술의 가치(H=ΣG): ${formatNum(result.techValue)} 백만원`, { bold: true, size: 28, color: '1B3A6B' }));
  }

  children.push(heading2('2. 주요변수 산정내역'));
  children.push(heading3('2.1 기술가치평가 산식'));
  children.push(p(VALUATION_FORMULA_TEXT()));

  children.push(heading3('2.2 기술의 경제적 수명'));
  if (result?.economicLife) {
    const el = result.economicLife;
    children.push(createSimpleTable(
      ['구분', '값'],
      [
        ['획득값', `${el.acquisitionValue.toFixed(1)}점`],
        ['TCT 기반 수명', `${el.rawEconomicLife}년`],
        ['법적 잔존기간', `${el.legalRemainingYears}년`],
        ['최종 경제적 수명', `${el.finalEconomicLife}년`],
        ['사업화 준비기간', `${el.preparationPeriod}년`],
        ['현금흐름 추정기간', `${el.cashFlowPeriod}년`],
      ],
    ));
  }

  children.push(heading3('2.4 적정 로열티율 산출'));
  if (result?.royaltyRate) {
    const rr = result.royaltyRate;
    children.push(createSimpleTable(
      ['구분', '값'],
      [
        ['기준 로열티율', `${(rr.baseRoyaltyRate * 100).toFixed(2)}%`],
        ['조정계수1', rr.adjustmentCoefficient.toFixed(4)],
        ['기술의 비중', rr.techWeight.toFixed(4)],
        ['개척률', `${(rr.pioneerRate * 100).toFixed(0)}%`],
        ['적정 로열티율', `${rr.effectiveRatePercent.toFixed(4)}%`],
      ],
    ));
  }

  children.push(heading3('2.6 할인율 추정'));
  if (result?.wacc) {
    const w = result.wacc;
    children.push(createSimpleTable(
      ['구분', '값'],
      [
        ['CAPM', `${(w.capmRate * 100).toFixed(2)}%`],
        ['규모 위험프리미엄', `${(w.sizePremium * 100).toFixed(2)}%`],
        ['기술사업화 위험프리미엄', `${w.riskPremiumPercent.toFixed(2)}%`],
        ['자기자본비용(Ke)', `${(w.equityCost * 100).toFixed(2)}%`],
        ['자기자본비율', `${(w.equityRatio * 100).toFixed(0)}%`],
        ['세전 타인자본비용', `${(w.debtCostRate * 100).toFixed(2)}%`],
        ['WACC', `${w.waccPercent.toFixed(2)}%`],
      ],
    ));
  }

  children.push(heading3('2.7 기술가치 산정'));
  if (result) {
    children.push(p(`최종 기술가치: ${formatNum(result.techValue)} 백만원 (= ${(result.techValue / 100).toFixed(1)}억원)`, { bold: true, size: 28, color: '1B3A6B' }));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========= Ⅶ. 부록 =========
  children.push(heading1('Ⅶ. 부록'));
  children.push(heading2('면책 사항'));
  const disclaimer = DISCLAIMER_TEXT({ companyName: bi.company.name, evaluationDate: bi.valuationDate });
  children.push(p(disclaimer));

  // Build document
  const doc = new Document({
    styles: docStyles,
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `기술가치평가보고서_${bi.company.name || '보고서'}.docx`);
}
