import React from 'react';

export default function RadioScale({ label, value, onChange, min = 1, max = 5, criteria, description }) {
  const range = [];
  for (let i = min; i <= max; i++) range.push(i);

  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {range.map((score) => (
            <button
              key={score}
              onClick={() => onChange(score)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                ${value === score
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title={criteria?.[score] || `${score}점`}
            >
              {score > 0 && min < 0 ? `+${score}` : score}
            </button>
          ))}
        </div>
      </div>
      {value !== undefined && value !== null && criteria?.[value] && (
        <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 ml-0">
          {criteria[value]}
        </div>
      )}
    </div>
  );
}
