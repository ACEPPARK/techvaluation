/**
 * Gemini API 연동 서비스
 * 보고서 각 섹션의 전문적인 한국어 텍스트 생성
 */

async function callGemini(prompt, apiKey) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. 상단 헤더에서 API 키를 입력해주세요.');
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API 호출 실패:', error);
    throw error;
  }
}

const SECTION_PROMPTS = {
  overview: (data) => `당신은 기술가치평가 보고서를 작성하는 전문 평가사입니다.
다음 정보를 바탕으로 "기술 개요 및 활용분야" 섹션을 3~4문단으로 작성해주세요.
기술 분야의 정의, 기본 원리, 활용 분야, 핵심 성능, 기존 기술 대비 장점을 포함해주세요.
전문적이고 객관적인 어조로 한국어로 작성해주세요. HTML 태그(<p>, <strong>, <ul>, <li> 등)를 사용해주세요.
${data.prompt ? `참고 키워드: ${data.prompt}` : ''}
${data.techAnalysis?.overview ? `기존 내용 참고: ${data.techAnalysis.overview.replace(/<[^>]*>/g, '')}` : ''}`,

  techTrend: (data) => `당신은 기술가치평가 보고서를 작성하는 전문 평가사입니다.
"기술동향" 섹션을 3~5문단으로 작성해주세요.
글로벌 기술동향, 원료/소재 동향, 공정기술 동향, 국내 R&D 현황을 포함해주세요.
전문적이고 객관적인 어조로 한국어로 작성하고 HTML 태그를 사용해주세요.
${data.prompt ? `기술 분야: ${data.prompt}` : ''}`,

  stabilityAnalysis: (data) => `당신은 특허 분석 전문가입니다.
"권리 안정성 종합 분석" 섹션을 2~3문단으로 작성해주세요.
선행기술 대비 차별성, 진보성 인정 여부, 무효 가능성 수준을 평가해주세요.
전문적이고 객관적인 어조로 한국어로 작성하고 HTML 태그를 사용해주세요.
${data.rightsAnalysis?.priorArtResults?.length ? `선행기술 ${data.rightsAnalysis.priorArtResults.length}건 발견` : ''}`,

  marketDefinition: (data) => `당신은 시장 분석 전문가입니다.
"시장 정의" 섹션을 2~3문단으로 작성해주세요.
시장의 정의, 주요 제조사/제품 현황, 차별화 포인트를 포함해주세요.
전문적이고 객관적인 어조로 한국어로 작성하고 HTML 태그를 사용해주세요.
${data.marketAnalysis?.ksicCode ? `KSIC: ${data.marketAnalysis.ksicCode}` : ''}`,

  marketTrend: (data) => `당신은 시장 분석 전문가입니다.
"시장 동향" 섹션을 3~4문단으로 작성해주세요.
시장 성장 동인, 공급망 현황, 정부 정책, 시장 구조적 특성을 포함해주세요.
전문적이고 객관적인 어조로 한국어로 작성하고 HTML 태그를 사용해주세요.`,

  marketOpinion: (data) => `당신은 기술가치평가 전문가입니다.
"시장성 검토 의견"을 6~8개의 불릿포인트로 작성해주세요.
수요 안정성, 성장 전망, 규제 환경, 원가 리스크, 경쟁 환경, 품질 요건, 종합 결론을 포함해주세요.
<ul><li> 형식으로 한국어로 작성해주세요.`,

  capabilities: (data) => `당신은 사업성 분석 전문가입니다.
"사업화 역량" 섹션을 3~4문단으로 작성해주세요.
인력/조직 역량, 거래처 현황, IP 보유 현황, 재무 역량, 추가 인프라를 포함해주세요.
전문적이고 객관적인 어조로 한국어로 작성하고 HTML 태그를 사용해주세요.`,

  opinion: (data) => `당신은 기술가치평가 전문가입니다.
"사업성 검토의견"을 7~9개의 불릿포인트로 작성해주세요.
사업화주체 구조, 사업모델, 원가 우위, IP 현황, 시장 수요, 리스크, 종합 결론을 포함해주세요.
<ul><li> 형식으로 한국어로 작성해주세요.`,
};

export async function generateSectionText(sectionKey, data, apiKey) {
  const promptBuilder = SECTION_PROMPTS[sectionKey];
  if (!promptBuilder) {
    throw new Error(`Unknown section: ${sectionKey}`);
  }
  const prompt = promptBuilder(data);
  return await callGemini(prompt, apiKey);
}

export async function generateBatchTexts(sections, storeData, apiKey) {
  const results = {};
  for (const section of sections) {
    try {
      results[section] = await generateSectionText(section, storeData, apiKey);
    } catch (e) {
      console.error(`Section ${section} generation failed:`, e);
      results[section] = null;
    }
  }
  return results;
}
