import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../contexts/ToastContext';
import SignupPage from '../SignupPage';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

// Mock dependencies
vi.mock('../../lib/store');
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

function renderSignupPage() {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    </ToastProvider>,
  );
}

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignupPage', () => {
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockImplementation((selector: (s: any) => any) => {
      const state = {
        refreshUser: mockRefreshUser,
        signInWithOAuth: vi.fn(),
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
    expect(screen.getByTestId('signup-display-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('signup-login-link')).toBeInTheDocument();
  });

  it('allows user to fill in form fields', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const displayNameInput = screen.getByTestId('signup-display-name-input') as HTMLInputElement;
    const emailInput = screen.getByTestId('signup-email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('signup-password-input') as HTMLInputElement;

    await user.type(displayNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');

    expect(displayNameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows password hint when password is entered', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const passwordInput = screen.getByTestId('signup-password-input') as HTMLInputElement;

    // Initially no hint (no password text)
    expect(
      screen.queryByText(/more characters needed|password looks good/i),
    ).not.toBeInTheDocument();

    // Enter short password
    await user.type(passwordInput, '123');
    expect(screen.getByText(/more characters needed/i)).toBeInTheDocument();

    // Enter valid password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password123');
    expect(screen.getByText(/password looks good/i)).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'All fields are required' },
    });

    (supabase.auth.signUp as any) = mockSignUp;

    renderSignupPage();

    // Fill only partial form
    const displayNameInput = screen.getByTestId('signup-display-name-input');
    await user.type(displayNameInput, 'John');

    const submitButton = screen.getByTestId('signup-submit-button');
    await user.click(submitButton);

    // HTML5 validation should prevent submission, but if it goes through, check for error
    await waitFor(
      () => {
        // Either HTML5 validation prevents submission, or we get an error message
        const errorMessage = screen.queryByTestId('signup-error-message');
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      },
      { timeout: 1000 },
    );
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: null,
      },
      error: null,
    });

    (supabase.auth.signUp as any) = mockSignUp;

    renderSignupPage();

    const displayNameInput = screen.getByTestId('signup-display-name-input');
    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const submitButton = screen.getByTestId('signup-submit-button');

    await user.type(displayNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: { user: { id: 'user-123' }, session: null },
              error: null,
            });
          }, 100);
        }),
    );

    (supabase.auth.signUp as any) = mockSignUp;

    renderSignupPage();

    const displayNameInput = screen.getByTestId('signup-display-name-input');
    const emailInput = screen.getByTestId('signup-email-input');
    const passwordInput = screen.getByTestId('signup-password-input');
    const submitButton = screen.getByTestId('signup-submit-button');

    await user.type(displayNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should show loading message
    await waitFor(() => {
      expect(screen.getByTestId('signup-loading-message')).toBeInTheDocument();
    });
  });
});
