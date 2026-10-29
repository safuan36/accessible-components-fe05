import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FocusTimer } from '../components/FocusTimer';
import { A11yProvider } from '../components/A11yAnnouncer';
import { StudyTask } from '../types';

describe('FocusTimer Component (W3C APG Accessible Timer)', () => {
  const mockTask: StudyTask = {
    id: 'timer-task-1',
    title: 'Dynamic Programming Memoization',
    description: 'Solve Fibonacci & LCS',
    subject: 'Algorithms',
    estimatedMinutes: 45,
    difficulty: 'medium',
    priority: 'high',
    completed: false,
    order: 1,
    activeRecall: []
  };

  const renderTimer = (props: Partial<React.ComponentProps<typeof FocusTimer>> = {}) => {
    return render(
      <A11yProvider>
        <FocusTimer
          activeTask={mockTask}
          mode="pomodoro"
          secondsRemaining={1500}
          totalSeconds={1500}
          isRunning={false}
          pomodoroCount={2}
          soundEnabled={true}
          onToggleSound={vi.fn()}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onReset={vi.fn()}
          onSkip={vi.fn()}
          onSelectMode={vi.fn()}
          onOpenRecallForActiveTask={vi.fn()}
          {...props}
        />
      </A11yProvider>
    );
  };

  it('renders time formatted in MM:SS and displays active task', () => {
    renderTimer({ secondsRemaining: 1500 });
    const timerElem = screen.getByRole('timer');
    expect(timerElem).toHaveTextContent('25:00');
    expect(screen.getByText('Dynamic Programming Memoization')).toBeInTheDocument();
    expect(screen.getByText(/cycle #3/i)).toBeInTheDocument();
  });

  it('renders accessible start button when paused and pause button when running', () => {
    const handleStart = vi.fn();
    const handlePause = vi.fn();

    const { rerender } = renderTimer({ isRunning: false, onStart: handleStart });
    const startBtn = screen.getByRole('button', { name: /start timer/i });
    fireEvent.click(startBtn);
    expect(handleStart).toHaveBeenCalled();

    rerender(
      <A11yProvider>
        <FocusTimer
          activeTask={mockTask}
          mode="pomodoro"
          secondsRemaining={1499}
          totalSeconds={1500}
          isRunning={true}
          pomodoroCount={2}
          soundEnabled={true}
          onToggleSound={vi.fn()}
          onStart={handleStart}
          onPause={handlePause}
          onReset={vi.fn()}
          onSkip={vi.fn()}
          onSelectMode={vi.fn()}
          onOpenRecallForActiveTask={vi.fn()}
        />
      </A11yProvider>
    );

    const pauseBtn = screen.getByRole('button', { name: /pause timer/i });
    fireEvent.click(pauseBtn);
    expect(handlePause).toHaveBeenCalled();
  });

  it('allows switching timer mode via tablist', () => {
    const handleSelectMode = vi.fn();
    renderTimer({ onSelectMode: handleSelectMode });

    const shortBreakTab = screen.getByRole('tab', { name: /short break/i });
    fireEvent.click(shortBreakTab);
    expect(handleSelectMode).toHaveBeenCalledWith('shortBreak');
  });

  it('calls onReset when reset button is pressed', () => {
    const handleReset = vi.fn();
    renderTimer({ onReset: handleReset });

    const resetBtn = screen.getByRole('button', { name: /reset timer/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
