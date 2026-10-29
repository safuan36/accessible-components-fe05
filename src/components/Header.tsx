import React from 'react';
import { Sparkles, Brain, Settings, Plus, Moon, Sun, Clock, BookOpen } from 'lucide-react';
import { StudyPlan, AIProviderConfig } from '../types';

interface HeaderProps {
  plans: StudyPlan[];
  activePlan: StudyPlan | null;
  onSelectPlan: (planId: string) => void;
  onOpenNewPlanModal: () => void;
  onOpenSettingsModal: () => void;
  aiConfig: AIProviderConfig;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  timerRunning: boolean;
  timerDisplay: string;
}

export const Header: React.FC<HeaderProps> = ({
  plans,
  activePlan,
  onSelectPlan,
  onOpenNewPlanModal,
  onOpenSettingsModal,
  aiConfig,
  darkMode,
  onToggleDarkMode,
  timerRunning,
  timerDisplay
}) => {
  const getProviderBadge = () => {
    switch (aiConfig.provider) {
      case 'anthropic':
        return { label: 'Claude 3.5', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700' };
      case 'gemini':
        return { label: 'Gemini 1.5', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-300 dark:border-blue-700' };
      default:
        return { label: 'Demo Mode (Instant)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700' };
    }
  };

  const badge = getProviderBadge();

  return (
    <>
      {/* WCAG 2.1 AA Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Brain className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  StudyFlow<span className="text-indigo-600 dark:text-indigo-400">.AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Capstone
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Cognitive Micro-Task & Spaced Retrieval Copilot
              </p>
            </div>
          </div>

          {/* Center: Plan Selector & Active Timer Pill */}
          <div className="hidden md:flex items-center gap-3">
            {plans.length > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <label htmlFor="plan-selector" className="sr-only">
                  Select Active Study Plan
                </label>
                <select
                  id="plan-selector"
                  value={activePlan?.id || ''}
                  onChange={(e) => onSelectPlan(e.target.value)}
                  className="text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[240px] truncate"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.subject}: {p.targetGoal}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {timerRunning && (
              <div
                role="status"
                className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-semibold animate-pulse"
                aria-label={`Timer active: ${timerDisplay}`}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Focus: {timerDisplay}</span>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* AI Provider Config Pill */}
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${badge.color}`}
              title="Configure AI Provider (Claude, Gemini, or Demo Mode)"
              aria-label={`AI Engine: ${badge.label}. Click to configure API keys.`}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline font-semibold">{badge.label}</span>
              <Settings className="w-3 h-3 ml-0.5 opacity-70" aria-hidden="true" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" /> : <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />}
            </button>

            {/* New Study Plan CTA */}
            <button
              type="button"
              onClick={onOpenNewPlanModal}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-95"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">New Plan</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
