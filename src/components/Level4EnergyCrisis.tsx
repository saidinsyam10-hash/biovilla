import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '../utils/audio';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  AlertTriangle, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Check, 
  HelpCircle,
  Award,
  Layers,
  Search,
  Eye,
  Maximize2,
  X,
  Microscope,
  FlaskConical,
  Calculator,
  Lightbulb,
  BatteryCharging,
  Flame
} from 'lucide-react';
import { UserAccount } from '../types';
import { LevelVideoSlide } from './LevelVideoSlide';
import { CellPowerPlantDiagram } from './CellPowerPlantDiagram';

// 3D Photorealistic Assets (BBC/National Geographic Scientific Style)
import symptomsDashboardImg from '../assets/images/level4_symptoms_dashboard_1789611201396.jpg';
import mitochondriaCutawayImg from '../assets/images/level4_mitochondria_cutaway_1789611212502.jpg';
import systemicMapImg from '../assets/images/level4_systemic_map_1789611224134.jpg';
import dimBulbImg from '../assets/images/symptom_dim_bulb_1789611237137.jpg';
import rustyGearsImg from '../assets/images/symptom_rusty_gears_1789611247772.jpg';
import rustyGateImg from '../assets/images/symptom_rusty_gate_1789611259963.jpg';

// Real Biological Cytology Assets (Real Organelles & Cell Pathology)
import cardMitoDistressImg from '../assets/images/card_mito_distress_1789608158842.jpg';
import cardAtpDecreaseImg from '../assets/images/card_atp_decrease_1789608172784.jpg';
import cardCellLowEnergyImg from '../assets/images/card_cell_low_energy_1789608189534.jpg';
import cardCellDisruptionImg from '../assets/images/card_cell_disruption_1789608202159.jpg';

interface Level4EnergyCrisisProps {
  onComplete: (score?: number, maxScore?: number) => void;
  onClose: () => void;
  isAlreadyCleared?: boolean;
  currentUser?: UserAccount | null;
}

