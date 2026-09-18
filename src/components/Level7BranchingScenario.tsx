import React, { useState } from 'react';
import { resolveMediaPath, sfx } from '../utils/audio';
import { 
  GitFork, 
  ShieldAlert, 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Activity, 
  Zap, 
  HeartHandshake, 
  AlertTriangle,
  Compass,
  FileCheck2
} from 'lucide-react';
import { UserAccount } from '../types';
import { LevelVideoSlide } from './LevelVideoSlide';

interface Level7Props {
  onComplete: (score: number, maxScore: number, jalurDiambil: string) => void;
  onClose: () => void;
  isAlreadyCleared?: boolean;
  currentUser?: UserAccount | null;
}

interface DecisionChoice {
  id: string;
  text: string;
  energyChange: number;
  integrityChange: number;
  logisticsChange: number;
  feedback: string;
}

interface DecisionNode {
  id: number;
  phaseTitle: string;
  scenario: string;
  choices: DecisionChoice[];
}

const DECISION_TREE: DecisionNode[] = [
  {
    id: 1,
    phaseTitle: 'Fase 1: Panggilan Darurat Sumber Energi',
    scenario: 'Alarm desa berbunyi nyaring! Pasokan oksigen dan glukosa menuju Pembangkit Mitokondria mulai menipis karena cuaca ekstrem di luar sel. Apa tindakan pertama yang Anda ambil sebagai Kepala Desa?',
    choices: [
      {
        id: 'A',
        text: 'Prioritaskan pasokan substrat glukosa ke Mitokondria dan pertahankan transpor ion membran untuk mencegah kolaps energi.',
        energyChange: 35,
        integrityChange: 30,
        logisticsChange: 30,
        feedback: 'Keputusan Tepat! Mitokondria menerima bahan bakar yang cukup untuk terus menyintesis ATP yang menjaga seluruh organel tetap hidup.'
      },
      {
        id: 'B',
        text: 'Matikan sementara seluruh komunikasi membran sel dan kunci semua gerbang secara mendadak.',
        energyChange: 15,
        integrityChange: 20,
        logisticsChange: 5,
        feedback: 'Tindakan Defensif Kaku: Meski sel terlindung sesaat, terputusnya pertukaran zat memperlambat metabolisme desa.'
      },
      {
        id: 'C',
        text: 'Kuras seluruh isi vakuola secara paksa tanpa menyaring zat terlarut yang keluar ke sitoplasma.',
        energyChange: 5,
        integrityChange: -10,
        logisticsChange: 10,
        feedback: 'Keputusan Berbahaya! Tekanan turgor sel merosot drastis dan sitoplasma mengalami stres osmotik.'
      }
    ]
  },
  {
    id: 2,
    phaseTitle: 'Fase 2: Manajemen Produksi & Logistik Protein',
    scenario: 'Laporan datang dari Pusat Perakitan (Ribosom): terdapat permintaan mendesak untuk membentuk enzim perbaikan membran dan hormon sinyal. Namun, jalur Retikulum Endoplasma sedang padat. Bagaimana Anda mengatur rutenya?',
    choices: [
      {
        id: 'A',
        text: 'Gunakan vesikel transpor khusus berpenanda molekuler tinggi untuk mempercepat transfer polipeptida dari RE ke Badan Golgi.',
        energyChange: 35,
        integrityChange: 35,
        logisticsChange: 35,
        feedback: 'Strategi Brilian! Penandaan molekuler (glikosilasi) terarah memastikan protein pelindung segera sampai ke membran dan lisosom tepat waktu.'
      },
      {
        id: 'B',
        text: 'Tumpuk semua bahan protein di RE halus sambil menunggu antrean di Badan Golgi mereda dengan sendirinya.',
        energyChange: 10,
        integrityChange: 15,
        logisticsChange: 10,
        feedback: 'Penundaan Logistik: Penumpukan protein di RE menyebabkan "ER Stress" yang membebani sel.'
      },
      {
        id: 'C',
        text: 'Hentikan total aktivitas Ribosom untuk menghemat energi sel tanpa memikirkan perbaikan membran.',
        energyChange: 15,
        integrityChange: -15,
        logisticsChange: -10,
        feedback: 'Langkah Fatal: Tanpa sintesis protein baru, sel tidak dapat memperbaiki kerusakan struktural organelnya.'
      }
    ]
  },
  {
    id: 3,
    phaseTitle: 'Fase 3: Pengendalian Limbah Toksik & Pertahanan Sel',
    scenario: 'Reaksi darurat menghasilkan sejumlah radikal bebas hidrogen peroksida dan serpihan organel rusak. Warga desa sel terancam keracunan jika limbah ini dibiarkan!',
    choices: [
      {
        id: 'A',
        text: 'Mobilisasi Lisosom untuk autofagi organel rusak dan perintahkan Peroksisom mengurai racun peroksida dengan enzim katalase.',
        energyChange: 30,
        integrityChange: 35,
        logisticsChange: 35,
        feedback: 'Kombinasi Sempurna! Lisosom mendaur ulang bahan berguna sementara Peroksisom menetralkan racun menjadi air dan oksigen murni.'
      },
      {
        id: 'B',
        text: 'Pecahkan kantung lisosom secara sembarangan di tengah sitoplasma agar limbah cepat musnah.',
        energyChange: -20,
        integrityChange: -30,
        logisticsChange: -20,
        feedback: 'Bencana Enzimik! Enzim asam lisosom yang tumpah bebas merusak struktur internal sel (autolisis tak terkendali).'
      },
      {
        id: 'C',
        text: 'Tampung semua limbah beracun di sudut sitoskeleton tanpa melakukan penguraian enzimatik.',
        energyChange: 10,
        integrityChange: 5,
        logisticsChange: 10,
        feedback: 'Kompromi Sementara: Penumpukan racun masih membayangi kelangsungan hidup sel dalam jangka panjang.'
      }
    ]
  }
];

