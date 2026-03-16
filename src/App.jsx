import React from 'react';
import AppShell from './components/layout/AppShell';
import useUIStore from './stores/useUIStore';
import Step1BasicInfo from './components/steps/Step1BasicInfo';
import Step2TechAnalysis from './components/steps/Step2TechAnalysis';
import Step3RightsAnalysis from './components/steps/Step3RightsAnalysis';
import Step4MarketAnalysis from './components/steps/Step4MarketAnalysis';
import Step5BusinessAnalysis from './components/steps/Step5BusinessAnalysis';
import Step6ValuationVariables from './components/steps/Step6ValuationVariables';
import Step7Preview from './components/steps/Step7Preview';

const stepComponents = {
  1: Step1BasicInfo,
  2: Step2TechAnalysis,
  3: Step3RightsAnalysis,
  4: Step4MarketAnalysis,
  5: Step5BusinessAnalysis,
  6: Step6ValuationVariables,
  7: Step7Preview,
};

function App() {
  const currentStep = useUIStore((state) => state.currentStep);
  const StepComponent = stepComponents[currentStep] || Step1BasicInfo;

  return (
    <AppShell>
      <StepComponent />
    </AppShell>
  );
}

export default App;