// Data Soal 3 Babak (Total 7 Soal)
interface QuestionData {
  id: string;
  round: 1 | 2 | 3;
  roundTitle: string;
  prompt: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

const QUESTIONS: QuestionData[] = [
  // Babak 1 – Observasi Gejala (2 Soal)
  {
    id: 'q1',
    round: 1,
    roundTitle: 'Babak 1 – Observasi Gejala Pemadaman',
    prompt: 'Ketika mitokondria kehabisan energi ATP, fasilitas manakah di Desa Sel yang langsung berhenti bekerja?',
    options: [
      { id: 'a', text: 'Pabrik protein (RE & Ribosom) macet dan pompa gerbang membran sel mati', isCorrect: true },
      { id: 'b', text: 'Inti sel membesar dan membelah dua kali lipat secara tiba-tiba', isCorrect: false },
      { id: 'c', text: 'Dinding pelindung sel langsung mencair seketika', isCorrect: false },
      { id: 'd', text: 'Seluruh cairan sitoplasma berubah menjadi gas', isCorrect: false },
    ],
    explanation: 'ATP adalah sumber energi utama sel. Tanpa pasokan ATP dari mitokondria, ribosom tidak dapat merangkai protein dan pompa ion pada membran sel mati, sehingga aktivitas sel lumpuh total.'
  },
  {
    id: 'q2',
    round: 1,
    roundTitle: 'Babak 1 – Observasi Gejala Pemadaman',
    prompt: 'Mengapa mitokondria dijuluki sebagai "Pembangkit Tenaga Listrik Desa Sel"?',
    options: [
      { id: 'a', text: 'Karena mitokondria memproduksi sekitar 90% energi ATP yang dibutuhkan seluruh organel', isCorrect: true },
      { id: 'b', text: 'Karena mitokondria menyimpan seluruh arsip cetak biru genetik DNA sel', isCorrect: false },
      { id: 'c', text: 'Karena mitokondria bertugas mendaur ulang sampah sel', isCorrect: false },
      { id: 'd', text: 'Karena mitokondria membungkus paket zat untuk diekspor ke luar sel', isCorrect: false },
    ],
    explanation: 'Mitokondria mengolah sari makanan melalui respirasi seluler aerob untuk menghasilkan puluhan ATP dari setiap molekul glukosa guna menyalakan kehidupan sel.'
  },

  // Babak 2 – Telusuri Mekanisme (3 Soal)
  {
    id: 'q3',
    round: 2,
    roundTitle: 'Babak 2 – Telusuri Mesin Pembangkit',
    prompt: 'Organel sel bermembran ganda yang memiliki lipatan krista tempat turbin pembuat ATP berputar adalah ...',
    options: [
      { id: 'a', text: 'Mitokondria', isCorrect: true },
      { id: 'b', text: 'Retikulum Endoplasma', isCorrect: false },
      { id: 'c', text: 'Badan Golgi', isCorrect: false },
      { id: 'd', text: 'Lisosom', isCorrect: false },
    ],
    explanation: 'Mitokondria memiliki membran luar dan membran dalam berlipat-lipat (krista) yang berfungsi menampung jutaan turbin enzim ATP Sintase pembuat energi.'
  },
  {
    id: 'q4',
    round: 2,
    roundTitle: 'Babak 2 – Telusuri Mesin Pembangkit',
    prompt: 'Apa yang terjadi pada pembangkit mitokondria jika pasokan gas Oksigen (O₂) di Desa Sel terhenti?',
    options: [
      { id: 'a', text: 'Rantai transpor elektron macet dan produksi ATP anjlok drastis', isCorrect: true },
      { id: 'b', text: 'Produksi energi justru meningkat dua kali lipat', isCorrect: false },
      { id: 'c', text: 'Sel langsung membelah diri menjadi dua sel baru', isCorrect: false },
      { id: 'd', text: 'Glukosa terbakar lebih cepat tanpa sisa limbah', isCorrect: false },
    ],
    explanation: 'Gas oksigen (O2) berperan krusial sebagai penangkap elektron terakhir di rantai transpor elektron. Tanpa oksigen, aliran elektron macet dan turbin ATP Sintase berhenti berputar.'
  },
  {
    id: 'q5',
    round: 2,
    roundTitle: 'Babak 2 – Telusuri Mesin Pembangkit',
    prompt: 'Mengapa molekul ATP sering diibaratkan sebagai "Mata Uang Energi" bagi organel di Desa Sel?',
    options: [
      { id: 'a', text: 'Karena ikatannya mudah melepaskan energi siap pakai seketika saat dibutuhkan organel', isCorrect: true },
      { id: 'b', text: 'Karena ATP hanya bisa dibuat satu kali seumur hidup sel', isCorrect: false },
      { id: 'c', text: 'Karena ATP disimpan rapat di inti sel dan tidak boleh dibelanjakan', isCorrect: false },
      { id: 'd', text: 'Karena ATP hanya berfungsi sebagai bahan penyusun dinding sel', isCorrect: false },
    ],
    explanation: 'Pemutusan satu ikatan fosfat pada ATP menjadi ADP membebaskan energi siap pakai seketika yang langsung dapat dibelanjakan oleh organel sel untuk bekerja.'
  },

  // Babak 3 – Prediksi Dampak Sistemik & Tantangan Matematika (2 Soal)
  {
    id: 'q6',
    round: 3,
    roundTitle: 'Babak 3 – Perhitungan Matematika Daya Desa Sel',
    prompt: '⚡ [Tantangan Matematika Daya Desa Sel]: Fasilitas Desa Sel membutuhkan energi darurat total sebesar 300 hingga 320 ATP agar seluruh lampu dan mesin menyala normal. Jika pembakaran 1 molekul glukosa secara aerob menghasilkan 30 sampai 32 ATP, berapakah jumlah molekul glukosa yang harus dipecah oleh mitokondria?',
    options: [
      { id: 'a', text: '10 molekul glukosa (menghasilkan tepat 300 s.d. 320 ATP)', isCorrect: true },
      { id: 'b', text: '5 molekul glukosa (hanya menghasilkan 150 s.d. 160 ATP)', isCorrect: false },
      { id: 'c', text: '20 molekul glukosa (berlebih 600 s.d. 640 ATP)', isCorrect: false },
      { id: 'd', text: '30 molekul glukosa (berlebih 900 s.d. 960 ATP)', isCorrect: false },
    ],
    explanation: 'Kunci Jawaban: Opsi A (10 molekul glukosa). Cara Menghitung: Nilai minimum = 300 ATP ÷ 30 ATP/glukosa = 10 glukosa; Nilai maksimum = 320 ATP ÷ 32 ATP/glukosa = 10 glukosa. Jadi, mitokondria membutuhkan tepat 10 molekul glukosa untuk menyalakan Desa Sel!'
  },
  {
    id: 'q7',
    round: 3,
    roundTitle: 'Babak 3 – Perhitungan Matematika Daya Desa Sel',
    prompt: 'Jika Desa Sel kehabisan oksigen dan terpaksa menggunakan jalur darurat tanpa oksigen (respirasi anaerob/fermentasi), mengapa cara ini sangat merugikan desa?',
    options: [
      { id: 'a', text: 'Hasil energinya sangat sedikit (hanya 2 ATP per glukosa) dan menimbulkan limbah asam laktat yang merusak sel', isCorrect: true },
      { id: 'b', text: 'Hasil energinya melonjak tinggi menjadi 100 ATP per glukosa', isCorrect: false },
      { id: 'c', text: 'Inti sel langsung menghilang secara misterius', isCorrect: false },
      { id: 'd', text: 'Desa Sel langsung kelebihan energi listrik tanpa batas', isCorrect: false },
    ],
    explanation: 'Respirasi anaerob di sitoplasma hanya menghasilkan 2 ATP per glukosa (jauh lebih sedikit dibanding 30-32 ATP di mitokondria) serta menimbun asam laktat yang dapat menurunkan pH dan meracuni sel.'
  },
];

/* ========================================================================= */
/* KOMPONEN ANIMASI INTERAKTIF: GENERATOR GLUKOSA -> ATP DESA SEL           */
/* ========================================================================= */
interface GlucoseEnergySimulatorProps {
  initialGlucose?: number;
}

export const GlucoseEnergySimulator: React.FC<GlucoseEnergySimulatorProps> = ({ initialGlucose = 10 }) => {
  const [glucoseCount, setGlucoseCount] = useState<number>(initialGlucose);
  const minAtp = glucoseCount * 30;
  const maxAtp = glucoseCount * 32;
  const targetMin = 300;
  const targetMax = 320;
  const isTargetMet = glucoseCount >= 10;
  const isTargetExact = glucoseCount === 10;
  const percentFulfillment = Math.min(100, Math.round((minAtp / targetMin) * 100));

  // Kecepatan putar turbin (makin banyak glukosa makin cepat berputar)
  const spinSpeed = Math.max(0.6, 5 / glucoseCount);

  return (
    <div className="bg-gradient-to-b from-slate-900 via-[#042421] to-slate-950 rounded-3xl p-4 sm:p-6 border-2 border-teal-500/50 shadow-2xl space-y-4 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-500/25 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-amber-200 flex items-center gap-2 font-fredoka">
              <span>Simulator Animasi: Generator Glukosa ➔ Energi ATP Desa Sel</span>
            </h3>
            <p className="text-xs text-slate-300">
              Uji coba konversi 1 Glukosa menghasilkan 30–32 ATP untuk menyalakan fasilitas Desa Sel
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-teal-500/40 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-300">Status Desa:</span>
          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
            isTargetExact
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
              : isTargetMet
              ? 'bg-teal-500/20 border-teal-400 text-teal-300'
              : 'bg-amber-500/20 border-amber-400 text-amber-300'
          }`}>
            {isTargetExact ? '⭐ Target Tepat 100%' : isTargetMet ? '⚡ Surplus Energi' : '⚠️ Daya Kurang'}
          </span>
        </div>
      </div>

      {/* Main Visual Animation Canvas (SVG) */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-teal-500/40 bg-slate-950/95 shadow-inner">
        <svg viewBox="0 0 840 280" className="w-full h-full object-contain">
          <defs>
            <linearGradient id="simMitoOuter" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#042f2e" />
            </linearGradient>
            <linearGradient id="simMitoMatrix" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#291102" />
            </linearGradient>
            <linearGradient id="simGlucoseGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="simGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Circuit Lines */}
          <line x1="180" y1="140" x2="310" y2="140" stroke="#14b8a6" strokeWidth="4" strokeDasharray="8 4" opacity="0.6" />
          <line x1="490" y1="140" x2="620" y2="140" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 4" opacity="0.8" />

          {/* ================= SECTION 1: INPUT GLUKOSA (KIRI) ================= */}
          <g transform="translate(10, 15)">
            <rect x="10" y="20" width="160" height="210" rx="16" fill="#042f2e" fillOpacity="0.4" stroke="#14b8a6" strokeWidth="2" strokeDasharray="6 4" />
            <text x="90" y="44" fill="#5eead4" fontSize="11" fontWeight="bold" textAnchor="middle">
              Silo Bahan Makanan
            </text>
            <text x="90" y="60" fill="#a7f3d0" fontSize="12" fontWeight="black" textAnchor="middle">
              {glucoseCount} Glukosa (C₆H₁₂O₆)
            </text>

            {/* Render Glucose Molecules as Hexagons */}
            {Array.from({ length: Math.min(10, glucoseCount) }).map((_, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const cx = 50 + col * 40;
              const cy = 90 + row * 40;
              return (
                <g key={i} className="animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                  <polygon
                    points={`${cx},${cy - 12} ${cx + 11},${cy - 6} ${cx + 11},${cy + 6} ${cx},${cy + 12} ${cx - 11},${cy + 6} ${cx - 11},${cy - 6}`}
                    fill="url(#simGlucoseGrad)"
                    stroke="#bef264"
                    strokeWidth="1.5"
                    filter="url(#simGlow)"
                  />
                  <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
                </g>
              );
            })}

            {glucoseCount > 10 && (
              <text x="90" y="215" fill="#facc15" fontSize="10" fontWeight="bold" textAnchor="middle">
                +{glucoseCount - 10} molekul tambahan
              </text>
            )}

            <path d="M 170 140 L 195 140" stroke="#34d399" strokeWidth="4" />
          </g>

          {/* ================= SECTION 2: MITOKONDRIA & TURBIN SINTASE (TENGAH) ================= */}
          <g transform="translate(400, 140)">
            <ellipse cx="0" cy="0" rx="130" ry="85" fill="url(#simMitoOuter)" stroke="#2dd4bf" strokeWidth="3" />
            <ellipse cx="0" cy="0" rx="105" ry="65" fill="url(#simMitoMatrix)" stroke="#f59e0b" strokeWidth="2" />

            <path d="M -90 -20 C -70 -50 -50 0 -30 -30 C -10 -50 10 0 30 -30 C 50 -50 70 0 90 -20" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.4" />
            <path d="M -90 20 C -70 50 -50 0 -30 30 C -10 50 10 0 30 30 C 50 50 70 0 90 20" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.4" />

            {/* Central Rotary Turbine (ATP Synthase) with dynamic spinning speed */}
            <g style={{ animation: `spin ${spinSpeed}s linear infinite`, transformOrigin: '0px 0px' }}>
              <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2={28 * Math.cos((deg * Math.PI) / 180)}
                  y2={28 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#fde047"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="0" cy="0" r="10" fill="#dc2626" filter="url(#simGlow)" />
            </g>

            {/* Spark Indicators */}
            <g transform="translate(-45, -45)">
              <polygon points="0,0 8,-12 3,-12 7,-22 -1,-10 4,-10" fill="#facc15" filter="url(#simGlow)" />
            </g>
            <g transform="translate(45, 45)">
              <polygon points="0,0 8,-12 3,-12 7,-22 -1,-10 4,-10" fill="#facc15" filter="url(#simGlow)" />
            </g>

            <text x="0" y="52" fill="#fde047" fontSize="10" fontWeight="black" textAnchor="middle">
              Turbin ATP Sintase
            </text>
            <text x="0" y="66" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">
              (1 Glukosa ➔ 30–32 ATP)
            </text>
          </g>

          {/* ================= SECTION 3: DESA SEL & FASILITAS (KANAN) ================= */}
          <g transform="translate(610, 15)">
            <rect x="10" y="20" width="200" height="210" rx="16" fill="#020617" fillOpacity="0.6" stroke={isTargetMet ? '#10b981' : '#f59e0b'} strokeWidth="2" />
            
            <text x="110" y="44" fill={isTargetMet ? '#34d399' : '#fde047'} fontSize="11" fontWeight="black" textAnchor="middle">
              Fasilitas Desa Sel
            </text>
            <text x="110" y="60" fill="#cbd5e1" fontSize="10" textAnchor="middle">
              Kebutuhan: 300–320 ATP
            </text>

            {/* 1. Balai Nukleus */}
            <g transform="translate(30, 80)">
              <rect x="0" y="10" width="36" height="34" rx="4" fill={isTargetMet ? '#047857' : glucoseCount >= 5 ? '#854d0e' : '#334155'} stroke={isTargetMet ? '#34d399' : '#64748b'} strokeWidth="1.5" />
              <polygon points="18,0 -4,12 40,12" fill={isTargetMet ? '#059669' : '#1e293b'} />
              <circle cx="18" cy="24" r="5" fill={isTargetMet ? '#fef08a' : glucoseCount >= 5 ? '#f59e0b' : '#0f172a'} filter={isTargetMet ? 'url(#simGlow)' : undefined} />
              <text x="18" y="54" fill="#94a3b8" fontSize="8" textAnchor="middle">Nukleus</text>
            </g>

            {/* 2. Pabrik Protein RE */}
            <g transform="translate(85, 80)">
              <rect x="0" y="12" width="36" height="32" rx="4" fill={isTargetMet ? '#047857' : glucoseCount >= 5 ? '#854d0e' : '#334155'} stroke={isTargetMet ? '#34d399' : '#64748b'} strokeWidth="1.5" />
              <polygon points="18,2 -2,14 38,14" fill={isTargetMet ? '#059669' : '#1e293b'} />
              <circle cx="18" cy="24" r="5" fill={isTargetMet ? '#fef08a' : glucoseCount >= 5 ? '#f59e0b' : '#0f172a'} filter={isTargetMet ? 'url(#simGlow)' : undefined} />
              <text x="18" y="54" fill="#94a3b8" fontSize="8" textAnchor="middle">Pabrik RE</text>
            </g>

            {/* 3. Pusat Distribusi Golgi */}
            <g transform="translate(140, 80)">
              <rect x="0" y="10" width="36" height="34" rx="4" fill={isTargetMet ? '#047857' : glucoseCount >= 5 ? '#854d0e' : '#334155'} stroke={isTargetMet ? '#34d399' : '#64748b'} strokeWidth="1.5" />
              <polygon points="18,0 -4,12 40,12" fill={isTargetMet ? '#059669' : '#1e293b'} />
              <circle cx="18" cy="24" r="5" fill={isTargetMet ? '#fef08a' : glucoseCount >= 5 ? '#f59e0b' : '#0f172a'} filter={isTargetMet ? 'url(#simGlow)' : undefined} />
              <text x="18" y="54" fill="#94a3b8" fontSize="8" textAnchor="middle">Golgi</text>
            </g>

            {/* 4. Gerbang Membran Sel */}
            <g transform="translate(45, 148)">
              <rect x="0" y="5" width="110" height="24" rx="6" fill={isTargetMet ? '#065f46' : glucoseCount >= 5 ? '#713f12' : '#1e293b'} stroke={isTargetMet ? '#10b981' : '#475569'} strokeWidth="1.5" />
              <line x1="20" y1="5" x2="20" y2="29" stroke="#94a3b8" strokeWidth="2" />
              <line x1="55" y1="5" x2="55" y2="29" stroke="#94a3b8" strokeWidth="2" />
              <line x1="90" y1="5" x2="90" y2="29" stroke="#94a3b8" strokeWidth="2" />
              <text x="55" y="42" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">Gerbang Membran & Pompa Ion</text>
            </g>

            {/* Village Lighting Status Banner */}
            <g transform="translate(110, 214)">
              <rect x="-85" y="-14" width="170" height="22" rx="8" fill={isTargetMet ? '#059669' : '#b45309'} opacity="0.95" />
              <text x="0" y="1" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">
                {isTargetMet ? '✓ SELURUH DESA MENYALA 100%' : '⚠️ SEBAGIAN MASIH GELAP'}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Interactive Controls & Live Mathematics Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        {/* Left: Interactive Glukosa Input Controls */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-teal-200 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Atur Pasokan Bahan Makanan (Glukosa):</span>
            </span>
            <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
              {glucoseCount} Molekul
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={glucoseCount <= 1}
              onClick={() => {
                sfx.playClick();
                setGlucoseCount(prev => Math.max(1, prev - 1));
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-black text-lg flex items-center justify-center border border-slate-600 transition-all cursor-pointer active:scale-95"
            >
              -
            </button>

            <input
              type="range"
              min="1"
              max="15"
              value={glucoseCount}
              onChange={(e) => {
                setGlucoseCount(Number(e.target.value));
              }}
              className="flex-1 accent-teal-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />

            <button
              type="button"
              disabled={glucoseCount >= 15}
              onClick={() => {
                sfx.playClick();
                setGlucoseCount(prev => Math.min(15, prev + 1));
              }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-black text-lg flex items-center justify-center border border-slate-600 transition-all cursor-pointer active:scale-95"
            >
              +
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setGlucoseCount(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                glucoseCount === 1 ? 'bg-teal-500/20 border-teal-400 text-teal-200' : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              1 Glukosa (Standar 30-32 ATP)
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setGlucoseCount(5);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                glucoseCount === 5 ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              5 Glukosa (150-160 ATP)
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setGlucoseCount(10);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                glucoseCount === 10 ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40' : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              }`}
            >
              ⭐ 10 Glukosa (Target Desa: 300–320 ATP)
            </button>
          </div>
        </div>

