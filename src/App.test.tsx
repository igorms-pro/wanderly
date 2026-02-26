import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from './pages/LandingPage';

describe('App', () => {
  it('renders landing page with Voyagely brand', () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      </HelmetProvider>,
    );
    expect(screen.getByTestId('voyagely-brand')).toBeInTheDocument();
  });
});
