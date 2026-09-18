import React, { useState, useEffect } from 'react';
import { SingleChoiceQuestion } from '../types';
import { sfx } from '../utils/audio';
import { Check, X, RotateCcw, HelpCircle, ArrowRight, Award, AlertCircle, ShieldAlert } from 'lucide-react';
import { getCurrentUser, saveTemporaryAnswer, getTemporaryAnswer, clearTemporaryAnswer } from '../utils/authStore';

interface QuizSingleChoiceProps {
  questions: SingleChoiceQuestion[];
  onComplete: (score: number, rawCorrect?: number, totalQuestions?: number) => void;
  passPercentage?: number;
  successMessage?: string;
  failMessage?: string;
}

export const QuizSingleChoice: React.FC<QuizSingleChoiceProps> = ({
  questions,
  onComplete,
  passPercentage = 80,
  successMessage = "Selamat, misi berhasil! Kamu telah menyelesaikan tantangan ini.",
  failMessage = "Pengerjaan kuis telah selesai dicatat! Kamu dapat mengulangi jika ingin nilai sempurna atau langsung melanjutkan ke level berikutnya di peta."
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [sessionAlert, setSessionAlert] = useState<string | null>(null);

  // Restore cached progress if user was interrupted or forced to login
  useEffect(() => {
    const cached = getTemporaryAnswer('quiz_single_choice');
    if (cached) {
      if (cached.selectedAnswers) {
        setSelectedAnswers(cached.selectedAnswers);
      }
      if (typeof cached.currentIdx === 'number' && cached.currentIdx < questions.length) {
        setCurrentIdx(cached.currentIdx);
        if (cached.selectedAnswers && cached.selectedAnswers[cached.currentIdx] !== undefined) {
          setIsAnswered(true);
        }
      }
    }
  }, [questions.length]);

  const currentQ = questions[currentIdx];
  const correctAnswer = currentQ?.answers[0]; // In H5P SingleChoiceSet, answers[0] is the correct answer

  // Shuffle answers per question deterministically or preserve them
  const [shuffledOptions, setShuffledOptions] = React.useState<Record<number, string[]>>({});

  React.useEffect(() => {
    const map: Record<number, string[]> = {};
    questions.forEach((q, idx) => {
      const copy = [...q.answers];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = (i * 7 + idx * 13) % (i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      map[idx] = copy;
    });
    setShuffledOptions(map);
  }, [questions]);

  const handleSelectOption = (ans: string) => {
    if (isAnswered) return;

    // Requirement: Check session login first before answering
    const user = getCurrentUser();
    if (!user) {
      saveTemporaryAnswer('quiz_single_choice', {
        currentIdx,
        selectedAnswers: { ...selectedAnswers, [currentIdx]: ans },
        timestamp: Date.now()
      });
      setSessionAlert('Sesi tidak aktif! Jawaban sementara Anda disimpan. Silakan masuk akun terlebih dahulu.');
      window.dispatchEvent(new CustomEvent('biovillage:require_login'));
      return;
    }

    const isCorrect = ans.trim() === correctAnswer.trim();
    if (isCorrect) {
      sfx.playCorrect();
    } else {
      sfx.playWrong();
    }

    const updated = { ...selectedAnswers, [currentIdx]: ans };
    setSelectedAnswers(updated);
    setIsAnswered(true);

    // Save temporary state so in-progress quiz is safe
    saveTemporaryAnswer('quiz_single_choice', {
      currentIdx,
      selectedAnswers: updated,
      timestamp: Date.now()
    });
  };

  const handleNext = () => {
    sfx.playClick();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsAnswered(selectedAnswers[currentIdx + 1] !== undefined);
    } else {
      // Show summary
      calculateFinalResults();
    }
  };

  const calculateFinalResults = () => {
    setShowSummary(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx]?.trim() === q.answers[0].trim()) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    if (percent >= passPercentage) {
      sfx.playStageComplete();
    }
  };

  const handleRetry = () => {
    sfx.playClick();
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsAnswered(false);
    setShowSummary(false);
    setShowSolutions(false);
  };

  // Calculate score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx]?.trim() === q.answers[0].trim()) {
      correctCount++;
    }
  });
  const percentScore = Math.round((correctCount / questions.length) * 100);
  const isPassed = percentScore >= passPercentage;

  if (showSummary) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200/80 shadow-xl max-w-2xl mx-auto flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
          isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {isPassed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
        </div>

        <h3 className="text-2xl font-bold font-fredoka text-slate-800 mb-1">
          {isPassed ? "Tantangan Selesai!" : "Perlu Berlatih Lagi"}
        </h3>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          {isPassed ? successMessage : failMessage}
        </p>

        {/* Score Badge */}
        <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 mb-6">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Jawaban Benar</span>
            <span className="text-2xl font-extrabold text-emerald-600">
              {correctCount} / {questions.length}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Skor Akhir</span>
            <span className={`text-2xl font-extrabold ${isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {percentScore}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={handleRetry}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Kuis</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSolutions(!showSolutions)}
            className="px-5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showSolutions ? "Sembunyikan Solusi" : "Lihat Kunci Jawaban"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearTemporaryAnswer('quiz_single_choice');
              onComplete(percentScore, correctCount, questions.length);
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <span>{isPassed ? "Lanjut & Buka Level Peta" : "Selesai Mengerjakan & Buka Level Peta"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Solutions List */}
        {showSolutions && (
          <div className="mt-8 text-left w-full border-t border-slate-200 pt-6 space-y-4 max-h-[360px] overflow-y-auto pr-2">
            <h4 className="font-bold text-slate-800 text-sm">Daftar Solusi Pertanyaan:</h4>
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isUserCorrect = userAns?.trim() === q.answers[0].trim();

              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-800 mb-1.5">
                    {idx + 1}. {q.question.replace(/<[^>]+>/g, '')}
                  </p>
                  <p className="text-emerald-700 font-bold">
                    ✓ Kunci: {q.answers[0].replace(/<[^>]+>/g, '')}
                  </p>
                  {userAns && !isUserCorrect && (
                    <p className="text-red-600 mt-0.5">
                      ✗ Jawabanmu: {userAns.replace(/<[^>]+>/g, '')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const options = shuffledOptions[currentIdx] || currentQ.answers;
  const userAnswer = selectedAnswers[currentIdx];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border-4 border-amber-200/80 shadow-xl max-w-2xl mx-auto flex flex-col gap-6">
      {/* Question Header & Progress */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
          Pertanyaan {currentIdx + 1} dari {questions.length}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-32 sm:w-44 h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed font-fredoka">
        <span dangerouslySetInnerHTML={{ __html: currentQ.question }} />
      </div>

      {/* Answer Options */}
      <div className="flex flex-col gap-3">
        {options.map((opt, optIdx) => {
          const cleanOpt = opt.replace(/<[^>]+>/g, '').trim();
          const cleanCorrect = correctAnswer.replace(/<[^>]+>/g, '').trim();
          const cleanUser = userAnswer?.replace(/<[^>]+>/g, '').trim();

          let btnStyle = "border-slate-200 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-300 text-slate-800";
          let icon = null;

          if (isAnswered) {
            if (cleanOpt === cleanCorrect) {
              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400";
              icon = <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
            } else if (cleanOpt === cleanUser) {
              btnStyle = "border-red-400 bg-red-50 text-red-900 line-through ring-2 ring-red-300";
              icon = <X className="w-5 h-5 text-red-500 flex-shrink-0" />;
            } else {
              btnStyle = "border-slate-200 bg-slate-50/50 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-sm sm:text-base cursor-pointer active:scale-[0.99] ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/80 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 flex-shrink-0 shadow-xs">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span dangerouslySetInnerHTML={{ __html: opt }} />
              </div>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span className="text-xs text-slate-500 font-medium">
          {isAnswered
            ? (userAnswer?.trim() === correctAnswer.trim() ? "✨ Jawabanmu benar!" : "⚠️ Jawaban belum tepat.")
            : "Pilih salah satu jawaban di atas"}
        </span>

        {isAnswered && (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer active:scale-95 transition-transform"
          >
            <span>{currentIdx < questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil Kuis"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
