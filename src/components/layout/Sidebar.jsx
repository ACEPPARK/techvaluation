import React from 'react';
import useUIStore from '../../stores/useUIStore';

const stepIcons = ['📋', '🔬', '⚖️', '📊', '🏢', '💰', '📄'];

export default function Sidebar() {
  const { currentStep, completedSteps, steps, sidebarCollapsed, setStep } = useUIStore();

  return (
    <aside className={`bg-blue-900 text-white flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
      <div className="p-5">
        <h2 className="text-base font-bold mb-1">기술가치평가</h2>
        <p className="text-blue-300 text-xs mb-6">보고서 작성 시스템</p>

        <nav className="space-y-1">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const isAccessible = step.id <= Math.max(currentStep, ...completedSteps, 1);

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && setStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left
                  ${isActive ? 'bg-blue-700 text-white font-medium' : ''}
                  ${isCompleted && !isActive ? 'text-blue-200 hover:bg-blue-800' : ''}
                  ${!isActive && !isCompleted ? 'text-blue-400 hover:bg-blue-800' : ''}
                  ${!isAccessible ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={!isAccessible}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0
                  ${isActive ? 'bg-white text-blue-900 font-bold' : ''}
                  ${isCompleted && !isActive ? 'bg-blue-600 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-blue-800 text-blue-400' : ''}
                `}>
                  {isCompleted && !isActive ? '✓' : step.id}
                </span>
                <div>
                  <div className="leading-tight">{step.title}</div>
                  <div className={`text-xs ${isActive ? 'text-blue-200' : 'text-blue-500'}`}>
                    Step {step.id}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Progress */}
      <div className="px-5 mt-4">
        <div className="text-xs text-blue-400 mb-1">진행률</div>
        <div className="w-full bg-blue-800 rounded-full h-2">
          <div
            className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / 7) * 100}%` }}
          />
        </div>
        <div className="text-xs text-blue-400 mt-1">{completedSteps.length}/7 완료</div>
      </div>
    </aside>
  );
}
