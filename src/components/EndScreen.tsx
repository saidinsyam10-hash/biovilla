import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { endScreenData } from '../data/gameData';
import { sfx } from '../utils/audio';
import { Award, Star, Map, RotateCcw, Sparkles } from 'lucide-react';

interface EndScreenProps {
  totalStars: number;
  clearedCount?: number;
  studentName?: string;
  onReviewMap: () => void;
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  totalStars,
  clearedCount = 8,
  studentName,
  onReviewMap,
  onRestart
}) => {
  useEffect(() => {
    sfx.playStageComplete();
    // Confetti fireworks
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-emerald-50 to-emerald-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col items-center text-center p-6 sm:p-10 animate-in zoom-in-95 duration-300">
        {/* Glowing Badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-xl border-4 border-white text-slate-900">
            <Award className="w-14 h-14" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          {endScreenData.badge}
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-fredoka text-slate-900 mb-2 tracking-tight">
          {studentName ? `Hebat, ${studentName}!` : endScreenData.title}
        </h2>

        {studentName && (
          <p className="text-sm font-bold text-emerald-700 mb-2">
            Misi BioVillage Simulator Tuntas dengan Sempurna!
          </p>
        )}

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
          {endScreenData.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs text-emerald-800 font-bold uppercase">Misi Selesai</span>
            <span className="text-3xl font-extrabold text-emerald-700 mt-1">{clearedCount} Level</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs text-amber-800 font-bold uppercase">Total Bintang</span>
            <div className="flex items-center gap-1 text-3xl font-extrabold text-amber-600 mt-1">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
              <span>{totalStars}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-md">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onReviewMap();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 transition-transform"
          >
            <Map className="w-5 h-5" />
            <span>Lihat Peta Desa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onRestart();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm sm:text-base cursor-pointer active:scale-95 transition-transform"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Ulangi Petualangan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
