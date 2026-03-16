import { create } from 'zustand';

const STEPS = [
  { id: 1, title: '기본 사항', shortTitle: '기본정보' },
  { id: 2, title: '기술성 분석', shortTitle: '기술성' },
  { id: 3, title: '권리성 분석', shortTitle: '권리성' },
  { id: 4, title: '시장성 분석', shortTitle: '시장성' },
  { id: 5, title: '사업성 분석', shortTitle: '사업성' },
  { id: 6, title: '기술가치 산정', shortTitle: '가치산정' },
  { id: 7, title: '보고서 생성', shortTitle: '보고서' },
];

const useUIStore = create((set) => ({
  currentStep: 1,
  completedSteps: [],
  sidebarCollapsed: false,
  isGeneratingText: false,
  isGeneratingDocx: false,
  geminiApiKey: '',
  steps: STEPS,

  setStep: (step) => set({ currentStep: step }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, 7),
    completedSteps: state.completedSteps.includes(state.currentStep)
      ? state.completedSteps
      : [...state.completedSteps, state.currentStep],
  })),
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1),
  })),
  markStepComplete: (step) => set((state) => ({
    completedSteps: state.completedSteps.includes(step)
      ? state.completedSteps
      : [...state.completedSteps, step],
  })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setGeneratingText: (v) => set({ isGeneratingText: v }),
  setGeneratingDocx: (v) => set({ isGeneratingDocx: v }),
}));

export default useUIStore;
