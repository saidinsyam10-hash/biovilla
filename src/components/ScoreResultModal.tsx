import React from 'react';
import { CheckCircle, XCircle, RotateCcw, ArrowRight, Award, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { LevelProgressRecord } from '../types';
import { LEVEL_RULES } from '../utils/scoreStore';

interface ScoreResultModalProps {
  isOpen: boolean;
  levelId: string;
  record: LevelProgressRecord;
  onRetry: () => void;
  onContinue: () => void;
}

export const ScoreResultModal: React.FC<ScoreResultModalProps> = ({
  isOpen,
  levelId,
  record,
  onRetry,
  onContinue,
}) => {
  if (!isOpen) return null;

  const rule = LEVEL_RULES[levelId];
  const isPassed = record.status === 'lulus';
  const isDoneOnly = record.status === 'selesai'; // e.g. Level 8
  const isFailed = record.status === 'belum_lulus';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isPassed ? 'bg-emerald-500' : isDoneOnly ? 'bg-teal-500' : 'bg-rose-500'
        }`} />

        {/* Icon status */}
        <div className="relative mb-4">
          {isPassed && (
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
              <Award className="w-10 h-10" />
            </div>
          )}
          {isDoneOnly && (
            <div className="w-20 h-20 rounded-2xl bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-300 shadow-lg shadow-teal-500/30">
              <Sparkles className="w-10 h-10" />
            </div>
          )}
          {isFailed && (
            <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/30">
              <AlertCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Level Name */}
        <span className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">
          {rule ? rule.title : levelId.toUpperCase()}
        </span>

        {/* Headline */}
        <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2 font-fredoka">
          {isPassed
            ? 'Hebat! Kamu Lulus Misi Ini!'
            : isDoneOnly
            ? 'Refleksi Berhasil Disimpan!'
            : 'Misi Belum Lulus'}
        </h3>

        {/* Status Badge */}
        <div className="mb-6">
          {isPassed && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
              <CheckCircle className="w-4 h-4" />
              Status: LULUS (Tuntas ≥ 70%)
            </span>
          )}
          {isDoneOnly && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/50">
              <CheckCircle className="w-4 h-4" />
              Status: SELESAI
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/50">
              <XCircle className="w-4 h-4" />
              Status: BELUM LULUS (Kurang dari 70%)
            </span>
          )}
        </div>

        {/* Score Breakdown Box */}
        {!isDoneOnly && (
          <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 mb-5 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Skor Diperoleh</span>
              <span className="text-2xl font-black text-amber-300">
                {record.skor} <span className="text-sm font-normal text-slate-400">/ {record.skor_maksimal}</span>
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Persentase</span>
              <span className={`text-2xl font-black ${record.persentase >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {record.persentase}%
              </span>
            </div>
          </div>
        )}

        {/* Essay preview if present */}
        {record.esai && (
          <div className="w-full bg-slate-800/60 border border-amber-500/30 rounded-xl p-3.5 mb-5 text-left text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Jawaban Esai Tersimpan di Database:</span>
            </div>
            <p className="text-slate-300 italic line-clamp-3">"{record.esai}"</p>
          </div>
        )}

        {/* Decision Path if present (Level 7) */}
        {record.jalur_diambil && (
          <div className="w-full bg-slate-800/60 border border-teal-500/30 rounded-xl p-3 mb-5 text-left text-xs">
            <span className="text-teal-300 font-bold">Jalur Keputusan: </span>
            <span className="text-slate-200">{record.jalur_diambil}</span>
          </div>
        )}

        {/* Informative description */}
        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
          {isPassed
            ? 'Nilai misi level ini telah otomatis tersimpan ke database Firestore. Anda dapat lanjut ke level selanjutnya di peta, atau mencoba lagi untuk skor sempurna!'
            : isDoneOnly
            ? 'Refleksi nilai dan pemahaman Biologi Anda telah berhasil direkam ke database Firestore.'
            : 'Nilai tersimpan ke database Firestore. Anda dapat mengulang level ini sekarang untuk memperbaiki nilai, atau tetap lanjut ke level berikutnya di peta.'}
        </p>

        {/* Catatan Nilai Akhir */}
        <div className="w-full bg-amber-500/10 border border-amber-400/30 rounded-xl p-3 mb-5 text-center text-xs text-amber-200/90 leading-relaxed">
          <span>ℹ️ <strong>Rapor Nilai Akhir:</strong> Akumulasi Nilai Akhir, Predikat, dan Kelulusan BioVillage akan otomatis muncul secara lengkap setelah <strong>Level 8</strong> selesai dikerjakan seluruhnya.</span>
        </div>

        {/* Action Buttons: Retry and Continue */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 border border-slate-600 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Ulangi Level Ini</span>
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition-all"
          >
            <span>Lanjut ke Level Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
