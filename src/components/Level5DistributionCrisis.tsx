import React, { useState } from 'react';
import { resolveMediaPath, sfx } from '../utils/audio';
import { 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Truck, 
  Package, 
  Layers,
  AlertTriangle
} from 'lucide-react';
import { UserAccount } from '../types';
import { LevelVideoSlide } from './LevelVideoSlide';

interface Level5Props {
  onComplete: (score: number, maxScore: number, essayText: string) => void;
  onClose: () => void;
  isAlreadyCleared?: boolean;
  currentUser?: UserAccount | null;
}

interface ObjectiveQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: ObjectiveQuestion[] = [
  {
    id: 'q5-1',
    prompt: 'Sebuah molekul polipeptida baru saja selesai disintesis oleh ribosom, namun belum dapat digunakan atau dikirim ke luar sel. Tahap pemrosesan lanjutan apa yang harus dilalui molekul tersebut?',
    options: [
      'Pelipatan di RE kasar, penambahan karbohidrat/glikosilasi, dan pengemasan di Badan Golgi',
      'Penguraian langsung menjadi karbon dioksida di dalam matriks mitokondria',
      'Penyimpanan permanen di dalam nukleolus tanpa modifikasi kimia',
      'Pengeluaran paksa menembus dinding sel melalui difusi sederhana'
    ],
    correctIndex: 0,
    explanation: 'Protein sekretori memerlukan pelipatan (folding) yang presisi di retikulum endoplasma kasar, dilanjutkan penambahan gugus penanda molekuler (glikosilasi/sortir) di badan Golgi sebelum diekspor.'
  },
  {
    id: 'q5-2',
    prompt: 'Jika pembentukan vesikel transpor dari Retikulum Endoplasma menuju Badan Golgi terhambat, dampak utama yang langsung dialami oleh sel adalah ...',
    options: [
      'Molekul protein menumpuk di RE dan tidak dapat disortir untuk mencapai organel target atau disekresi',
      'Sel langsung kehilangan seluruh DNA dan kromosom',
      'Dinding sel seketika mencair dan berubah wujud menjadi energi kimia',
      'Mitokondria berhenti membelah dan lenyap dari sitoplasma'
    ],
    correctIndex: 0,
    explanation: 'Vesikel transpor adalah kurir logistik seluler. Gangguan vesikel transpor mengakibatkan krisis distribusi di mana bahan menumpuk di tempat asal dan tidak sampai ke destinasi.'
  },
  {
    id: 'q5-3',
    prompt: 'Perhatikan analogi: Jika pelabuhan internal sel adalah Retikulum Endoplasma dan pasar sortir adalah Badan Golgi, siapakah perahu kurir yang menghubungkan keduanya?',
    options: [
      'Vesikel Transpor (Transport Vesicles)',
      'Sentriol dan Benang Spindel',
      'Kloroplas dan Tilakoid',
      'Nukleus dan Porus Nukleus'
    ],
    correctIndex: 0,
    explanation: 'Vesikel bertunas dari membran RE kasar membawa kargo protein melintasi sitosol untuk berfusi dengan membran cis-Golgi.'
  },
  {
    id: 'q5-4',
    prompt: 'Di Desa Sel, ketika terdapat kelebihan bahan cadangan makanan atau produk metabolit yang harus disimpan sementara pada sel tumbuhan, organel penampung utamanya adalah ...',
    options: [
      'Vakuola Sentral',
      'Lisosom Sekunder',
      'Peroksisom',
      'Sentrosom'
    ],
    correctIndex: 0,
    explanation: 'Vakuola sentral pada tumbuhan berfungsi sebagai gudang cadangan cairan, pigmen, ion organik, dan menjaga tekanan turgor sel.'
  },
  {
    id: 'q5-5',
    prompt: 'Setelah proses metabolisme berlangsung, jika limbah seluler atau organel yang sudah rusak tidak segera dihancurkan oleh enzim hidrolase asam lisosom, apa yang akan terjadi pada desa sel?',
    options: [
      'Akumulasi debris sampah seluler yang memicu toksisitas dan gangguan kerja organel lain',
      'Produksi energi ATP melonjak tanpa henti',
      'Materi genetik bertambah dua kali lipat secara spontan',
      'Membran plasma kehilangan sifat selektif permeabelnya seketika'
    ],
    correctIndex: 0,
    explanation: 'Pembersihan seluler (autofagi) oleh lisosom sangat penting untuk mencegah penumpukan agregat toksik yang dapat menyebabkan apoptosis atau kerusakan sel.'
  }
];

