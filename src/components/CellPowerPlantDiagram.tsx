import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Info, 
  ChevronRight, 
  Maximize2, 
  Eye,
  ShieldAlert,
  ShieldCheck,
  Power
} from 'lucide-react';
import { sfx } from '../utils/audio';

interface CellPowerPlantDiagramProps {
  initialState?: 'normal' | 'crisis';
  showControls?: boolean;
  interactiveHotspots?: boolean;
  activeChamberFilter?: 'all' | 'glycolysis' | 'krebs' | 'etc';
  onStateChange?: (state: 'normal' | 'crisis') => void;
  className?: string;
}

export type OrganelleId = 'mitochondria' | 'nucleus' | 'er' | 'golgi' | 'membrane' | 'cytoplasm' | 'atp_synthase';

interface OrganelleDetail {
  id: OrganelleId;
  name: string;
  biologyName: string;
  electricityRole: string;
  atpConsumption: string;
  normalStatus: string;
  crisisStatus: string;
  voltageImpact: string;
}

const ORGANELLES_DATA: Record<OrganelleId, OrganelleDetail> = {
  mitochondria: {
    id: 'mitochondria',
    name: 'Pembangkit Tenaga Listrik Sel',
    biologyName: 'Mitokondria (Organel Bermembran Ganda)',
    electricityRole: 'Generator daya pusat yang memompa proton (H+) untuk membangkitkan tegangan membran (~180 mV) dan memutar turbin ATP sintase.',
    atpConsumption: 'Penghasil 90% pasokan ATP sel (32–36 ATP per molekul glukosa)',
    normalStatus: 'Berdestinasi stabil, krista berdenyut menghasilkan miliaran molekul ATP per detik.',
    crisisStatus: 'Aliran elektron macet karena kekurangan akseptor O2; gradien proton runtuh dan tegangan membran anjlok.',
    voltageImpact: 'Tegangan membran mitokondria anjlok dari 180 mV ke <30 mV.'
  },
  nucleus: {
    id: 'nucleus',
    name: 'Pusat Komando & Arsip Genetik',
    biologyName: 'Nukleus / Inti Sel',
    electricityRole: 'Pusat kendali operasional yang menginstruksikan transkripsi DNA ke mRNA untuk merespons kebutuhan energi sel.',
    atpConsumption: 'Membutuhkan ATP konstan untuk transkripsi gen, perbaikan DNA, dan transpor pori nukleus.',
    normalStatus: 'Inti sel aktif meregulasi produksi enzim dan mesin seluler.',
    crisisStatus: 'Transkripsi gen melambat drastis; sinyal darurat (faktor stres) diaktifkan ke sitoplasma.',
    voltageImpact: 'Tegangan transpor pori inti terganggu akibat defisit energi.'
  },
  er: {
    id: 'er',
    name: 'Pabrik Biosintesis Makromolekul',
    biologyName: 'Retikulum Endoplasma (RE Kasar & Halus) + Ribosom',
    electricityRole: 'Beban listrik biosintesis; membutuhkan energi kontinu untuk menyatukan asam amino menjadi protein dan melipatnya.',
    atpConsumption: 'Mengonsumsi ~25% ATP seluler untuk translasi polipeptida dan kontrol pelipatan protein.',
    normalStatus: 'Ribosom aktif memproduksi ribuan protein per menit dengan pelipatan sempurna.',
    crisisStatus: 'Sintesis protein macet; akumulasi protein salah lipat (ER Stress) memicu respons apoptosis jika krisis berlanjut.',
    voltageImpact: 'Gradien kalsium di lumen RE bocor karena pompa SERCA kehabisan daya ATP.'
  },
  golgi: {
    id: 'golgi',
    name: 'Pusat Logistik, Pengemasan & Ekspedisi',
    biologyName: 'Aparatus Golgi (Badan Golgi) & Vesikel',
    electricityRole: 'Pusat distribusi yang memerlukan motor molekuler listrik (dinein & kinesin) untuk memindahkan paket vesikel.',
    atpConsumption: 'Mengonsumsi ATP untuk modifikasi glikoprotein dan pergerakan motor vesikel di sepanjang mikrotubulus.',
    normalStatus: 'Vesikel bertunas dan meluncur cepat menyalurkan materi ke seluruh sel dan ke membran luar.',
    crisisStatus: 'Pengiriman vesikel mandek total; paket protein menumpuk di sisterna golgi.',
    voltageImpact: 'Aliran vesikel berhenti karena motor kinesin kehilangan energi fosfat hidrolisis ATP.'
  },
  membrane: {
    id: 'membrane',
    name: 'Gerbang Perbatasan & Penjaga Sel',
    biologyName: 'Membran Sel (Fosfolipid Bilayer & Pompa Na+/K+)',
    electricityRole: 'Kapasitor listrik batas sel; menahan gradien potensial aksi dan mengatur lalu lintas zat masuk/keluar.',
    atpConsumption: 'Pompa Na+/K+ ATPase sendiri menghabiskan 30–40% seluruh energi sel untuk memompa ion melawan gradien!',
    normalStatus: 'Beda potensial membran sel stabil (-70 mV), ion Na+ dan K+ terjaga proporsional.',
    crisisStatus: 'Pompa ion mati; ion Na+ dan air merembes masuk secara difusi bebas menyebabkan sel membengkak (sitotoksik edem).',
    voltageImpact: 'Potensial istirahat membran sel hilang, gerbang pertahanan lumpuh total.'
  },
  cytoplasm: {
    id: 'cytoplasm',
    name: 'Jaringan Sitoplasma & Glikolisis',
    biologyName: 'Sitosol & Rangka Sel (Sitoskeleton)',
    electricityRole: 'Medium konduksi ionik sel yang mengalirkan sinyal listrik, gradien konsentrasi zat, serta jalur darurat glikolisis.',
    atpConsumption: 'Glikolisis menghasilkan 2 ATP bersih darurat di sitosol tanpa memerlukan oksigen.',
    normalStatus: 'Sitosol jernih berdenyut dengan aliran siklosis yang teratur.',
    crisisStatus: 'Terjadi asidosis laktat karena sel beralih ke respirasi anaerobik darurat.',
    voltageImpact: 'pH sitoplasma turun drastis (mengasam) dan merusak konformasi enzim.'
  },
  atp_synthase: {
    id: 'atp_synthase',
    name: 'Turbin Generator Listrik Molekuler',
    biologyName: 'Enzim Kompleks V: ATP Sintase (Rotary Motor)',
    electricityRole: 'Generator listrik mikro nanometrik yang berputar hingga 9.000 RPM digerakkan oleh arus proton (H+) melintasi membran dalam.',
    atpConsumption: 'Pabrik utama yang memfosforilasi ADP + Pi menjadi molekul baterai sel (ATP).',
    normalStatus: 'Turbin berputar mulus memanen daya gerak proton menghasilkan jutaan ATP per detik.',
    crisisStatus: 'Arus proton terhenti karena ketiadaan gradien muatan listrik; turbin generator berhenti total.',
    voltageImpact: 'Daya gerak proton (Proton Motive Force) mendekati nol.'
  }
};

