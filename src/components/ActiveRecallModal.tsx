import React, { useState, useEffect, useRef } from 'react';
import { X, Brain, CheckCircle2, AlertCircle, Trophy, ArrowRight } from 'lucide-react';
import { StudyTask, QuizQuestion, AIProviderConfig } from '../types';
import { generateQuizForTask } from '../services/aiService';
import { useA11y } from './A11yAnnouncer';

interface ActiveRecallModalProps {
  task: StudyTask | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  aiConfig: AIProviderConfig;
}

export const ActiveRecallModal: React.FC<ActiveRecallModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  aiConfig
}) => {
  const { announce } = useA11y();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsLoading(true);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsFinished(false);

      generateQuizForTask(task, aiConfig)
        .then((q) => {
          setQuestions(q);
          announce(`Active recall quiz ready for ${task.title}. 3 questions loaded.`, 'polite');
        })
        .catch((err) => {
          console.error('Quiz loading failed:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen, task, aiConfig, announce]);

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

  if (!isOpen || !task) return null;

  const currentQuestion = questions[currentIndex];
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;
  const currentSelection = selectedAnswers[currentIndex];
  const isCorrect = currentQuestion && hasAnsweredCurrent && currentSelection === currentQuestion.correctIndex;

  const handleSelectOption = (optIndex: number) => {
    if (hasAnsweredCurrent) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));

    const right = optIndex === currentQuestion.correctIndex;
    announce(
      right
        ? 'Correct answer! ' + currentQuestion.explanation
        : 'Incorrect. ' + currentQuestion.explanation,
      'polite'
    );
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      announce('Quiz completed! Review your retention score.', 'polite');
    }
  };

  const score = Object.entries(selectedAnswers).reduce((acc, [idxStr, selected]) => {
    const qIndex = parseInt(idxStr, 10);
    return questions[qIndex]?.correctIndex === selected ? acc + 1 : acc;
  }, 0);

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400">
              <Brain className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="quiz-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Active Retrieval Practice
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {task.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close active recall quiz"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Generating Active Recall Questions...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Synthesizing retrieval prompts tailored to "{task.title}"
              </p>
            </div>
          ) : isFinished ? (
            /* Finished Summary View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-300">
                <Trophy className="w-8 h-8" aria-hidden="true" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Retrieval Session Completed!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  You scored <strong className="text-violet-600 dark:text-violet-400">{score} of {questions.length}</strong> on this session.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                {score === questions.length ? (
                  <p>
                    🌟 <strong>Full Concept Mastery!</strong> Your retrieval performance demonstrates solid synaptic consolidation. Mark this task as done and proceed.
                  </p>
                ) : (
                  <p>
                    💡 <strong>Spaced Reinforcement Opportunity:</strong> Review the questions you missed before moving forward to strengthen long-term memory.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onCompleteTask(task.id);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Task Completed & Exit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFinished(false);
                    setCurrentIndex(0);
                    setSelectedAnswers({});
                  }}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Retry Drill
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            /* Question Active View */
            <div className="space-y-4">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span>
                  {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div
                role="radiogroup"
                aria-label={`Question ${currentIndex + 1}: ${currentQuestion.question}`}
                className="space-y-2 pt-1"
              >
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = currentSelection === optIdx;
                  const isOptionCorrect = optIdx === currentQuestion.correctIndex;

                  let optionStyle =
                    'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80';

                  if (hasAnsweredCurrent) {
                    if (isOptionCorrect) {
                      optionStyle =
                        'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isOptionCorrect) {
                      optionStyle =
                        'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500';
                    } else {
                      optionStyle =
                        'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={hasAnsweredCurrent}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-violet-500 ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              {hasAnsweredCurrent && (
                <div
                  role="region"
                  aria-label="Answer explanation"
                  className={`p-3.5 rounded-xl border text-xs animate-in fade-in duration-200 ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Correct!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Insight & Reinforcement:</span>
                      </>
                    )}
                  </div>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!isFinished && !isLoading && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Exit Quiz
            </button>

            <button
              type="button"
              disabled={!hasAnsweredCurrent}
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <span>{currentIndex === questions.length - 1 ? 'Finish Drill' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
