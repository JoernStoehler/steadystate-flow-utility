import React from 'react';

import type { ForceVector } from '../utils/simulation';

interface ForceVectorTableProps {
  forces: ForceVector[];
  onRemoveForce: (index: number) => void;
  onClearForces: () => void;
  onAddForce?: () => void; // Optional callback to add a default force
  onUpdateForce?: (index: number, newForce: ForceVector) => void; // Optional callback to update a force
}

export default function ForceVectorTable({
  forces,
  onRemoveForce,
  onClearForces,
  onAddForce,
  onUpdateForce,
}: ForceVectorTableProps) {
  // Format numbers to a reasonable precision
  const formatNumber = (num: number): string => {
    return num.toFixed(3);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Force Vectors</h3>
        <div className="space-x-2">
          {onAddForce && (
            <button
              onClick={onAddForce}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Force
            </button>
          )}
          {forces.length > 0 && (
            <button
              onClick={onClearForces}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {forces.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          Click and drag on the canvas to add force vectors.
        </p>
      ) : (
        <div className="text-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Force</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forces.map((force, index) => (
                <tr
                  key={`force-${index}`}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    {onUpdateForce ? (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <span className="w-4">x:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={force.x}
                            onChange={e => {
                              const newX = Math.max(
                                0,
                                Math.min(1, parseFloat(e.target.value) || 0)
                              );
                              onUpdateForce(index, { ...force, x: newX });
                            }}
                            className="w-16 ml-1 px-1 py-0 text-xs border rounded"
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="w-4">y:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={force.y}
                            onChange={e => {
                              const newY = Math.max(
                                0,
                                Math.min(1, parseFloat(e.target.value) || 0)
                              );
                              onUpdateForce(index, { ...force, y: newY });
                            }}
                            className="w-16 ml-1 px-1 py-0 text-xs border rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        ({formatNumber(force.x)}, {formatNumber(force.y)})
                      </>
                    )}
                  </td>
                  <td className="p-2">
                    {onUpdateForce ? (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <span className="w-6">fx:</span>
                          <input
                            type="number"
                            step="0.1"
                            value={force.fx}
                            onChange={e => {
                              const newFx = parseFloat(e.target.value) || 0;
                              onUpdateForce(index, { ...force, fx: newFx });
                            }}
                            className="w-16 ml-1 px-1 py-0 text-xs border rounded"
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="w-6">fy:</span>
                          <input
                            type="number"
                            step="0.1"
                            value={force.fy}
                            onChange={e => {
                              const newFy = parseFloat(e.target.value) || 0;
                              onUpdateForce(index, { ...force, fy: newFy });
                            }}
                            className="w-16 ml-1 px-1 py-0 text-xs border rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        ({formatNumber(force.fx)}, {formatNumber(force.fy)})
                      </>
                    )}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => onRemoveForce(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      title="Remove this force vector"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
