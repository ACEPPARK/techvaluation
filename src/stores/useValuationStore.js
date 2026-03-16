import { create } from 'zustand';

const initialState = {
  // Step 1: 기본 사항
  basicInfo: {
    patents: [{ title: '', registrationNumber: '', applicationNumber: '', applicationDate: '', registrationDate: '', expiryDate: '', holders: '', applicant: '', status: '등록', ipc: '', claimCount: '', independentClaims: '', dependentClaims: '', overseasFiling: false, summary: '', representativeClaim: '' }],
    company: { name: '', representative: '', address: '', bizNumber: '', industry: '', ksicCode: '', established: '', size: '중소기업' },
    evaluator: { name: '', organization: '', qualification: '', participants: [{ affiliation: '', position: '', name: '' }] },
    purpose: '기술이전용',
    valuationDate: '',
    reportDate: '',
    validityPeriod: '',
    targetMarket: '',
    representativeIPC: '',
  },

  // Step 2: 기술성 분석
  techAnalysis: {
    overview: '',
    coretech: '',
    techTrend: '',
    competitors: [{ name: '', country: '', field: '', features: '' }],
    innovation: '',
    rippleEffect: '',
    commercializationEnv: '',
    competitiveness: { intensity: '', superiority: '', substitutability: '', imitationDifficulty: '', obsolescence: '' },
  },

  // Step 3: 권리성 분석
  rightsAnalysis: {
    priorArt: { countries: ['한국'], period: '', criteria: '', ipcCodes: '', keywords: '', searchFormula: '' },
    priorArtResults: [{ number: '', publicationNumber: '', applicant: '', title: '', status: '', relevance: 'A' }],
    priorArtComparisons: [{ patentNumber: '', similarities: '', differences: '', conclusion: '' }],
    stabilityAnalysis: '',
    protectionStrength: '',
    infringementDetection: '',
    businessRelevance: '',
  },

  // Step 4: 시장성 분석
  marketAnalysis: {
    marketDefinition: '',
    productFeatures: '',
    ksicCode: '',
    marketTrend: '',
    industryStructure: '',
    valueChain: '',
    pest: { political: '', economic: '', social: '', technological: '' },
    globalMarket: { currentSize: 0, projectedSize: 0, cagr: 0, year: '', projectedYear: '', source: '' },
    domesticMarket: { currentSize: 0, projectedSize: 0, cagr: 0, year: '', projectedYear: '', source: '' },
    marketOpinion: '',
  },

  // Step 5: 사업성 분석
  businessAnalysis: {
    companyOverview: '',
    companyInfo: { name: '', size: '중소기업', established: '', representative: '', industry: '', address: '' },
    history: [{ year: '', event: '' }],
    capabilities: '',
    businessPlan: '',
    revenuePlan: [{ year: '', target: 0 }],
    ipStatus: '',
    opinion: '',
  },

  // Step 6: 기술가치 산정 변수
  valuationVariables: {
    tctData: { q1: 3, q2: 6, q3: 10 },
    techLifeScores: {},
    legalRemainingYears: 15,
    preparationPeriod: 3,
    revenueProjections: [],
    revenueGrowthRate: 5,
    selectedIndustryCode: 'C20',
    baseRoyaltyRate: 0.035,
    adjustmentScores: {},
    techWeightItems: [{ product: '', weightA: 0, techElement: '', weightB: 0, isProtected: true }],
    techWeight: 0.5,
    pioneerRate: 0.7,
    companySize: '중소기업',
    isListed: false,
    capmRate: 0.12,
    sizePremium: 0.03,
    riskPremiumScores: {},
    equityRatio: 0.5,
    debtCostRate: 0.05,
    avgCorporateTaxRate: 0.209,
  },

  // Step 7: 생성된 텍스트 & 결과
  generatedTexts: {},
  calculationResult: null,
};

const useValuationStore = create((set, get) => ({
  ...initialState,

  // Generic update for any path
  updateField: (section, field, value) => set((state) => ({
    [section]: { ...state[section], [field]: value },
  })),

  // Deep nested update
  updateNestedField: (section, path, value) => set((state) => {
    const newSection = { ...state[section] };
    const keys = path.split('.');
    let current = newSection;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return { [section]: newSection };
  }),

  // Patent operations
  addPatent: () => set((state) => ({
    basicInfo: {
      ...state.basicInfo,
      patents: [...state.basicInfo.patents, { title: '', registrationNumber: '', applicationNumber: '', applicationDate: '', registrationDate: '', expiryDate: '', holders: '', applicant: '', status: '등록', ipc: '', claimCount: '', independentClaims: '', dependentClaims: '', overseasFiling: false, summary: '', representativeClaim: '' }],
    },
  })),
  removePatent: (index) => set((state) => ({
    basicInfo: {
      ...state.basicInfo,
      patents: state.basicInfo.patents.filter((_, i) => i !== index),
    },
  })),
  updatePatent: (index, field, value) => set((state) => {
    const patents = [...state.basicInfo.patents];
    patents[index] = { ...patents[index], [field]: value };
    return { basicInfo: { ...state.basicInfo, patents } };
  }),

  // Array item operations (generic)
  addArrayItem: (section, field, template) => set((state) => ({
    [section]: {
      ...state[section],
      [field]: [...(state[section][field] || []), template],
    },
  })),
  removeArrayItem: (section, field, index) => set((state) => ({
    [section]: {
      ...state[section],
      [field]: state[section][field].filter((_, i) => i !== index),
    },
  })),
  updateArrayItem: (section, field, index, key, value) => set((state) => {
    const arr = [...state[section][field]];
    arr[index] = { ...arr[index], [key]: value };
    return { [section]: { ...state[section], [field]: arr } };
  }),

  // Calculation result
  setCalculationResult: (result) => set({ calculationResult: result }),
  setGeneratedText: (key, text) => set((state) => ({
    generatedTexts: { ...state.generatedTexts, [key]: text },
  })),

  // Reset
  resetAll: () => set(initialState),
}));

export default useValuationStore;
