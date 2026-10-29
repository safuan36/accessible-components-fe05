import { describe, it, expect } from 'vitest';
import { parseAIPlanResponse, generateStudyPlan, generateQuizForTask } from '../services/aiService';
import { StudyTask } from '../types';

describe('aiService - Resilient JSON Parser (FE-07)', () => {
  const dummyInput = {
    subject: 'Computer Science',
    topicGoal: 'Graphs & Dynamic Programming',
    targetDate: '2026-11-05',
    dailyHours: 2,
    difficultyPreference: 'balanced' as const
  };

  it('correctly parses clean JSON array', () => {
    const raw = JSON.stringify([
      {
        title: 'Learn BFS',
        description: 'Implement queue traversal',
        estimatedMinutes: 45,
        difficulty: 'medium',
        priority: 'high',
        activeRecall: [{ question: 'What queue is used?', answer: 'FIFO' }]
      }
    ]);

    const tasks = parseAIPlanResponse(raw, dummyInput);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Learn BFS');
    expect(tasks[0].estimatedMinutes).toBe(45);
    expect(tasks[0].difficulty).toBe('medium');
    expect(tasks[0].activeRecall).toHaveLength(1);
  });

  it('handles markdown code fences (```json ... ```)', () => {
    const raw = `\`\`\`json
[
  {
    "title": "Master DFS",
    "description": "Recursion call stack",
    "estimatedMinutes": 30,
    "difficulty": "easy",
    "priority": "medium",
    "activeRecall": [{ "question": "Stack type?", "answer": "LIFO" }]
  }
]
\`\`\``;

    const tasks = parseAIPlanResponse(raw, dummyInput);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Master DFS');
    expect(tasks[0].estimatedMinutes).toBe(30);
  });

  it('extracts JSON array embedded in conversational preamble and postscript', () => {
    const raw = `Here is your customized study plan:
[
  {
    "title": "Solve 0/1 Knapsack",
    "description": "2D table optimization",
    "estimatedMinutes": 60,
    "difficulty": "hard",
    "priority": "high"
  }
]
Let me know if you want any adjustments!`;

    const tasks = parseAIPlanResponse(raw, dummyInput);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Solve 0/1 Knapsack');
    // Verifies activeRecall fallback was synthesized when missing
    expect(tasks[0].activeRecall.length).toBeGreaterThanOrEqual(1);
  });

  it('clamps invalid minutes and assigns safe fallback values', () => {
    const raw = JSON.stringify([
      {
        title: 'Unbounded minutes task',
        estimatedMinutes: 9999, // Should clamp to max 180
        difficulty: 'nonexistent-difficulty', // Should default to medium
        priority: 'invalid-priority' // Should fallback
      }
    ]);

    const tasks = parseAIPlanResponse(raw, dummyInput);
    expect(tasks[0].estimatedMinutes).toBe(180);
    expect(tasks[0].difficulty).toBe('medium');
  });

  it('generates high-fidelity demo study plan reliably', async () => {
    const plan = await generateStudyPlan(dummyInput, { provider: 'demo' });
    expect(plan.id).toBeDefined();
    expect(plan.tasks.length).toBeGreaterThanOrEqual(4);
    expect(plan.providerUsed).toBe('demo');
    expect(plan.totalEstimatedHours).toBeGreaterThan(0);
  });

  it('generates 3-question active recall quiz for a study task', async () => {
    const mockTask: StudyTask = {
      id: 'task-1',
      title: 'Graph Traversal',
      description: 'BFS and DFS comparison',
      subject: 'CS',
      estimatedMinutes: 45,
      difficulty: 'medium',
      priority: 'high',
      completed: false,
      order: 1,
      activeRecall: [
        { id: '1', question: 'Why BFS for shortest path?', answer: 'Explores level by level' },
        { id: '2', question: 'DFS space complexity?', answer: 'O(V) recursion stack' }
      ]
    };

    const questions = await generateQuizForTask(mockTask, { provider: 'demo' });
    expect(questions).toHaveLength(3);
    questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation).toBeTruthy();
    });
  });
});
