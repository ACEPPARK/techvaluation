"""
기술가치평가 보고서 PDF 생성기
산업통상자원부 기술평가실무가이드(2021 개정판) 양식 기반
"""

import os
from fpdf import FPDF
from valuation_engine import ValuationInput, ValuationResult, format_currency
from datetime import datetime


class KoreanPDF(FPDF):
    """한글 지원 PDF 클래스"""

    def __init__(self):
        super().__init__()
        self._korean_font = None
        self._load_korean_font()

    def _load_korean_font(self):
        """시스템에서 한글 폰트를 찾아 로드"""
        candidates = [
            "/System/Library/Fonts/AppleSDGothicNeo.ttc",
            "/Library/Fonts/NanumGothic.ttf",
            "/Library/Fonts/NanumGothicBold.ttf",
            "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
            "C:/Windows/Fonts/malgun.ttf",
            "C:/Windows/Fonts/gulim.ttc",
        ]
        for path in candidates:
            if os.path.exists(path):
                try:
                    self.add_font("Korean", "", path)
                    self.add_font("Korean", "B", path)
                    self._korean_font = "Korean"
                    return
                except Exception:
                    continue

        # AppleGothic은 OS/2 테이블 이슈로 별도 처리
        apple_gothic = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
        if os.path.exists(apple_gothic):
            try:
                self.add_font("Korean", "", apple_gothic)
                self.add_font("Korean", "B", apple_gothic)
                self._korean_font = "Korean"
                return
            except Exception:
                pass

        # 폰트를 못 찾으면 NanumGothic 자동 다운로드 시도
        try:
            nanum_path = self._download_nanum_font()
            if nanum_path:
                self.add_font("Korean", "", nanum_path)
                self.add_font("Korean", "B", nanum_path)
                self._korean_font = "Korean"
                return
        except Exception:
            pass

        raise RuntimeError(
            "한글 폰트를 찾을 수 없습니다. "
            "NanumGothic 폰트를 설치해주세요: pip install fonts-nanum 또는 "
            "https://hangeul.naver.com 에서 나눔고딕을 다운로드하세요."
        )

    def _download_nanum_font(self):
        """NanumGothic 폰트 자동 다운로드"""
        import urllib.request
        font_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
        os.makedirs(font_dir, exist_ok=True)
        font_path = os.path.join(font_dir, "NanumGothic.ttf")
        if os.path.exists(font_path):
            return font_path
        url = "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Regular.ttf"
        try:
            urllib.request.urlretrieve(url, font_path)
            return font_path
        except Exception:
            return None

    def set_korean_font(self, size=10, bold=False):
        style = "B" if bold else ""
        self.set_font(self._korean_font, style, size)

    def header(self):
        if self.page_no() > 1:
            self.set_korean_font(8)
            self.set_text_color(128, 128, 128)
            self.cell(0, 8, "기술가치평가 보고서", 0, 1, "R")
            self.set_draw_color(200, 200, 200)
            self.line(10, 15, 200, 15)
            self.ln(5)
            self.set_text_color(0, 0, 0)

    def footer(self):
        self.set_y(-15)
        self.set_korean_font(8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"- {self.page_no()} -", 0, 0, "C")

    def section_title(self, title, level=1):
        if level == 1:
            self.set_korean_font(16, bold=True)
            self.set_fill_color(41, 65, 122)
            self.set_text_color(255, 255, 255)
            self.cell(0, 12, f"  {title}", 0, 1, "L", fill=True)
            self.set_text_color(0, 0, 0)
        elif level == 2:
            self.set_korean_font(13, bold=True)
            self.set_text_color(41, 65, 122)
            self.cell(0, 10, title, 0, 1, "L")
            self.set_text_color(0, 0, 0)
        else:
            self.set_korean_font(11, bold=True)
            self.cell(0, 8, title, 0, 1, "L")
        self.ln(3)

    def body_text(self, text):
        self.set_korean_font(10)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def key_value(self, key, value, indent=10):
        self.set_x(indent)
        self.set_korean_font(10, bold=True)
        self.cell(60, 7, key, 0, 0)
        self.set_korean_font(10)
        self.cell(0, 7, str(value), 0, 1)

    def add_table(self, headers, rows, col_widths=None):
        if col_widths is None:
            total_w = 190
            col_widths = [total_w / len(headers)] * len(headers)

        # Header
        self.set_korean_font(9, bold=True)
        self.set_fill_color(41, 65, 122)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 8, h, 1, 0, "C", fill=True)
        self.ln()
        self.set_text_color(0, 0, 0)

        # Rows
        self.set_korean_font(8)
        fill = False
        for row in rows:
            if self.get_y() > 265:
                self.add_page()
                # Redraw header
                self.set_korean_font(9, bold=True)
                self.set_fill_color(41, 65, 122)
                self.set_text_color(255, 255, 255)
                for i, h in enumerate(headers):
                    self.cell(col_widths[i], 8, h, 1, 0, "C", fill=True)
                self.ln()
                self.set_text_color(0, 0, 0)
                self.set_korean_font(8)

            if fill:
                self.set_fill_color(240, 240, 250)
            else:
                self.set_fill_color(255, 255, 255)
            for i, cell_val in enumerate(row):
                self.cell(col_widths[i], 7, str(cell_val), 1, 0, "C", fill=True)
            self.ln()
            fill = not fill
        self.ln(3)


