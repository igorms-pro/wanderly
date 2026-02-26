import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { useStore } from '../../lib/store';

vi.mock('../../lib/store');
vi.mock('../../lib/sentry', () => ({ setSentryUser: vi.fn() }));
vi.mock('../../lib/analytics', () => ({ Analytics: { identify: vi.fn() } }));

const mockNavigate = vi.fn();
const mockLocation = { state: null, pathname: '/login', search: '', hash: '' };
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('LoginPage', () => {
  const mockSignInWithPassword = vi.fn();
  const mockSignInWithOAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as unknown as { getState: () => object }).getState = () => ({
      user: {
        id: '1',
        email: 'test@example.com',
        display_name: 'Test',
        avatar_url: '',
        created_at: '',
      },
    });
    (useStore as any).mockImplementation((selector: (s: any) => any) => {
      const state = {
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: mockSignInWithOAuth,
      };
      return selector(state);
    });
  });

  it('renders login page with all elements', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('login-welcome-title')).toBeInTheDocument();
    expect(screen.getByTestId('login-welcome-subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('login-form-title')).toBeInTheDocument();
    expect(screen.getByTestId('login-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('login-signup-link')).toBeInTheDocument();
  });

  it('renders Google OAuth button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    // Facebook commenté en attendant vérif app FB
  });

  it('allows user to enter email and password', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'newpassword');

    expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
    expect((passwordInput as HTMLInputElement).value).toBe('newpassword');
  });

  it('submits form and navigates to dashboard when sign-in succeeds', async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    await user.type(screen.getByTestId('login-email-input'), 'test@example.com');
    await user.type(screen.getByTestId('login-password-input'), 'password');
    await user.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows error when sign-in fails', async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValueOnce({ error: 'Invalid credentials' });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    await user.type(screen.getByTestId('login-email-input'), 'test@example.com');
    await user.type(screen.getByTestId('login-password-input'), 'password');
    await user.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error-message')).toHaveTextContent('Invalid credentials');
    });
  });

  it('shows success message when provided', () => {
    (mockLocation as any).state = { message: 'Account created successfully!' };

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('login-success-message')).toBeInTheDocument();
    expect(screen.getByText('Account created successfully!')).toBeInTheDocument();

    (mockLocation as any).state = null;
  });
});
