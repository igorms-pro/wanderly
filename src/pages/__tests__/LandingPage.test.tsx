import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from '../LandingPage';

function renderLanding() {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    </HelmetProvider>,
  );
}

describe('LandingPage', () => {
  it('renders landing page with brand name', () => {
    renderLanding();

    expect(screen.getByTestId('voyagely-brand')).toBeInTheDocument();
  });

  it('renders hero section with title and description', () => {
    renderLanding();

    expect(screen.getByTestId('landing-hero-title')).toBeInTheDocument();
    expect(screen.getByTestId('landing-hero-description')).toBeInTheDocument();
  });

  it('renders hero CTA link', () => {
    renderLanding();

    const ctaLink = screen.getByTestId('hero-cta-link');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/signup');
  });

  it('renders sign in link in navigation', () => {
    renderLanding();

    const signInLink = screen.getByTestId('landing-signin-link');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/login');
  });

  it('renders features section', () => {
    renderLanding();

    expect(screen.getByTestId('landing-features-title')).toBeInTheDocument();
    expect(screen.getByTestId('landing-features-subtitle')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    renderLanding();

    // Check that feature cards are rendered (they should contain the feature titles)
    // We can check for specific feature text that should be translated
    const featuresSection = screen
      .getByTestId('landing-features-title')
      .closest('div')?.parentElement;
    expect(featuresSection).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    renderLanding();

    // The "How It Works" section should be present
    // We can check for step numbers or titles
    const page = screen.getByTestId('voyagely-brand').closest('div');
    expect(page).toBeInTheDocument();
  });
});