def generate_report(inp: ValuationInput, results: list, output_path: str) -> str:
    """기술가치평가 보고서 PDF 생성"""

    pdf = KoreanPDF()
    pdf.set_auto_page_break(auto=True, margin=20)

    # =========== 표지 ===========
    pdf.add_page()
    pdf.ln(40)
    pdf.set_korean_font(28, bold=True)
    pdf.set_text_color(41, 65, 122)
    pdf.cell(0, 15, "기술가치평가 보고서", 0, 1, "C")
    pdf.ln(10)

    pdf.set_draw_color(41, 65, 122)
    pdf.set_line_width(0.5)
    pdf.line(50, pdf.get_y(), 160, pdf.get_y())
    pdf.ln(15)

    pdf.set_korean_font(14)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 10, f"평가대상기술: {inp.tech_name}", 0, 1, "C")
    pdf.cell(0, 10, f"평가의뢰기업: {inp.company_name}", 0, 1, "C")
    pdf.ln(10)

    pdf.set_korean_font(12)
    pdf.cell(0, 8, f"평가목적: {inp.valuation_purpose}", 0, 1, "C")
    pdf.cell(0, 8, f"평가기준일: {inp.valuation_date}", 0, 1, "C")
    pdf.ln(30)

    pdf.set_korean_font(12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, f"평가자: {inp.evaluator_name}", 0, 1, "C")
    report_date = datetime.now().strftime("%Y년 %m월 %d일")
    pdf.cell(0, 8, f"작성일: {report_date}", 0, 1, "C")

    pdf.ln(20)
    pdf.set_korean_font(9)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 6, "본 보고서는 산업통상자원부 기술평가실무가이드(2021 개정판)에 근거하여 작성되었습니다.", 0, 1, "C")

    # =========== Executive Summary ===========
    pdf.add_page()
    pdf.section_title("Executive Summary")

    primary = results[0] if results else None
    if primary:
        pdf.body_text(
            f"본 보고서는 {inp.company_name}의 '{inp.tech_name}'에 대한 "
            f"기술가치를 {inp.valuation_purpose} 목적으로 평가한 결과입니다."
        )
        pdf.ln(3)

        pdf.section_title("평가 결과 요약", level=2)
        for r in results:
            val_str = format_currency(r.tech_value)
            pdf.key_value(f"{r.method}:", val_str)
        pdf.ln(3)

        pdf.section_title("주요 평가 전제", level=2)
        pdf.key_value("평가기준일", inp.valuation_date)
        pdf.key_value("경제적 내용연수", f"{inp.economic_life}년")
        pdf.key_value("할인율(WACC)", f"{inp.discount_rate * 100:.1f}%")
        pdf.key_value("법인세율", f"{inp.tax_rate * 100:.1f}%")

    # =========== 1. 기업개요 ===========
    pdf.add_page()
    pdf.section_title("1. 기업 개요")
    pdf.key_value("기업명", inp.company_name)
    pdf.key_value("평가대상기술", inp.tech_name)
    pdf.key_value("평가목적", inp.valuation_purpose)
    pdf.key_value("평가기준일", inp.valuation_date)

    # =========== 2. 기술성 분석 ===========
    pdf.add_page()
    pdf.section_title("2. 기술성 분석")

    if inp.tech_assessment:
        headers = ["평가항목", "평가점수 (1~5)"]
        rows = [[k, str(v)] for k, v in inp.tech_assessment.items()]
        avg = sum(inp.tech_assessment.values()) / len(inp.tech_assessment)
        rows.append(["평균", f"{avg:.2f}"])
        pdf.add_table(headers, rows, col_widths=[120, 70])

    # =========== 3. 권리성 분석 ===========
    pdf.section_title("3. 권리성 분석")

    if inp.rights_assessment:
        pdf.body_text(
            "특허 등 지식재산권의 법적 안정성, 권리범위, 활용도 등을 "
            "평가합니다. (산자부 가이드 표10 '권리성 분석' 기준)"
        )
        headers = ["평가항목", "평가점수 (1~5)"]
        rows = [[k, str(v)] for k, v in inp.rights_assessment.items()]
        avg = sum(inp.rights_assessment.values()) / len(inp.rights_assessment)
        rows.append(["평균", f"{avg:.2f}"])
        pdf.add_table(headers, rows, col_widths=[120, 70])

    # =========== 4. 사업성 분석 ===========
    pdf.section_title("4. 사업성 분석")

    if inp.biz_assessment:
        headers = ["평가항목", "평가점수 (1~5)"]
        rows = [[k, str(v)] for k, v in inp.biz_assessment.items()]
        avg = sum(inp.biz_assessment.values()) / len(inp.biz_assessment)
        rows.append(["평균", f"{avg:.2f}"])
        pdf.add_table(headers, rows, col_widths=[120, 70])

    # =========== 5. 시장성 분석 ===========
    pdf.section_title("5. 시장성 분석")

    if inp.market_assessment:
        headers = ["평가항목", "평가점수 (1~5)"]
        rows = [[k, str(v)] for k, v in inp.market_assessment.items()]
        avg = sum(inp.market_assessment.values()) / len(inp.market_assessment)
        rows.append(["평균", f"{avg:.2f}"])
        pdf.add_table(headers, rows, col_widths=[120, 70])

    # =========== 6. 평가의견 (방법별 상세) ===========
    for r in results:
        pdf.add_page()
        pdf.section_title(f"6. 평가 상세: {r.method}")

        pdf.section_title("주요 파라미터", level=2)
        for k, v in r.summary.items():
            if isinstance(v, float) and v < 1:
                pdf.key_value(k, f"{v * 100:.1f}%")
            else:
                pdf.key_value(k, str(v))

        pdf.ln(3)

        # 연도별 상세 테이블
        if r.yearly_details:
            pdf.section_title("연도별 산출 내역", level=2)

            if r.method == "수익접근법 (DCF)":
                headers = ["연도", "매출액", "FCF", "기술CF", "현가계수", "현재가치"]
                col_widths = [25, 35, 35, 35, 30, 30]
                rows = []
                for d in r.yearly_details:
                    rows.append([
                        str(d["연도"]),
                        f"{d['매출액']:,.0f}",
                        f"{d['잉여현금흐름(FCF)']:,.0f}",
                        f"{d['기술현금흐름']:,.0f}",
                        f"{d['현가계수']:.4f}",
                        f"{d['현재가치']:,.0f}",
                    ])
                # 합계
                total_pv = sum(d["현재가치"] for d in r.yearly_details)
                rows.append(["합계", "", "", "", "", f"{total_pv:,.0f}"])
            else:
                headers = ["연도", "매출액", "로열티(세전)", "로열티(세후)", "현가계수", "현재가치"]
                col_widths = [25, 35, 35, 35, 30, 30]
                rows = []
                for d in r.yearly_details:
                    rows.append([
                        str(d["연도"]),
                        f"{d['매출액']:,.0f}",
                        f"{d['로열티수입(세전)']:,.0f}",
                        f"{d['세후로열티수입']:,.0f}",
                        f"{d['현가계수']:.4f}",
                        f"{d['현재가치']:,.0f}",
                    ])
                total_pv = sum(d["현재가치"] for d in r.yearly_details)
                rows.append(["합계", "", "", "", "", f"{total_pv:,.0f}"])

            pdf.add_table(headers, rows, col_widths)

        pdf.ln(5)
        pdf.section_title("평가 결과", level=2)
        val_str = format_currency(r.tech_value)
        pdf.set_korean_font(14, bold=True)
        pdf.set_text_color(41, 65, 122)
        pdf.cell(0, 12, f"기술가치: {val_str}", 0, 1, "C")
        pdf.set_text_color(0, 0, 0)

    # =========== 7. 기술수명 영향요인 ===========
    pdf.add_page()
    pdf.section_title("7. 기술수명 영향요인 평가")

    if inp.tech_life_factors:
        headers = ["평가항목", "평가점수 (1~5)"]
        rows = [[k, str(v)] for k, v in inp.tech_life_factors.items()]
        avg = sum(inp.tech_life_factors.values()) / len(inp.tech_life_factors)
        rows.append(["평균", f"{avg:.2f}"])
        pdf.add_table(headers, rows, col_widths=[120, 70])

    pdf.body_text(f"경제적 내용연수: {inp.economic_life}년")

    # =========== 8. 종합 의견 ===========
    pdf.add_page()
    pdf.section_title("8. 종합 평가 의견")

    if results:
        primary = results[0]
        pdf.body_text(
            f"본 평가에서는 산업통상자원부 기술평가실무가이드(2021 개정판)에 근거하여 "
            f"'{inp.tech_name}'의 기술가치를 평가하였습니다."
        )
        pdf.body_text(
            f"주요 평가방법으로 {primary.method}을(를) 적용하였으며, "
            f"경제적 내용연수 {inp.economic_life}년, 할인율 {inp.discount_rate*100:.1f}%를 적용하였습니다."
        )
        for r in results:
            val_str = format_currency(r.tech_value)
            pdf.body_text(f"- {r.method}에 의한 기술가치: {val_str}")

        pdf.ln(5)
        pdf.body_text(
            "본 평가결과는 평가기준일 현재의 시장상황 및 제반 가정에 기초한 것으로, "
            "향후 시장환경 변화, 기술 발전 추이 등에 따라 실제 가치와 차이가 발생할 수 있습니다."
        )

    # =========== 9. 부록: 면책 조항 ===========
    pdf.add_page()
    pdf.section_title("9. 면책 사항 및 유의 사항")
    pdf.body_text(
        "1. 본 보고서의 기술가치평가 결과는 평가기준일 현재의 시장상황, "
        "제공된 자료 및 정보, 평가자의 전문적 판단에 기초한 것입니다."
    )
    pdf.body_text(
        "2. 본 보고서에 기재된 기술가치는 해당 기술의 절대적인 가치를 "
        "확정하는 것이 아니며, 평가 목적 및 전제 조건의 변경에 따라 "
        "달라질 수 있습니다."
    )
    pdf.body_text(
        "3. 평가에 사용된 재무 추정치, 시장 전망 등은 불확실성을 내포하고 있으며, "
        "실제 결과와 차이가 발생할 수 있습니다."
    )
    pdf.body_text(
        "4. 본 보고서는 특정 투자 의사결정이나 거래의 적정성을 보증하는 것이 아닙니다."
    )

    # PDF 저장
    pdf.output(output_path)
    return output_path