        {/* Right: Live Calculation & Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Perhitungan Daya Berjalan:</span>
            </span>
            <span className="text-xs font-mono font-bold text-teal-300">
              Target: 300–320 ATP
            </span>
          </div>

          {/* Mathematical Equation Display Box */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-teal-500/30 font-mono text-center text-xs sm:text-sm">
            <span className="text-emerald-300 font-bold">{glucoseCount} Glukosa</span>
            <span className="text-slate-400"> × </span>
            <span className="text-sky-300 font-bold">(30 s.d. 32 ATP)</span>
            <span className="text-slate-400"> = </span>
            <span className={`font-black ${isTargetExact ? 'text-emerald-400' : isTargetMet ? 'text-teal-300' : 'text-amber-400'}`}>
              {minAtp} s.d. {maxAtp} ATP
            </span>
          </div>

          {/* Progress Bar of Desa Requirement */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Pemenuhan Daya Desa:</span>
              <span className={isTargetMet ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                {percentFulfillment}% ({minAtp}/300 ATP Minimum)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTargetExact
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : isTargetMet
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${percentFulfillment}%` }}
              />
            </div>
          </div>

          {/* Informational Guidance Text */}
          <div className="text-[11px] leading-relaxed">
            {isTargetExact ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Tepat Sekali! 10 molekul glukosa menghasilkan 300–320 ATP, menyalakan seluruh fasilitas Desa Sel!</span>
              </span>
            ) : isTargetMet ? (
              <span className="text-teal-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                <span>Daya melimpah! Desa Sel memiliki cadangan energi lebih dari cukup.</span>
              </span>
            ) : (
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-orange-400" />
                <span>Daya masih kurang {targetMin - minAtp} ATP. Tambahkan glukosa hingga mencapai 10 molekul!</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type SceneStep = 'video' | 'scene1' | 'scene2' | 'scene3' | 'scene4' | 'scene5' | 'summary';

export const Level4EnergyCrisis: React.FC<Level4EnergyCrisisProps> = ({
  onComplete,
  onClose,
  isAlreadyCleared = false,
  currentUser
}) => {
  const [currentScene, setCurrentScene] = useState<SceneStep>('video');

  // Animation states for Scene 1 (Crisis Intro)
  const [scene1State, setScene1State] = useState<'normal' | 'flicker' | 'crisis'>('normal');

  // Interactive real biological symptoms inspected in Scene 3 (Babak 1)
  const [inspectedSymptom, setInspectedSymptom] = useState<'mito' | 'er' | 'membrane' | 'bulb' | 'gear' | 'gate' | null>('mito');
  const [inspectedSamples, setInspectedSamples] = useState<string[]>(['mito']);

  // Lightbox modal for full-resolution scientific inspection
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; title: string; desc: string } | null>(null);

  // Active chamber in Scene 4 (Babak 2)
  const [activeChamber, setActiveChamber] = useState<'glycolysis' | 'krebs' | 'etc'>('etc');
  const [viewModeBabak2, setViewModeBabak2] = useState<'photo' | 'diagram' | 'schematic'>('diagram');

  // Sector inspection in Scene 5 (Babak 3)
  const [inspectedMapPoint, setInspectedMapPoint] = useState<'mitochondria' | 're' | 'golgi' | 'nucleus' | 'gate' | null>('mitochondria');

  // Answers state for all 7 questions: { [questionId: string]: string (optionId) }
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showQuestionFeedback, setShowQuestionFeedback] = useState<Record<string, boolean>>({});

  // Question navigation per scene
  const [scene3CurrentQ, setScene3CurrentQ] = useState<number>(0); // 0 or 1
  const [scene4CurrentQ, setScene4CurrentQ] = useState<number>(0); // 0, 1, or 2
  const [scene5CurrentQ, setScene5CurrentQ] = useState<number>(0); // 0 or 1

  // Autoplay or sequence timers for Scene 1 & 2
  useEffect(() => {
    if (currentScene === 'scene1') {
      const timer1 = setTimeout(() => {
        setScene1State('flicker');
      }, 1500);

      const timer2 = setTimeout(() => {
        setScene1State('crisis');
        sfx.playWrong();
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [currentScene]);

  // Audio cues on scene transitions
  const handleNextScene = (next: SceneStep) => {
    sfx.playClick();
    setCurrentScene(next);
  };

  const handleSelectOption = (qId: string, optId: string) => {
    sfx.playClick();
    setUserAnswers(prev => ({ ...prev, [qId]: optId }));
    setShowQuestionFeedback(prev => ({ ...prev, [qId]: true }));

    const question = QUESTIONS.find(q => q.id === qId);
    const chosen = question?.options.find(o => o.id === optId);
    if (chosen?.isCorrect) {
      sfx.playCorrect();
    } else {
      sfx.playWrong();
    }
  };

  // Score calculation
  const totalQuestions = QUESTIONS.length;
  const correctCount = QUESTIONS.filter(q => {
    const userOptId = userAnswers[q.id];
    const opt = q.options.find(o => o.id === userOptId);
    return opt?.isCorrect;
  }).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = scorePercent >= 70;

  const handleFinishLevel = () => {
    if (currentUser?.role === 'guru') {
      onClose();
      return;
    }
    sfx.playStageComplete();
    onComplete(correctCount, totalQuestions);
  };

  const handleResetLevel = () => {
    sfx.playClick();
    setUserAnswers({});
    setShowQuestionFeedback({});
    setScene3CurrentQ(0);
    setScene4CurrentQ(0);
    setScene5CurrentQ(0);
    setScene1State('normal');
    setCurrentScene('video');
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Top Progress & Step Navigation Indicator */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-teal-500/30 rounded-2xl p-2.5 sm:p-3 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-extrabold text-amber-200 tracking-wide uppercase text-[11px] sm:text-xs">
            Level 4: Krisis Energi Desa Sel
          </span>
        </div>

        {/* Step Breadcrumbs */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
          {[
            { id: 'video', label: '1. Video Krisis' },
            { id: 'scene1', label: '2. Intro' },
            { id: 'scene2', label: '3. Transisi' },
            { id: 'scene3', label: '4. Gejala' },
            { id: 'scene4', label: '5. Mekanisme' },
            { id: 'scene5', label: '6. Prediksi' },
            { id: 'summary', label: 'Laporan' }
          ].map((st, idx) => {
            const isActive = currentScene === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setCurrentScene(st.id as SceneStep);
                }}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950 shadow-md font-black' 
                    : 'bg-slate-800/80 text-teal-200/70 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE 1: VIDEO PENGANTAR LEVEL 4 & TEMPAT UPLOAD                          */}
      {/* ========================================================================= */}
      {currentScene === 'video' && (
        <LevelVideoSlide
          levelTitle="Level 4: Krisis Energi di Desa Sel"
          slideTitle="Krisis Energi di Desa Sel"
          slideDescription="Simak video pengantar tentang pemadaman darurat dan krisis energi di Desa Sel. Anda dapat menonton video bawaan atau mengunggah video investigasi Anda sendiri di bawah ini sebelum melanjutkan ke analisis gejala krisis."
          slotKey="asset_043"
          slideId="lvl4-s0"
          defaultVideoSource="asset_043.mp4"
          nextButtonTitle="Lanjut ke Investigasi Gejala"
          onNext={() => handleNextScene('scene1')}
          currentUser={currentUser}
        />
      )}

      {/* ========================================================================= */}
      {/* ADEGAN 1: INTRO KRISIS ENERGI & PEMBANGKIT LISTRIK DESA SEL               */}
      {/* ========================================================================= */}
      {currentScene === 'scene1' && (
        <div className="space-y-4">
          <CellPowerPlantDiagram
            initialState={scene1State === 'crisis' ? 'crisis' : 'normal'}
            showControls={true}
            interactiveHotspots={true}
            onStateChange={(st) => setScene1State(st)}
          />

          {/* Bottom Alert & Navigation Ribbon */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-amber-400/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${scene1State === 'crisis' ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {scene1State === 'crisis' ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-200">
                  {scene1State === 'crisis' ? 'Peringatan: Pemadaman Listrik Biologis (Blackout Energi) di Desa Sel!' : 'Desa Sel: Pembangkit Listrik Beroperasi Normal (36 ATP/Glukosa)'}
                </div>
                <div className="text-[11px] text-slate-300">
                  {scene1State === 'crisis' ? 'Aliran arus elektron terhenti, gradien tegangan membran mitokondria anjlok ke 24 mV. Seluruh organel mengalami kelaparan daya!' : 'Jalur bio-listrik mengalirkan ATP dari gardu mitokondria ke inti sel, RE, badan golgi, dan membran sel.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setScene1State(scene1State === 'crisis' ? 'normal' : 'crisis');
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                <span>{scene1State === 'crisis' ? 'Kembali Normal' : 'Simulasi Padam'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNextScene('scene2')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-900/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 animate-bounce"
              >
                <Search className="w-4 h-4 text-slate-950" />
                <span>Selidiki Masalah Kelistrikan Sel</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADEGAN 2: TRANSISI MISI (HOLOGRAPHIC DIAGNOSTIC PANEL)                    */}
      {/* ========================================================================= */}
      {currentScene === 'scene2' && (
        <div className="space-y-4">
          <div className="relative w-full aspect-video max-h-[460px] bg-gradient-to-b from-[#022c22] via-[#0f172a] to-[#2e1065] rounded-3xl overflow-hidden border-2 border-teal-500/40 shadow-2xl flex items-center justify-center select-none">
            <svg viewBox="0 0 960 540" className="w-full h-full object-cover">
              <defs>
                <filter id="holoGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="holoBorder" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Floating Holographic Diagnostic Panel */}
              <g transform="translate(480, 240)">
                {/* Hologram Base Projection Beam */}
                <polygon points="-240,160 240,160 320,240 -320,240" fill="#0d9488" opacity="0.1" />

                {/* Main Hologram Glass Window */}
                <rect x="-260" y="-140" width="520" height="260" rx="24" fill="#042f2e" fillOpacity="0.75" stroke="url(#holoBorder)" strokeWidth="3" filter="url(#holoGlow)" />

                {/* Orbiting Bioluminescent Particles */}
                <circle cx="-160" cy="-60" r="3" fill="#facc15" filter="url(#holoGlow)">
                  <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="50" r="3.5" fill="#2dd4bf" filter="url(#holoGlow)">
                  <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="6s" repeatCount="indefinite" />
                </circle>

                {/* Gauge 1: Matrix Potential (Flickering Orange) */}
                <g transform="translate(-160, -20)">
                  <circle cx="0" cy="0" r="42" fill="#0f172a" stroke="#14b8a6" strokeWidth="4" />
                  <path d="M -30 20 A 42 42 0 1 1 25 25" fill="none" stroke="#f97316" strokeWidth="6" strokeDasharray="140" strokeDashoffset="50" className="animate-pulse" />
                  <circle cx="0" cy="0" r="8" fill="#ea580c" />
                  <line x1="0" y1="0" x2="18" y2="-18" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                  <text x="0" y="58" fill="#5eead4" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Tegangan Membran (ΔΨm)
                  </text>
                  <text x="0" y="74" fill="#f87171" fontSize="10" fontWeight="black" textAnchor="middle">
                    24 mV (Drop Kritis)
                  </text>
                </g>

                {/* Gauge 2: ATP Output (Critical Low) */}
                <g transform="translate(0, -20)">
                  <circle cx="0" cy="0" r="48" fill="#0f172a" stroke="#14b8a6" strokeWidth="4" />
                  <path d="M -35 25 A 48 48 0 1 1 30 30" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="180" strokeDashoffset="120" className="animate-pulse" />
                  <circle cx="0" cy="0" r="10" fill="#dc2626" />
                  <line x1="0" y1="0" x2="-22" y2="-10" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                  <text x="0" y="65" fill="#fde047" fontSize="12" fontWeight="black" textAnchor="middle">
                    Sintesis Energi Sel (ATP)
                  </text>
                  <text x="0" y="82" fill="#ef4444" fontSize="11" fontWeight="black" textAnchor="middle">
                    0.4 mM (Drop Kritis 90%)
                  </text>
                </g>

                {/* Gauge 3: Oxygen Inflow (Weak) */}
                <g transform="translate(160, -20)">
                  <circle cx="0" cy="0" r="42" fill="#0f172a" stroke="#14b8a6" strokeWidth="4" />
                  <path d="M -30 20 A 42 42 0 1 1 25 25" fill="none" stroke="#f97316" strokeWidth="6" strokeDasharray="140" strokeDashoffset="70" className="animate-pulse" />
                  <circle cx="0" cy="0" r="8" fill="#ea580c" />
                  <line x1="0" y1="0" x2="14" y2="-14" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                  <text x="0" y="58" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Konsumsi Oksigen (O₂)
                  </text>
                  <text x="0" y="74" fill="#f87171" fontSize="10" fontWeight="black" textAnchor="middle">
                    18% (Akseptor Putus)
                  </text>
                </g>

                {/* Cute Organelle Citizen Approaching and Raising Hand */}
                <g transform="translate(-10, 140)">
                  <ellipse cx="0" cy="22" rx="28" ry="12" fill="#020617" opacity="0.6" />
                  {/* Round Body */}
                  <circle cx="0" cy="0" r="28" fill="#06b6d4" stroke="#cffafe" strokeWidth="2.5" />
                  {/* Big Pixar Eyes */}
                  <circle cx="-8" cy="-6" r="8" fill="#ffffff" />
                  <circle cx="-7" cy="-6" r="4.8" fill="#082f49" />
                  <circle cx="-9" cy="-8" r="2.2" fill="#ffffff" />

                  <circle cx="8" cy="-6" r="8" fill="#ffffff" />
                  <circle cx="9" cy="-6" r="4.8" fill="#082f49" />
                  <circle cx="7" cy="-8" r="2.2" fill="#ffffff" />

                  {/* Raised hand towards the hologram */}
                  <path d="M 22 5 Q 38 -15 32 -30" fill="none" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="32" cy="-30" r="6" fill="#67e8f9" />
                </g>
              </g>
            </svg>

            {/* Bottom Action Ribbon */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-teal-500/40 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
              <div className="text-xs sm:text-sm text-teal-200 font-semibold">
                Telemetri sitologi mendeteksi kolapsnya gradien proton dan penghentian sintesis ATP di mitokondria.
              </div>
              <button
                type="button"
                onClick={() => handleNextScene('scene3')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Masuk ke Babak 1: Investigasi Sel Nyata</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADEGAN 3: BABAK 1 – OBSERVASI GEJALA (PEMINDAIAN BIOLOGIS SEL NYATA)       */}
      {/* ========================================================================= */}
      {currentScene === 'scene3' && (
        <div className="space-y-5">
          {/* Petunjuk Misi Investigasi Siswa (Instruksi Jelas dan Aksi Nyata) */}
          <div className="bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-900 border-2 border-emerald-400/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/25 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-emerald-200 flex items-center gap-2 font-fredoka">
                    <span>Misi Penyelidikan: Temukan Penyebab Padamnya Listrik Desa Sel</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ikuti 3 langkah mudah berikut untuk menyelidiki kerusakan organel akibat ketiadaan pasokan ATP:
                  </p>
                </div>
              </div>

              {/* Progress counter pill */}
              <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-2xl border border-emerald-500/40 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-300">Progres Sampel:</span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  inspectedSamples.length === 3
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                }`}>
                  {inspectedSamples.length} / 3 Organel Diperiksa
                </span>
              </div>
            </div>

            {/* 3 Steps Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className={`p-3.5 rounded-2xl border transition-all ${
                inspectedSamples.length > 0 ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900/70 border-slate-700/50'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black flex items-center justify-center">1</span>
                  <span className="text-xs font-bold text-emerald-200">Periksa 3 Organel</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Klik kartu <strong>Mitokondria</strong>, <strong>RE & Ribosom</strong>, dan <strong>Membran Sel</strong> untuk melihat kondisi fisiknya saat kehabisan energi.
                </p>
              </div>

              <div className={`p-3.5 rounded-2xl border transition-all ${
                inspectedSamples.length === 3 ? 'bg-teal-950/40 border-teal-500/50' : 'bg-slate-900/70 border-slate-700/50'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400 text-teal-300 text-xs font-black flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-teal-200">Buka Inspeksi 3D</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Gunakan tombol <em>"Inspeksi Mikroskop 3D"</em> untuk melihat foto visual nyata: lipatan krista yang kolaps, translasi protein macet, dan kebocoran ion.
                </p>
              </div>

              <div className={`p-3.5 rounded-2xl border transition-all ${
                userAnswers['q1'] && userAnswers['q2'] ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-900/70 border-slate-700/50'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black flex items-center justify-center">3</span>
                  <span className="text-xs font-bold text-amber-200">Jawab 2 Soal Mudah</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Pilih jawaban yang tepat untuk membuktikan pemahaman Anda dan membuka akses ke <strong>Babak 2: Mesin Pembangkit</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Main 3D Photorealistic Biological Cell Microscope Scanning Display */}
          <div className="relative w-full rounded-3xl overflow-hidden border-2 border-teal-500/40 shadow-2xl bg-slate-950 group">
            <div className="relative aspect-video max-h-[380px] w-full overflow-hidden">
              <img
                src={cardCellDisruptionImg}
                alt="Pemindaian Mikroskopi Sel Nyata Mengalami Krisis Energi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10 pointer-events-none" />

              {/* Real Biological Laboratory HUD Overlay */}
              <div className="absolute top-4 left-4 right-16 flex flex-wrap items-center gap-2 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-[11px] font-black flex items-center gap-1.5 shadow">
                  <Microscope className="w-3.5 h-3.5" />
                  <span>Mikroskopi Sitologi Fluoresen 3D (Cryo-EM)</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-red-950/85 backdrop-blur-md border border-red-400/50 text-red-300 text-[11px] font-bold flex items-center gap-1 shadow animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Status Sel: Krisis Penipisan ATP Masif</span>
                </span>
              </div>

              {/* Floating Live Telemetry Panel */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 z-10">
                <div className="bg-slate-900/85 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 flex items-center gap-2.5 shadow">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Kadar ATP Bebas Sitosol</div>
                    <div className="text-xs font-black text-amber-200">0.4 mM <span className="text-[10px] text-red-400 font-normal">(-90% Kritis)</span></div>
                  </div>
                </div>

                <div className="bg-slate-900/85 backdrop-blur-md border border-sky-400/40 rounded-2xl p-2.5 flex items-center gap-2.5 shadow">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Potensial Membran Krista (ΔΨm)</div>
                    <div className="text-xs font-black text-sky-200">-24 mV <span className="text-[10px] text-red-400 font-normal">(Drop dari -180 mV)</span></div>
                  </div>
                </div>

                <div className="bg-slate-900/85 backdrop-blur-md border border-teal-400/40 rounded-2xl p-2.5 flex items-center gap-2.5 shadow">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Integritas Membran Sel</div>
                    <div className="text-xs font-black text-rose-300">Pembengkakan Osmotik</div>
                  </div>
                </div>
              </div>

              {/* Floating Fullscreen Zoom Action */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setFullscreenImage({
                    src: cardCellDisruptionImg,
                    title: 'Pemindaian Mikroskopi Sel Eukariotik Nyata (Kondisi Krisis ATP)',
                    desc: 'Visualisasi 3D sitologi sel nyata yang mengalami deprivasi energi masif: krista mitokondria kehilangan gradien proton, ribosom terdisosiasi dari retikulum endoplasma, dan membran sel membengkak akibat kegagalan transpor ion aktif.'
                  });
                }}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-teal-400/40 text-teal-200 text-xs font-bold hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer z-20"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Perbesar Visual 3D</span>
              </button>
            </div>
          </div>

          {/* Three Real Biological Organelle Indicators with Fluorescent Lens Ring */}
          <div className="bg-gradient-to-b from-[#042f2e] via-[#0f172a] to-[#1e1b4b] rounded-3xl p-5 sm:p-6 border-2 border-teal-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-500/20 pb-3">
              <span className="text-xs sm:text-sm font-extrabold text-teal-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Pemindaian Tiga Indikator Biologis Sel Nyata:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Klik tiap organel untuk menganalisis kerusakan mikroskopis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Organel Nyata 1: Mitokondria (Krista & Matriks) */}
              <div
                onClick={() => {
                  sfx.playClick();
                  setInspectedSymptom('mito');
                  if (!inspectedSamples.includes('mito')) {
                    setInspectedSamples(prev => [...prev, 'mito']);
                  }
                }}
                className={`relative rounded-2xl p-4 flex flex-col items-center justify-between transition-all cursor-pointer group border-2 ${
                  inspectedSymptom === 'mito'
                    ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-slate-900/70 border-teal-500/30 hover:border-teal-400/60'
                }`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                    Organel 1 • Daya
                  </span>
                  {inspectedSamples.includes('mito') ? (
                    <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Teranalisis</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold">Klik periksa</span>
                  )}
                </div>

                {/* Microscope Circular Glowing Lens */}
                <div className="relative w-28 h-28 rounded-full border-2 border-sky-400/90 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] mb-3 bg-slate-950 overflow-hidden">
                  <img
                    src={cardMitoDistressImg}
                    alt="Mitokondria Nyata Mengalami Disfungsi Krista"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 rounded-full border border-sky-300/40 pointer-events-none" />
                  <div className="absolute bottom-1 right-2 text-[9px] font-mono text-sky-300 bg-slate-950/80 px-1 rounded border border-sky-400/40">
                    200 nm
                  </div>
                </div>

                <div className="text-xs font-black text-amber-200 text-center">
                  Mitokondria (Membran Krista)
                </div>
                <div className="text-[10px] font-semibold text-sky-300 text-center mt-0.5">
                  Runtuhnya Gradien Proton (ΔΨm)
                </div>
                <div className="text-[11px] text-slate-300 text-center mt-2 leading-relaxed">
                  Membran dalam kehilangan gradien ion H⁺. Turbin enzim ATP Synthase berhenti berputar; suplai 36 ATP lumpuh.
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sfx.playClick();
                    if (!inspectedSamples.includes('mito')) {
                      setInspectedSamples(prev => [...prev, 'mito']);
                    }
                    setFullscreenImage({
                      src: cardMitoDistressImg,
                      title: 'Indikator 1: Mitokondria Nyata — Runtuhnya Gradien Proton Krista',
                      desc: 'Mikroskopi 3D potongan krista membran dalam mitokondria. Pada kondisi respirasi normal, rantai transpor elektron memompa proton ke ruang antarmembran menciptakan potensial -180 mV. Saat pasokan oksigen/substrat terhenti, gradien runtuh ke -24 mV sehingga ATP Synthase berhenti berputar total.'
                    });
                  }}
                  className="mt-3 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-300 hover:text-sky-100 flex items-center gap-1.5 font-bold border border-sky-400/30"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspeksi Mikroskop 3D</span>
                </button>
              </div>

              {/* Organel Nyata 2: Retikulum Endoplasma & Ribosom */}
              <div
                onClick={() => {
                  sfx.playClick();
                  setInspectedSymptom('er');
                  if (!inspectedSamples.includes('er')) {
                    setInspectedSamples(prev => [...prev, 'er']);
                  }
                }}
                className={`relative rounded-2xl p-4 flex flex-col items-center justify-between transition-all cursor-pointer group border-2 ${
                  inspectedSymptom === 'er'
                    ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-slate-900/70 border-teal-500/30 hover:border-teal-400/60'
                }`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-md border border-teal-400/30">
                    Organel 2 • Biosintesis
                  </span>
                  {inspectedSamples.includes('er') ? (
                    <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Teranalisis</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold">Klik periksa</span>
                  )}
                </div>

                {/* Microscope Circular Glowing Lens */}
                <div className="relative w-28 h-28 rounded-full border-2 border-sky-400/90 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] mb-3 bg-slate-950 overflow-hidden">
                  <img
                    src={cardCellLowEnergyImg}
                    alt="Retikulum Endoplasma & Ribosom Nyata Macet"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 rounded-full border border-sky-300/40 pointer-events-none" />
                  <div className="absolute bottom-1 right-2 text-[9px] font-mono text-sky-300 bg-slate-950/80 px-1 rounded border border-sky-400/40">
                    100 nm
                  </div>
                </div>

                <div className="text-xs font-black text-amber-200 text-center">
                  Retikulum Endoplasma & Ribosom
                </div>
                <div className="text-[10px] font-semibold text-sky-300 text-center mt-0.5">
                  Macetnya Sintesis & Pelipatan Protein
                </div>
                <div className="text-[11px] text-slate-300 text-center mt-2 leading-relaxed">
                  Sintesis protein butuh 4 ATP/GTP per asam amino. Ketiadaan energi menyebabkan ribosom lepas dan terjadi ER Stress.
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sfx.playClick();
                    if (!inspectedSamples.includes('er')) {
                      setInspectedSamples(prev => [...prev, 'er']);
                    }
                    setFullscreenImage({
                      src: cardCellLowEnergyImg,
                      title: 'Indikator 2: Retikulum Endoplasma & Ribosom Mengalami ER Stress',
                      desc: 'Mikroskopi sitoplasma memperlihatkan membran retikulum endoplasma kasar (REK). Tanpa pasokan ATP kontinu dari mitokondria, translasi asam amino oleh ribosom terhenti, protein gagal melipat secara benar (unfolded protein response), dan lalu lintas vesikel sekretori lumpuh.'
                    });
                  }}
                  className="mt-3 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-300 hover:text-sky-100 flex items-center gap-1.5 font-bold border border-sky-400/30"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspeksi Mikroskop 3D</span>
                </button>
              </div>

