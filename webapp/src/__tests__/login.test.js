import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from '../login';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../context/AuthContext');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  analytics: null,
}));

describe('Login Page', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin });
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<Login />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/email/i);
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, message: 'Login successful' });
    
    render(<Login />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toast.success).toHaveBeenCalledWith('Login successful', expect.any(Object));
    });
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockResolvedValueOnce({ success: false, message: errorMessage });
    
    render(<Login />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
    });
  });

  it('shows loading state while logging in', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Login />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
}); 