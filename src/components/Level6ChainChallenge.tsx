import React, { useState, useEffect } from 'react';
import { sfx } from '../utils/audio';
import { 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { UserAccount } from '../types';
import { LevelVideoSlide } from './LevelVideoSlide';

interface Level6Props {
  onComplete: (score: number, maxScore: number, essayText: string) => void;
  onClose?: () => void;
  isAlreadyCleared?: boolean;
  currentUser?: UserAccount | null;
}

interface ChainItem {
  id: string;
  label: string;
  correctStep: number; // 0, 1, 2, 3
}

interface MissionData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  items: ChainItem[];
  explanation: string;
}

const MISSIONS: MissionData[] = [
  {
    id: 1,
    title: 'Misi 1: Disfungsi Pembangkit Mitokondria',
    subtitle: 'Lacak rantai kegagalan respirasi seluler',
    description: 'Susun urutan 4 tahap sebab-akibat ketika Mitokondria mengalami gangguan kerusakan membran dalam (krista).',
    items: [
      { id: 'm1-1', label: 'Membran krista mitokondria rusak', correctStep: 0 },
      { id: 'm1-2', label: 'Gradien proton & sintesis ATP menurun drastis', correctStep: 1 },
      { id: 'm1-3', label: 'Ketersediaan energi kimia sel berkurang', correctStep: 2 },
      { id: 'm1-4', label: 'Aktivitas metabolisme aktif sel terhenti', correctStep: 3 }
    ],
    explanation: 'Kerusakan krista mengganggu rantai transpor elektron -> produksi ATP turun -> sel kekurangan energi -> aktivitas vital terhenti.'
  },
  {
    id: 2,
    title: 'Misi 2: Krisis Pabrik Perakitan Ribosom',
    subtitle: 'Lacak rantai kegagalan sintesis protein',
    description: 'Susun urutan dampak saat Ribosom kehilangan subunit fungsionalnya.',
    items: [
      { id: 'm2-1', label: 'Kerusakan struktur subunit Ribosom', correctStep: 0 },
      { id: 'm2-2', label: 'Translasi mRNA menjadi asam amino gagal', correctStep: 1 },
      { id: 'm2-3', label: 'Defisit enzim dan protein struktural sel', correctStep: 2 },
      { id: 'm2-4', label: 'Regenerasi membran dan perbaikan sel terhambat', correctStep: 3 }
    ],
    explanation: 'Ribosom membaca kode genetik. Jika gagal, pasokan polipeptida terhenti sehingga sel tidak dapat memperbaiki organel.'
  },
  {
    id: 3,
    title: 'Misi 3: Kemacetan Logistik Badan Golgi',
    subtitle: 'Lacak rantai kegagalan sortir molekuler',
    description: 'Susun urutan gangguan saat cisterna Badan Golgi kehilangan enzim glikosilasi.',
    items: [
      { id: 'm3-1', label: 'Enzim glikosilasi Golgi tidak aktif', correctStep: 0 },
      { id: 'm3-2', label: 'Protein gagal dimodifikasi dengan label penanda', correctStep: 1 },
      { id: 'm3-3', label: 'Vesikel sekretori tidak tahu alamat organel tujuan', correctStep: 2 },
      { id: 'm3-4', label: 'Enzim lisosom dan protein membran salah kirim / mandek', correctStep: 3 }
    ],
    explanation: 'Badan Golgi berfungsi memberi "kode pos" molekuler pada protein. Tanpa penandaan, logistik internal sel mengalami disorientasi.'
  },
  {
    id: 4,
    title: 'Misi 4: Keracunan Akibat Kegagalan Lisosom',
    subtitle: 'Lacak rantai penumpukan debris intraseluler',
    description: 'Susun urutan ketika Lisosom kehilangan keasaman internal (pH) enzim hidrolase.',
    items: [
      { id: 'm4-1', label: 'Pompa proton lisosom gagal menjaga pH asam', correctStep: 0 },
      { id: 'm4-2', label: 'Enzim hidrolitik kehilangan kemampuan mencerna makromolekul', correctStep: 1 },
      { id: 'm4-3', label: 'Akumulasi organel tua dan sampah beracun di sitoplasma', correctStep: 2 },
      { id: 'm4-4', label: 'Sitoplasma mengalami stres toksik yang memicu kematian sel', correctStep: 3 }
    ],
    explanation: 'Lisosom memerlukan pH 4.5–5.0 untuk mencerna makromolekul. Tanpa autofagi yang efisien, akumulasi sampah membebani sel.'
  },
  {
    id: 5,
    title: 'Misi 5: Kebocoran Gerbang Membran Sel',
    subtitle: 'Lacak rantai hilangnya homeostasis sel',
    description: 'Susun urutan saat fosfolipid bilayer membran sel dirusak senyawa surfaktan agresif.',
    items: [
      { id: 'm5-1', label: 'Lapisan fosfolipid bilayer membran sel terdesintegrasi', correctStep: 0 },
      { id: 'm5-2', label: 'Hilangnya sifat selektif permeabel gerbang sel', correctStep: 1 },
      { id: 'm5-3', label: 'Zat asing dan air masuk/keluar tak terkendali', correctStep: 2 },
      { id: 'm5-4', label: 'Sel mengalami lisis osmotik (pecah) dan hancur', correctStep: 3 }
    ],
    explanation: 'Membran sel menjaga lingkungan internal tetap stabil. Saat permeabilitas hilang, keseimbangan osmotik runtuh berakibat lisis sel.'
  }
];

