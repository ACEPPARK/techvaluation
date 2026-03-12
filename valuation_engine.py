"""
기술가치평가 핵심 계산 엔진
- 산업통상자원부 기술평가실무가이드(2021 개정판) 기반
- 수익접근법 (DCF), 로열티공제법 모델I/II 지원
"""

import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ValuationInput:
    """기술가치평가 입력 데이터"""
    # 기본 정보
    tech_name: str = ""
    company_name: str = ""
    valuation_purpose: str = ""
    valuation_date: str = ""
    evaluator_name: str = ""

    # 매출액 추정 (연도별, 만원 단위)
    revenue_years: List[str] = field(default_factory=list)
    revenues: List[float] = field(default_factory=list)

    # 경제적 내용연수
    economic_life: int = 5

    # 할인율 (WACC)
    discount_rate: float = 0.15  # 15%

    # 수익접근법 파라미터
    operating_margin: float = 0.10  # 영업이익률
    tax_rate: float = 0.22  # 법인세율
    depreciation_ratio: float = 0.03  # 감가상각비 비율 (매출액 대비)
    capex_ratio: float = 0.05  # 자본적지출 비율
    working_capital_ratio: float = 0.02  # 순운전자본 증가율

    # 기술기여도
    industry_tech_factor: float = 0.40  # 산업기술요소 (업종별 기술기여도)
    individual_tech_strength: float = 0.50  # 개별기술강도

    # 로열티공제법 파라미터
    base_royalty_rate: float = 0.03  # 기준 로열티율
    tech_weight: float = 0.50  # 기술의 비중
    adjustment_factor: float = 1.0  # 조정계수
    pioneer_rate: float = 1.0  # 개척률

    # 로열티공제법 모델II 파라미터
    reasonable_royalty_rate: float = 0.05  # 합리적 로열티율
    ip_protection_weight: float = 0.50  # 지식재산 보호비중

    # 기술수명 영향요인 평가 (각 1~5점)
    tech_life_factors: dict = field(default_factory=lambda: {
        "기술권리 안정성": 3,
        "기술경쟁 강도": 3,
        "대체기술 가능성": 3,
        "모방난이도": 3,
        "권리범위 광도": 3,
        "시장진입 가능성": 3,
        "시장경쟁 강도": 3,
        "시장경쟁의 변화": 3,
        "신제품 출현 가능성": 3,
        "예상시장 점유율": 3,
    })

    # 기술성 평가 (각 1~5점)
    tech_assessment: dict = field(default_factory=lambda: {
        "기술의 혁신성": 3,
        "기술의 차별성": 3,
        "기술의 대체 불가능성": 3,
        "기술의 모방 난이도": 3,
        "기술적 완성도": 3,
        "기술의 활용성": 3,
        "기술수명 전망": 3,
    })

    # 사업성 평가 (각 1~5점)
    biz_assessment: dict = field(default_factory=lambda: {
        "사업화 준비 수준": 3,
        "생산/제조 역량": 3,
        "마케팅/판매 역량": 3,
        "재무 건전성": 3,
        "경영진 역량": 3,
        "사업화 위험도": 3,
    })

    # 권리성 평가 (각 1~5점) - 산자부 가이드 표10
    rights_assessment: dict = field(default_factory=lambda: {
        "권리 안정성": 3,
        "권리행사 제한 가능성": 3,
        "권리보호 범위": 3,
        "지식재산 활용도": 3,
        "제품 적용 여부": 3,
    })

    # 시장성 평가 (각 1~5점)
    market_assessment: dict = field(default_factory=lambda: {
        "시장규모 및 성장성": 3,
        "목표시장 진입 가능성": 3,
        "시장 경쟁 강도": 3,
        "수요의 안정성": 3,
        "시장 점유율 전망": 3,
    })


@dataclass
class ValuationResult:
    """기술가치평가 결과"""
    method: str
    tech_value: float  # 기술가치 (만원)
    yearly_details: List[dict] = field(default_factory=list)
    tech_contribution: float = 0.0  # 기술기여도
    discount_rate: float = 0.0
    economic_life: int = 0
    summary: dict = field(default_factory=dict)


def calc_technology_contribution(industry_factor: float, individual_strength: float) -> float:
    """
    기술기여도 산출
    기술기여도 = 산업기술요소 × 개별기술강도
    """
    return industry_factor * individual_strength