export const Level7BranchingScenario: React.FC<Level7Props> = ({
  onComplete,
  isAlreadyCleared = false,
  currentUser
}) => {
  const [activeStep, setActiveStep] = useState<'video' | 'scenario'>('video');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [energyScore, setEnergyScore] = useState<number>(50);
  const [integrityScore, setIntegrityScore] = useState<number>(50);
  const [logisticsScore, setLogisticsScore] = useState<number>(50);
  const [decisionHistory, setDecisionHistory] = useState<DecisionChoice[]>([]);

  const handleSelectChoice = (choice: DecisionChoice) => {
    sfx.playClick();
    const newChoices = [...selectedChoices, choice.id];
    const newHistory = [...decisionHistory, choice];
    
    setSelectedChoices(newChoices);
    setDecisionHistory(newHistory);
    setEnergyScore(prev => Math.min(100, Math.max(0, prev + choice.energyChange)));
    setIntegrityScore(prev => Math.min(100, Math.max(0, prev + choice.integrityChange)));
    setLogisticsScore(prev => Math.min(100, Math.max(0, prev + choice.logisticsChange)));

    if (currentStep < DECISION_TREE.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate outcome
      finishScenario(newHistory);
    }
  };

  const finishScenario = (history: DecisionChoice[]) => {
    setShowResult(true);

    // Calculate total points on 0 - 100 scale
    // Perfect: A, A, A -> 100 points
    const aCount = history.filter(h => h.id === 'A').length;
    const bCount = history.filter(h => h.id === 'B').length;
    const cCount = history.filter(h => h.id === 'C').length;

    let totalScore = 0;
    let jalur = 'krisis_berlanjut';

    if (aCount === 3) {
      totalScore = 100;
      jalur = 'penyelamatan_berhasil';
    } else if (aCount === 2 && bCount === 1) {
      totalScore = 85;
      jalur = 'penyelamatan_berhasil';
    } else if (aCount === 2 && cCount === 1) {
      totalScore = 75;
      jalur = 'stabilisasi_parsial';
    } else if (aCount === 1 && bCount >= 1) {
      totalScore = 60;
      jalur = 'krisis_berlanjut';
    } else if (bCount >= 2) {
      totalScore = 50;
      jalur = 'krisis_berlanjut';
    } else {
      totalScore = 30;
      jalur = 'kegagalan_sistemik';
    }

    if (totalScore >= 70 || jalur === 'penyelamatan_berhasil') {
      sfx.playStageComplete();
    } else {
      sfx.playWrong();
    }

    onComplete(totalScore, 100, jalur);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedChoices([]);
    setDecisionHistory([]);
    setEnergyScore(50);
    setIntegrityScore(50);
    setLogisticsScore(50);
    setShowResult(false);
    sfx.playClick();
  };

  const currentNode = DECISION_TREE[currentStep];

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto text-slate-800">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-purple-500/30 rounded-2xl p-2.5 sm:p-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-extrabold text-amber-200 tracking-wide uppercase text-[11px] sm:text-xs">
            Level 7: Penyelamatan Krisis Holistik
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
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md font-black'
                : 'bg-slate-800/80 text-purple-200/70 hover:bg-slate-700 hover:text-white'
            }`}
          >
            1. Video Pengantar
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveStep('scenario');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStep === 'scenario'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md font-black'
                : 'bg-slate-800/80 text-purple-200/70 hover:bg-slate-700 hover:text-white'
            }`}
          >
            2. Skenario Keputusan
          </button>
        </div>
      </div>

      {activeStep === 'video' ? (
        <LevelVideoSlide
          levelTitle="Level 7: Penyelamatan Krisis Holistik Desa Sel"
          slideTitle="Panggilan Darurat Kepala Desa"
          slideDescription="Simak video panggilan darurat Kepala Desa Sel mengenai ancaman krisis sistemik pada seluruh organel sel. Anda dapat memutar video bawaan atau mengunggah video investigasi Anda sendiri di bawah ini sebelum mengambil keputusan strategis."
          slotKey="asset_061"
          slideId="lvl7-s0"
          defaultVideoSource="asset_061.mp4"
          nextButtonTitle="Lanjut ke Skenario Pengambilan Keputusan"
          onNext={() => setActiveStep('scenario')}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* Level Header */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-purple-500/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-500/20 border border-purple-400/40 rounded-xl text-purple-300">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Level 7 • Skenario Pengambilan Keputusan (Branching)
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-fredoka text-amber-200">
                  Penyelamatan Krisis Holistik Desa Sel
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Sebagai Kepala Desa Sel, setiap keputusan yang kamu ambil akan menentukan nasib kelangsungan hidup sel. Nilai akhir dihitung pada skala 0–100 berdasarkan jalur keputusan. <strong>Syarat lulus: mencapai jalur sukses ('penyelamatan_berhasil' atau skor ≥ 70).</strong>
            </p>

            {/* Real-time Indicator Gauges */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-purple-500/30">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-purple-500/30 flex flex-col">
                <span className="text-[10px] text-purple-300 font-bold uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Energi (ATP)
                </span>
                <span className="text-lg font-black text-amber-300">{energyScore}%</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-purple-500/30 flex flex-col">
                <span className="text-[10px] text-purple-300 font-bold uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" /> Integritas Sel
                </span>
                <span className="text-lg font-black text-emerald-300">{integrityScore}%</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-purple-500/30 flex flex-col">
                <span className="text-[10px] text-purple-300 font-bold uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 text-teal-400" /> Efisiensi Logistik
                </span>
                <span className="text-lg font-black text-teal-300">{logisticsScore}%</span>
              </div>
            </div>
          </div>

      {/* Main Decision Screen */}
      {!showResult ? (
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-indigo-200 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b pb-3 border-indigo-100">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
              {currentNode.phaseTitle} ({currentStep + 1} / {DECISION_TREE.length})
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Keputusan Ke-{currentStep + 1}
            </span>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm sm:text-base text-indigo-950 font-medium leading-relaxed">
              {currentNode.scenario}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Kebijakan yang Akan Anda Terapkan:
            </span>
            {currentNode.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSelectChoice(choice)}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all active:scale-98 cursor-pointer flex items-start gap-3 group shadow-sm hover:shadow"
              >
                <span className="w-8 h-8 rounded-lg bg-indigo-700 text-white font-black text-sm flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                  {choice.id}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                    {choice.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Result Summary */
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-300 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b pb-3 border-emerald-100">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900 font-fredoka">
              Rekapitulasi Keputusan Kepala Desa Sel
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {decisionHistory.map((h, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 mb-1">
                  Keputusan Fase {i + 1}: Opsi {h.id}
                </div>
                <p className="text-slate-700 mb-1">{h.text}</p>
                <span className="text-emerald-700 font-semibold italic">{h.feedback}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Skenario Lain</span>
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
