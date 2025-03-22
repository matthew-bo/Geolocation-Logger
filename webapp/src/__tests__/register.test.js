import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Register from '../register';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

// Mock dependencies
jest.mock('../../context/AuthContext');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  analytics: null,
}));

describe('Register Page', () => {
  const mockRegisterUser = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ register: mockRegisterUser });
    useRouter.mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('renders register form', () => {
    render(<Register />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<Register />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<Register />);
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'johndoe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign up/i }).closest('form'));
    });

    await waitFor(() => {
      const helperText = screen.getByText('Invalid email address');
      expect(helperText).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    render(<Register />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password456' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/the passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    mockRegisterUser.mockResolvedValueOnce({ success: true, message: 'Registration successful' });
    
    render(<Register />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'johndoe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(toast.success).toHaveBeenCalledWith('Registration successful', expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles registration failure', async () => {
    const errorMessage = 'Email already in use';
    mockRegisterUser.mockResolvedValueOnce({ success: false, message: errorMessage });
    
    render(<Register />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'johndoe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
    });
  });

  it('shows loading state while registering', async () => {
    mockRegisterUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Register />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'johndoe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });
}); 