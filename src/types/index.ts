export type Difficulty = 'easy' | 'medium' | 'hard';
export type Priority = 'low' | 'medium' | 'high';

export interface ActiveRecallItem {
  id: string;
  question: string;
  answer: string;
  userMastered?: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  subject: string;
  estimatedMinutes: number;
  difficulty: Difficulty;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  activeRecall: ActiveRecallItem[];
  order: number;
}

export interface StudyPlan {
  id: string;
  title: string;
  subject: string;
  targetGoal: string;
  targetDate: string;
  dailyHours: number;
  totalEstimatedHours: number;
  tasks: StudyTask[];
  createdAt: string;
  providerUsed: 'anthropic' | 'gemini' | 'demo';
  aiModel?: string;
}

export type AIProvider = 'demo' | 'anthropic' | 'gemini';

export interface AIProviderConfig {
  provider: AIProvider;
  anthropicKey?: string;
  geminiKey?: string;
  anthropicModel?: string;
  geminiModel?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface TimerSession {
  mode: TimerMode;
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  activeTaskId: string | null;
  completedCycles: number;
}
