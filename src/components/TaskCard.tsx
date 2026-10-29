import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  HelpCircle,
  Trash2,
  Brain
} from 'lucide-react';
import { StudyTask } from '../types';

interface TaskCardProps {
  task: StudyTask;
  isTimerActive: boolean;
  onToggleComplete: (taskId: string) => void;
  onStartFocus: (task: StudyTask) => void;
  onOpenQuiz: (task: StudyTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isTimerActive,
  onToggleComplete,
  onStartFocus,
  onOpenQuiz,
  onDeleteTask
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'hard':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'medium':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'high':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const recallRegionId = `task-recall-${task.id}`;

  return (
    <article
      aria-labelledby={`task-title-${task.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
        task.completed
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
          : isTimerActive
          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Checkbox Trigger */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as completed`}
          className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-0.5"
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/50" />
          ) : (
            <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500" />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority} Priority
            </span>

            <span
              className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                task.difficulty
              )}`}
            >
              {task.difficulty}
            </span>

            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {task.estimatedMinutes} mins
            </span>

            {isTimerActive && (
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-300 dark:border-indigo-800 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Active Focus Session
              </span>
            )}
          </div>

          <h2
            id={`task-title-${task.id}`}
            className={`text-base font-bold tracking-tight text-slate-900 dark:text-white ${
              task.completed ? 'line-through text-slate-500 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {task.description}
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              {/* Pomodoro Action */}
              <button
                type="button"
                onClick={() => onStartFocus(task)}
                aria-label={isTimerActive ? 'Task currently active in timer' : `Focus on "${task.title}" with Pomodoro Timer`}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isTimerActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{isTimerActive ? 'Focusing Now' : 'Focus (25m)'}</span>
              </button>

              {/* Active Recall Quiz Button */}
              <button
                type="button"
                onClick={() => onOpenQuiz(task)}
                aria-label={`Test retention for "${task.title}" with 3-question active recall`}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Brain className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Active Recall Quiz</span>
              </button>

              {/* Recall Concept Disclosure Button */}
              {task.activeRecall.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-expanded={isExpanded}
                  aria-controls={recallRegionId}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{task.activeRecall.length} Recall Concepts</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>

            {/* Delete Trigger */}
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                  <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300 px-1">
                    Delete task?
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 px-1.5 py-1 focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label={`Delete task "${task.title}"`}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Expandable Active Recall Details (W3C APG Disclosure Pattern) */}
          {isExpanded && (
            <div
              id={recallRegionId}
              role="region"
              aria-label={`Active recall concepts for ${task.title}`}
              className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Spaced Retrieval Self-Test Prompts</span>
              </div>
              <ul className="space-y-2 text-xs">
                {task.activeRecall.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800"
                  >
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Q{idx + 1}: {item.question}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 pl-2 border-l-2 border-indigo-400">
                      Answer: {item.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