export const Level5DistributionCrisis: React.FC<Level5Props> = ({
  onComplete,
  isAlreadyCleared = false,
  currentUser
}) => {
  const [activeStep, setActiveStep] = useState<'video' | 'quiz'>('video');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [essayText, setEssayText] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [essayError, setEssayError] = useState<string>('');

  const isTeacher = currentUser?.role === 'guru';

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (hasSubmitted) return;
    sfx.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = (): number => {
    let score = 0;
    QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSubmitted) return;

    if (Object.keys(selectedAnswers).length < QUESTIONS.length) {
      alert('Mohon jawab seluruh 5 soal pilihan ganda terlebih dahulu.');
      return;
    }

    if (!essayText.trim() || essayText.trim().length < 10) {
      setEssayError('Mohon tuliskan penjelasan analisis esai minimal 10 karakter.');
      return;
    }
    setEssayError('');

    const finalScore = calculateScore();
    setHasSubmitted(true);

    if (finalScore >= 4) {
      sfx.playStageComplete();
    } else {
      sfx.playWrong();
    }

    // Pass final score (0-5), max score (5), and essay text
    onComplete(finalScore, QUESTIONS.length, essayText.trim());
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setEssayText('');
    setHasSubmitted(false);
    setEssayError('');
    sfx.playClick();
  };

  const currentScore = calculateScore();
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === QUESTIONS.length;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto text-slate-800">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-teal-500/30 rounded-2xl p-2.5 sm:p-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-extrabold text-amber-200 tracking-wide uppercase text-[11px] sm:text-xs">
            Level 5: Inspeksi Jalur Distribusi
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveStep('video');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStep === 'video'
                ? 'bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 text-teal-200/70 hover:bg-slate-700 hover:text-white'
            }`}
          >
            1. Video Distribusi
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveStep('quiz');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStep === 'quiz'
                ? 'bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 text-teal-200/70 hover:bg-slate-700 hover:text-white'
            }`}
          >
            2. Misi Soal Distribusi
          </button>
        </div>
      </div>

      {activeStep === 'video' ? (
        <LevelVideoSlide
          levelTitle="Level 5: Inspeksi Jalur Distribusi"
          slideTitle="Inspeksi Jalur Distribusi (Badan Golgi & Vesikel)"
          slideDescription="Simak video pengantar mengenai alur sortir, pengemasan glikosilasi, dan peran vital armada vesikel di Badan Golgi. Anda dapat memutar video bawaan atau mengunggah video investigasi Anda sendiri sebelum menjawab kuis."
          slotKey="asset_047"
          slideId="lvl5-s0"
          defaultVideoSource="asset_047.mp4"
          nextButtonTitle="Lanjut ke Misi Soal Distribusi"
          onNext={() => setActiveStep('quiz')}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* Intro Header Banner */}
          <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-teal-600/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-teal-500/20 border border-teal-400/40 rounded-xl text-teal-300">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                  Level 5 • Logistik &amp; Distribusi Desa Sel
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-fredoka text-amber-200">
                  Krisis Distribusi &amp; Rantai Pasok Seluler
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Pusat sortir Badan Golgi dan armada Vesikel Transpor mengalami hambatan distribusi! Selesaikan <strong>5 Soal Objektif</strong> (Skor Maks 5, Syarat Lulus Minimal 70% / 4 Benar) serta tuliskan <strong>Analisis Esai</strong> strategi pemulihan sistem logistik desa.
            </p>
          </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Section 1: Objective Questions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-amber-300/80 pb-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Bagian A: Kuis Objektif Pemahaman Distribusi (5 Soal)
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              Bobot: 1 Poin per Soal (Maks 5)
            </span>
          </div>

          {QUESTIONS.map((q, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const selectedOpt = selectedAnswers[idx];
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div 
                key={q.id}
                className="bg-white rounded-2xl p-5 shadow-sm border-2 border-amber-200/70 hover:border-amber-400/80 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                    {q.prompt}
                  </p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-2 pl-10">
                  {q.options.map((opt, optIdx) => {
                    const isChosen = selectedOpt === optIdx;
                    let btnStyle = "border-slate-200 bg-slate-50 hover:bg-amber-50/70 text-slate-800";
                    
                    if (isChosen) {
                      btnStyle = "border-emerald-500 bg-emerald-50 font-semibold text-emerald-950 shadow-sm ring-2 ring-emerald-400";
                    }

                    if (hasSubmitted) {
                      if (optIdx === q.correctIndex) {
                        btnStyle = "border-emerald-600 bg-emerald-100/90 text-emerald-950 font-bold ring-2 ring-emerald-500";
                      } else if (isChosen && !isCorrect) {
                        btnStyle = "border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-400 line-through";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(idx, optIdx)}
                        disabled={hasSubmitted}
                        className={`text-left text-xs sm:text-sm p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-2.5 ${btnStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on submit */}
                {hasSubmitted && (
                  <div className="mt-2 pl-10">
                    <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                      isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}>
                      <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-700" />
                      <div>
                        <span className="font-bold">{isCorrect ? 'Benar! ' : 'Kurang Tepat! '}</span>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section 2: Essay Question */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-teal-300/80 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-teal-200 pb-2">
            <FileText className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Bagian B: Analisis Esai Pemecahan Masalah (Disimpan ke Firestore)
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong>Instruksi Soal Esai:</strong> Bayangkan kamu adalah Kepala Manajemen Logistik Desa Sel. Jika terjadi kegagalan modifikasi protein di Badan Golgi sehingga molekul penanda tujuan tidak terpasang, jelaskan bagaimana dampaknya terhadap organel penerima (seperti lisosom dan membran plasma), serta usulkan langkah yang dapat dilakukan sel untuk menormalkan kembali aliran distribusi tersebut!
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="essay-input" className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Tuliskan Jawaban Esai Anda di Bawah Ini:</span>
              <span className="text-slate-400 font-normal">
                {essayText.trim().length} karakter
              </span>
            </label>
            <textarea
              id="essay-input"
              rows={4}
              value={essayText}
              onChange={e => setEssayText(e.target.value)}
              disabled={hasSubmitted}
              placeholder="Ketikkan analisis esai Anda secara mendalam di sini..."
              className="w-full p-3.5 rounded-xl border-2 border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-xs sm:text-sm text-slate-900 transition-all outline-none resize-y"
            />
            {essayError && (
              <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {essayError}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 italic">
            * Jawaban esai Anda akan disimpan secara permanen ke koleksi Firestore subkoleksi progres siswa untuk ditinjau oleh Bapak/Ibu Guru di Dashboard Guru.
          </span>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 bg-amber-100/90 rounded-2xl border-2 border-amber-300 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              Status Pengerjaan: {Object.keys(selectedAnswers).length} / {QUESTIONS.length} Soal Dijawab
            </span>
          </div>

          <div className="flex items-center gap-3">
            {hasSubmitted && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-slate-700" />
                <span>Ulangi Pengerjaan</span>
              </button>
            )}

            {!hasSubmitted ? (
              <button
                type="submit"
                disabled={!allQuestionsAnswered}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 ${
                  allQuestionsAnswered
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirim Jawaban &amp; Simpan ke Database</span>
              </button>
            ) : null}
          </div>
        </div>
          </form>
        </>
      )}
    </div>
  );
};
