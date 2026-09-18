import React, { useState, useEffect } from 'react';
import { EssayQuestion } from '../types';
import { sfx } from '../utils/audio';
import { 
  BookOpen, 
  Heart, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  Lightbulb, 
  Feather, 
  ArrowRight, 
  ShieldCheck,
  Compass,
  Award,
  Star,
  Loader2,
  Bot,
  BrainCircuit,
  Check
} from 'lucide-react';
import { getCurrentUser, saveTemporaryAnswer, getTemporaryAnswer } from '../utils/authStore';
import { requestEssayEvaluation, EssayEvalResponse } from '../utils/geminiAi';

interface QuizEssayReflectionProps {
  question: EssayQuestion;
  nextButtonLabel?: string;
  onSubmit: (answerText: string) => void;
  onNext: () => void;
}

export const QuizEssayReflection: React.FC<QuizEssayReflectionProps> = ({
  question,
  nextButtonLabel = "Lanjut",
  onSubmit,
  onNext
}) => {
  const cacheKey = `essay_reflection_${question.id || 'default'}`;
  const [essayText, setEssayText] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [aiEvaluation, setAiEvaluation] = useState<EssayEvalResponse | null>(null);

  const minWords = question.minWords || 15;

  // Restore cached draft answer on mount or question change
  useEffect(() => {
    const cached = getTemporaryAnswer(cacheKey);
    if (cached && typeof cached.text === 'string') {
      setEssayText(cached.text);
      if (cached.submitted) {
        setHasSubmitted(true);
      }
      if (cached.evaluation) {
        setAiEvaluation(cached.evaluation);
      }
    } else {
      setEssayText('');
      setHasSubmitted(false);
      setAiEvaluation(null);
    }
    setErrorMessage(null);
  }, [question.id, cacheKey]);

  // Handle text change with automatic local storage persistence
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEssayText(text);
    if (errorMessage) setErrorMessage(null);
    saveTemporaryAnswer(cacheKey, { 
      text, 
      submitted: hasSubmitted, 
      evaluation: aiEvaluation,
      timestamp: Date.now() 
    });
  };

  // Calculate word count
  const words = essayText.trim() === '' ? 0 : essayText.trim().split(/\s+/).filter(Boolean).length;
  const isWordCountMet = words >= minWords;

  const handleSubmit = async () => {
    if (words < minWords) {
      setErrorMessage(`Refleksi masih terlalu singkat (${words}/${minWords} kata). Harap tuliskan minimal ${minWords} kata agar pemikiranmu tersampaikan secara utuh.`);
      sfx.playWrong();
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      saveTemporaryAnswer(cacheKey, { text: essayText, submitted: false });
      window.dispatchEvent(new CustomEvent('biovillage:require_login'));
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);
    sfx.playClick();

    try {
      const evalResult = await requestEssayEvaluation({
        essayText: essayText.trim(),
        questionTitle: question.title,
        category: question.category,
        prompt: question.prompt,
        verseRef: question.verseReference,
        scientificConnection: question.scientificConnection,
        guidingQuestions: question.guidingQuestions,
        studentName: user.fullName || user.nama || user.username
      });

      setAiEvaluation(evalResult);
      setHasSubmitted(true);
      sfx.playCorrect();

      saveTemporaryAnswer(cacheKey, { 
        text: essayText, 
        submitted: true, 
        evaluation: evalResult,
        timestamp: Date.now() 
      });

      onSubmit(essayText.trim());
    } catch (err: any) {
      console.warn('Gagal evaluasi AI:', err);
      // Fallback
      setHasSubmitted(true);
      onSubmit(essayText.trim());
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEditAgain = () => {
    sfx.playClick();
    setHasSubmitted(false);
    saveTemporaryAnswer(cacheKey, { 
      text: essayText, 
      submitted: false, 
      evaluation: aiEvaluation,
      timestamp: Date.now() 
    });
  };

  const handleProceedNext = () => {
    sfx.playClick();
    onNext();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Badge & Category */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow">
            <Feather className="w-4 h-4" />
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              {question.category || 'Tadabbur Sains & Integrasi Nilai Islam'}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100">
              {question.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Soal Esai Refleksi</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
            <Bot className="w-3 h-3 text-emerald-400" />
            <span>Penilai AI Gemini</span>
          </div>
        </div>
      </div>

      {/* Islamic & Spiritual Verse Card (if provided) */}
      {(question.verseArabic || question.verseReference) && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/70 border-2 border-emerald-500/30 p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Dalil &amp; Hikmah Keagungan</span>
            </span>
            {question.verseReference && (
              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {question.verseReference}
              </span>
            )}
          </div>

          {/* Arabic Calligraphy Style */}
          {question.verseArabic && (
            <div className="pt-2 text-right">
              <p className="text-base sm:text-xl md:text-2xl font-serif text-amber-100/95 leading-loose tracking-wide dir-rtl select-none">
                {question.verseArabic}
              </p>
            </div>
          )}

          {/* Translation */}
          {question.verseTranslation && (
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed border-l-2 border-emerald-400/60 pl-3 py-0.5">
              "{question.verseTranslation}"
            </p>
          )}

          {/* Scientific Connection / Resonance */}
          {question.scientificConnection && (
            <div className="pt-2 border-t border-emerald-500/20 flex items-start gap-2 text-xs text-emerald-200/90 leading-relaxed">
              <Compass className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Korelasi Sains Seluler:</strong> {question.scientificConnection}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Prompt Question & Guiding Points */}
      <div className="bg-slate-900/90 rounded-2xl border-2 border-teal-500/30 p-5 sm:p-6 shadow-md space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Pertanyaan Pemantik Refleksi:</span>
          </h4>
          <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
            {question.prompt}
          </p>
        </div>

        {/* Guiding points accordion / toggle */}
        {question.guidingQuestions && question.guidingQuestions.length > 0 && (
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3.5 space-y-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Poin Bantuan Berpikir ({question.guidingQuestions.length} Aspek):</span>
              </span>
              <span className="text-[10px] text-slate-400 underline">
                {showGuide ? 'Sembunyikan' : 'Tampilkan'}
              </span>
            </button>

            {showGuide && (
              <ul className="space-y-1.5 pt-1">
                {question.guidingQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Text Area for Student Reflection */}
        {!hasSubmitted ? (
          <div className="space-y-2 pt-1">
            <label htmlFor={`essay-${question.id}`} className="block text-xs font-bold text-slate-200">
              Tuliskan Refleksi Pribadimu:
            </label>
            <textarea
              id={`essay-${question.id}`}
              rows={6}
              disabled={isEvaluating}
              value={essayText}
              onChange={handleTextChange}
              placeholder={question.placeholder || "Tuliskan apa yang kamu rasakan, hikmah keteraturan sel yang kamu temukan, serta komitmen perilakumu dalam kehidupan sehari-hari..."}
              className="w-full p-4 rounded-2xl bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 transition-all outline-none resize-y leading-relaxed font-sans disabled:opacity-50"
            />

            {/* Word Count & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border flex items-center gap-1 ${
                  isWordCountMet
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isWordCountMet ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                  )}
                  <span>{words} / {minWords} kata</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {isWordCountMet ? '✓ Memenuhi syarat panjang minimal' : `Kurang ${minWords - words} kata lagi`}
                </span>
              </div>

              <span className="text-[10px] text-slate-500 italic">
                * Draf tersimpan otomatis di perangkatmu
              </span>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs font-semibold text-rose-200 flex items-center gap-2 animate-in shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button & Evaluating State */}
            <div className="pt-3 flex justify-end">
              {isEvaluating ? (
                <div className="px-6 py-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-900/30 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>✨ AI Guru Sedang Menganalisis Refleksimu...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={words < 3}
                  className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
                    isWordCountMet
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim &amp; Nilai Refleksi dengan AI</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Submitted State / Keepsake Card with AI Assessment */
          <div className="space-y-5 pt-2 animate-in fade-in duration-300">
            {/* 1. Header Rekap */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-400/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Alhamdulillah, Refleksimu Telah Tercatat &amp; Dinilai!</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  {words} Kata
                </span>
              </div>

              {/* Teks Tulisan Siswa */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs sm:text-sm text-slate-100 italic leading-relaxed whitespace-pre-wrap">
                "{essayText}"
              </div>
            </div>

            {/* 2. Kartu Ulasan & Penilaian Cerdas AI */}
            {aiEvaluation && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/50 to-teal-950/60 border-2 border-emerald-400/40 p-5 sm:p-6 shadow-xl space-y-4">
                {/* AI Badge Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                      <BrainCircuit className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                          Penilaian AI Guru BioVillage
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                          {aiEvaluation.isAiGenerated ? 'Gemini 2.5 Flash' : 'Analisis Cerdas'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Evaluasi komprehensif terhadap pemahaman sains dan komitmen akhlakmu
                      </p>
                    </div>
                  </div>

                  {/* Nilai & Predikat */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300 block">
                        {aiEvaluation.predicate}
                      </span>
                      <span className="text-[10px] text-slate-400">Predikat Refleksi</span>
                    </div>
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
                      {aiEvaluation.score}
                    </div>
                  </div>
                </div>

                {/* Gelar / Lencana Karakter Diraih */}
                {aiEvaluation.badge && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
                    <Award className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-xs">
                      <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                        Lencana Kehormatan:
                      </span>
                      <strong className="text-amber-200 font-extrabold text-xs sm:text-sm">
                        {aiEvaluation.badge}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Rubrik Skor Metrik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-300">
                      <span>Kedalaman Sains &amp; Analogi:</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < aiEvaluation.depthScore ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Ketepatan memahami peran organel dan keterkaitannya dengan fasilitas desa.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span>Internalisasi Nilai &amp; Akhlak:</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < aiEvaluation.valuesScore ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Kesadaran spiritual, rasa syukur, dan komitmen aksi nyata dalam kehidupan.
                    </p>
                  </div>
                </div>

                {/* Ulasan Umpan Balik AI */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ulasan Umpan Balik AI:</span>
                  </div>
                  <p className="italic">"{aiEvaluation.feedback}"</p>
                </div>

                {/* Poin Keunggulan & Saran */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {aiEvaluation.strengths && aiEvaluation.strengths.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-teal-500/20 space-y-2">
                      <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                        <span>Keunggulan Refleksimu:</span>
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {aiEvaluation.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-teal-400">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiEvaluation.improvements && aiEvaluation.improvements.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-amber-500/20 space-y-2">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Saran Pengayaan Berpikir:</span>
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {aiEvaluation.improvements.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Hasil evaluasi ini telah disinkronkan ke rekap riwayat siswa untuk ditinjau guru.</span>
                </div>
              </div>
            )}

            {/* Actions: Edit or Proceed to Next Slide */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleEditAgain}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tulis Ulang Refleksi</span>
              </button>

              <button
                type="button"
                onClick={handleProceedNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
              >
                <span>{nextButtonLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

