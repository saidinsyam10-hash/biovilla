import React, { useState, useEffect } from 'react';
import { MultiChoiceQuestion } from '../types';
import { sfx } from '../utils/audio';
import { Check, X, RotateCcw, HelpCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { getCurrentUser, saveTemporaryAnswer, getTemporaryAnswer, clearTemporaryAnswer } from '../utils/authStore';

interface QuizMultiChoiceProps {
  question: MultiChoiceQuestion;
  onAnswerSubmit: (isCorrect: boolean) => void;
  nextButtonLabel?: string;
}

export const QuizMultiChoice: React.FC<QuizMultiChoiceProps> = ({
  question,
  onAnswerSubmit,
  nextButtonLabel = "Lanjut"
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const questionKey = question.id || question.question;
  const cacheKey = `quiz_mc_${question.id || 'current'}`;

  // Reset state whenever the question changes to ensure clean slate
  useEffect(() => {
    setSelectedIdx(null);
    setHasChecked(false);
    setShowSolution(false);

    // Restore cached answer for this specific question if exists
    const cached = getTemporaryAnswer(cacheKey);
    if (cached && typeof cached.selectedIdx === 'number') {
      setSelectedIdx(cached.selectedIdx);
    }
  }, [questionKey, cacheKey]);

  const handleOptionClick = (idx: number) => {
    if (hasChecked) return;
    sfx.playClick();
    setSelectedIdx(idx);
    saveTemporaryAnswer(cacheKey, { selectedIdx: idx });
  };

  const handleCheck = () => {
    if (selectedIdx === null) return;

    // Check session login first before answering
    const user = getCurrentUser();
    if (!user) {
      saveTemporaryAnswer(cacheKey, { selectedIdx });
      window.dispatchEvent(new CustomEvent('biovillage:require_login'));
      return;
    }

    const isCorrect = question.options[selectedIdx]?.correct ?? false;
    if (isCorrect) {
      sfx.playCorrect();
    } else {
      sfx.playWrong();
    }
    setHasChecked(true);
  };

  const handleRetry = () => {
    sfx.playClick();
    setSelectedIdx(null);
    setHasChecked(false);
    setShowSolution(false);
    clearTemporaryAnswer(cacheKey);
  };

  const isCurrentCorrect = selectedIdx !== null && Boolean(question.options[selectedIdx]?.correct);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border-4 border-amber-200/80 shadow-xl max-w-2xl mx-auto flex flex-col gap-6">
      {/* Question Prompt */}
      <div 
        className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed font-fredoka border-b border-slate-200 pb-4"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />

      {/* Options List */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isOptCorrect = opt.correct;

          let btnClass = "border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800";
          let badge = null;

          if (hasChecked) {
            if (isOptCorrect && (isCurrentCorrect || showSolution)) {
              btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400";
              badge = (
                <span className="flex items-center gap-1 text-emerald-700 text-xs font-black bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {showSolution && !isCurrentCorrect ? "Kunci Jawaban" : "Benar"}
                </span>
              );
            } else if (isSelected && !isOptCorrect) {
              btnClass = "border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-300";
              badge = (
                <span className="flex items-center gap-1 text-rose-700 text-xs font-black bg-rose-100/90 border border-rose-300 px-2.5 py-1 rounded-lg">
                  <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  Salah
                </span>
              );
            } else {
              btnClass = "border-slate-200 bg-slate-50/50 text-slate-400 opacity-60";
            }
          } else if (isSelected) {
            btnClass = "border-amber-400 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400 shadow-sm";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasChecked}
              onClick={() => handleOptionClick(idx)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-sm sm:text-base cursor-pointer active:scale-[0.99] ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/90 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 flex-shrink-0 shadow-xs">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span dangerouslySetInnerHTML={{ __html: opt.text }} />
              </div>
              {badge}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback Banner (Only visible AFTER answering) */}
      {hasChecked && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 border transition-all ${
            isCurrentCorrect
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-amber-50 text-amber-950 border-amber-300'
          }`}
        >
          {isCurrentCorrect ? (
            <>
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Jawabanmu Tepat!</strong> Kamu telah memahami refleksi nilai dan harmoni organel sel dengan sangat baik.
              </span>
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Jawaban belum tepat.</strong> Silakan klik <em>Coba Lagi</em> untuk memilih kembali, atau klik <em>Kunci Jawaban</em> untuk melihat jawaban yang benar.
              </span>
            </>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {hasChecked && !isCurrentCorrect && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
          )}

          {hasChecked && !isCurrentCorrect && (
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showSolution ? "Sembunyikan Kunci" : "Kunci Jawaban"}</span>
            </button>
          )}
        </div>

        <div>
          {!hasChecked ? (
            <button
              type="button"
              disabled={selectedIdx === null}
              onClick={handleCheck}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                selectedIdx !== null
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                clearTemporaryAnswer(cacheKey);
                onAnswerSubmit(Boolean(isCurrentCorrect));
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <span>{nextButtonLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
