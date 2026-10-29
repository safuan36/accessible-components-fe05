import { StudyPlan, AIProviderConfig } from '../types';

const STORAGE_KEYS = {
  PLANS: 'studyflow_plans_v1',
  ACTIVE_PLAN_ID: 'studyflow_active_plan_id_v1',
  AI_CONFIG: 'studyflow_ai_config_v1',
  STATS: 'studyflow_stats_v1',
  THEME: 'studyflow_theme_v1',
};

export interface UserStats {
  completedTasksCount: number;
  totalStudyMinutes: number;
  completedPomodoros: number;
  currentStreakDays: number;
  lastActiveDate: string;
}

const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: 'demo',
  anthropicModel: 'claude-3-5-sonnet-20241022',
  geminiModel: 'gemini-1.5-flash'
};

const DEFAULT_STATS: UserStats = {
  completedTasksCount: 0,
  totalStudyMinutes: 0,
  completedPomodoros: 0,
  currentStreakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

// Seed initial study plan so first-time visitors have instant interactive data
export function getInitialSeedPlan(): StudyPlan {
  const today = new Date();
  const target = new Date(today);
  target.setDate(today.getDate() + 7);

  return {
    id: 'seed-plan-algorithms',
    title: 'CS 301: Advanced Data Structures & Algorithm Design',
    subject: 'Computer Science',
    targetGoal: 'Master Graphs, Dynamic Programming & Heaps for Midterm',
    targetDate: target.toISOString().split('T')[0],
    dailyHours: 2.5,
    totalEstimatedHours: 4.1,
    createdAt: new Date().toISOString(),
    providerUsed: 'demo',
    aiModel: 'StudyFlow Cognitive Engine',
    tasks: [
      {
        id: 'seed-task-1',
        title: 'Analyze Graph Traversal: BFS vs DFS & Cycle Detection',
        description: 'Trace recursion trees, implement cycle detection in directed graphs, and solve topological sorting using Kahn algorithm.',
        subject: 'Computer Science',
        estimatedMinutes: 50,
        difficulty: 'medium',
        priority: 'high',
        completed: true,
        order: 1,
        activeRecall: [
          {
            id: 'recall-s1-1',
            question: 'Why does BFS guarantee shortest path in unweighted graphs?',
            answer: 'BFS explores vertices in strictly increasing order of path length from source, visiting all k-distance nodes before any k+1 distance node.'
          },
          {
            id: 'recall-s1-2',
            question: 'How does DFS detect back-edges in a directed graph?',
            answer: 'By maintaining an in-stack recursion state (gray nodes); reaching a node currently in the call stack signifies a cycle.'
          }
        ]
      },
      {
        id: 'seed-task-2',
        title: 'Master Dynamic Programming: 0/1 Knapsack & 1D Space Optimization',
        description: 'Derive DP recurrence relation, construct 2D memoization table, and compress memory to a 1D rolling array.',
        subject: 'Computer Science',
        estimatedMinutes: 60,
        difficulty: 'hard',
        priority: 'high',
        completed: false,
        order: 2,
        activeRecall: [
          {
            id: 'recall-s2-1',
            question: 'What is the recurrence relation for 0/1 Knapsack?',
            answer: 'dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]) when wt[i-1] <= w.'
          },
          {
            id: 'recall-s2-2',
            question: 'Why must 1D space optimization loop capacity backwards?',
            answer: 'Looping backwards prevents using item i more than once by referencing un-updated values from row i-1.'
          }
        ]
      },
      {
        id: 'seed-task-3',
        title: 'Binary Heaps, Priority Queues & Dijkstra Optimization',
        description: 'Implement min-heap percolate-up/down logic and analyze Dijkstra shortest-path with adjacency list and min-heap.',
        subject: 'Computer Science',
        estimatedMinutes: 45,
        difficulty: 'medium',
        priority: 'medium',
        completed: false,
        order: 3,
        activeRecall: [
          {
            id: 'recall-s3-1',
            question: 'What is the time complexity of Dijkstra with a binary heap?',
            answer: 'O((V + E) log V), because each edge relaxation performs a decrease-key/insertion in O(log V).'
          }
        ]
      },
      {
        id: 'seed-task-4',
        title: 'Active Retrieval Practice: 3 Medium Graph & DP Problems',
        description: 'Timed 60-minute mock exam without reference manuals or auto-complete.',
        subject: 'Computer Science',
        estimatedMinutes: 60,
        difficulty: 'hard',
        priority: 'high',
        completed: false,
        order: 4,
        activeRecall: [
          {
            id: 'recall-s4-1',
            question: 'What is the difference between Memoization and Tabulation?',
            answer: 'Memoization is top-down recursion with caching; Tabulation is bottom-up iterative computation avoiding stack overhead.'
          }
        ]
      },
      {
        id: 'seed-task-5',
        title: 'Synthesize Error Journal & Edge Cases Checklist',
        description: 'Document tricky boundary cases: single node graphs, disconnected components, and 0-weight items.',
        subject: 'Computer Science',
        estimatedMinutes: 30,
        difficulty: 'easy',
        priority: 'low',
        completed: false,
        order: 5,
        activeRecall: [
          {
            id: 'recall-s5-1',
            question: 'What 3 edge cases should you always test for tree/graph inputs?',
            answer: 'Empty graph, disconnected components, and graph with negative/zero cycles.'
          }
        ]
      }
    ]
  };
}

export function loadPlans(): StudyPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (!raw) {
      const initial = [getInitialSeedPlan()];
      savePlans(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [getInitialSeedPlan()];
  } catch (err) {
    console.error('Error loading study plans:', err);
    return [getInitialSeedPlan()];
  }
}

export function savePlans(plans: StudyPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch (err) {
    console.error('Error saving study plans:', err);
  }
}

export function loadActivePlanId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID);
}

export function saveActivePlanId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, id);
}

export function loadAIConfig(): AIProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    if (!raw) return DEFAULT_AI_CONFIG;
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAIConfig(config: AIProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving AI config:', err);
  }
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Error saving user stats:', err);
  }
}
