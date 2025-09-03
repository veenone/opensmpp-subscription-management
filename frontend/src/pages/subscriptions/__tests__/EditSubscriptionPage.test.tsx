import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';
import EditSubscriptionPage from '../EditSubscriptionPage';
import { AuthContext } from '../../../contexts/AuthContext';
import { subscriptionApi } from '../../../services/subscriptionService';
import { Subscription } from '../../../types/subscription';

// Mock the subscription service
jest.mock('../../../services/subscriptionService', () => ({
  subscriptionApi: {
    getSubscriptionById: jest.fn(),
  },
}));

// Mock the SubscriptionForm component
jest.mock('../../../components/subscription/SubscriptionForm', () => ({
  SubscriptionForm: ({ open, onClose, onSuccess, subscription, mode }: any) => (
    <div data-testid="subscription-form">
      {open && (
        <div>
          <h3>Subscription Form - {mode} mode</h3>
          <p>Subscription ID: {subscription?.id}</p>
          <button onClick={onClose}>Close</button>
          <button onClick={onSuccess}>Save</button>
        </div>
      )}
    </div>
  ),
}));

const mockSubscription: Subscription = {
  id: '123',
  msisdn: '+1234567890',
  impu: 'sip:1234567890@example.com',
  impi: '1234567890@example.com',
  status: 'ACTIVE',
  displayName: 'Test User',
  email: 'test@example.com',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-02T00:00:00Z',
};

const mockAuthContextValue = {
  user: { id: '1', username: 'testuser', roles: ['admin'] },
  hasPermission: jest.fn().mockReturnValue(true),
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
};

const TestWrapper: React.FC<{ children: React.ReactNode; route?: string }> = ({ 
  children, 
  route = '/subscriptions/123/edit' 
}) => (
  <MemoryRouter initialEntries={[route]}>
    <ThemeProvider theme={theme}>
      <AuthContext.Provider value={mockAuthContextValue}>
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  </MemoryRouter>
);

describe('EditSubscriptionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (subscriptionApi.getSubscriptionById as jest.Mock).mockResolvedValue(mockSubscription);
  });

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading subscription data...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders subscription data after successful fetch', async () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    });

    expect(screen.getByText('Test User (+1234567890)')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(subscriptionApi.getSubscriptionById).toHaveBeenCalledWith(123);
  });

  it('renders error state when subscription not found', async () => {
    (subscriptionApi.getSubscriptionById as jest.Mock).mockRejectedValue({
      status: 404,
      message: 'Not found',
    });

    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Subscription with ID "123" not found/)).toBeInTheDocument();
    });

    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.getByText('View All Subscriptions')).toBeInTheDocument();
  });

  it('renders permission error when user lacks edit permissions', async () => {
    (mockAuthContextValue.hasPermission as jest.Mock).mockReturnValue(false);

    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/You do not have permission to edit subscriptions/)).toBeInTheDocument();
    });
  });

  it('opens subscription form when edit button is clicked', async () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit subscription/i });
    fireEvent.click(editButton);

    expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
    expect(screen.getByText('Subscription Form - edit mode')).toBeInTheDocument();
    expect(screen.getByText('Subscription ID: 123')).toBeInTheDocument();
  });

  it('closes form and refreshes data when form is saved', async () => {
    const updatedSubscription = { ...mockSubscription, displayName: 'Updated User' };
    (subscriptionApi.getSubscriptionById as jest.Mock)
      .mockResolvedValueOnce(mockSubscription)
      .mockResolvedValueOnce(updatedSubscription);

    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test User (+1234567890)')).toBeInTheDocument();
    });

    // Open form
    const editButton = screen.getByRole('button', { name: /edit subscription/i });
    fireEvent.click(editButton);

    // Save form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Verify form is closed and data is refreshed
    await waitFor(() => {
      expect(screen.queryByTestId('subscription-form')).not.toBeInTheDocument();
    });

    expect(subscriptionApi.getSubscriptionById).toHaveBeenCalledTimes(2);
  });

  it('renders breadcrumbs with correct navigation', async () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    });

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Test User (+1234567890)')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('disables edit button when user lacks permissions', async () => {
    (mockAuthContextValue.hasPermission as jest.Mock)
      .mockReturnValue(false)
      .mockReturnValueOnce(true); // Allow initial fetch

    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit subscription/i });
    expect(editButton).toBeDisabled();
  });

  it('handles network errors gracefully', async () => {
    (subscriptionApi.getSubscriptionById as jest.Mock).mockRejectedValue({
      message: 'Network error',
    });

    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load subscription data/)).toBeInTheDocument();
    });
  });

  it('handles invalid subscription ID', () => {
    render(
      <TestWrapper route="/subscriptions//edit">
        <EditSubscriptionPage />
      </TestWrapper>
    );

    expect(screen.getByText(/Subscription ID is required/)).toBeInTheDocument();
  });

  it('maintains responsive design principles', async () => {
    // Mock window.matchMedia for responsive breakpoints
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('xs'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    });

    // On mobile (xs breakpoint), back button should be visible
    expect(screen.getAllByText('Back')).toHaveLength(2); // One in header, one in button group
  });
});

describe('EditSubscriptionPage Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (subscriptionApi.getSubscriptionById as jest.Mock).mockResolvedValue(mockSubscription);
  });

  it('has proper heading hierarchy', async () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Edit Subscription' })).toBeInTheDocument();
    });
  });

  it('provides proper navigation labels', async () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('navigation')).toBeInTheDocument();
    });
  });

  it('has accessible button labels', async () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit subscription/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('provides loading state announcements', () => {
    render(
      <TestWrapper>
        <EditSubscriptionPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading subscription data...')).toBeInTheDocument();
  });
});