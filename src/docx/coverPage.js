import { Paragraph, TextRun, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle } from 'docx';
import { FONT_NAME, TABLE_HEADER_COLOR, createTableBorders } from './styles';
import { emptyLine, formatNum } from './helpers';

export function createCoverPage(data) {
  const bi = data.basicInfo;
  const result = data.calculationResult;
  const primaryPatent = bi.patents[0] || {};

  const elements = [];

  // Spacing
  for (let i = 0; i < 4; i++) elements.push(emptyLine());

  // Title
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: '기술가치평가보고서', font: FONT_NAME, size: 56, bold: true, color: '1B3A6B' })],
  }));
  elements.push(emptyLine());

  // Subtitle line
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━', font: FONT_NAME, size: 24, color: '1B3A6B' })],
  }));

  // Basic info table
  const infoRows = [
    ['(1) 발명의 명칭', `${primaryPatent.title || '-'} ${bi.patents.length > 1 ? `외 ${bi.patents.length - 1}건` : ''}`],
    ['(2) 특허등록번호', `${primaryPatent.registrationNumber || '-'} ${bi.patents.length > 1 ? `외 ${bi.patents.length - 1}건` : ''}`],
    ['(3) 특허권자', primaryPatent.holders || '-'],
    ['(4) 평가 의뢰인', bi.company.name || '-'],
    ['(5) 평가 목적·용도', bi.purpose || '-'],
    ['(6) 평가 기준일', bi.valuationDate || '-'],
    ['(7) 유효기간', '발급일로부터 1년'],
  ];

  const borders = createTableBorders();
  elements.push(new Table({
    rows: [
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '평가대상특허(기술) 및 일반 사항', bold: true, size: 22, color: 'FFFFFF', font: FONT_NAME })] })],
          columnSpan: 2, shading: { type: ShadingType.SOLID, color: TABLE_HEADER_COLOR } }),
      ]}),
      ...infoRows.map(([k, v]) => new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20, font: FONT_NAME })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v || '-', size: 20, font: FONT_NAME })] })] }),
      ]})),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
  }));

  elements.push(emptyLine());

  // Result table
  if (result) {
    const resultRows = [
      ['적용된 평가방법', '로열티공제법 Ⅰ'],
      ['특허기술 가치평가액', `${formatNum(result.techValue)} 백만원`],
      ['기술의 경제적 수명', `${result.economicLife?.finalEconomicLife || '-'}년`],
      ['현금흐름 추정기간', `${result.economicLife?.cashFlowPeriod || '-'}년`],
      ['로열티율', `${((result.royaltyRate?.effectiveRate || 0) * 100).toFixed(4)}%`],
      ['할인율', `${((result.wacc?.wacc || 0) * 100).toFixed(2)}%`],
      ['대표 IPC', bi.representativeIPC || '-'],
      ['목표시장', bi.targetMarket || '-'],
    ];

    elements.push(new Table({
      rows: [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '기술가치평가 결과(요약)', bold: true, size: 22, color: 'FFFFFF', font: FONT_NAME })] })],
            columnSpan: 2, shading: { type: ShadingType.SOLID, color: TABLE_HEADER_COLOR } }),
        ]}),
        ...resultRows.map(([k, v]) => new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20, font: FONT_NAME })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, font: FONT_NAME })] })] }),
        ]})),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
    }));
  }

  // Page break
  elements.push(new Paragraph({ children: [new PageBreak()] }));

  return elements;
}
