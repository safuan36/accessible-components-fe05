import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { AIProviderConfig, StudyPlan } from '../types';
import { generateStudyPlan, PlanGenerationInput } from '../services/aiService';

interface PlanGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (newPlan: StudyPlan) => void;
  aiConfig: AIProviderConfig;
  onOpenSettings: () => void;
}

const PRESETS = [
  {
    label: 'CS: Algorithms & Complexity',
    subject: 'Computer Science',
    topicGoal: 'Graphs, Dynamic Programming & Heap Optimization for Midterm',
    hours: 2.5,
    difficulty: 'balanced' as const
  },
  {
    label: 'AI/ML: Deep Learning Foundations',
    subject: 'Machine Learning',
    topicGoal: 'Backpropagation, Transformer Attention & Loss Convergence',
    hours: 3.0,
    difficulty: 'rigorous' as const
  },
  {
    label: 'Web Dev: React 19 & TypeScript',
    subject: 'Software Engineering',
    topicGoal: 'Server Components, Accessible WAI-ARIA Dialogs & State Architecture',
    hours: 2.0,
    difficulty: 'balanced' as const
  },
  {
    label: 'Biology: Cellular Respiration & Genetics',
    subject: 'Molecular Biology',
    topicGoal: 'Krebs Cycle, ATP Synthase Mechanism & Mendelian Genetics',
    hours: 2.0,
    difficulty: 'balanced' as const
  }
];

export const PlanGeneratorModal: React.FC<PlanGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
  aiConfig,
  onOpenSettings
}) => {
  const [subject, setSubject] = useState('');
  const [topicGoal, setTopicGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2.5);
  const [difficultyPreference, setDifficultyPreference] = useState<'balanced' | 'rigorous' | 'beginner'>('balanced');
  const [notesOrSyllabus, setNotesOrSyllabus] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Set default target date to 7 days in the future
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setTargetDate(d.toISOString().split('T')[0]);
      setErrorMessage(null);

      // Focus first input
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector('input') as HTMLElement;
        firstInput?.focus();
      }, 50);
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Focus trap & Escape dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Animated loading step ticker
  useEffect(() => {
    if (!isLoading) return;
    const intervals = [
      setTimeout(() => setLoadingStep(1), 300),
      setTimeout(() => setLoadingStep(2), 700),
      setTimeout(() => setLoadingStep(3), 1100)
    ];
    return () => intervals.forEach(clearTimeout);
  }, [isLoading]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setSubject(preset.subject);
    setTopicGoal(preset.topicGoal);
    setDailyHours(preset.hours);
    setDifficultyPreference(preset.difficulty);
    setErrorMessage(null);
  };

  const handleGenerate = async (overrideWithDemo = false) => {
    if (!subject.trim() || !topicGoal.trim()) {
      setErrorMessage('Please provide both a subject/course and your learning goal.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    setErrorMessage(null);

    const input: PlanGenerationInput = {
      subject: subject.trim(),
      topicGoal: topicGoal.trim(),
      targetDate: targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      dailyHours,
      difficultyPreference,
      notesOrSyllabus: notesOrSyllabus.trim() || undefined
    };

    const effectiveConfig: AIProviderConfig = overrideWithDemo
      ? { ...aiConfig, provider: 'demo' }
      : aiConfig;

    try {
      const plan = await generateStudyPlan(input, effectiveConfig);
      onPlanCreated(plan);
      onClose();
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate study plan. Please verify your connection or switch to Demo Mode.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-modal-title"
        aria-describedby="plan-modal-desc"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="plan-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Generate AI Study Plan
              </h2>
              <p id="plan-modal-desc" className="text-xs text-slate-500 dark:text-slate-400">
                Cognitive task chunking & active recall question generator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
              ⚡ Quick Starters:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-subject" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject or Course Name *
              </label>
              <input
                id="input-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science, Molecular Biology"
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="input-target-date" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Exam / Submission Date *
              </label>
              <input
                id="input-target-date"
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-topic-goal" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Learning Goal / Exam Topics / Assignment Prompt *
            </label>
            <textarea
              id="input-topic-goal"
              required
              rows={2}
              value={topicGoal}
              onChange={(e) => setTopicGoal(e.target.value)}
              placeholder="e.g. Master Graph traversals, Dynamic Programming, and Heap algorithms for the upcoming midterm exam."
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Daily hours & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="input-daily-hours" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Daily Study Time:
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {dailyHours} hrs / day
                </span>
              </div>
              <input
                id="input-daily-hours"
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cognitive Pacing:
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['beginner', 'balanced', 'rigorous'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyPreference(diff)}
                    className={`text-xs font-semibold py-2 rounded-xl capitalize transition border ${
                      difficultyPreference === diff
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label htmlFor="input-syllabus-notes" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Optional: Paste syllabus outline, textbook chapters, or lecture notes
            </label>
            <textarea
              id="input-syllabus-notes"
              rows={2}
              value={notesOrSyllabus}
              onChange={(e) => setNotesOrSyllabus(e.target.value)}
              placeholder="Paste specific topics, professor guidelines, or textbook chapters to customize the plan..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Error Banner with safe recovery (FE-07) */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                className="shrink-0 font-bold underline hover:no-underline text-rose-900 dark:text-rose-100"
              >
                Use Demo Simulator
              </button>
            </div>
          )}

          {/* Provider status bar */}
          <div className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-600 dark:text-slate-400">
              Active AI Engine:{' '}
              <strong className="text-slate-900 dark:text-white capitalize">
                {aiConfig.provider === 'anthropic'
                  ? 'Anthropic Claude 3.5'
                  : aiConfig.provider === 'gemini'
                  ? 'Google Gemini 1.5'
                  : 'High-Fidelity Demo (Instant)'}
              </strong>
            </span>
            <button
              type="button"
              onClick={onOpenSettings}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Change Key / Provider
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div
            aria-live="polite"
            className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2"
          >
            {isLoading && (
              <>
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {loadingStep === 0 && 'Analyzing topic & cognitive pacing...'}
                  {loadingStep === 1 && 'Decomposing into actionable micro-tasks...'}
                  {loadingStep >= 2 && 'Synthesizing active-recall questions...'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <span>Generating Plan...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Build Curriculum</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
