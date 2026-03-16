import React from 'react';

export default function CalculationPreview({ title, items, formula, highlight }) {
  // items: [{ label, value, unit?, isHighlight? }]
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      {title && <h4 className="text-sm font-bold text-blue-900 mb-3">{title}</h4>}
      {formula && (
        <div className="text-xs text-blue-700 bg-blue-100 rounded px-3 py-2 mb-3 font-mono">
          {formula}
        </div>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center justify-between text-sm ${item.isHighlight ? 'font-bold text-blue-900 pt-2 border-t border-blue-200' : 'text-gray-700'}`}>
            <span>{item.label}</span>
            <span className={item.isHighlight ? 'text-lg' : ''}>
              {item.value}
              {item.unit && <span className="text-xs text-gray-500 ml-1">{item.unit}</span>}
            </span>
          </div>
        ))}
      </div>
      {highlight && (
        <div className="mt-3 pt-3 border-t border-blue-200 text-center">
          <div className="text-xs text-blue-600 mb-1">{highlight.label}</div>
          <div className="text-2xl font-bold text-blue-900">{highlight.value}</div>
        </div>
      )}
    </div>
  );
}