export const Level6ChainChallenge: React.FC<Level6Props> = ({
  onComplete,
  isAlreadyCleared = false,
  currentUser
}) => {
  const [activeStep, setActiveStep] = useState<'video' | 'chains'>('video');
  const [currentMissionIdx, setCurrentMissionIdx] = useState<number>(0);
  // Store user step placements for each mission: missionIdx -> array of 4 itemIds
  const [missionPlacements, setMissionPlacements] = useState<Record<number, (string | null)[]>>({
    0: [null, null, null, null],
    1: [null, null, null, null],
    2: [null, null, null, null],
    3: [null, null, null, null],
    4: [null, null, null, null],
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [missionChecked, setMissionChecked] = useState<Record<number, boolean>>({});
  const [essayText, setEssayText] = useState<string>('');
  const [essayError, setEssayError] = useState<string>('');
  const [hasFinishedAll, setHasFinishedAll] = useState<boolean>(false);

  const curMission = MISSIONS[currentMissionIdx];
  const curPlacements = missionPlacements[currentMissionIdx] || [null, null, null, null];

  // Available items not yet placed in current mission
  const placedSet = new Set(curPlacements.filter(Boolean));
  const availableItems = curMission.items.filter(item => !placedSet.has(item.id));

  const handleSelectItem = (itemId: string) => {
    sfx.playClick();
    setSelectedItemId(prev => (prev === itemId ? null : itemId));
  };

  const handlePlaceInSlot = (slotIdx: number) => {
    sfx.playClick();
    if (selectedItemId) {
      setMissionPlacements(prev => {
        const nextSlots = [...(prev[currentMissionIdx] || [null, null, null, null])];
        const existingIdx = nextSlots.indexOf(selectedItemId);
        if (existingIdx !== -1) {
          nextSlots[existingIdx] = null;
        }
        nextSlots[slotIdx] = selectedItemId;
        return { ...prev, [currentMissionIdx]: nextSlots };
      });
      setSelectedItemId(null);
      setMissionChecked(prev => ({ ...prev, [currentMissionIdx]: false }));
    } else if (curPlacements[slotIdx]) {
      // Remove item
      setMissionPlacements(prev => {
        const nextSlots = [...(prev[currentMissionIdx] || [null, null, null, null])];
        nextSlots[slotIdx] = null;
        return { ...prev, [currentMissionIdx]: nextSlots };
      });
      setMissionChecked(prev => ({ ...prev, [currentMissionIdx]: false }));
    }
  };

  const checkCurrentMission = () => {
    sfx.playClick();
    setMissionChecked(prev => ({ ...prev, [currentMissionIdx]: true }));
    const isCorrect = isMissionCorrect(currentMissionIdx);
    if (isCorrect) {
      sfx.playCorrect();
    } else {
      sfx.playWrong();
    }
  };

  const isMissionCorrect = (mIdx: number): boolean => {
    const slots = missionPlacements[mIdx];
    if (!slots || slots.some(s => !s)) return false;
    const mission = MISSIONS[mIdx];
    return slots.every((placedId, stepIdx) => {
      const itm = mission.items.find(i => i.id === placedId);
      return itm && itm.correctStep === stepIdx;
    });
  };

  const calculateTotalScore = (): number => {
    let score = 0;
    MISSIONS.forEach((_, idx) => {
      if (isMissionCorrect(idx)) {
        score += 1;
      }
    });
    return score;
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayText.trim() || essayText.trim().length < 10) {
      setEssayError('Mohon isi analisis refleksi detektif minimal 10 karakter.');
      return;
    }
    setEssayError('');

    const finalScore = calculateTotalScore();
    setHasFinishedAll(true);

    if (finalScore >= 4) {
      sfx.playStageComplete();
    } else {
      sfx.playWrong();
    }

    onComplete(finalScore, MISSIONS.length, essayText.trim());
  };

  const currentScore = calculateTotalScore();

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto text-slate-800">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-extrabold text-amber-200 tracking-wide uppercase text-[11px] sm:text-xs">
            Level 6: Detektif Kerusakan Sistem Sel
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
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 text-amber-200/70 hover:bg-slate-700 hover:text-white'
            }`}
          >
            1. Video Laporan
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveStep('chains');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStep === 'chains'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 text-amber-200/70 hover:bg-slate-700 hover:text-white'
            }`}
          >
            2. Misi Rantai Sebab-Akibat
          </button>
        </div>
      </div>

      {activeStep === 'video' ? (
        <LevelVideoSlide
          levelTitle="Level 6: Detektif Kerusakan Sistem Sel"
          slideTitle="Laporan Kerusakan Sistem Sel"
          slideDescription="Simak video rekaman laporan investigasi kerusakan sistem sel berikut. Perhatikan bagaimana kegagalan satu organel memicu reaksi berantai pada seluruh fungsi desa sel. Anda dapat memutar video bawaan atau mengunggah rekaman video investigasi Anda sendiri di bawah ini."
          slotKey="asset_049"
          slideId="lvl6-s0"
          defaultVideoSource="asset_049.mp4"
          nextButtonTitle="Lanjut ke Misi Detektif Kerusakan"
          onNext={() => setActiveStep('chains')}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* Intro Header */}
          <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-amber-600/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Level 6 • Investigasi Rantai Sebab-Akibat
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-fredoka text-amber-200">
                  Detektif Kerusakan Sistem Sel &amp; Analisis Kritis
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
              Sebagai detektif seluler, pecahkan <strong>5 Misi Rantai Sebab-Akibat</strong> (Skor Maksimal 5 Poin, Syarat Lulus Minimal 70% / 4 Benar) serta tuliskan <strong>Laporan Refleksi Detektif</strong> untuk disimpan di database Firestore!
            </p>
          </div>

      {/* Mission Tabs Bar (Misi 1 to 5) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {MISSIONS.map((m, idx) => {
          const isDone = missionChecked[idx] && isMissionCorrect(idx);
          const isCurrent = idx === currentMissionIdx;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                sfx.playClick();
                setCurrentMissionIdx(idx);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                  : isDone
                  ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Misi {idx + 1}</span>
              {isDone && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* Current Mission Workspace */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-amber-300/80 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              {curMission.title}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {curMission.subtitle}
            </h3>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
            Misi {currentMissionIdx + 1} dari 5
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium">
          {curMission.description} Letakkan kartu di kotak alur nomor 1 (Penyebab Awal) hingga nomor 4 (Dampak Akhir).
        </p>

        {/* 4 Step Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(slotIdx => {
            const placedId = curPlacements[slotIdx];
            const item = curMission.items.find(i => i.id === placedId);
            const isChecked = missionChecked[currentMissionIdx];
            const isCorrect = isChecked && item && item.correctStep === slotIdx;
            const isWrong = isChecked && item && item.correctStep !== slotIdx;

            return (
              <div
                key={slotIdx}
                onClick={() => handlePlaceInSlot(slotIdx)}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[130px] cursor-pointer ${
                  selectedItemId && !placedId
                    ? 'border-dashed border-amber-400 bg-amber-50/60 ring-2 ring-amber-300'
                    : isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                    : isWrong
                    ? 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-300'
                    : item
                    ? 'border-slate-300 bg-amber-50/40 shadow-xs'
                    : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    Tahap {slotIdx + 1}
                  </span>
                  {isChecked && (
                    <span>
                      {isCorrect ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      ) : isWrong ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      ) : null}
                    </span>
                  )}
                </div>

                {item ? (
                  <div className="flex flex-col">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.label}
                    </p>
                    <span className="text-[10px] text-slate-400 italic mt-1">(Klik untuk lepas)</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic text-center my-auto">
                    {selectedItemId ? '👉 Klik taruh kartu' : 'Kosong'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Available Items Tray */}
        <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pilihan Kartu Sebab-Akibat (Klik kartu lalu klik kotak di atas):
          </span>
          {availableItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableItems.map(item => {
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item.id)}
                    className={`p-3 rounded-xl border-2 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-100 text-slate-950 ring-2 ring-amber-400 shadow'
                        : 'border-slate-300 bg-white hover:bg-amber-50 text-slate-800 shadow-xs'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-emerald-700 font-semibold italic">
              Semua 4 kartu telah ditempatkan ke kotak alur di atas.
            </span>
          )}
        </div>

        {/* Check Button and Feedback for Current Mission */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkCurrentMission}
              disabled={curPlacements.some(s => !s)}
              className={`px-5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all ${
                curPlacements.every(Boolean)
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Periksa Alur Misi {currentMissionIdx + 1}
            </button>
          </div>

          {/* Explanation if checked */}
          {missionChecked[currentMissionIdx] && (
            <div className={`text-xs p-3 rounded-xl border flex items-center gap-2 flex-1 ${
              isMissionCorrect(currentMissionIdx)
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <HelpCircle className="w-4 h-4 flex-shrink-0" />
              <span>{curMission.explanation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Essay Section (Disimpan ke Firestore) */}
      <form onSubmit={handleFinalSubmit} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-orange-300/80 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
          <FileText className="w-5 h-5 text-orange-700" />
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
            Laporan Refleksi Detektif Seluler (Disimpan ke Firestore)
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong>Soal Esai:</strong> Dari 5 kasus gangguan organel yang telah kamu selidiki di atas, jelaskan mengapa gangguan pada satu organel (misalnya mitokondria atau retikulum endoplasma) tidak pernah berdiri sendiri, melainkan selalu memicu efek domino terhadap kelangsungan hidup organel lain di seluruh Desa Sel!
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="essay-level6" className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Tuliskan Analisis Detektif Anda di Bawah Ini:</span>
            <span className="text-slate-400 font-normal">{essayText.trim().length} karakter</span>
          </label>
          <textarea
            id="essay-level6"
            rows={4}
            value={essayText}
            onChange={e => setEssayText(e.target.value)}
            disabled={hasFinishedAll}
            placeholder="Tuliskan analisis keterkaitan sistemik organel sel di sini..."
            className="w-full p-3.5 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-slate-900 transition-all outline-none resize-y"
          />
          {essayError && (
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {essayError}
            </span>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <span className="text-xs font-bold text-slate-700">
            Skor Misi Terjawab Benar: {currentScore} / {MISSIONS.length} Poin
          </span>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Kirim Hasil Detektif &amp; Simpan ke Database</span>
          </button>
        </div>
          </form>
        </>
      )}
    </div>
  );
};