def calc_free_cash_flow(
    revenue: float,
    operating_margin: float,
    tax_rate: float,
    depreciation_ratio: float,
    capex_ratio: float,
    working_capital_change: float,
) -> float:
    """
    잉여현금흐름(FCF) 산출
    FCF = 세후영업이익 + 감가상각비 - 자본적지출 - 순운전자본증가
    """
    operating_income = revenue * operating_margin
    nopat = operating_income * (1 - tax_rate)  # 세후순영업이익
    depreciation = revenue * depreciation_ratio
    capex = revenue * capex_ratio
    fcf = nopat + depreciation - capex - working_capital_change
    return fcf


def calc_dcf_valuation(inp: ValuationInput) -> ValuationResult:
    """
    수익접근법 (DCF 방법) 기술가치 산출

    기술가치 = Σ [FCF × 기술기여도 / (1 + 할인율)^t]
    """
    tech_contribution = calc_technology_contribution(
        inp.industry_tech_factor, inp.individual_tech_strength
    )

    yearly_details = []
    total_present_value = 0.0
    prev_revenue = 0.0

    for i, (year, revenue) in enumerate(zip(inp.revenue_years, inp.revenues)):
        t = i + 1

        # 순운전자본 변화 추정
        if i == 0:
            wc_change = revenue * inp.working_capital_ratio
        else:
            wc_change = (revenue - prev_revenue) * inp.working_capital_ratio

        # FCF 계산
        fcf = calc_free_cash_flow(
            revenue=revenue,
            operating_margin=inp.operating_margin,
            tax_rate=inp.tax_rate,
            depreciation_ratio=inp.depreciation_ratio,
            capex_ratio=inp.capex_ratio,
            working_capital_change=wc_change,
        )

        # 기술가치 현금흐름
        tech_cash_flow = fcf * tech_contribution

        # 현가계수
        discount_factor = 1 / (1 + inp.discount_rate) ** t

        # 현재가치
        present_value = tech_cash_flow * discount_factor

        total_present_value += present_value

        yearly_details.append({
            "연도": year,
            "매출액": revenue,
            "영업이익": revenue * inp.operating_margin,
            "세후영업이익": revenue * inp.operating_margin * (1 - inp.tax_rate),
            "감가상각비": revenue * inp.depreciation_ratio,
            "자본적지출": revenue * inp.capex_ratio,
            "순운전자본증가": wc_change,
            "잉여현금흐름(FCF)": fcf,
            "기술기여도": tech_contribution,
            "기술현금흐름": tech_cash_flow,
            "현가계수": discount_factor,
            "현재가치": present_value,
        })

        prev_revenue = revenue

    return ValuationResult(
        method="수익접근법 (DCF)",
        tech_value=total_present_value,
        yearly_details=yearly_details,
        tech_contribution=tech_contribution,
        discount_rate=inp.discount_rate,
        economic_life=inp.economic_life,
        summary={
            "산업기술요소": inp.industry_tech_factor,
            "개별기술강도": inp.individual_tech_strength,
            "기술기여도": tech_contribution,
            "할인율": inp.discount_rate,
            "법인세율": inp.tax_rate,
            "영업이익률": inp.operating_margin,
        },
    )


def calc_royalty_relief_model1(inp: ValuationInput) -> ValuationResult:
    """
    로열티공제법 모델I 기술가치 산출

    기술가치 = Σ [매출액 × 기준로열티율 × 기술의비중 × 조정계수 × 개척률 × (1-세율)] / (1+할인율)^t
    """
    yearly_details = []
    total_present_value = 0.0

    for i, (year, revenue) in enumerate(zip(inp.revenue_years, inp.revenues)):
        t = i + 1

        # 로열티 수입 (세전)
        royalty_income = (
            revenue
            * inp.base_royalty_rate
            * inp.tech_weight
            * inp.adjustment_factor
            * inp.pioneer_rate
        )

        # 세후 로열티 수입
        after_tax_royalty = royalty_income * (1 - inp.tax_rate)

        # 현가계수
        discount_factor = 1 / (1 + inp.discount_rate) ** t

        # 현재가치
        present_value = after_tax_royalty * discount_factor

        total_present_value += present_value

        yearly_details.append({
            "연도": year,
            "매출액": revenue,
            "기준로열티율": inp.base_royalty_rate,
            "기술의비중": inp.tech_weight,
            "조정계수": inp.adjustment_factor,
            "개척률": inp.pioneer_rate,
            "로열티수입(세전)": royalty_income,
            "법인세비용": royalty_income * inp.tax_rate,
            "세후로열티수입": after_tax_royalty,
            "현가계수": discount_factor,
            "현재가치": present_value,
        })

    return ValuationResult(
        method="로열티공제법 모델I",
        tech_value=total_present_value,
        yearly_details=yearly_details,
        tech_contribution=inp.tech_weight,
        discount_rate=inp.discount_rate,
        economic_life=inp.economic_life,
        summary={
            "기준로열티율": inp.base_royalty_rate,
            "기술의비중": inp.tech_weight,
            "조정계수": inp.adjustment_factor,
            "개척률": inp.pioneer_rate,
            "할인율": inp.discount_rate,
            "법인세율": inp.tax_rate,
        },
    )


