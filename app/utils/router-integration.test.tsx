import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createRoutesStub, Form } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

// Sample form component with validation
const LoginForm = () => {
  const [error, setError] = useState('');

  return (
    <div>
      <h1>Login Form</h1>
      <Form method="post" onSubmit={() => setError('Invalid credentials')}>
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </div>
        <button type="submit">Login</button>
        {error && <p role="alert">{error}</p>}
      </Form>
    </div>
  );
};

describe('React Router Form Integration', () => {
  it('displays form errors', async () => {
    const user = userEvent.setup();

    // Create a stub with a route using our LoginForm
    const Stub = createRoutesStub([
      {
        path: '/login',
        Component: LoginForm,
        action: () => {
          return { error: 'Invalid credentials' };
        },
      },
    ]);

    render(<Stub initialEntries={['/login']} />);

    // Fill out form
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Check that error is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });
});
