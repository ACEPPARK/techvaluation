import React from 'react';
import Sidebar from './Sidebar';
import StepNavigation from './StepNavigation';
import useUIStore from '../../stores/useUIStore';

export default function AppShell({ children }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-blue-900">기술가치평가 보고서 자동 생성</h1>
          <div className="text-xs text-gray-400">로열티공제법 모델 Ⅰ</div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        <StepNavigation />
      </div>
    </div>
  );
}
