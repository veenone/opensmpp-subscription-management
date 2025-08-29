import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { LoadingSpinner, PageLoading, InlineLoading } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Please wait...';
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders without message when not provided', () => {
    render(<LoadingSpinner message="" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});

describe('PageLoading', () => {
  it('renders with default message', () => {
    render(<PageLoading />);
    expect(screen.getByText('Loading page...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Loading dashboard...';
    render(<PageLoading message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});

describe('InlineLoading', () => {
  it('renders with message', () => {
    const message = 'Saving...';
    render(<InlineLoading message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders without message', () => {
    render(<InlineLoading />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});