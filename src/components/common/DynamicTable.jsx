import React from 'react';

export default function DynamicTable({ columns, rows, onChange, onAdd, onRemove, addLabel = '+ 행 추가', minRows = 0 }) {
  // columns: [{ key, label, type: 'text'|'number'|'date'|'select'|'textarea', options?, width?, placeholder? }]
  
  const handleCellChange = (rowIndex, colKey, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [colKey]: value };
    onChange(newRows);
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      const template = {};
      columns.forEach(col => { template[col.key] = col.type === 'number' ? 0 : ''; });
      onChange([...rows, template]);
    }
  };

  const handleRemove = (index) => {
    if (rows.length <= minRows) return;
    if (onRemove) {
      onRemove(index);
    } else {
      onChange(rows.filter((_, i) => i !== index));
    }
  };

  const renderCell = (row, col, rowIndex) => {
    const value = row[col.key] ?? '';
    const commonClass = 'input-field text-xs py-1.5';

    switch (col.type) {
      case 'select':
        return (
          <select value={value} onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)} className={`select-field text-xs py-1.5`}>
            {(col.options || []).map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea value={value} onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
            className={commonClass} rows={2} placeholder={col.placeholder} />
        );
      case 'number':
        return (
          <input type="number" value={value} onChange={(e) => handleCellChange(rowIndex, col.key, Number(e.target.value))}
            className={commonClass} placeholder={col.placeholder} />
        );
      case 'date':
        return (
          <input type="date" value={value} onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
            className={commonClass} />
        );
      default:
        return (
          <input type="text" value={value} onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
            className={commonClass} placeholder={col.placeholder} />
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 w-8">#</th>
            {columns.map(col => (
              <th key={col.key} className="px-2 py-2 text-left text-xs font-medium text-gray-500" style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
            <th className="px-2 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100">
              <td className="px-2 py-1.5 text-xs text-gray-400">{rowIndex + 1}</td>
              {columns.map(col => (
                <td key={col.key} className="px-2 py-1.5">
                  {renderCell(row, col, rowIndex)}
                </td>
              ))}
              <td className="px-2 py-1.5">
                {rows.length > minRows && (
                  <button onClick={() => handleRemove(rowIndex)} className="text-red-400 hover:text-red-600 text-lg" title="삭제">×</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAdd} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
        {addLabel}
      </button>
    </div>
  );
}
