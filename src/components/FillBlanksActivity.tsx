import React, { useState, useMemo } from 'react';
import { sfx } from '../utils/audio';
import { Check, X, RotateCcw, HelpCircle, ArrowRight, FileCheck } from 'lucide-react';

interface FillBlanksActivityProps {
  rawText: string;
  onComplete: () => void;
  isAlreadyCleared?: boolean;
}

interface BlankPart {
  type: 'text' | 'blank';
  content: string;
  index?: number;
  expectedAnswer?: string;
}

export const FillBlanksActivity: React.FC<FillBlanksActivityProps> = ({
  rawText,
  onComplete,
  isAlreadyCleared = false
}) => {
  // Parse text containing *answer* patterns
  const { parts, blankAnswers } = useMemo(() => {
    const list: BlankPart[] = [];
    const answers: string[] = [];
    const regex = /\*([^*]+)\*/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let blankCount = 0;

    while ((match = regex.exec(rawText)) !== null) {
      if (match.index > lastIdx) {
        list.push({
          type: 'text',
          content: rawText.substring(lastIdx, match.index)
        });
      }
      const ans = match[1].trim();
      answers.push(ans);
      list.push({
        type: 'blank',
        content: '',
        index: blankCount,
        expectedAnswer: ans
      });
      blankCount++;
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < rawText.length) {
      list.push({
        type: 'text',
        content: rawText.substring(lastIdx)
      });
    }

    return { parts: list, blankAnswers: answers };
  }, [rawText]);

  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [hasChecked, setHasChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Provide word bank chips for easier input & accessibility
  const wordBank = useMemo(() => {
    return Array.from(new Set(blankAnswers)).sort();
  }, [blankAnswers]);

  const handleInputChange = (idx: number, val: string) => {
    if (hasChecked) return;
    setInputs(prev => ({ ...prev, [idx]: val }));
  };

  const handleInsertWord = (word: string) => {
    if (hasChecked) return;
    sfx.playClick();
    let targetIdx = focusedIndex;
    if (targetIdx === null || inputs[targetIdx]?.trim() !== '') {
      // Find first empty blank
      const firstEmpty = blankAnswers.findIndex((_, i) => !inputs[i] || inputs[i].trim() === '');
      targetIdx = firstEmpty !== -1 ? firstEmpty : 0;
    }
    setInputs(prev => ({ ...prev, [targetIdx!]: word }));
  };

  const handleCheck = () => {
    setHasChecked(true);
    let allCorrect = true;
    blankAnswers.forEach((ans, i) => {
      const user = inputs[i]?.trim().toLowerCase();
      if (user !== ans.trim().toLowerCase()) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      sfx.playCorrect();
    } else {
      sfx.playWrong();
    }
  };

  const handleRetry = () => {
    sfx.playClick();
    setInputs({});
    setHasChecked(false);
    setShowSolution(false);
  };

  const handleToggleSolution = () => {
    sfx.playClick();
    if (!showSolution) {
      const solved: Record<number, string> = {};
      blankAnswers.forEach((ans, i) => {
        solved[i] = ans;
      });
      setInputs(solved);
      setShowSolution(true);
      setHasChecked(true);
    } else {
      setShowSolution(false);
    }
  };

  let correctCount = 0;
  blankAnswers.forEach((ans, i) => {
    if (inputs[i]?.trim().toLowerCase() === ans.trim().toLowerCase()) {
      correctCount++;
    }
  });
  const allCorrect = correctCount === blankAnswers.length;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border-4 border-amber-200/80 shadow-xl max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xl font-bold font-fredoka text-emerald-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            Laporan Investigasi Krisis Desa Sel
          </h4>
          <p className="text-xs sm:text-sm text-slate-600">
            Lengkapi bagian yang kosong dengan nama organel atau istilah yang tepat.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          {Object.keys(inputs).filter(k => inputs[Number(k)]?.trim()).length} / {blankAnswers.length} Terisi
        </span>
      </div>

      {/* Word Bank */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex flex-col gap-2">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
          Bank Kata Pilihan (Klik untuk Memasukkan):
        </span>
        <div className="flex flex-wrap gap-2">
          {wordBank.map((word, wIdx) => (
            <button
              key={wIdx}
              type="button"
              disabled={hasChecked}
              onClick={() => handleInsertWord(word)}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/80 text-xs font-bold text-slate-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              + {word}
            </button>
          ))}
        </div>
      </div>

      {/* Main Narrative with Interactive Inlines */}
      <div className="text-sm sm:text-base leading-loose text-slate-800 bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-inner">
        {parts.map((part, idx) => {
          if (part.type === 'text') {
            return <span key={idx}>{part.content}</span>;
          }

          const blankIdx = part.index!;
          const currentVal = inputs[blankIdx] || '';
          const isCorrect = hasChecked && currentVal.trim().toLowerCase() === part.expectedAnswer?.toLowerCase();
          const isWrong = hasChecked && !isCorrect;

          return (
            <span key={idx} className="inline-block mx-1.5 align-baseline my-1">
              <span className="relative inline-flex items-center">
                <input
                  type="text"
                  disabled={hasChecked}
                  value={currentVal}
                  placeholder={`[kosong #${blankIdx + 1}]`}
                  onFocus={() => setFocusedIndex(blankIdx)}
                  onChange={e => handleInputChange(blankIdx, e.target.value)}
                  className={`px-3 py-1 text-xs sm:text-sm font-bold rounded-lg border-2 transition-all outline-none text-center min-w-[130px] max-w-[180px] shadow-xs ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-950 font-extrabold'
                      : isWrong
                      ? 'border-red-400 bg-red-100 text-red-950'
                      : focusedIndex === blankIdx
                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                />
                {hasChecked && (
                  <span className="ml-1">
                    {isCorrect ? (
                      <Check className="w-4 h-4 text-emerald-600 inline" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 inline" />
                    )}
                  </span>
                )}
              </span>
            </span>
          );
        })}
      </div>

      {/* Feedback Message */}
      {hasChecked && (
        <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
          allCorrect
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          {allCorrect ? (
            <Check className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <span className="font-bold block">
              {allCorrect ? "Luar Biasa! Semua Isian Tepat" : "Pengerjaan Laporan Tercatat!"}
            </span>
            <span>
              {allCorrect
                ? "Seluruh bagian laporan investigasi telah terisi dengan benar. Misi laporan sukses!"
                : `Terisi benar: ${correctCount} dari ${blankAnswers.length} bagian. Kamu bisa mencoba lagi atau langsung melanjutkan dan membuka level berikutnya di peta!`}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {hasChecked && !allCorrect && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Laporan</span>
            </button>
          )}

          {hasChecked && (
            <button
              type="button"
              onClick={handleToggleSolution}
              className="px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showSolution ? "Sembunyikan Solusi" : "Kunci Jawaban"}</span>
            </button>
          )}
        </div>

        <div>
          {!hasChecked ? (
            <button
              type="button"
              onClick={handleCheck}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sfx.playStageComplete();
                onComplete();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <span>{allCorrect ? "Laporan Berhasil Diverifikasi!" : "Lanjut & Buka Level Peta"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
