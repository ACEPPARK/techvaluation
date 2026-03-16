import { AlignmentType, HeadingLevel, TabStopPosition, TabStopType, convertMillimetersToTwip, BorderStyle } from 'docx';

export const FONT_NAME = 'Malgun Gothic';
export const FONT_NAME_EN = 'Times New Roman';

export const docStyles = {
  default: {
    document: {
      run: { font: FONT_NAME, size: 22 },
      paragraph: { spacing: { after: 120, line: 360 } },
    },
    heading1: {
      run: { font: FONT_NAME, size: 32, bold: true, color: '1B3A6B' },
      paragraph: { spacing: { before: 360, after: 200 } },
    },
    heading2: {
      run: { font: FONT_NAME, size: 28, bold: true, color: '1B3A6B' },
      paragraph: { spacing: { before: 240, after: 160 } },
    },
    heading3: {
      run: { font: FONT_NAME, size: 24, bold: true },
      paragraph: { spacing: { before: 200, after: 120 } },
    },
  },
};

export const TABLE_HEADER_COLOR = '1B3A6B';
export const TABLE_ALT_COLOR = 'F0F4FA';

export function createTableBorders() {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  return { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
}
