import React from 'react';
import { CheckCircle2, Clock, Flame, Trophy } from 'lucide-react';
import { StudyPlan } from '../types';

interface StatsBarProps {
  plan: StudyPlan;
  filter: 'all' | 'pending' | 'completed' | 'high';
  onFilterChange: (filter: 'all' | 'pending' | 'completed' | 'high') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pomodoroCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  plan,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  pomodoroCount
}) => {
  const totalTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const remainingMinutes = plan.tasks
    .filter((t) => !t.completed)
    .reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const remainingHours = (remainingMinutes / 60).toFixed(1);

  return (
    <section
      aria-label="Study Progress & Productivity Dashboard"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5"
    >
      {/* Top Banner: Goal Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <span>{plan.subject}</span>
            <span>•</span>
            <span>Target: {plan.targetDate}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {plan.targetGoal}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Engineered with <span className="font-semibold text-slate-700 dark:text-slate-300">{plan.aiModel || 'AI Cognitive Engine'}</span> ({plan.providerUsed.toUpperCase()})
          </p>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/80 rounded-lg text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {completedTasks} / {totalTasks}
              </div>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Remaining</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {remainingHours} hrs
              </div>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/80 rounded-lg text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pomodoros</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {pomodoroCount} cycles
              </div>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/80 rounded-lg text-amber-600 dark:text-amber-400">
              <Trophy className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mastery</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {progressPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>Curriculum Mastery Progress</span>
          <span>{progressPercent}% Complete ({completedTasks} of {totalTasks} Micro-Tasks)</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Curriculum completion progress: ${progressPercent} percent`}
          className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter tasks"
          className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl"
        >
          {(
            [
              { key: 'all', label: 'All Tasks' },
              { key: 'pending', label: 'To Do' },
              { key: 'high', label: 'High Priority' },
              { key: 'completed', label: 'Completed' }
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={filter === item.key}
              type="button"
              onClick={() => onFilterChange(item.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                filter === item.key
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <label htmlFor="task-search-input" className="sr-only">
            Search study tasks
          </label>
          <input
            id="task-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks or topics..."
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </section>
  );
};
