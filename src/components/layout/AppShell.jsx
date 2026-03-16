import React, { useState } from 'react';
import Sidebar from './Sidebar';
import StepNavigation from './StepNavigation';
import useUIStore from '../../stores/useUIStore';

export default function AppShell({ children }) {
  const { sidebarCollapsed, toggleSidebar, geminiApiKey, setGeminiApiKey } = useUIStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 lg:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-blue-900">기술가치평가 보고서 자동 생성</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:inline">로열티공제법 모델 Ⅰ</span>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  geminiApiKey ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
                title="Gemini API 키 설정"
              >
                <span className={`w-2 h-2 rounded-full ${geminiApiKey ? 'bg-emerald-500' : 'bg-red-400'}`} />
                API 키
              </button>
            </div>
          </div>
          {showApiKey && (
            <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Gemini API Key</label>
              <div className="relative flex-1">
                <input
                  type={apiKeyVisible ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="input-field text-xs pr-16"
                />
                <button
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {apiKeyVisible ? '숨기기' : '보기'}
                </button>
              </div>
              {geminiApiKey && (
                <span className="text-xs text-emerald-600 whitespace-nowrap">설정 완료</span>
              )}
            </div>
          )}
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
