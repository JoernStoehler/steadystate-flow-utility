import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Welcome } from './welcome';

// Mock the SVG imports
vi.mock('./logo-dark.svg', () => ({
  default: 'logo-dark.svg',
}));
vi.mock('./logo-light.svg', () => ({
  default: 'logo-light.svg',
}));

describe('Welcome', () => {
  it('renders the component with the correct structure', () => {
    render(<Welcome />);

    // Check for main elements
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText("What's next?")).toBeInTheDocument();

    // Check for React Router Docs link
    const reactRouterDocsLink = screen.getByText('React Router Docs');
    expect(reactRouterDocsLink).toBeInTheDocument();
    expect(reactRouterDocsLink.closest('a')).toHaveAttribute(
      'href',
      'https://reactrouter.com/docs'
    );
    expect(reactRouterDocsLink.closest('a')).toHaveAttribute('target', '_blank');

    // Check for Discord link
    const discordLink = screen.getByText('Join Discord');
    expect(discordLink).toBeInTheDocument();
    expect(discordLink.closest('a')).toHaveAttribute('href', 'https://rmx.as/discord');

    // Check for both light and dark mode logos
    const logos = screen.getAllByAltText('React Router');
    expect(logos).toHaveLength(2);

    // Check light logo
    const lightLogo = logos.find(logo => logo.classList.contains('block'));
    expect(lightLogo).toBeInTheDocument();
    expect(lightLogo).toHaveAttribute('src', 'logo-light.svg');
    expect(lightLogo).toHaveClass('block w-full dark:hidden');
  });
});