              {/* Organel Nyata 3: Membran Plasma Sel & Pompa Ion Na+/K+ */}
              <div
                onClick={() => {
                  sfx.playClick();
                  setInspectedSymptom('membrane');
                  if (!inspectedSamples.includes('membrane')) {
                    setInspectedSamples(prev => [...prev, 'membrane']);
                  }
                }}
                className={`relative rounded-2xl p-4 flex flex-col items-center justify-between transition-all cursor-pointer group border-2 ${
                  inspectedSymptom === 'membrane'
                    ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-slate-900/70 border-teal-500/30 hover:border-teal-400/60'
                }`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-400/10 px-2 py-0.5 rounded-md border border-rose-400/30">
                    Organel 3 • Pertahanan
                  </span>
                  {inspectedSamples.includes('membrane') ? (
                    <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Teranalisis</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold">Klik periksa</span>
                  )}
                </div>

                {/* Microscope Circular Glowing Lens */}
                <div className="relative w-28 h-28 rounded-full border-2 border-sky-400/90 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] mb-3 bg-slate-950 overflow-hidden">
                  <img
                    src={cardCellDisruptionImg}
                    alt="Membran Sel & Pompa Ion Mengalami Pembengkakan"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 rounded-full border border-sky-300/40 pointer-events-none" />
                  <div className="absolute bottom-1 right-2 text-[9px] font-mono text-sky-300 bg-slate-950/80 px-1 rounded border border-sky-400/40">
                    500 nm
                  </div>
                </div>

                <div className="text-xs font-black text-amber-200 text-center">
                  Membran Plasma & Pompa Na⁺/K⁺
                </div>
                <div className="text-[10px] font-semibold text-rose-300 text-center mt-0.5">
                  Gagal Transpor Aktif & Pembengkakan Sel
                </div>
                <div className="text-[11px] text-slate-300 text-center mt-2 leading-relaxed">
                  Pompa ion mati tanpa ATP. Ion Na⁺ dan air masuk secara masif menyebabkan sel membengkak dan terancam lisis.
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sfx.playClick();
                    if (!inspectedSamples.includes('membrane')) {
                      setInspectedSamples(prev => [...prev, 'membrane']);
                    }
                    setFullscreenImage({
                      src: cardCellDisruptionImg,
                      title: 'Indikator 3: Membran Plasma Sel Nyata Mengalami Pembengkakan Osmotik',
                      desc: 'Mikroskopi batas luar sel. Pompa Na⁺/K⁺ ATPase mengonsumsi ~30% ATP total tubuh untuk memompa 3 Na⁺ keluar dan 2 K⁺ ke dalam melawan gradien. Ketika mitokondria gagal menghasilkan ATP, pompa mati, ion natrium dan air terakumulasi di dalam sitosol, menyebabkan edema sitotoksik dan hilangnya gradien membran.'
                    });
                  }}
                  className="mt-3 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-300 hover:text-sky-100 flex items-center gap-1.5 font-bold border border-sky-400/30"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspeksi Mikroskop 3D</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Question Panel (2 Soal Babak 1) */}
          <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-teal-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs font-black uppercase text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                Pertanyaan {scene3CurrentQ + 1} dari 2
              </span>
              <span className="text-xs text-teal-300 font-semibold">
                Babak 1: Observasi Gejala
              </span>
            </div>

            {/* Current Question */}
            {(() => {
              const currentQ = QUESTIONS[scene3CurrentQ];
              const selectedOptId = userAnswers[currentQ.id];
              const isFeedbackShown = showQuestionFeedback[currentQ.id];

              return (
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 font-fredoka leading-snug">
                    {currentQ.prompt}
                  </h3>

                  <div className="space-y-2">
                    {currentQ.options.map(opt => {
                      const isSelected = selectedOptId === opt.id;
                      let btnStyle = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750";

                      if (isFeedbackShown) {
                        if (opt.isCorrect) {
                          btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle = "bg-red-950/80 border-red-500 text-red-200 line-through opacity-80";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-teal-900/60 border-teal-400 text-white font-bold";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs sm:text-sm flex items-start gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-lg bg-slate-900/80 border border-slate-600 flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 mt-0.5">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isFeedbackShown && opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          )}
                          {isFeedbackShown && isSelected && !opt.isCorrect && (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback explanation box */}
                  {isFeedbackShown && (
                    <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analisis Gejala Biologi:</span>
                      </div>
                      <p className="leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  )}

                  {/* Question navigation button */}
                  <div className="flex items-center justify-between pt-2">
                    {scene3CurrentQ > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playClick();
                          setScene3CurrentQ(0);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Soal Sebelumnya
                      </button>
                    ) : <div />}

                    {scene3CurrentQ === 0 ? (
                      <button
                        type="button"
                        disabled={!userAnswers[currentQ.id]}
                        onClick={() => {
                          sfx.playClick();
                          setScene3CurrentQ(1);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <span>Lanjut ke Soal 2</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!userAnswers[currentQ.id]}
                        onClick={() => handleNextScene('scene4')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-black cursor-pointer flex items-center gap-2 shadow-lg"
                      >
                        <span>Menuju Babak 2: Telusuri Mekanisme</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADEGAN 4: BABAK 2 – TELUSURI MEKANISME (POTONGAN MITOKONDRIA REALISTIS)    */}
      {/* ========================================================================= */}
      {currentScene === 'scene4' && (
        <div className="space-y-5">
          {/* Main Scientific Visualization Container */}
          <div className="bg-gradient-to-b from-[#042f2e] via-[#0f172a] to-[#2e1065] rounded-3xl p-4 sm:p-6 border-2 border-teal-500/40 shadow-xl space-y-4">
            {/* View Mode & Chamber Selectors */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap rounded-xl bg-slate-900/90 p-1 border border-teal-500/30 gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setViewModeBabak2('diagram');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewModeBabak2 === 'diagram'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ⚡ Diagram Listrik & Turbin Sel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setViewModeBabak2('photo');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewModeBabak2 === 'photo'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Visual 3D Fotorealistik
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setViewModeBabak2('schematic');
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewModeBabak2 === 'schematic'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Skematik 3 Zona
                </button>
              </div>

              {/* Fullscreen zoom */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setFullscreenImage({
                    src: mitochondriaCutawayImg,
                    title: 'Adegan 2: Visualisasi Ilmiah Potongan Melintang Mitokondria (BBC / NatGeo Style)',
                    desc: 'Potongan melintang realistis dengan membran organik berlekuk, cairan sitoplasma kehijauan (glikolisis), matriks oranye-keemasan (siklus Krebs), dan membran dalam biru terang dengan aliran elektron menuju molekul oksigen.'
                  });
                }}
                className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-teal-400/40 text-teal-200 text-xs font-bold hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Perbesar Visual 3D</span>
              </button>
            </div>

            {/* Chamber selector tabs (active for schematic view) */}
            {viewModeBabak2 === 'schematic' && (
              <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-teal-500/30 gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setActiveChamber('glycolysis');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeChamber === 'glycolysis'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Zona 1: Sitoplasma Luar (Glikolisis)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setActiveChamber('krebs');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeChamber === 'krebs'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Zona 2: Matriks Mitokondria (Siklus Krebs)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setActiveChamber('etc');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeChamber === 'etc'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Zona 3: Membran Krista (Transpor Elektron & O2)
                </button>
              </div>
            )}

            {/* Display Area: Either 3D Photorealistic, Biological Electrical Diagram, or Schematic */}
            {viewModeBabak2 === 'photo' ? (
              <div className="relative w-full aspect-video max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-teal-500/30 group">
                <img
                  src={mitochondriaCutawayImg}
                  alt="Visualisasi Ilmiah Potongan Melintang Mitokondria"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20 pointer-events-none" />
              </div>
            ) : viewModeBabak2 === 'diagram' ? (
              <CellPowerPlantDiagram
                initialState="normal"
                showControls={true}
                interactiveHotspots={true}
                className="p-3 bg-slate-950/90 border-teal-500/30"
              />
            ) : (
              /* Schematic SVG Mode */
              <div className="relative w-full aspect-[21/9] max-h-[340px] bg-slate-950 rounded-2xl overflow-hidden border border-teal-500/30 flex items-center justify-center select-none">
                <svg viewBox="0 0 840 360" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="cutawayOuter" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#042f2e" />
                    </linearGradient>
                    <linearGradient id="matrixGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#78350f" />
                      <stop offset="100%" stopColor="#451a03" />
                    </linearGradient>
                    <filter id="partGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Outer Membrane Cutaway Shell */}
                  <ellipse cx="420" cy="180" rx="360" ry="140" fill="url(#cutawayOuter)" stroke="#2dd4bf" strokeWidth="4" />
                  
                  {/* Inner Matrix Area */}
                  <ellipse cx="420" cy="180" rx="300" ry="105" fill="url(#matrixGrad)" stroke="#f59e0b" strokeWidth="2.5" />

                  {/* RUANG 1: HIJAU MUDA (GLIKOLISIS DI SEKITAR MEMBRAN LUAR) */}
                  <g className={activeChamber === 'glycolysis' ? 'opacity-100' : 'opacity-40'}>
                    <rect x="80" y="80" width="180" height="200" rx="20" fill="#065f46" fillOpacity="0.4" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="140" cy="150" r="14" fill="#a7f3d0" stroke="#059669" strokeWidth="2" filter="url(#partGlow)" />
                    <path d="M 160 150 L 195 130" stroke="#34d399" strokeWidth="3" />
                    <circle cx="210" cy="125" r="9" fill="#6ee7b7" filter="url(#partGlow)" />
                    <circle cx="210" cy="175" r="9" fill="#6ee7b7" filter="url(#partGlow)" />
                  </g>

                  {/* RUANG 2: ORANYE KEEMASAN (SIKLUS KREBS BERBENTUK RODA BERPUTAR) */}
                  <g className={activeChamber === 'krebs' ? 'opacity-100' : 'opacity-40'}>
                    <g transform="translate(420, 180)">
                      <circle cx="0" cy="0" r="60" fill="none" stroke="#fbbf24" strokeWidth="4" strokeDasharray="16 8" className="animate-[spin_10s_linear_infinite]" />
                      <circle cx="0" cy="0" r="20" fill="#b45309" stroke="#fde047" strokeWidth="2" />
                      <circle cx="-42" cy="-42" r="7" fill="#fef08a" filter="url(#partGlow)" />
                      <circle cx="42" cy="-42" r="7" fill="#fef08a" filter="url(#partGlow)" />
                      <circle cx="42" cy="42" r="7" fill="#fef08a" filter="url(#partGlow)" />
                      <circle cx="-42" cy="42" r="7" fill="#fef08a" filter="url(#partGlow)" />
                    </g>
                  </g>

                  {/* RUANG 3: LORONG BIRU TERANG (TRANSPOR ELEKTRON & GELEMBUNG OKSIGEN) */}
                  <g className={activeChamber === 'etc' ? 'opacity-100' : 'opacity-40'}>
                    <rect x="580" y="80" width="180" height="200" rx="20" fill="#0369a1" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M 600 120 Q 640 180 600 240 Q 670 180 740 240" fill="none" stroke="#38bdf8" strokeWidth="4" />
                    <circle cx="680" cy="140" r="16" fill="#38bdf8" fillOpacity="0.4" stroke="#bae6fd" strokeWidth="2" filter="url(#partGlow)" className="animate-pulse" />
                    <circle cx="720" cy="190" r="12" fill="#38bdf8" fillOpacity="0.4" stroke="#bae6fd" strokeWidth="2" filter="url(#partGlow)" />
                    <circle cx="630" cy="160" r="4" fill="#facc15" filter="url(#partGlow)" />
                    <circle cx="650" cy="150" r="4" fill="#facc15" filter="url(#partGlow)" />
                  </g>
                </svg>
              </div>
            )}

            {/* Chamber Biological Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-xs space-y-1">
              {activeChamber === 'glycolysis' && (
                <div>
                  <span className="font-bold text-emerald-300">Zona Sitoplasma: </span>
                  <span className="text-slate-300">Glikolisis memecah 1 molekul glukosa menjadi 2 piruvat di sitosol sekitar membran luar, menghasilkan 2 ATP bersih dan 2 NADH tanpa memerlukan oksigen.</span>
                </div>
              )}
              {activeChamber === 'krebs' && (
                <div>
                  <span className="font-bold text-amber-300">Zona Matriks: </span>
                  <span className="text-slate-300">Siklus Asam Sitrat (Krebs) di dalam matriks oranye-keemasan memproses asetil-KoA, membebaskan CO2, serta memanen pembawa elektron NADH dan FADH2 berenergi tinggi.</span>
                </div>
              )}
              {activeChamber === 'etc' && (
                <div>
                  <span className="font-bold text-sky-300">Zona Krista & Membran Dalam: </span>
                  <span className="text-slate-300">Rantai transpor elektron mengalirkan elektron berenergi menuju molekul oksigen (akseptor terakhir) sambil memompa proton untuk memutar enzim turbin ATP sintase.</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Question Panel (3 Soal Babak 2) */}
          <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-teal-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs font-black uppercase text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                Pertanyaan {scene4CurrentQ + 1} dari 3
              </span>
              <span className="text-xs text-sky-300 font-semibold">
                Babak 2: Telusuri Mekanisme
              </span>
            </div>

            {/* Current Question from index 2 to 4 */}
            {(() => {
              const qIndex = 2 + scene4CurrentQ;
              const currentQ = QUESTIONS[qIndex];
              const selectedOptId = userAnswers[currentQ.id];
              const isFeedbackShown = showQuestionFeedback[currentQ.id];

              return (
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 font-fredoka leading-snug">
                    {currentQ.prompt}
                  </h3>

                  <div className="space-y-2">
                    {currentQ.options.map(opt => {
                      const isSelected = selectedOptId === opt.id;
                      let btnStyle = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750";

                      if (isFeedbackShown) {
                        if (opt.isCorrect) {
                          btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle = "bg-red-950/80 border-red-500 text-red-200 line-through opacity-80";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-sky-900/60 border-sky-400 text-white font-bold";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs sm:text-sm flex items-start gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-lg bg-slate-900/80 border border-slate-600 flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 mt-0.5">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isFeedbackShown && opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          )}
                          {isFeedbackShown && isSelected && !opt.isCorrect && (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback explanation box */}
                  {isFeedbackShown && (
                    <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-xs text-sky-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mekanisme Biokimia:</span>
                      </div>
                      <p className="leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  )}

                  {/* Question navigation button */}
                  <div className="flex items-center justify-between pt-2">
                    {scene4CurrentQ > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playClick();
                          setScene4CurrentQ(scene4CurrentQ - 1);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Soal Sebelumnya
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNextScene('scene3')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Kembali ke Babak 1
                      </button>
                    )}

                    {scene4CurrentQ < 2 ? (
                      <button
                        type="button"
                        disabled={!userAnswers[currentQ.id]}
                        onClick={() => {
                          sfx.playClick();
                          setScene4CurrentQ(scene4CurrentQ + 1);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <span>Soal Berikutnya ({scene4CurrentQ + 2}/3)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!userAnswers[currentQ.id]}
                        onClick={() => handleNextScene('scene5')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-black cursor-pointer flex items-center gap-2 shadow-lg"
                      >
                        <span>Menuju Babak 3: Prediksi Dampak Sistemik</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ADEGAN 5: BABAK 3 – PREDIKSI DAMPAK SISTEMIK (PETA DESA DARI ATAS REALISTIS) */}
      {/* ========================================================================= */}
      {currentScene === 'scene5' && (
        <div className="space-y-5">
          {/* Top Visual Panel: Peta 3D Fotorealistik Desa Sel dari Atas (BBC / NatGeo Style) */}
          <div className="relative w-full rounded-3xl overflow-hidden border-2 border-teal-500/40 shadow-2xl bg-slate-950 group">
            <div className="relative aspect-video max-h-[400px] w-full overflow-hidden">
              <img
                src={systemicMapImg}
                alt="Peta Desa Sel dari Atas Berkurangnya Pasokan Energi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20 pointer-events-none" />

              {/* Fullscreen Zoom Action */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setFullscreenImage({
                    src: systemicMapImg,
                    title: 'Adegan 3: Peta Dampak Sistemik Desa Sel (Fotorealistik Ilmiah)',
                    desc: 'Peta dari atas dengan lanskap mikroskopis natural, material biologis, Pembangkit Energi mitokondria di tengah meredup dengan pendaran oranye pudar, garis energi tipis ke Pusat Produksi (RE) dan Jalur Distribusi (Golgi) yang ikut meredup, sementara Balai Desa (Nukleus) dan Gerbang (Membran) tetap teal normal.'
                  });
                }}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-teal-400/40 text-teal-200 text-xs font-bold hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Perbesar Peta 3D</span>
              </button>
            </div>
          </div>

          {/* Interactive Village Sector Radar */}
          <div className="bg-gradient-to-b from-[#042f2e] via-[#0f172a] to-[#1e1b4b] rounded-3xl p-5 border-2 border-teal-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-teal-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Pemeriksaan Status Fasilitas Desa Sel:</span>
              </span>
              <span className="text-[11px] text-slate-400">Pilih sektor untuk membaca telaah diagnostik</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setInspectedMapPoint('mitochondria');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  inspectedMapPoint === 'mitochondria'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow'
                    : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[10px] font-black uppercase text-amber-400">Pusat Desa</div>
                <div className="text-xs font-bold truncate">Mitokondria</div>
                <div className="text-[10px] text-amber-300/80 mt-0.5">Meredup Oranye</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setInspectedMapPoint('re');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  inspectedMapPoint === 're'
                    ? 'bg-orange-500/20 border-orange-400 text-orange-200 shadow'
                    : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[10px] font-black uppercase text-orange-400">Produksi</div>
                <div className="text-xs font-bold truncate">RE & Ribosom</div>
                <div className="text-[10px] text-orange-300/80 mt-0.5">Meredup Menurun</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setInspectedMapPoint('golgi');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  inspectedMapPoint === 'golgi'
                    ? 'bg-orange-500/20 border-orange-400 text-orange-200 shadow'
                    : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[10px] font-black uppercase text-orange-400">Logistik</div>
                <div className="text-xs font-bold truncate">Badan Golgi</div>
                <div className="text-[10px] text-orange-300/80 mt-0.5">Penyortiran Mandek</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setInspectedMapPoint('nucleus');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  inspectedMapPoint === 'nucleus'
                    ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow'
                    : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[10px] font-black uppercase text-teal-400">Balai Desa</div>
                <div className="text-xs font-bold truncate">Nukleus / Inti</div>
                <div className="text-[10px] text-teal-300/80 mt-0.5">Teal Normal</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setInspectedMapPoint('gate');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  inspectedMapPoint === 'gate'
                    ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow'
                    : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[10px] font-black uppercase text-teal-400">Perbatasan</div>
                <div className="text-xs font-bold truncate">Membran Sel</div>
                <div className="text-[10px] text-teal-300/80 mt-0.5">Struktur Utuh</div>
              </button>
            </div>

            {/* Diagnostic Details on Inspected Sector */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-xs">
              {inspectedMapPoint === 'mitochondria' && (
                <div>
                  <span className="font-bold text-amber-300">Pusat Pembangkit Mitokondria: </span>
                  <span className="text-slate-300">Mengalami disfungsi gradien proton. Pendaran oranye pudar menandakan laju pembentukan ATP anjlok drastis, memicu efek domino kekurangan energi ke seluruh jaringan seluler.</span>
                </div>
              )}
              {inspectedMapPoint === 're' && (
                <div>
                  <span className="font-bold text-orange-300">Pusat Produksi (Retikulum Endoplasma): </span>
                  <span className="text-slate-300">Garis energi oranye tipis menunjukkan suplai berkurang. Translasi rantai polipeptida oleh ribosom dan pelipatan protein membutuhkan hidrolisis GTP/ATP yang kini terhambat.</span>
                </div>
              )}
              {inspectedMapPoint === 'golgi' && (
                <div>
                  <span className="font-bold text-orange-300">Jalur Distribusi (Badan Golgi): </span>
                  <span className="text-slate-300">Proses glikosilasi protein dan pembentukan vesikel sekretori terhenti karena pergerakan motor dinein/kinesin di mikrotubulus membutuhkan ATP konstan.</span>
                </div>
              )}
              {inspectedMapPoint === 'nucleus' && (
                <div>
                  <span className="font-bold text-teal-300">Balai Desa (Nukleus): </span>
                  <span className="text-slate-300">Materi genetik DNA terlindung di dalam selubung ganda dan tetap bercahaya teal normal, namun transkripsi RNA lanjutan akan terancam jika ATP habis total.</span>
                </div>
              )}
              {inspectedMapPoint === 'gate' && (
                <div>
                  <span className="font-bold text-teal-300">Gerbang Desa (Membran Sel): </span>
                  <span className="text-slate-300">Lapisan fosfolipid bilayer tetap utuh (bercahaya teal), namun pompa natrium-kalium (Na+/K+ ATPase) yang bertugas menjaga potensial membran mulai lumpuh.</span>
                </div>
              )}
            </div>
          </div>

          {/* Simulator Animasi Interaktif: Glukosa -> ATP Desa Sel */}
          <GlucoseEnergySimulator initialGlucose={10} />

          {/* Interactive Question Panel (2 Soal Babak 3) */}
          <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-teal-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs font-black uppercase text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                Pertanyaan {scene5CurrentQ + 1} dari 2
              </span>
              <span className="text-xs text-orange-300 font-semibold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Babak 3: Perhitungan Daya Desa Sel & Dampak Sistemik</span>
              </span>
            </div>

            {/* Current Question from index 5 to 6 */}
            {(() => {
              const qIndex = 5 + scene5CurrentQ;
              const currentQ = QUESTIONS[qIndex];
              const selectedOptId = userAnswers[currentQ.id];
              const isFeedbackShown = showQuestionFeedback[currentQ.id];

              return (
                <div className="space-y-4">
                  {currentQ.id === 'q6' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-teal-500/20 border border-amber-400/40 text-amber-300 text-xs font-black shadow mb-1">
                      <Calculator className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Tantangan Perhitungan Matematika Biologi Terapan</span>
                    </div>
                  )}

                  <h3 className="text-sm sm:text-base font-bold text-slate-100 font-fredoka leading-snug">
                    {currentQ.prompt}
                  </h3>

                  <div className="space-y-2">
                    {currentQ.options.map(opt => {
                      const isSelected = selectedOptId === opt.id;
                      let btnStyle = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750";

                      if (isFeedbackShown) {
                        if (opt.isCorrect) {
                          btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                        } else if (isSelected && !opt.isCorrect) {
                          btnStyle = "bg-red-950/80 border-red-500 text-red-200 line-through opacity-80";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-orange-900/60 border-orange-400 text-white font-bold";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs sm:text-sm flex items-start gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-lg bg-slate-900/80 border border-slate-600 flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 mt-0.5">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isFeedbackShown && opt.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          )}
                          {isFeedbackShown && isSelected && !opt.isCorrect && (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback explanation box */}
                  {isFeedbackShown && (
                    <div className="space-y-3">
                      {currentQ.id === 'q6' ? (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border-2 border-emerald-400/60 text-xs space-y-2.5 shadow-xl">
                          <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span>Kunci Jawaban Resmi: Opsi A (10 Molekul Glukosa)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-200">
                              <div className="text-[10px] text-slate-400 font-sans font-semibold">Perhitungan Batas Bawah:</div>
                              <div className="mt-0.5">300 ATP ÷ 30 ATP/glukosa = <strong className="text-amber-300 text-xs font-black">10 Glukosa</strong></div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-teal-500/40 text-teal-200">
                              <div className="text-[10px] text-slate-400 font-sans font-semibold">Perhitungan Batas Atas:</div>
                              <div className="mt-0.5">320 ATP ÷ 32 ATP/glukosa = <strong className="text-amber-300 text-xs font-black">10 Glukosa</strong></div>
                            </div>
                          </div>
                          <p className="text-[11px] text-emerald-100 leading-relaxed font-sans">
                            💡 <strong>Rumus Biologi:</strong> 1 molekul glukosa menghasilkan rentang <strong>30 hingga 32 ATP</strong> melalui respirasi aerob sempurna. Untuk memenuhi kebutuhan energi Desa Sel sebesar <strong>300 s.d. 320 ATP</strong>, mitokondria membutuhkan tepat <strong>10 molekul glukosa</strong>!
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-500/40 text-xs text-orange-200 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-amber-300">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Analisis Biokimia Sel:</span>
                          </div>
                          <p className="leading-relaxed">{currentQ.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question navigation button */}
                  <div className="flex items-center justify-between pt-2">
                    {scene5CurrentQ > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playClick();
                          setScene5CurrentQ(0);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Soal Sebelumnya
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNextScene('scene4')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Kembali ke Babak 2
                      </button>
                    )}

                    {scene5CurrentQ === 0 ? (
                      <button
                        type="button"
                        disabled={!userAnswers[currentQ.id]}
                        onClick={() => {
                          sfx.playClick();
                          setScene5CurrentQ(1);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <span>Soal Terakhir (2/2)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!userAnswers[currentQ.id]}
                        onClick={() => handleNextScene('summary')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-black cursor-pointer flex items-center gap-2 shadow-lg"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Kirim Hasil Penyelidikan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PENUTUP: LAPORAN KEPALA DESA & KELULUSAN (MINIMAL 70%)                    */}
      {/* ========================================================================= */}
      {currentScene === 'summary' && (
        <div className="bg-slate-900/95 rounded-3xl p-6 sm:p-8 border-2 border-teal-500/50 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-teal-400 text-slate-950 shadow-lg mb-1">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200 font-fredoka">
              Hasil Evaluasi Penyelidikan Krisis Energi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Penilaian pemahaman struktur dan fungsi organel mitokondria serta keterkaitan respirasi seluler.
            </p>
          </div>

          {/* Score Card Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">Jawaban Benar</span>
              <span className="text-2xl font-black text-teal-300 font-fredoka">
                {correctCount} / {totalQuestions}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">Skor Akhir</span>
              <span className={`text-2xl font-black font-fredoka ${isPassed ? 'text-amber-300' : 'text-orange-400'}`}>
                {scorePercent}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">Status Standar</span>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full inline-block mt-1 ${
                isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {isPassed ? '✓ Memenuhi (≥70%)' : 'Belum Memenuhi (<70%)'}
              </span>
            </div>
          </div>

          {/* Conditional Mayor Message (Pesan Kepala Desa Sebagai Jembatan Cerita ke Level 5) */}
          {isPassed ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border-2 border-emerald-500/50 space-y-3 shadow-lg">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Pesan Resmi Kepala Desa Sel:</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                "Kerja luar biasa, Penyelidik! Anda telah berhasil menelusuri akar penyebab krisis di Pembangkit Energi Mitokondria. 
                <strong> Laporan resmi penyelidikan akan segera ditulis dan diserahkan ke Balai Desa</strong>. Berdasarkan temuan Anda, 
                penurunan pasokan energi ini memicu keterlambatan parah pada pos pengemasan dan jalur pengiriman bahan makromolekul. 
                Siapkan diri Anda untuk menyelidiki <strong>Krisis Distribusi Logistik Desa Sel di Level 5!</strong>"
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-orange-950/50 border border-orange-500/40 text-orange-200 text-xs sm:text-sm space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Ketuntasan Belum Tercapai</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                Untuk menyusun laporan resmi Kepala Desa dan membuka jalan ke Level 5, Anda perlu mencapai skor minimal 70% (minimal 5 dari 7 soal terjawab dengan tepat). Silakan pelajari kembali mekanisme organel dan ulangi kuis.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetLevel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Penyelidikan Level 4</span>
            </button>

            <button
              type="button"
              onClick={handleFinishLevel}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 border-b-4 border-emerald-800"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isPassed ? "Selesaikan Level 4 & Buka Level 5" : "Lanjut ke Level 5"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal for 3D Photorealistic Inspection */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl border-2 border-teal-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-amber-200">{fullscreenImage.title}</h4>
                <p className="text-xs text-teal-300">Visual Ilmiah Biologi Medis 3D (Fotorealistik Sinematik)</p>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenImage(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 bg-black/80 flex items-center justify-center">
              <img
                src={fullscreenImage.src}
                alt={fullscreenImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain rounded-2xl border border-teal-500/30 shadow-2xl"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-300 leading-relaxed">
              {fullscreenImage.desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
