import React from 'react';
import RadioScale from './RadioScale';

export default function ScoringTable({ title, items, values, onChange, showWeights = false, showTotal = true }) {
  // items: [{ key, label, weight?, category?, criteria? }]
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  
  const totalWeightedScore = items.reduce((sum, item) => {
    const score = values[item.key] || 0;
    const weight = item.weight || 1;
    return sum + score * weight;
  }, 0);

  const maxScore = items.reduce((sum, item) => {
    const maxVal = item.scaleMax || 5;
    const weight = item.weight || 1;
    return sum + maxVal * weight;
  }, 0);

  const renderItems = (filteredItems) => filteredItems.map((item) => (
    <div key={item.key} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      {showWeights && (
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center mt-0.5">
          {item.weight}
        </span>
      )}
      <div className="flex-1">
        <RadioScale
          label={item.label}
          value={values[item.key]}
          onChange={(v) => onChange(item.key, v)}
          min={item.scaleMin || 1}
          max={item.scaleMax || 5}
          criteria={item.criteria}
        />
      </div>
    </div>
  ));

  return (
    <div className="card mb-4">
      {title && <h3 className="section-title">{title}</h3>}
      
      {categories.length > 0 ? (
        categories.map(cat => (
          <div key={cat} className="mb-4">
            <h4 className="subsection-title text-blue-800">{cat}</h4>
            {renderItems(items.filter(i => i.category === cat))}
          </div>
        ))
      ) : (
        renderItems(items)
      )}

      {showTotal && (
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">합계</span>
          <span className="text-lg font-bold text-blue-800">
            {totalWeightedScore.toFixed(1)} / {maxScore}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({((totalWeightedScore / maxScore) * 100).toFixed(1)}%)
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
