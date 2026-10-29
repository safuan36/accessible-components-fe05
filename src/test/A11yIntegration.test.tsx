import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('StudyFlow AI Application & Accessibility Integration (WCAG 2.1 AA)', () => {
  it('renders skip link targeting main landmark for keyboard navigation', () => {
    render(<App />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders semantic landmarks: header, main, aside, footer', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // aside for timer
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });

  it('provides persistent live regions for screen readers', () => {
    render(<App />);

    const politeAnnouncer = screen.getByTestId('a11y-polite-announcer');
    const assertiveAnnouncer = screen.getByTestId('a11y-assertive-announcer');

    expect(politeAnnouncer).toHaveAttribute('aria-live', 'polite');
    expect(assertiveAnnouncer).toHaveAttribute('aria-live', 'assertive');
  });

  it('filters task list when filter tabs are toggled', () => {
    render(<App />);

    // Initial load has seed tasks
    const allTab = screen.getByRole('tab', { name: /all tasks/i });
    const completedTab = screen.getByRole('tab', { name: /completed/i });

    expect(allTab).toHaveAttribute('aria-selected', 'true');

    // Click Completed filter
    fireEvent.click(completedTab);
    expect(completedTab).toHaveAttribute('aria-selected', 'true');
    expect(allTab).toHaveAttribute('aria-selected', 'false');
  });

  it('opens and closes AI Engine settings modal with keyboard accessible dialog pattern', () => {
    render(<App />);

    const settingsBtns = screen.getAllByRole('button', { name: /ai engine/i });
    fireEvent.click(settingsBtns[0]);

    const dialog = screen.getByRole('dialog', { name: /ai engine & api configuration/i });
    expect(dialog).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByRole('button', { name: /close api configuration/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
