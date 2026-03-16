import React from 'react';

export default function NumberInput({ label, value, onChange, unit = '백만원', min = 0, max, step = 1, placeholder, className = '' }) {
  const formattedDisplay = typeof value === 'number' && !isNaN(value)
    ? new Intl.NumberFormat('ko-KR').format(value)
    : '';

  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="input-field pr-16"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
        )}
      </div>
      {value > 0 && unit === '백만원' && value >= 100 && (
        <div className="text-xs text-gray-400 mt-1">
          = {(value / 100).toFixed(1)}억원
        </div>
      )}
    </div>
  );
}
