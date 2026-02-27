import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../contexts/ToastContext';
import SignupPage from '../SignupPage';
import { useStore } from '../../lib/store';

vi.mock('../../lib/store');

function renderSignupPage() {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    </ToastProvider>,
  );
}

describe('SignupPage', () => {
  const mockSignInWithOAuth = vi.fn();
  const mockSignInWithMagicLink = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockImplementation((selector: (s: any) => any) => {
      const state = {
        signInWithOAuth: mockSignInWithOAuth,
        signInWithMagicLink: mockSignInWithMagicLink,
        user: null,
      };
      return selector(state);
    });
  });

  it('renders signup page with all elements', () => {
    renderSignupPage();

    expect(screen.getByTestId('signup-join-title')).toBeInTheDocument();
    expect(screen.getByTestId('signup-join-subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.getByTestId('signup-form-title')).toBeInTheDocument();
    expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-send-magic-link')).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByTestId('signup-login-link')).toBeInTheDocument();
  });

  it('sends magic link when email form is submitted', async () => {
    const user = userEvent.setup();
    mockSignInWithMagicLink.mockResolvedValueOnce({});

    renderSignupPage();

    await user.type(screen.getByTestId('signup-email-input'), 'test@example.com');
    await user.click(screen.getByTestId('signup-send-magic-link'));

    await waitFor(() => {
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('test@example.com');
    });
    // Like OneLink: form stays visible, email cleared after success
    expect((screen.getByTestId('signup-email-input') as HTMLInputElement).value).toBe('');
  });

  it('calls signInWithOAuth when Google button is clicked', async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockResolvedValueOnce({});

    renderSignupPage();

    await user.click(screen.getByText(/Continue with Google/i));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
    });
  });
});
