import React from 'react';

import type { ForceVector } from '../utils/simulation';

interface ForceVectorTableProps {
  forces: ForceVector[];
  onRemoveForce: (index: number) => void;
  onClearForces: () => void;
}

export default function ForceVectorTable({
  forces,
  onRemoveForce,
  onClearForces,
}: ForceVectorTableProps) {
  // Format numbers to a reasonable precision
  const formatNumber = (num: number): string => {
    return num.toFixed(3);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Force Vectors</h3>
        {forces.length > 0 && (
          <button
            onClick={onClearForces}
            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All
          </button>
        )}
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
                    ({formatNumber(force.x)}, {formatNumber(force.y)})
                  </td>
                  <td className="p-2">
                    ({formatNumber(force.fx)}, {formatNumber(force.fy)})
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
