import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Brain, Bell, BellOff } from 'lucide-react';
import { StudyTask, TimerMode } from '../types';

interface FocusTimerProps {
  activeTask: StudyTask | null;
  mode: TimerMode;
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  pomodoroCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSelectMode: (mode: TimerMode) => void;
  onOpenRecallForActiveTask: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  activeTask,
  mode,
  secondsRemaining,
  totalSeconds,
  isRunning,
  pomodoroCount,
  soundEnabled,
  onToggleSound,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSelectMode,
  onOpenRecallForActiveTask
}) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;

  // SVG circular progress calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const modeLabels: Record<TimerMode, { title: string; color: string }> = {
    pomodoro: { title: 'Focus Session', color: 'text-indigo-600 dark:text-indigo-400' },
    shortBreak: { title: 'Short Break', color: 'text-emerald-600 dark:text-emerald-400' },
    longBreak: { title: 'Long Rest', color: 'text-sky-600 dark:text-sky-400' }
  };

  const currentModeInfo = modeLabels[mode];

  return (
    <aside
      aria-label="Pomodoro Focus Engine"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
    >
      {/* Mode Selector Tabs */}
      <div
        role="tablist"
        aria-label="Timer session modes"
        className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
      >
        {(
          [
            { key: 'pomodoro', label: 'Focus (25m)' },
            { key: 'shortBreak', label: 'Short Break (5m)' },
            { key: 'longBreak', label: 'Long Break (15m)' }
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={mode === tab.key}
            type="button"
            onClick={() => onSelectMode(tab.key)}
            className={`py-1.5 px-2 rounded-lg text-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              mode === tab.key
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timer Circular Display */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                mode === 'pomodoro'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-emerald-500 dark:text-emerald-400'
              }`}
              fill="transparent"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              role="timer"
              aria-live="off"
              aria-label={`Time remaining: ${minutes} minutes, ${seconds} seconds`}
              className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono"
            >
              {timeFormatted}
            </span>
            <span className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${currentModeInfo.color}`}>
              {currentModeInfo.title}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Cycle #{pomodoroCount + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Active Target Task info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
          Currently Focusing On
        </span>
        {activeTask ? (
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {activeTask.title}
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              {activeTask.subject} • {activeTask.estimatedMinutes}m target
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Select "Focus" on any task below to anchor this session
          </p>
        )}
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={isRunning ? onPause : onStart}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label="Reset timer to full duration"
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip to next session mode"
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Skip to next mode"
        >
          <SkipForward className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute timer sound alerts' : 'Enable timer sound alerts'}
          className={`p-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            soundEnabled
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
          title={soundEnabled ? 'Sound alert enabled' : 'Sound alert muted'}
        >
          {soundEnabled ? <Bell className="w-4 h-4" aria-hidden="true" /> : <BellOff className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>

      {/* Active Recall Consolidation Prompt */}
      {activeTask && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onOpenRecallForActiveTask}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl border border-violet-200 dark:border-violet-800 transition focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <Brain className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Test Active Recall Now</span>
          </button>
        </div>
      )}
    </aside>
  );
};
