import { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType, TableLayoutType } from 'docx';
import { TABLE_HEADER_COLOR, TABLE_ALT_COLOR, FONT_NAME, createTableBorders } from './styles';

export function p(text, options = {}) {
  const { bold, size, color, alignment, heading, spacing, font } = options;
  const config = {};
  if (heading) config.heading = heading;
  if (alignment) config.alignment = alignment;
  if (spacing) config.spacing = spacing;

  return new Paragraph({
    ...config,
    children: [
      new TextRun({
        text: text || '',
        bold: bold || false,
        size: size || 22,
        color: color || '000000',
        font: font || FONT_NAME,
      }),
    ],
  });
}

export function heading1(text) {
  return p(text, { heading: HeadingLevel.HEADING_1, bold: true, size: 32, color: '1B3A6B' });
}

export function heading2(text) {
  return p(text, { heading: HeadingLevel.HEADING_2, bold: true, size: 28, color: '1B3A6B' });
}

export function heading3(text) {
  return p(text, { heading: HeadingLevel.HEADING_3, bold: true, size: 24 });
}

export function emptyLine() {
  return new Paragraph({ children: [] });
}

export function bulletItem(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 22, font: FONT_NAME })],
  });
}

export function keyValuePair(key, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${key}: `, bold: true, size: 22, font: FONT_NAME }),
      new TextRun({ text: String(value || '-'), size: 22, font: FONT_NAME }),
    ],
  });
}

export function createSimpleTable(headers, rows, options = {}) {
  const { columnWidths } = options;
  const borders = createTableBorders();

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF', font: FONT_NAME })],
      })],
      shading: { type: ShadingType.SOLID, color: TABLE_HEADER_COLOR },
      width: columnWidths ? { size: columnWidths[i], type: WidthType.PERCENTAGE } : undefined,
    })),
  });

  const dataRows = rows.map((row, rowIndex) => new TableRow({
    children: row.map((cell, i) => new TableCell({
      children: [new Paragraph({
        alignment: typeof cell === 'number' || (typeof cell === 'string' && /^[\d,.%-]+$/.test(cell)) ? AlignmentType.RIGHT : AlignmentType.LEFT,
        children: [new TextRun({ text: String(cell ?? '-'), size: 20, font: FONT_NAME })],
      })],
      shading: rowIndex % 2 === 1 ? { type: ShadingType.SOLID, color: TABLE_ALT_COLOR } : undefined,
      width: columnWidths ? { size: columnWidths[i], type: WidthType.PERCENTAGE } : undefined,
    })),
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    layout: TableLayoutType.FIXED,
  });
}

export function htmlToDocxParagraphs(html) {
  if (!html) return [emptyLine()];
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
  if (!text) return [emptyLine()];

  return text.split(/\n+/).filter(Boolean).map(para =>
    new Paragraph({
      children: [new TextRun({ text: para.trim(), size: 22, font: FONT_NAME })],
      spacing: { after: 120 },
    })
  );
}

export function formatNum(n) {
  if (n === null || n === undefined || isNaN(n)) return '-';
  return new Intl.NumberFormat('ko-KR').format(Math.round(n));
}
