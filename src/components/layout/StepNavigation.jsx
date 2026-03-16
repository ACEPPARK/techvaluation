import React from 'react';
import useUIStore from '../../stores/useUIStore';

export default function StepNavigation() {
  const { currentStep, steps, prevStep, nextStep } = useUIStore();
  const currentStepInfo = steps.find(s => s.id === currentStep);

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <button
        onClick={prevStep}
        disabled={currentStep === 1}
        className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← 이전
      </button>

      <span className="text-sm text-gray-500">
        {currentStepInfo?.title} ({currentStep}/7)
      </span>

      <button
        onClick={nextStep}
        disabled={currentStep === 7}
        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        다음 →
      </button>
    </div>
  );
}
