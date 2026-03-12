"""
기술가치평가서 작성 프로그램
산업통상자원부 기술평가실무가이드(2021 개정판) 기반

실행: streamlit run app.py
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import os
import tempfile

from valuation_engine import (
    ValuationInput,
    ValuationResult,
    calc_dcf_valuation,
    calc_royalty_relief_model1,
    calc_royalty_relief_model2,
    calc_technology_contribution,
    get_tech_strength_from_score,
    calc_tech_life_score,
    estimate_economic_life,
    format_currency,
    INDUSTRY_TECH_FACTORS,
    INDUSTRY_ROYALTY_RATES,
)
from report_generator import generate_report

# ==================== 페이지 설정 ====================
st.set_page_config(
    page_title="기술가치평가 시스템",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
    .main-header {
        font-size: 2rem;
        font-weight: bold;
        color: #29417A;
        text-align: center;
        padding: 1rem 0;
    }
    .sub-header {
        font-size: 0.9rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    .result-box {
        background-color: #f0f2f6;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #29417A;
        margin: 1rem 0;
    }
    .value-highlight {
        font-size: 1.8rem;
        font-weight: bold;
        color: #29417A;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 10px 20px;
    }
</style>
""", unsafe_allow_html=True)


def main():
    st.markdown('<div class="main-header">기술가치평가 시스템</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">산업통상자원부 기술평가실무가이드(2021 개정판) 기반</div>',
        unsafe_allow_html=True,
    )

    # ==================== 사이드바: 평가 방법 선택 ====================
    with st.sidebar:
        st.header("평가 설정")
        methods = st.multiselect(
            "평가 방법 선택",
            ["수익접근법 (DCF)", "로열티공제법 모델I", "로열티공제법 모델II"],
            default=["수익접근법 (DCF)"],
        )

        st.divider()
        st.header("업종 선택")
        industry = st.selectbox(
            "해당 업종",
            list(INDUSTRY_TECH_FACTORS.keys()),
            index=0,
        )

        st.divider()
        st.caption("v1.0 | 산자부 기술평가실무가이드 2021")

    # ==================== 메인 탭 구성 ====================
    tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
        "1. 기본정보",
        "2. 매출추정",
        "3. 평가파라미터",
        "4. 정성평가",
        "5. 평가실행",
        "6. 결과분석",
        "7. 보고서",
    ])

    # 세션 상태 초기화
    if "valuation_input" not in st.session_state:
        st.session_state.valuation_input = ValuationInput()
    if "results" not in st.session_state:
        st.session_state.results = []

    inp = st.session_state.valuation_input

    # ==================== TAB 1: 기본정보 ====================
    with tab1:
        st.subheader("기본 정보 입력")

        col1, col2 = st.columns(2)
        with col1:
            inp.tech_name = st.text_input("평가대상 기술명", value=inp.tech_name, key="tech_name")
            inp.company_name = st.text_input("평가의뢰 기업명", value=inp.company_name, key="company_name")
            inp.evaluator_name = st.text_input("평가자명", value=inp.evaluator_name, key="evaluator_name")

        with col2:
            inp.valuation_purpose = st.selectbox(
                "평가 목적",
                ["기술이전/거래", "현물출자", "담보/보증", "투자유치", "분쟁/소송", "청산", "기타"],
                key="valuation_purpose",
            )
            inp.valuation_date = st.date_input(
                "평가기준일", value=datetime.now(), key="valuation_date"
            ).strftime("%Y-%m-%d")

        st.info("기술의 개요, 특허 현황, 기술 설명 등은 보고서에 직접 기술됩니다.")

    # ==================== TAB 2: 매출 추정 ====================
    with tab2:
        st.subheader("매출액 추정")
        st.caption("경제적 내용연수 기간 동안의 연도별 예상 매출액을 입력하세요. (단위: 만원)")

        col_life, col_start = st.columns(2)
        with col_life:
            inp.economic_life = st.number_input(
                "경제적 내용연수 (년)",
                min_value=1, max_value=20, value=inp.economic_life,
                key="economic_life",
            )
        with col_start:
            start_year = st.number_input(
                "시작 연도",
                min_value=2020, max_value=2040, value=datetime.now().year,
                key="start_year",
            )

        # 매출액 입력 방식 선택
        input_mode = st.radio(
            "입력 방식",
            ["직접 입력", "초기값 + 성장률"],
            horizontal=True,
            key="revenue_input_mode",
        )

        if input_mode == "초기값 + 성장률":
            col_a, col_b = st.columns(2)
            with col_a:
                init_revenue = st.number_input(
                    "1차년도 매출액 (만원)", min_value=0, value=100000, step=10000,
                    key="init_revenue",
                )
            with col_b:
                growth_rate = st.number_input(
                    "연간 매출성장률 (%)", min_value=-50.0, max_value=200.0, value=10.0,
                    step=1.0, key="growth_rate",
                )

            years = [str(start_year + i) for i in range(inp.economic_life)]
            revenues = []
            for i in range(inp.economic_life):
                rev = init_revenue * (1 + growth_rate / 100) ** i
                revenues.append(round(rev))

            inp.revenue_years = years
            inp.revenues = revenues

            # 미리보기
            df_preview = pd.DataFrame({
                "연도": years,
                "매출액 (만원)": [f"{r:,.0f}" for r in revenues],
            })
            st.dataframe(df_preview, use_container_width=True, hide_index=True)

        else:
            years = [str(start_year + i) for i in range(inp.economic_life)]
            revenues = []

            cols = st.columns(min(inp.economic_life, 5))
            for i in range(inp.economic_life):
                col_idx = i % min(inp.economic_life, 5)
                with cols[col_idx]:
                    rev = st.number_input(
                        f"{years[i]}년",
                        min_value=0, value=100000 if not inp.revenues or i >= len(inp.revenues) else int(inp.revenues[i]),
                        step=10000,
                        key=f"rev_{i}",
                    )
                    revenues.append(rev)

            inp.revenue_years = years
            inp.revenues = revenues

        # 매출 추이 차트
        if inp.revenues:
            fig = go.Figure()
            fig.add_trace(go.Bar(
                x=inp.revenue_years,
                y=inp.revenues,
                marker_color="#29417A",
                text=[f"{r:,.0f}" for r in inp.revenues],
                textposition="outside",
            ))
            fig.update_layout(
                title="연도별 추정 매출액",
                xaxis_title="연도",
                yaxis_title="매출액 (만원)",
                height=400,
            )
            st.plotly_chart(fig, use_container_width=True)

    # ==================== TAB 3: 평가 파라미터 ====================
    with tab3:
        st.subheader("평가 파라미터 설정")

        # --- 공통 파라미터 ---
        st.markdown("#### 공통 파라미터")
        col1, col2, col3 = st.columns(3)
        with col1:
            inp.discount_rate = st.number_input(
                "할인율 / WACC (%)",
                min_value=1.0, max_value=50.0,
                value=inp.discount_rate * 100, step=0.5,
                key="discount_rate_pct",
            ) / 100
        with col2:
            inp.tax_rate = st.number_input(
                "법인세율 (%)",
                min_value=0.0, max_value=50.0,
                value=inp.tax_rate * 100, step=0.5,
                key="tax_rate_pct",
            ) / 100
        with col3:
            st.metric("선택 업종", industry)
            st.caption(f"산업기술요소: {INDUSTRY_TECH_FACTORS[industry]*100:.0f}%")

        st.divider()

        # --- 수익접근법 파라미터 ---
        if "수익접근법 (DCF)" in methods:
            st.markdown("#### 수익접근법 (DCF) 파라미터")
            col1, col2 = st.columns(2)

            with col1:
                inp.operating_margin = st.number_input(
                    "영업이익률 (%)",
                    min_value=0.0, max_value=100.0,
                    value=inp.operating_margin * 100, step=1.0,
                    key="op_margin",
                ) / 100

                inp.depreciation_ratio = st.number_input(
                    "감가상각비 비율 (매출액 대비, %)",
                    min_value=0.0, max_value=30.0,
                    value=inp.depreciation_ratio * 100, step=0.5,
                    key="depr_ratio",
                ) / 100

            with col2:
                inp.capex_ratio = st.number_input(
                    "자본적지출 비율 (매출액 대비, %)",
                    min_value=0.0, max_value=30.0,
                    value=inp.capex_ratio * 100, step=0.5,
                    key="capex_ratio",
                ) / 100

                inp.working_capital_ratio = st.number_input(
                    "순운전자본 증가율 (매출 변동 대비, %)",
                    min_value=0.0, max_value=30.0,
                    value=inp.working_capital_ratio * 100, step=0.5,
                    key="wc_ratio",
                ) / 100

            st.markdown("##### 기술기여도")
            col_a, col_b, col_c = st.columns(3)
            with col_a:
                inp.industry_tech_factor = st.number_input(
                    "산업기술요소",
                    min_value=0.0, max_value=1.0,
                    value=float(INDUSTRY_TECH_FACTORS[industry]),
                    step=0.05, format="%.2f",
                    key="ind_tech_factor",
                )
            with col_b:
                inp.individual_tech_strength = st.number_input(
                    "개별기술강도",
                    min_value=0.0, max_value=1.0,
                    value=inp.individual_tech_strength,
                    step=0.05, format="%.2f",
                    key="ind_tech_str",
                )
            with col_c:
                tech_contribution = calc_technology_contribution(
                    inp.industry_tech_factor, inp.individual_tech_strength
                )
                st.metric(
                    "기술기여도",
                    f"{tech_contribution * 100:.1f}%",
                )
                st.caption("= 산업기술요소 x 개별기술강도")

        st.divider()

        # --- 로열티공제법 모델I 파라미터 ---
        if "로열티공제법 모델I" in methods:
            st.markdown("#### 로열티공제법 모델I 파라미터")
            col1, col2 = st.columns(2)

            with col1:
                inp.base_royalty_rate = st.number_input(
                    "기준 로열티율 (%)",
                    min_value=0.0, max_value=30.0,
                    value=float(INDUSTRY_ROYALTY_RATES.get(industry, 0.03)) * 100,
                    step=0.5, key="base_royalty",
                ) / 100

                inp.tech_weight = st.number_input(
                    "기술의 비중",
                    min_value=0.0, max_value=1.0,
                    value=inp.tech_weight,
                    step=0.05, format="%.2f",
                    key="tech_weight",
                )

            with col2:
                inp.adjustment_factor = st.number_input(
                    "조정계수",
                    min_value=0.0, max_value=3.0,
                    value=inp.adjustment_factor,
                    step=0.1, format="%.2f",
                    key="adj_factor",
                )

                inp.pioneer_rate = st.number_input(
                    "개척률",
                    min_value=0.0, max_value=1.0,
                    value=inp.pioneer_rate,
                    step=0.05, format="%.2f",
                    key="pioneer_rate",
                )

        # --- 로열티공제법 모델II 파라미터 ---
        if "로열티공제법 모델II" in methods:
            st.markdown("#### 로열티공제법 모델II 파라미터")
            col1, col2 = st.columns(2)

            with col1:
                inp.reasonable_royalty_rate = st.number_input(
                    "합리적 로열티율 (%)",
                    min_value=0.0, max_value=30.0,
                    value=inp.reasonable_royalty_rate * 100,
                    step=0.5, key="reasonable_royalty",
                ) / 100

            with col2:
                inp.ip_protection_weight = st.number_input(
                    "지식재산 보호비중",
                    min_value=0.0, max_value=1.0,
                    value=inp.ip_protection_weight,
                    step=0.05, format="%.2f",
                    key="ip_weight",
                )

    # ==================== TAB 4: 정성 평가 ====================
    with tab4:
        st.subheader("정성 평가")
        st.caption("각 항목별 1점(매우 낮음) ~ 5점(매우 높음)으로 평가해주세요.")

        eval_tab1, eval_tab2, eval_tab3, eval_tab4, eval_tab5 = st.tabs([
            "기술성 평가", "권리성 평가", "사업성 평가", "시장성 평가", "기술수명 영향요인"
        ])

        with eval_tab1:
            st.markdown("##### 기술성 평가")
            for key in inp.tech_assessment:
                inp.tech_assessment[key] = st.slider(
                    key, 1, 5, inp.tech_assessment[key], key=f"tech_{key}"
                )

        with eval_tab2:
            st.markdown("##### 권리성 평가")
            st.caption(
                "특허 등 지식재산권의 법적 안정성, 권리범위, 활용도 등을 평가합니다. "
                "(산자부 가이드 표10 '권리성 분석' 기준)"
            )
            for key in inp.rights_assessment:
                inp.rights_assessment[key] = st.slider(
                    key, 1, 5, inp.rights_assessment[key], key=f"rights_{key}"
                )

        with eval_tab3:
            st.markdown("##### 사업성 평가")
            for key in inp.biz_assessment:
                inp.biz_assessment[key] = st.slider(
                    key, 1, 5, inp.biz_assessment[key], key=f"biz_{key}"
                )

        with eval_tab4:
            st.markdown("##### 시장성 평가")
            for key in inp.market_assessment:
                inp.market_assessment[key] = st.slider(
                    key, 1, 5, inp.market_assessment[key], key=f"mkt_{key}"
                )

        with eval_tab5:
            st.markdown("##### 기술수명 영향요인 평가")
            for key in inp.tech_life_factors:
                inp.tech_life_factors[key] = st.slider(
                    key, 1, 5, inp.tech_life_factors[key], key=f"life_{key}"
                )

            avg_score = calc_tech_life_score(inp.tech_life_factors)
            est_life = estimate_economic_life(avg_score)
            st.info(f"평균 점수: {avg_score:.2f} | 추정 경제적 내용연수: {est_life}년")

        # 정성평가 요약 레이더 차트
        st.divider()
        st.markdown("##### 정성평가 요약")

        tech_avg = sum(inp.tech_assessment.values()) / len(inp.tech_assessment) if inp.tech_assessment else 0
        rights_avg = sum(inp.rights_assessment.values()) / len(inp.rights_assessment) if inp.rights_assessment else 0
        biz_avg = sum(inp.biz_assessment.values()) / len(inp.biz_assessment) if inp.biz_assessment else 0
        mkt_avg = sum(inp.market_assessment.values()) / len(inp.market_assessment) if inp.market_assessment else 0
        life_avg = calc_tech_life_score(inp.tech_life_factors)

        fig = go.Figure()
        categories = ["기술성", "권리성", "사업성", "시장성", "기술수명"]
        values = [tech_avg, rights_avg, biz_avg, mkt_avg, life_avg]
        values_closed = values + [values[0]]
        categories_closed = categories + [categories[0]]

        fig.add_trace(go.Scatterpolar(
            r=values_closed,
            theta=categories_closed,
            fill="toself",
            fillcolor="rgba(41, 65, 122, 0.2)",
            line=dict(color="#29417A", width=2),
            name="평가 점수",
        ))
        fig.update_layout(
            polar=dict(radialaxis=dict(visible=True, range=[0, 5])),
            showlegend=False,
            height=400,
        )
        st.plotly_chart(fig, use_container_width=True)

        # 개별기술강도 자동 산출
        all_scores = list(inp.tech_assessment.values()) + list(inp.rights_assessment.values()) + list(inp.biz_assessment.values()) + list(inp.market_assessment.values())
        overall_avg = sum(all_scores) / len(all_scores) if all_scores else 3.0
        auto_strength = get_tech_strength_from_score(overall_avg)
        st.info(f"정성평가 종합 평균: {overall_avg:.2f} -> 개별기술강도 참고값: {auto_strength:.2f}")

    # ==================== TAB 5: 평가 실행 ====================
    with tab5:
        st.subheader("기술가치 평가 실행")

        # 입력 데이터 검증
        valid = True
        issues = []

        if not inp.tech_name:
            issues.append("기술명이 입력되지 않았습니다.")
            valid = False
        if not inp.revenues or all(r == 0 for r in inp.revenues):
            issues.append("매출액이 입력되지 않았습니다.")
            valid = False
        if not methods:
            issues.append("평가 방법이 선택되지 않았습니다.")
            valid = False

        if issues:
            for issue in issues:
                st.warning(issue)

        # 입력 요약
        st.markdown("#### 입력 데이터 요약")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("평가대상", inp.tech_name or "-")
            st.metric("경제적 내용연수", f"{inp.economic_life}년")
        with col2:
            st.metric("할인율", f"{inp.discount_rate*100:.1f}%")
            st.metric("법인세율", f"{inp.tax_rate*100:.1f}%")
        with col3:
            total_rev = sum(inp.revenues) if inp.revenues else 0
            st.metric("총 추정 매출액", format_currency(total_rev))
            st.metric("선택 방법", f"{len(methods)}개")

        st.divider()

        if st.button("평가 실행", type="primary", disabled=not valid, use_container_width=True):
            with st.spinner("기술가치를 산출하고 있습니다..."):
                results = []

                if "수익접근법 (DCF)" in methods:
                    results.append(calc_dcf_valuation(inp))

                if "로열티공제법 모델I" in methods:
                    results.append(calc_royalty_relief_model1(inp))

                if "로열티공제법 모델II" in methods:
                    results.append(calc_royalty_relief_model2(inp))

                st.session_state.results = results

            st.success("평가가 완료되었습니다!")

            # 결과 요약
            for r in results:
                val_str = format_currency(r.tech_value)
                st.markdown(
                    f'<div class="result-box">'
                    f'<strong>{r.method}</strong><br>'
                    f'<span class="value-highlight">{val_str}</span>'
                    f'</div>',
                    unsafe_allow_html=True,
                )

    # ==================== TAB 6: 결과 분석 ====================
    with tab6:
        st.subheader("평가 결과 분석")

        results = st.session_state.results

        if not results:
            st.info("먼저 '5. 평가실행' 탭에서 평가를 실행해주세요.")
        else:
            # 방법별 비교
            if len(results) > 1:
                st.markdown("#### 방법별 기술가치 비교")
                compare_data = {
                    "평가방법": [r.method for r in results],
                    "기술가치 (만원)": [r.tech_value for r in results],
                }
                df_compare = pd.DataFrame(compare_data)

                fig = px.bar(
                    df_compare,
                    x="평가방법",
                    y="기술가치 (만원)",
                    color="평가방법",
                    text=[format_currency(v) for v in df_compare["기술가치 (만원)"]],
                )
                fig.update_layout(height=400, showlegend=False)
                fig.update_traces(textposition="outside")
                st.plotly_chart(fig, use_container_width=True)

            # 각 방법별 상세
            for r in results:
                st.divider()
                st.markdown(f"#### {r.method} 상세")

                if r.yearly_details:
                    df = pd.DataFrame(r.yearly_details)

                    # 연도별 현재가치 추이
                    fig = go.Figure()
                    fig.add_trace(go.Bar(
                        x=df["연도"].astype(str),
                        y=df["현재가치"],
                        marker_color="#29417A",
                        name="현재가치",
                        text=[f"{v:,.0f}" for v in df["현재가치"]],
                        textposition="outside",
                    ))
                    fig.update_layout(
                        title=f"{r.method} - 연도별 현재가치",
                        xaxis_title="연도",
                        yaxis_title="현재가치 (만원)",
                        height=350,
                    )
                    st.plotly_chart(fig, use_container_width=True)

                    # 상세 테이블
                    st.markdown("##### 연도별 산출 내역")
                    format_dict = {}
                    for col in df.columns:
                        if col != "연도":
                            if "계수" in col or "기여도" in col or "비중" in col or "율" in col or "률" in col:
                                format_dict[col] = "{:.4f}"
                            else:
                                format_dict[col] = "{:,.0f}"

                    st.dataframe(
                        df.style.format(format_dict),
                        use_container_width=True,
                        hide_index=True,
                    )

                # 결과 메트릭
                val_str = format_currency(r.tech_value)
                st.metric(f"{r.method} 기술가치", val_str)

            # 민감도 분석
            st.divider()
            st.markdown("#### 민감도 분석")
            st.caption("할인율 변동에 따른 기술가치 변화")

            primary = results[0]
            base_rate = inp.discount_rate
            sensitivity_rates = [base_rate - 0.03, base_rate - 0.02, base_rate - 0.01,
                                 base_rate, base_rate + 0.01, base_rate + 0.02, base_rate + 0.03]
            sensitivity_rates = [max(0.01, r) for r in sensitivity_rates]

            sensitivity_values = []
            for rate in sensitivity_rates:
                temp_inp = ValuationInput(
                    revenue_years=inp.revenue_years,
                    revenues=inp.revenues,
                    economic_life=inp.economic_life,
                    discount_rate=rate,
                    operating_margin=inp.operating_margin,
                    tax_rate=inp.tax_rate,
                    depreciation_ratio=inp.depreciation_ratio,
                    capex_ratio=inp.capex_ratio,
                    working_capital_ratio=inp.working_capital_ratio,
                    industry_tech_factor=inp.industry_tech_factor,
                    individual_tech_strength=inp.individual_tech_strength,
                    base_royalty_rate=inp.base_royalty_rate,
                    tech_weight=inp.tech_weight,
                    adjustment_factor=inp.adjustment_factor,
                    pioneer_rate=inp.pioneer_rate,
                    reasonable_royalty_rate=inp.reasonable_royalty_rate,
                    ip_protection_weight=inp.ip_protection_weight,
                )

                if primary.method == "수익접근법 (DCF)":
                    res = calc_dcf_valuation(temp_inp)
                elif primary.method == "로열티공제법 모델I":
                    res = calc_royalty_relief_model1(temp_inp)
                else:
                    res = calc_royalty_relief_model2(temp_inp)

                sensitivity_values.append(res.tech_value)

            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=[f"{r*100:.1f}%" for r in sensitivity_rates],
                y=sensitivity_values,
                mode="lines+markers",
                line=dict(color="#29417A", width=2),
                marker=dict(size=8),
            ))
            # 기준점 표시
            base_idx = sensitivity_rates.index(base_rate) if base_rate in sensitivity_rates else 3
            fig.add_trace(go.Scatter(
                x=[f"{base_rate*100:.1f}%"],
                y=[sensitivity_values[base_idx]],
                mode="markers",
                marker=dict(color="red", size=12, symbol="diamond"),
                name="기준 할인율",
            ))
            fig.update_layout(
                title="할인율 민감도 분석",
                xaxis_title="할인율",
                yaxis_title="기술가치 (만원)",
                height=400,
            )
            st.plotly_chart(fig, use_container_width=True)

    # ==================== TAB 7: 보고서 생성 ====================
    with tab7:
        st.subheader("기술가치평가 보고서 생성")

        results = st.session_state.results

        if not results:
            st.info("먼저 '5. 평가실행' 탭에서 평가를 실행해주세요.")
        else:
            st.markdown("#### 보고서 미리보기")

            col1, col2 = st.columns(2)
            with col1:
                st.markdown("**기본 정보**")
                st.write(f"- 기술명: {inp.tech_name}")
                st.write(f"- 기업명: {inp.company_name}")
                st.write(f"- 평가목적: {inp.valuation_purpose}")
                st.write(f"- 평가기준일: {inp.valuation_date}")
            with col2:
                st.markdown("**평가 결과**")
                for r in results:
                    st.write(f"- {r.method}: {format_currency(r.tech_value)}")

            st.divider()

            if st.button("PDF 보고서 생성", type="primary", use_container_width=True):
                with st.spinner("보고서를 생성하고 있습니다..."):
                    output_dir = tempfile.mkdtemp()
                    filename = f"기술가치평가보고서_{inp.tech_name}_{datetime.now().strftime('%Y%m%d')}.pdf"
                    output_path = os.path.join(output_dir, filename)

                    try:
                        generate_report(inp, results, output_path)

                        with open(output_path, "rb") as f:
                            pdf_bytes = f.read()

                        st.success("보고서가 생성되었습니다!")
                        st.download_button(
                            label="PDF 보고서 다운로드",
                            data=pdf_bytes,
                            file_name=filename,
                            mime="application/pdf",
                            use_container_width=True,
                        )
                    except Exception as e:
                        st.error(f"보고서 생성 중 오류가 발생했습니다: {str(e)}")

            # Excel 다운로드
            st.divider()
            st.markdown("#### 데이터 다운로드")

            if st.button("Excel 데이터 다운로드", use_container_width=True):
                output_dir = tempfile.mkdtemp()
                excel_path = os.path.join(
                    output_dir,
                    f"기술가치평가_{inp.tech_name}_{datetime.now().strftime('%Y%m%d')}.xlsx",
                )

                with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
                    for r in results:
                        if r.yearly_details:
                            df = pd.DataFrame(r.yearly_details)
                            sheet_name = r.method[:31]  # Excel sheet name limit
                            df.to_excel(writer, sheet_name=sheet_name, index=False)

                with open(excel_path, "rb") as f:
                    excel_bytes = f.read()

                st.download_button(
                    label="Excel 파일 다운로드",
                    data=excel_bytes,
                    file_name=os.path.basename(excel_path),
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    use_container_width=True,
                )


if __name__ == "__main__":
    main()
