import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from '../components/TaskCard';
import { StudyTask } from '../types';

describe('TaskCard Component (FE-05 / FE-10 Accessibility & Behavior)', () => {
  const mockTask: StudyTask = {
    id: 'test-task-1',
    title: 'Implement Dijkstra Algorithm',
    description: 'Use adjacency list and min-priority queue.',
    subject: 'Computer Science',
    estimatedMinutes: 50,
    difficulty: 'medium',
    priority: 'high',
    completed: false,
    order: 1,
    activeRecall: [
      {
        id: 'r1',
        question: 'What is Dijkstra time complexity with binary heap?',
        answer: 'O((V + E) log V)'
      }
    ]
  };

  it('renders task details, priority, difficulty, and duration correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        isTimerActive={false}
        onToggleComplete={vi.fn()}
        onStartFocus={vi.fn()}
        onOpenQuiz={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    expect(screen.getByText('Implement Dijkstra Algorithm')).toBeInTheDocument();
    expect(screen.getByText('Use adjacency list and min-priority queue.')).toBeInTheDocument();
    expect(screen.getByText(/high priority/i)).toBeInTheDocument();
    expect(screen.getByText(/50 mins/i)).toBeInTheDocument();
  });

  it('triggers onToggleComplete when checkbox is activated', () => {
    const handleToggle = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        isTimerActive={false}
        onToggleComplete={handleToggle}
        onStartFocus={vi.fn()}
        onOpenQuiz={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const checkBtn = screen.getByRole('button', { name: /mark "implement dijkstra algorithm" as completed/i });
    fireEvent.click(checkBtn);
    expect(handleToggle).toHaveBeenCalledWith('test-task-1');
  });

  it('controls active recall disclosure with proper W3C APG aria attributes', () => {
    render(
      <TaskCard
        task={mockTask}
        isTimerActive={false}
        onToggleComplete={vi.fn()}
        onStartFocus={vi.fn()}
        onOpenQuiz={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const disclosureBtn = screen.getByRole('button', { name: /1 recall concepts/i });
    expect(disclosureBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(disclosureBtn);
    expect(disclosureBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/What is Dijkstra time complexity with binary heap/i)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(disclosureBtn);
    expect(disclosureBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('triggers onStartFocus when Focus button is pressed', () => {
    const handleFocus = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        isTimerActive={false}
        onToggleComplete={vi.fn()}
        onStartFocus={handleFocus}
        onOpenQuiz={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const focusBtn = screen.getByRole('button', { name: /focus on "implement dijkstra algorithm"/i });
    fireEvent.click(focusBtn);
    expect(handleFocus).toHaveBeenCalledWith(mockTask);
  });

  it('requires explicit confirmation before deleting a task', () => {
    const handleDelete = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        isTimerActive={false}
        onToggleComplete={vi.fn()}
        onStartFocus={vi.fn()}
        onOpenQuiz={vi.fn()}
        onDeleteTask={handleDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteBtn);

    // Shows confirmation prompt
    expect(screen.getByText('Delete task?')).toBeInTheDocument();
    expect(handleDelete).not.toHaveBeenCalled();

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);
    expect(handleDelete).toHaveBeenCalledWith('test-task-1');
  });
});