export const CellPowerPlantDiagram: React.FC<CellPowerPlantDiagramProps> = ({
  initialState = 'normal',
  showControls = true,
  interactiveHotspots = true,
  onStateChange,
  className = ''
}) => {
  const [powerMode, setPowerMode] = useState<'normal' | 'crisis'>(initialState);
  const [viewAngle, setViewAngle] = useState<'cell_overview' | 'mitochondria_zoom'>('cell_overview');
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleId>('mitochondria');
  const [showAnatomyLabels, setShowAnatomyLabels] = useState<boolean>(true);
  const [showElectricalFlow, setShowElectricalFlow] = useState<boolean>(true);

  const togglePower = () => {
    sfx.playClick();
    const next = powerMode === 'normal' ? 'crisis' : 'normal';
    setPowerMode(next);
    if (next === 'crisis') {
      sfx.playWrong();
    } else {
      sfx.playCorrect();
    }
    onStateChange?.(next);
  };

  const isCrisis = powerMode === 'crisis';
  const organelle = ORGANELLES_DATA[selectedOrganelle];

  return (
    <div className={`flex flex-col gap-4 rounded-3xl bg-slate-950 border-2 border-teal-500/40 p-4 sm:p-5 shadow-2xl text-slate-100 ${className}`}>
      {/* Top Header & Interactive Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-500/20">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border transition-all ${
            isCrisis 
              ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 animate-pulse' 
              : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black font-fredoka text-amber-200">
                Pembangkit Tenaga Listrik Sel (Mitokondria & Aliran Energi)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isCrisis ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isCrisis ? 'Blackout / Krisis Listrik' : 'Daya Penuh 100%'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visualisasi anatomi sel biologis lengkap dengan mitokondria sebagai gardu pembangkit daya listrik (ATP).
            </p>
          </div>
        </div>

        {/* View Switchers & Simulation Toggles */}
        {showControls && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setViewAngle('cell_overview');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewAngle === 'cell_overview'
                    ? 'bg-teal-500 text-slate-950 font-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Peta Sel Utuh
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setViewAngle('mitochondria_zoom');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewAngle === 'mitochondria_zoom'
                    ? 'bg-teal-500 text-slate-950 font-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Zoom Pembangkit Listrik
              </button>
            </div>

            <button
              type="button"
              onClick={togglePower}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md ${
                isCrisis
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white animate-pulse'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isCrisis ? 'Pulihkan Daya Listrik' : 'Simulasi Krisis Listrik'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Visual Display Stage */}
      <div className="relative w-full aspect-[16/9] max-h-[460px] bg-gradient-to-b from-[#021c1c] via-[#081729] to-[#120f26] rounded-2xl overflow-hidden border border-teal-500/30 shadow-inner flex items-center justify-center select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Real-time Volt & Status Heads-Up Display (HUD) */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-teal-500/40 text-[11px] flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="text-slate-300 font-semibold">Potensial Listrik Membran (ΔΨm):</span>
            <span className={`font-black font-mono ${isCrisis ? 'text-red-400' : 'text-emerald-300'}`}>
              {isCrisis ? '24 mV (Kritis)' : '185 mV (Optimal)'}
            </span>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-teal-500/40 text-[11px] flex items-center gap-2 shadow-lg">
            <Zap className={`w-3.5 h-3.5 ${isCrisis ? 'text-orange-400' : 'text-amber-300'}`} />
            <span className="text-slate-300 font-semibold">Produksi Listrik Sel (ATP Output):</span>
            <span className={`font-black font-mono ${isCrisis ? 'text-orange-400' : 'text-amber-300'}`}>
              {isCrisis ? '12% (Krisis Total)' : '100% (36 ATP/Glukosa)'}
            </span>
          </div>
        </div>

        {/* Quick Toggles HUD */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAnatomyLabels(!showAnatomyLabels)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer backdrop-blur-md ${
              showAnatomyLabels
                ? 'bg-teal-500/30 border-teal-400/60 text-teal-200'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            Label Sel: {showAnatomyLabels ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => setShowElectricalFlow(!showElectricalFlow)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer backdrop-blur-md ${
              showElectricalFlow
                ? 'bg-amber-500/30 border-amber-400/60 text-amber-200'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            Arus Listrik: {showElectricalFlow ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SVG VIEWPORT 1: FULL CELL BIOLOGICAL OVERVIEW & ELECTRICAL DISTRIBUTION   */}
        {/* ========================================================================= */}
        {viewAngle === 'cell_overview' ? (
          <svg viewBox="0 0 960 540" className="w-full h-full object-contain">
            <defs>
              <linearGradient id="cellMembraneGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#115e59" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#042f2e" stopOpacity="0.9" />
              </linearGradient>

              <radialGradient id="cytoplasmGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={isCrisis ? 0.05 : 0.18} />
                <stop offset="70%" stopColor="#042f2e" stopOpacity={isCrisis ? 0.3 : 0.1} />
                <stop offset="100%" stopColor="#021a1a" stopOpacity="0.5" />
              </radialGradient>

              {/* Mitochondria Gradients */}
              <linearGradient id="mitoCutawayOuter" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={isCrisis ? '#c2410c' : '#f59e0b'} />
                <stop offset="50%" stopColor={isCrisis ? '#9a3412' : '#d97706'} />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              <linearGradient id="mitoMatrixGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={isCrisis ? '#7c2d12' : '#fef08a'} />
                <stop offset="40%" stopColor={isCrisis ? '#451a03' : '#fbbf24'} />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* Soft bio-electric glows */}
              <filter id="bioElectricGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. CELL MEMBRANE (Membran Sel Bilayer Oval Asimetris Alami) */}
            <g id="cell-membrane-group">
              {/* Outer boundary shadow */}
              <path
                d="M 120 270 C 110 110, 320 60, 520 65 C 760 70, 860 140, 870 290 C 880 430, 710 490, 480 485 C 250 480, 130 420, 120 270 Z"
                fill="none"
                stroke="#0f766e"
                strokeWidth="18"
                opacity="0.3"
              />
              {/* Plasma membrane lipid bilayer edge */}
              <path
                d="M 120 270 C 110 110, 320 60, 520 65 C 760 70, 860 140, 870 290 C 880 430, 710 490, 480 485 C 250 480, 130 420, 120 270 Z"
                fill="url(#cytoplasmGlow)"
                stroke={isCrisis ? '#ea580c' : '#2dd4bf'}
                strokeWidth="6"
                filter="url(#bioElectricGlow)"
                className="cursor-pointer hover:opacity-90 transition-all"
                onClick={() => setSelectedOrganelle('membrane')}
              />
              {/* Inner membrane leaflet */}
              <path
                d="M 128 270 C 119 119, 323 72, 518 76 C 752 81, 850 148, 859 290 C 869 422, 704 478, 480 473 C 257 468, 140 412, 128 270 Z"
                fill="none"
                stroke="#5eead4"
                strokeWidth="2"
                strokeDasharray="8 6"
                opacity="0.6"
              />

              {/* Ion Pump Na+/K+ ATPase on the cell membrane */}
              <g 
                transform="translate(130, 230)" 
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setSelectedOrganelle('membrane')}
              >
                <circle cx="0" cy="0" r="10" fill={isCrisis ? '#ef4444' : '#10b981'} filter="url(#sparkleGlow)" />
                <path d="M -5 -5 L 5 5 M -5 5 L 5 -5" stroke="#ffffff" strokeWidth="2" />
                {showAnatomyLabels && (
                  <text x="-40" y="-14" fill="#5eead4" fontSize="9" fontWeight="bold">
                    Pompa Na+/K+ (Beban Listrik)
                  </text>
                )}
              </g>
            </g>

            {/* 2. BIOLOGICAL ELECTRICAL CONDUITS (Kabel Distribusi Listrik / Sitoskeleton Sel) */}
            {showElectricalFlow && (
              <g id="electrical-grid-lines">
                {/* Conduit to Nucleus */}
                <path
                  d="M 480 280 C 420 270, 360 250, 310 230"
                  fill="none"
                  stroke={isCrisis ? '#f97316' : '#38bdf8'}
                  strokeWidth={isCrisis ? '2' : '4'}
                  strokeDasharray={isCrisis ? '4 8' : '8 6'}
                  filter="url(#bioElectricGlow)"
                  className={isCrisis ? 'opacity-40 animate-pulse' : 'opacity-90'}
                />
                {/* Conduit to Endoplasmic Reticulum */}
                <path
                  d="M 480 280 C 400 320, 330 350, 260 360"
                  fill="none"
                  stroke={isCrisis ? '#f97316' : '#38bdf8'}
                  strokeWidth={isCrisis ? '2' : '4'}
                  strokeDasharray={isCrisis ? '4 8' : '8 6'}
                  filter="url(#bioElectricGlow)"
                  className={isCrisis ? 'opacity-40 animate-pulse' : 'opacity-90'}
                />
                {/* Conduit to Golgi */}
                <path
                  d="M 540 290 C 620 310, 680 320, 720 310"
                  fill="none"
                  stroke={isCrisis ? '#f97316' : '#38bdf8'}
                  strokeWidth={isCrisis ? '2' : '4'}
                  strokeDasharray={isCrisis ? '4 8' : '8 6'}
                  filter="url(#bioElectricGlow)"
                  className={isCrisis ? 'opacity-40 animate-pulse' : 'opacity-90'}
                />
                {/* Conduit to Plasma Membrane Pump */}
                <path
                  d="M 480 300 C 360 340, 240 310, 135 235"
                  fill="none"
                  stroke={isCrisis ? '#f97316' : '#38bdf8'}
                  strokeWidth={isCrisis ? '2' : '4'}
                  strokeDasharray={isCrisis ? '4 8' : '8 6'}
                  filter="url(#bioElectricGlow)"
                  className={isCrisis ? 'opacity-40 animate-pulse' : 'opacity-90'}
                />

                {/* Flowing ATP packets (Sparks) */}
                {!isCrisis && (
                  <>
                    <circle cx="390" cy="250" r="5" fill="#fef08a" filter="url(#sparkleGlow)">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="360" cy="335" r="5" fill="#fef08a" filter="url(#sparkleGlow)">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="630" cy="305" r="5" fill="#fef08a" filter="url(#sparkleGlow)">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="280" cy="285" r="4.5" fill="#fde047" filter="url(#sparkleGlow)">
                      <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </g>
            )}

            {/* 3. NUCLEUS (Inti Sel / Balai Desa Pusat Komando) */}
            <g
              transform="translate(260, 200)"
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedOrganelle('nucleus')}
            >
              {/* Nuclear Envelope Double Membrane */}
              <circle cx="0" cy="0" r="75" fill="#312e81" stroke="#818cf8" strokeWidth="4" filter="url(#bioElectricGlow)" />
              <circle cx="0" cy="0" r="70" fill="#1e1b4b" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="6 4" />
              {/* Chromatin / DNA Threads inside Nucleus */}
              <path
                d="M -40 -15 Q -10 -45 20 -20 Q 50 5 10 35 Q -30 45 -40 10 Z"
                fill="none"
                stroke="#c7d2fe"
                strokeWidth="3.5"
                opacity="0.85"
              />
              <path
                d="M -25 -30 Q 15 -10 35 -35 Q 45 20 -10 15 Z"
                fill="none"
                stroke="#a5b4fc"
                strokeWidth="2.5"
                opacity="0.6"
              />
              {/* Nucleolus (Anak Inti) */}
              <circle cx="10" cy="-5" r="22" fill="#4338ca" stroke="#c084fc" strokeWidth="2" />
              <circle cx="10" cy="-5" r="14" fill="#6366f1" filter="url(#sparkleGlow)" />

              {/* Interactive Target Indicator */}
              {selectedOrganelle === 'nucleus' && (
                <circle cx="0" cy="0" r="82" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" className="animate-spin" />
              )}

              {showAnatomyLabels && (
                <g transform="translate(0, 95)">
                  <rect x="-65" y="-12" width="130" height="22" rx="6" fill="#0f172a" fillOpacity="0.85" stroke="#6366f1" strokeWidth="1" />
                  <text x="0" y="3" fill="#e0e7ff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Nukleus (Pusat Komando)
                  </text>
                </g>
              )}
            </g>

            {/* 4. ENDOPLASMIC RETICULUM (RE Kasar & Halus dengan Ribosom) */}
            <g
              transform="translate(230, 360)"
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedOrganelle('er')}
            >
              {/* Curved Membrane Cisternae */}
              <path
                d="M -70 -20 C -40 -40, 20 -40, 60 -15 C 30 10, -30 5, -70 -20 Z"
                fill="#065f46"
                stroke="#34d399"
                strokeWidth="2.5"
              />
              <path
                d="M -80 0 C -45 -15, 25 -15, 75 5 C 45 25, -20 20, -80 0 Z"
                fill="#047857"
                stroke="#6ee7b7"
                strokeWidth="2.5"
              />
              <path
                d="M -70 25 C -35 10, 35 15, 80 30 C 50 48, -15 40, -70 25 Z"
                fill="#065f46"
                stroke="#34d399"
                strokeWidth="2"
              />
              {/* Tiny Ribosome Dots on Rough ER */}
              {[-60, -40, -20, 0, 20, 40, 60].map((x, i) => (
                <circle key={i} cx={x} cy={-28 + (i % 3) * 4} r="2.5" fill="#facc15" />
              ))}

              {selectedOrganelle === 'er' && (
                <rect x="-90" y="-45" width="180" height="90" rx="14" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="5 5" />
              )}

              {showAnatomyLabels && (
                <g transform="translate(0, 58)">
                  <rect x="-70" y="-12" width="140" height="22" rx="6" fill="#0f172a" fillOpacity="0.85" stroke="#34d399" strokeWidth="1" />
                  <text x="0" y="3" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle">
                    RE & Ribosom (Pabrik Protein)
                  </text>
                </g>
              )}
            </g>

            {/* 5. GOLGI APPARATUS (Badan Golgi & Vesikel Pengiriman) */}
            <g
              transform="translate(730, 290)"
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedOrganelle('golgi')}
            >
              {/* Stacked curved cisternae */}
              <path d="M -50 -35 Q -10 -45 35 -30" fill="none" stroke="#0d9488" strokeWidth="6" strokeLinecap="round" />
              <path d="M -55 -15 Q -10 -25 45 -10" fill="none" stroke="#14b8a6" strokeWidth="7" strokeLinecap="round" />
              <path d="M -50 5 Q -10 -5 40 10" fill="none" stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round" />
              <path d="M -45 25 Q -10 15 35 30" fill="none" stroke="#5eead4" strokeWidth="5" strokeLinecap="round" />

              {/* Secretory Transport Vesicles */}
              <circle cx="55" cy="-25" r="7" fill="#2dd4bf" stroke="#99f6e4" strokeWidth="1.5" />
              <circle cx="65" cy="5" r="8" fill="#14b8a6" stroke="#99f6e4" strokeWidth="1.5" />
              <circle cx="-65" cy="15" r="6" fill="#2dd4bf" stroke="#99f6e4" strokeWidth="1.5" />
              <circle cx="50" cy="35" r="7" fill="#5eead4" stroke="#ffffff" strokeWidth="1.5" />

              {selectedOrganelle === 'golgi' && (
                <rect x="-75" y="-55" width="155" height="110" rx="14" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="5 5" />
              )}

              {showAnatomyLabels && (
                <g transform="translate(0, 56)">
                  <rect x="-65" y="-12" width="130" height="22" rx="6" fill="#0f172a" fillOpacity="0.85" stroke="#2dd4bf" strokeWidth="1" />
                  <text x="0" y="3" fill="#99f6e4" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Badan Golgi (Logistik)
                  </text>
                </g>
              )}
            </g>

            {/* 6. CENTERPIECE: MITOCHONDRIA (Pusat Pembangkit Listrik Sel) */}
            <g
              transform="translate(510, 270)"
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedOrganelle('mitochondria')}
            >
              {/* Outer Bio-electric Radiation Aura */}
              <ellipse
                cx="0"
                cy="0"
                rx="125"
                ry="75"
                fill={isCrisis ? '#ea580c' : '#f59e0b'}
                opacity={isCrisis ? 0.15 : 0.3}
                filter="url(#bioElectricGlow)"
                className={isCrisis ? 'animate-pulse' : ''}
              />

              {/* Outer Membrane (Membran Luar) */}
              <ellipse
                cx="0"
                cy="0"
                rx="110"
                ry="65"
                fill="url(#mitoCutawayOuter)"
                stroke={isCrisis ? '#f97316' : '#fde047'}
                strokeWidth="4"
                filter="url(#bioElectricGlow)"
              />

              {/* Intermembrane Space & Inner Membrane (Matriks & Krista) */}
              <ellipse
                cx="0"
                cy="0"
                rx="96"
                ry="52"
                fill="url(#mitoMatrixGrad)"
                stroke={isCrisis ? '#b45309' : '#fef08a'}
                strokeWidth="2.5"
              />

              {/* Inner Cristae Folds (Lipatan Krista - Sirkuit Listrik Transpor Elektron) */}
              <g className={isCrisis ? 'opacity-60' : 'opacity-100'}>
                {/* Fold 1 (Left) */}
                <path
                  d="M -80 -10 C -50 -45, -30 20, -10 -25"
                  fill="none"
                  stroke={isCrisis ? '#f97316' : '#fef08a'}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Fold 2 (Center) */}
                <path
                  d="M -30 30 C 0 -10, 25 40, 50 -15"
                  fill="none"
                  stroke={isCrisis ? '#f97316' : '#fef08a'}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Fold 3 (Right) */}
                <path
                  d="M 30 35 C 55 -5, 75 25, 80 -10"
                  fill="none"
                  stroke={isCrisis ? '#f97316' : '#fef08a'}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>

              {/* Rotary ATP Synthase Molecular Turbines (Turbin Generator Listrik Sel) */}
              <g transform="translate(15, -15)">
                <circle cx="0" cy="0" r="10" fill="#facc15" stroke="#ffffff" strokeWidth="2" filter="url(#sparkleGlow)" />
                <path d="M 0 -8 L 0 8 M -8 0 L 8 0" stroke="#78350f" strokeWidth="2" className={isCrisis ? '' : 'animate-spin'} />
              </g>
              <g transform="translate(-40, 15)">
                <circle cx="0" cy="0" r="9" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" filter="url(#sparkleGlow)" />
                <path d="M 0 -7 L 0 7 M -7 0 L 7 0" stroke="#78350f" strokeWidth="1.5" className={isCrisis ? '' : 'animate-spin'} />
              </g>

              {/* Warning Beacon if in Crisis */}
              {isCrisis && (
                <g transform="translate(0, -55)">
                  <circle cx="0" cy="0" r="14" fill="#ef4444" filter="url(#bioElectricGlow)" className="animate-ping" />
                  <circle cx="0" cy="0" r="12" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                  <path d="M -4 -4 L 4 4 M -4 4 L 4 -4" stroke="#ffffff" strokeWidth="2.5" />
                </g>
              )}

              {selectedOrganelle === 'mitochondria' && (
                <ellipse cx="0" cy="0" rx="122" ry="76" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="6 6" />
              )}

              {showAnatomyLabels && (
                <g transform="translate(0, 84)">
                  <rect x="-95" y="-12" width="190" height="24" rx="7" fill="#0f172a" fillOpacity="0.95" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#fef08a" fontSize="11" fontWeight="900" textAnchor="middle">
                    ⚡ Mitokondria (Pembangkit Listrik)
                  </text>
                </g>
              )}
            </g>
          </svg>
        ) : (
          // =========================================================================
          // SVG VIEWPORT 2: ZOOM CLOSE-UP OF MITOCHONDRIA ELECTRICAL GENERATOR
          // =========================================================================
          <svg viewBox="0 0 960 540" className="w-full h-full object-contain">
            <defs>
              <linearGradient id="macroOuterMem" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#042f2e" />
              </linearGradient>

              <linearGradient id="macroMatrix" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={isCrisis ? '#7c2d12' : '#78350f'} />
                <stop offset="100%" stopColor={isCrisis ? '#451a03' : '#311000'} />
              </linearGradient>

              <linearGradient id="protonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Background Cytosol Stage */}
            <rect x="0" y="0" width="960" height="540" fill="#041f23" />

            {/* Mitokondria Cutaway Body */}
            <g transform="translate(480, 260)">
              {/* Outer Membrane (Smooth Barrier) */}
              <ellipse cx="0" cy="0" rx="390" ry="210" fill="url(#macroOuterMem)" stroke="#2dd4bf" strokeWidth="5" />

              {/* Intermembrane Space (Ruang Antarmembran: Baterai Akumulasi Proton H+) */}
              <ellipse cx="0" cy="0" rx="365" ry="190" fill="#0f766e" stroke="#5eead4" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />

              {/* Inner Matrix Bed */}
              <ellipse cx="0" cy="0" rx="340" ry="170" fill="url(#macroMatrix)" stroke="#d97706" strokeWidth="3" />

              {/* REAKTOR 1: SIKLUS KREBS (Di Matriks Tengah) */}
              <g 
                transform="translate(-130, -20)" 
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedOrganelle('mitochondria')}
              >
                <circle cx="0" cy="0" r="75" fill="#451a03" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10 6" className={isCrisis ? '' : 'animate-[spin_20s_linear_infinite]'} />
                <circle cx="0" cy="0" r="28" fill="#b45309" stroke="#fde047" strokeWidth="2" />
                <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Siklus Krebs
                </text>
                <text x="0" y="96" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Matriks: Pelepasan Elektron (NADH/FADH2)
                </text>
              </g>

              {/* REAKTOR 2: RANTAI TRANSPOR ELEKTRON (Kompleks I, II, III, IV) */}
              <g transform="translate(110, -50)">
                <path d="M -80 0 L 80 0" stroke={isCrisis ? '#f97316' : '#38bdf8'} strokeWidth="6" strokeDasharray="10 5" className="animate-pulse" />
                {[-60, -20, 20, 60].map((cx, idx) => (
                  <g key={idx} transform={`translate(${cx}, 0)`}>
                    <rect x="-12" y="-18" width="24" height="36" rx="6" fill="#0284c7" stroke="#bae6fd" strokeWidth="2" />
                    <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">
                      {['I', 'II', 'III', 'IV'][idx]}
                    </text>
                  </g>
                ))}
                <text x="0" y="32" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Rantai Transpor Elektron (Aliran Arus Listrik Sel)
                </text>

                {/* Akseptor Akhir O2 (Grounding Elektron) */}
                <g transform="translate(105, 0)">
                  <circle cx="0" cy="0" r="16" fill={isCrisis ? '#7f1d1d' : '#0369a1'} stroke={isCrisis ? '#ef4444' : '#67e8f9'} strokeWidth="2" />
                  <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">
                    O₂
                  </text>
                  <text x="0" y="-22" fill={isCrisis ? '#fca5a5' : '#7dd3fc'} fontSize="9" fontWeight="bold" textAnchor="middle">
                    {isCrisis ? 'O2 Putus!' : 'Akseptor Akhir'}
                  </text>
                </g>
              </g>

              {/* REAKTOR 3: GENERATOR TURBIN ATP SINTASE */}
              <g 
                transform="translate(160, 75)" 
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedOrganelle('atp_synthase')}
              >
                {/* Stator & Rotor Motor */}
                <path d="M -8 -35 L 8 -35 L 8 -10 L -8 -10 Z" fill="#b45309" stroke="#fde047" strokeWidth="1.5" />
                <circle cx="0" cy="15" r="32" fill="#d97706" stroke="#fef08a" strokeWidth="3" />
                <circle cx="0" cy="15" r="16" fill="#78350f" stroke="#ffffff" strokeWidth="2" />

                {/* Spinning blades */}
                <g className={isCrisis ? '' : 'animate-spin'}>
                  <line x1="0" y1="-10" x2="0" y2="40" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
                  <line x1="-25" y1="15" x2="25" y2="15" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
                </g>

                {/* Outgoing Golden ATP Sparks */}
                {!isCrisis && (
                  <g transform="translate(45, 15)">
                    <circle cx="0" cy="0" r="10" fill="#facc15" stroke="#ffffff" strokeWidth="2" filter="url(#sparkleGlow)" />
                    <text x="0" y="3" fill="#78350f" fontSize="8" fontWeight="black" textAnchor="middle">
                      ATP
                    </text>
                  </g>
                )}

                <text x="0" y="65" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Turbin ATP Sintase (Generator Listrik Biologis)
                </text>
              </g>

              {/* Proton (H+) flow arrows (Arus Listrik Proton) */}
              <g id="proton-arrows" className={isCrisis ? 'opacity-20' : 'opacity-100'}>
                {[ -220, -160, -100, 0, 80, 220 ].map((px, i) => (
                  <g key={i} transform={`translate(${px}, -120)`}>
                    <circle cx="0" cy="0" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#0f172a" fontSize="8" fontWeight="black" textAnchor="middle">
                      H⁺
                    </text>
                  </g>
                ))}
                <text x="-160" y="-140" fill="#7dd3fc" fontSize="10" fontWeight="bold">
                  ▲ Akumulasi Muatan Positif (Baterai Potensial Listrik Membran)
                </text>
              </g>
            </g>
          </svg>
        )}

        {/* Floating Switch Button inside viewport */}
        <div className="absolute bottom-3 left-3 z-20">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setViewAngle(viewAngle === 'cell_overview' ? 'mitochondria_zoom' : 'cell_overview');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-teal-200 text-xs font-bold border border-teal-500/40 shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{viewAngle === 'cell_overview' ? 'Beralih ke Close-Up Generator Mitokondria' : 'Kembali ke Peta Sel Utuh'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Organelle Exploration Selector Bar */}
      {interactiveHotspots && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-teal-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilih Komponen Sel & Jaringan Listrik Biologis:</span>
            </span>
            <span className="hidden sm:inline text-[11px]">Klik organel untuk menelaah peran kelistrikan sel</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {(Object.keys(ORGANELLES_DATA) as OrganelleId[]).map((key) => {
              const item = ORGANELLES_DATA[key];
              const isSelected = selectedOrganelle === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setSelectedOrganelle(key);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-md ring-1 ring-teal-400'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase text-amber-400 truncate">
                    {key === 'mitochondria' ? '⚡ Pembangkit' : key === 'atp_synthase' ? '⚙️ Turbin' : '🏢 Organel'}
                  </div>
                  <div className="text-xs font-extrabold truncate mt-0.5">{item.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">
                    {key === 'mitochondria' ? 'Mitokondria' : key === 'nucleus' ? 'Nukleus' : key === 'er' ? 'RE' : key === 'golgi' ? 'Golgi' : key === 'membrane' ? 'Membran' : key === 'atp_synthase' ? 'ATP Sintase' : 'Sitosol'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Card */}
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-teal-500/30 shadow-lg space-y-2 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
              <div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  Telaah Biologi & Kelistrikan Sel:
                </span>
                <h4 className="text-sm font-bold text-teal-200">{organelle.name} ({organelle.biologyName})</h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-950/80 border border-teal-500/30 text-teal-300 self-start sm:self-auto">
                {organelle.atpConsumption}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Peran Kelistrikan / Energi:</span>
                </span>
                <p className="text-slate-300 leading-relaxed pl-5">{organelle.electricityRole}</p>
              </div>

              <div className="space-y-1">
                <span className={`font-bold flex items-center gap-1.5 ${isCrisis ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isCrisis ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Status {isCrisis ? 'Saat Blackout / Krisis Listrik' : 'Saat Daya Normal (100%)'}:</span>
                </span>
                <p className="text-slate-300 leading-relaxed pl-5">
                  {isCrisis ? organelle.crisisStatus : organelle.normalStatus}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-teal-300/80 pt-1 border-t border-slate-800 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span><strong>Dampak Beda Potensial Listrik:</strong> {organelle.voltageImpact}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
