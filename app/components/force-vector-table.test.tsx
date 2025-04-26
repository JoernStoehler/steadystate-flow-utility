import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import type { ForceVector } from '../utils/simulation';

import ForceVectorTable from './force-vector-table';

describe('ForceVectorTable', () => {
  it('renders empty state when no forces', () => {
    render(<ForceVectorTable forces={[]} onRemoveForce={() => {}} onClearForces={() => {}} />);

    expect(screen.getByText(/click and drag/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders forces in a table', () => {
    const forces: ForceVector[] = [
      { x: 0.1, y: 0.2, fx: 0.3, fy: 0.4 },
      { x: 0.5, y: 0.6, fx: 0.7, fy: 0.8 },
    ];

    render(<ForceVectorTable forces={forces} onRemoveForce={() => {}} onClearForces={() => {}} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 forces
  });

  it('calls onRemoveForce when remove button clicked', async () => {
    const user = userEvent.setup();
    const mockRemove = vi.fn();

    const forces: ForceVector[] = [{ x: 0.1, y: 0.2, fx: 0.3, fy: 0.4 }];

    render(
      <ForceVectorTable forces={forces} onRemoveForce={mockRemove} onClearForces={() => {}} />
    );

    // Find and click the remove button
    const removeButton = screen.getByTitle('Remove this force vector');
    await user.click(removeButton);

    expect(mockRemove).toHaveBeenCalledWith(0);
  });

  it('calls onClearForces when clear button clicked', async () => {
    const user = userEvent.setup();
    const mockClear = vi.fn();

    const forces: ForceVector[] = [{ x: 0.1, y: 0.2, fx: 0.3, fy: 0.4 }];

    render(<ForceVectorTable forces={forces} onRemoveForce={() => {}} onClearForces={mockClear} />);

    // Find and click the clear button
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearButton);

    expect(mockClear).toHaveBeenCalled();
  });
});