def calc_royalty_relief_model2(inp: ValuationInput) -> ValuationResult:
    """
    로열티공제법 모델II 기술가치 산출

    기술가치 = Σ [매출액 × 합리적로열티율 × 지식재산보호비중 × (1-세율)] / (1+할인율)^t
    """
    yearly_details = []
    total_present_value = 0.0

    for i, (year, revenue) in enumerate(zip(inp.revenue_years, inp.revenues)):
        t = i + 1

        royalty_income = (
            revenue
            * inp.reasonable_royalty_rate
            * inp.ip_protection_weight
        )

        after_tax_royalty = royalty_income * (1 - inp.tax_rate)

        discount_factor = 1 / (1 + inp.discount_rate) ** t

        present_value = after_tax_royalty * discount_factor

        total_present_value += present_value

        yearly_details.append({
            "연도": year,
            "매출액": revenue,
            "합리적로열티율": inp.reasonable_royalty_rate,
            "지식재산보호비중": inp.ip_protection_weight,
            "로열티수입(세전)": royalty_income,
            "법인세비용": royalty_income * inp.tax_rate,
            "세후로열티수입": after_tax_royalty,
            "현가계수": discount_factor,
            "현재가치": present_value,
        })

    return ValuationResult(
        method="로열티공제법 모델II",
        tech_value=total_present_value,
        yearly_details=yearly_details,
        tech_contribution=inp.ip_protection_weight,
        discount_rate=inp.discount_rate,
        economic_life=inp.economic_life,
        summary={
            "합리적로열티율": inp.reasonable_royalty_rate,
            "지식재산보호비중": inp.ip_protection_weight,
            "할인율": inp.discount_rate,
            "법인세율": inp.tax_rate,
        },
    )


# 업종별 산업기술요소 참고 테이블 (산자부 가이드 기준)
INDUSTRY_TECH_FACTORS = {
    "의약": 0.45,
    "반도체": 0.50,
    "전자부품": 0.45,
    "정보통신": 0.45,
    "소프트웨어": 0.50,
    "기계": 0.35,
    "자동차": 0.35,
    "화학": 0.40,
    "바이오": 0.50,
    "에너지": 0.35,
    "식품": 0.30,
    "섬유": 0.25,
    "건설": 0.25,
    "기타 제조": 0.35,
    "서비스": 0.30,
}

# 업종별 기준 로열티율 참고 테이블
INDUSTRY_ROYALTY_RATES = {
    "의약": 0.05,
    "반도체": 0.04,
    "전자부품": 0.035,
    "정보통신": 0.04,
    "소프트웨어": 0.05,
    "기계": 0.03,
    "자동차": 0.03,
    "화학": 0.035,
    "바이오": 0.05,
    "에너지": 0.03,
    "식품": 0.025,
    "섬유": 0.02,
    "건설": 0.02,
    "기타 제조": 0.03,
    "서비스": 0.025,
}

# 개별기술강도 평가표 등급
TECH_STRENGTH_TABLE = {
    (4.5, 5.0): 0.90,
    (4.0, 4.5): 0.75,
    (3.5, 4.0): 0.60,
    (3.0, 3.5): 0.50,
    (2.5, 3.0): 0.40,
    (2.0, 2.5): 0.30,
    (1.5, 2.0): 0.20,
    (1.0, 1.5): 0.10,
}


def get_tech_strength_from_score(avg_score: float) -> float:
    """평균 점수로부터 개별기술강도 산출"""
    for (low, high), strength in TECH_STRENGTH_TABLE.items():
        if low <= avg_score < high:
            return strength
    if avg_score >= 5.0:
        return 0.90
    return 0.10


def calc_tech_life_score(factors: dict) -> float:
    """기술수명 영향요인 평균 점수 계산"""
    if not factors:
        return 3.0
    return sum(factors.values()) / len(factors)


def estimate_economic_life(tech_life_score: float, base_life: int = 10) -> int:
    """
    기술수명 영향요인 점수 기반 경제적 내용연수 추정
    기본 수명 대비 보정
    """
    ratio = tech_life_score / 3.0  # 기준점수 3.0 대비 비율
    estimated = round(base_life * ratio)
    return max(1, min(20, estimated))


def format_currency(value: float) -> str:
    """금액 포맷팅 (만원 단위)"""
    if abs(value) >= 10000:
        return f"{value / 10000:,.1f}억원"
    return f"{value:,.0f}만원"
