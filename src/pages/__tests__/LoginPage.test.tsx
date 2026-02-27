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
  useToast: () => ({ addToast: vi.fn() }),
}));

describe('LoginPage', () => {
  const mockSignInWithOAuth = vi.fn();
  const mockSignInWithMagicLink = vi.fn();

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
        signInWithOAuth: mockSignInWithOAuth,
        signInWithMagicLink: mockSignInWithMagicLink,
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
    expect(screen.getByTestId('login-send-magic-link')).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByTestId('login-signup-link')).toBeInTheDocument();
  });

  it('sends magic link when email form is submitted', async () => {
    const user = userEvent.setup();
    mockSignInWithMagicLink.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    await user.type(screen.getByTestId('login-email-input'), 'test@example.com');
    await user.click(screen.getByTestId('login-send-magic-link'));

    await waitFor(() => {
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('test@example.com');
    });
    // Like OneLink: form stays visible, email cleared after success
    expect((screen.getByTestId('login-email-input') as HTMLInputElement).value).toBe('');
  });

  it('calls signInWithOAuth when Google button is clicked', async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    await user.click(screen.getByText(/Continue with Google/i));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('google');
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
