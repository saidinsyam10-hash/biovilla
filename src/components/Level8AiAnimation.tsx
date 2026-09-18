import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Pause, Zap } from 'lucide-react';

interface Level8AiAnimationProps {
  slideId: string;
  title?: string;
}

interface AnimationMeta {
  badge: string;
  subBadge: string;
  verseRef?: string;
  themeColor: string;
  accentColor: string;
}

const SLIDE_METAS: Record<string, AnimationMeta> = {
  'lvl8-s1': {
    badge: 'Tadabbur Sains Ilahi',
    subBadge: 'Keterpaduan & Desain Holistik Sel',
    verseRef: "QS. Ali 'Imran : 190–191",
    themeColor: '#10b981',
    accentColor: '#fbbf24'
  },
  'lvl8-s2': {
    badge: 'Sinergi & Amanah',
    subBadge: 'Jalur Perakitan Ribosom → Golgi',
    verseRef: 'Nilai Integritas & Tanggung Jawab',
    themeColor: '#3b82f6',
    accentColor: '#60a5fa'
  },
  'lvl8-s3': {
    badge: 'Filter Tabayyun',
    subBadge: 'Selektivitas Lapisan Fosfolipid Ganda',
    verseRef: 'QS. Al-Hujurat : 6',
    themeColor: '#059669',
    accentColor: '#34d399'
  },
  'lvl8-s4': {
    badge: 'Dinamika Energi ATP',
    subBadge: 'Pemanfaatan Energi Mitokondria untuk Kebaikan',
    verseRef: 'Syukur & Amal Bajik',
    themeColor: '#f59e0b',
    accentColor: '#fde047'
  },
  'lvl8-s5': {
    badge: 'Desain Itqan Nanometer',
    subBadge: 'Presisi Ultrastruktur Sel 100% Cacat 0',
    verseRef: 'QS. Al-Mulk : 3–4',
    themeColor: '#8b5cf6',
    accentColor: '#c084fc'
  },
  'lvl8-s6': {
    badge: 'Keseimbangan Tawazun',
    subBadge: 'Homeostasis & Osmoregulasi Sel',
    verseRef: 'QS. Al-Qamar : 49',
    themeColor: '#06b6d4',
    accentColor: '#22d3ee'
  },
  'lvl8-s7': {
    badge: 'Air Basis Kehidupan',
    subBadge: 'Sitosol & Pelarut Universal Biokimia',
    verseRef: 'QS. Al-Anbiya : 30',
    themeColor: '#0284c7',
    accentColor: '#38bdf8'
  },
  'lvl8-s8': {
    badge: 'Pusat Komando Qalb',
    subBadge: 'Nukleus Pengendali & Keluhuran Niat',
    verseRef: 'HR. Bukhari (Hadits Hati)',
    themeColor: '#6366f1',
    accentColor: '#a855f7'
  },
  'lvl8-s9': {
    badge: 'Muhasabah & Tazkiyah',
    subBadge: 'Autofagi Lisosom: Daur Ulang Pembersih',
    verseRef: 'Penyucian Jiwa & Introspeksi Diri',
    themeColor: '#14b8a6',
    accentColor: '#2dd4bf'
  },
  'lvl8-s12': {
    badge: 'Harmoni Sains & Iman',
    subBadge: 'Pohon Kehidupan Desa Sel & Kosmos Hayati',
    verseRef: 'Sintesis Paripurna Ulul Albab',
    themeColor: '#059669',
    accentColor: '#f59e0b'
  }
};

export const Level8AiAnimation: React.FC<Level8AiAnimationProps> = ({ slideId, title }) => {
  const [pulseKey, setPulseKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [tick, setTick] = useState(0);

  const meta: AnimationMeta = SLIDE_METAS[slideId] || {
    badge: 'Visualisasi Sains AI',
    subBadge: title || 'Harmoni Nilai & Sains Sel',
    verseRef: undefined,
    themeColor: '#10b981',
    accentColor: '#fbbf24'
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTick(prev => (prev + 1) % 3600);
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const triggerReaction = () => {
    setPulseKey(prev => prev + 1);
  };

  // Render specific SVG animation based on slide ID
  const renderAnimationContent = () => {
    const t = tick * 0.05;

    switch (slideId) {
      // 1. Keterpaduan & Desain Holistik Sel (QS. Ali 'Imran 190-191)
      case 'lvl8-s1': {
        const nucleusPulse = 1 + 0.08 * Math.sin(t * 2);
        const orbitAngle1 = t * 0.8;
        const orbitAngle2 = t * 0.6 + 2.0;
        const orbitAngle3 = t * 0.7 + 4.0;
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <radialGradient id="s1-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.9" />
              </radialGradient>
              <radialGradient id="s1-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="s1-core" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>

            <rect width="600" height="240" fill="url(#s1-bg)" rx="16" />

            {/* Shimmering cosmic stars */}
            {[...Array(16)].map((_, i) => {
              const sx = 40 + ((i * 37) % 520);
              const sy = 25 + ((i * 53) % 190);
              const starOp = 0.3 + 0.6 * Math.abs(Math.sin(t + i));
              return (
                <circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 2 : 1.2} fill="#fef08a" opacity={starOp} />
              );
            })}

            {/* Orbit rings */}
            <ellipse cx="300" cy="120" rx="200" ry="75" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
            <ellipse cx="300" cy="120" rx="140" ry="50" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
            <ellipse cx="300" cy="120" rx="80" ry="30" fill="none" stroke="#34d399" strokeWidth="1.2" opacity="0.6" />

            {/* Energy Conduits connecting to center */}
            <line x1={300 + 190 * Math.cos(orbitAngle1)} y1={120 + 70 * Math.sin(orbitAngle1)} x2="300" y2="120" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <line x1={300 + 130 * Math.cos(orbitAngle2)} y1={120 + 45 * Math.sin(orbitAngle2)} x2="300" y2="120" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <line x1={300 + 75 * Math.cos(orbitAngle3)} y1={120 + 28 * Math.sin(orbitAngle3)} x2="300" y2="120" stroke="#6ee7b7" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />

            {/* Central Glowing Nucleus */}
            <circle cx="300" cy="120" r={40 * nucleusPulse} fill="url(#s1-glow)" />
            <circle cx="300" cy="120" r="24" fill="url(#s1-core)" filter="drop-shadow(0 0 10px #fbbf24)" />
            <circle cx="300" cy="120" r="14" fill="#fff" opacity="0.85" />
            <text x="300" y="124" textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="bold">NUKLEUS</text>

            {/* Orbiting Organelles */}
            {/* Mitochondria on outer orbit */}
            <g transform={`translate(${300 + 190 * Math.cos(orbitAngle1)}, ${120 + 70 * Math.sin(orbitAngle1)})`}>
              <ellipse rx="18" ry="11" fill="#f97316" stroke="#fdba74" strokeWidth="1.5" />
              <path d="M-12 0 Q-6 -5 0 0 T12 0" fill="none" stroke="#ffedd5" strokeWidth="1.5" />
              <text x="0" y="20" textAnchor="middle" fill="#fed7aa" fontSize="9" fontWeight="bold">Mitokondria</text>
            </g>

            {/* Chloroplast on mid orbit */}
            <g transform={`translate(${300 + 130 * Math.cos(orbitAngle2)}, ${120 + 45 * Math.sin(orbitAngle2)})`}>
              <ellipse rx="16" ry="10" fill="#15803d" stroke="#86efac" strokeWidth="1.5" />
              <circle cx="-5" cy="0" r="3" fill="#86efac" />
              <circle cx="5" cy="0" r="3" fill="#86efac" />
              <text x="0" y="19" textAnchor="middle" fill="#bbf7d0" fontSize="9" fontWeight="bold">Kloroplas</text>
            </g>

            {/* Golgi on inner orbit */}
            <g transform={`translate(${300 + 75 * Math.cos(orbitAngle3)}, ${120 + 28 * Math.sin(orbitAngle3)})`}>
              <path d="M-10 -6 Q0 -10 10 -6 M-12 0 Q0 -4 12 0 M-10 6 Q0 2 10 6" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <text x="0" y="18" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold">Golgi</text>
            </g>

            {/* Text badge */}
            <rect x="20" y="18" width="170" height="26" rx="8" fill="#047857" opacity="0.8" />
            <text x="105" y="35" textAnchor="middle" fill="#ecfdf5" fontSize="10" fontWeight="bold">
              ✨ Keterpaduan Selular Ilahi
            </text>
          </svg>
        );
      }

      // 2. Ribosom & Golgi: Jalur Amanah (Sintesis & Vesikel)
      case 'lvl8-s2': {
        const progress = (tick * 0.015) % 1;
        const vX = 140 + progress * 240;
        const vY = 120 + Math.sin(progress * Math.PI * 4) * 12;
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <linearGradient id="s2-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s2-bg)" rx="16" />

            {/* Microtubule track */}
            <line x1="120" y1="120" x2="420" y2="120" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <line x1="120" y1="120" x2="420" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 8" strokeDashoffset={-tick * 2} />

            {/* Ribosome & mRNA on the left */}
            <g transform="translate(100, 120)">
              {/* mRNA Strand */}
              <path d="M-50 20 Q-20 10 10 20 T70 20" fill="none" stroke="#f43f5e" strokeWidth="3" />
              {/* Large & Small Subunit */}
              <circle cx="0" cy="-14" r="22" fill="#3b82f6" stroke="#93c5fd" strokeWidth="2" />
              <circle cx="0" cy="12" r="15" fill="#2563eb" stroke="#bfdbfe" strokeWidth="2" />
              {/* Growing Polypeptide */}
              <path d="M-8 -30 Q-15 -45 5 -55" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3" />
              <text x="0" y="45" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">Ribosom</text>
              <text x="0" y="58" textAnchor="middle" fill="#60a5fa" fontSize="9">Perakit Protein</text>
            </g>

            {/* Transport Vesicle moving smoothly */}
            <g transform={`translate(${vX}, ${vY})`}>
              <circle cx="0" cy="0" r="16" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
              <circle cx="0" cy="0" r="9" fill="#facc15" />
              {/* Particle trail */}
              <circle cx="-16" cy="0" r="4" fill="#38bdf8" opacity="0.6" />
              <circle cx="-26" cy="0" r="2.5" fill="#38bdf8" opacity="0.3" />
              <text x="0" y="-22" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">Vesikel Amanah</text>
            </g>

            {/* Golgi Complex on the right */}
            <g transform="translate(470, 120)">
              <path d="M-20 -40 Q10 -20 -20 0 Q10 20 -20 40" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
              <path d="M-5 -45 Q25 -20 -5 0 Q25 20 -5 45" fill="none" stroke="#34d399" strokeWidth="10" strokeLinecap="round" opacity="0.85" />
              <path d="M12 -35 Q40 -15 12 0 Q40 15 12 35" fill="none" stroke="#6ee7b7" strokeWidth="8" strokeLinecap="round" />
              <circle cx="35" cy="-25" r="7" fill="#6ee7b7" />
              <circle cx="42" cy="18" r="8" fill="#6ee7b7" />
              <text x="10" y="65" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">Badan Golgi</text>
              <text x="10" y="78" textAnchor="middle" fill="#a7f3d0" fontSize="9">Pusat Distribusi</text>
            </g>

            <rect x="20" y="16" width="220" height="24" rx="6" fill="#1e3a8a" opacity="0.8" />
            <text x="130" y="32" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="bold">
              📦 Sinergi Tak Terputus Tanpa Ego
            </text>
          </svg>
        );
      }

      // 3. Tabayyun & Membran Sel Semipermeabel (QS. Al-Hujurat 6)
      case 'lvl8-s3': {
        const tPass = (tick * 0.02) % 1;
        // Good nutrient passing through channel
        const goodX = 120 + tPass * 360;
        const goodY = 120;
        // Bad particle bouncing back
        const badPhase = (tick * 0.03) % 1;
        const badX = badPhase < 0.5 ? 120 + badPhase * 280 : 260 - (badPhase - 0.5) * 260;
        const badY = 65;
        const shieldPulse = 1 + 0.15 * Math.sin(tick * 0.2);

        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <linearGradient id="s3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s3-bg)" rx="16" />

            {/* Outer vs Inner Labels */}
            <text x="80" y="30" fill="#a7f3d0" fontSize="11" fontWeight="bold">LUAR SEL (Ekstraseluler)</text>
            <text x="500" y="30" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">DALAM SEL (Sitosol)</text>

            {/* Phospholipid Bilayer Wall */}
            <g transform="translate(300, 0)">
              {/* Upper membrane block */}
              <rect x="-24" y="40" width="48" height="55" rx="6" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
              {[...Array(6)].map((_, i) => (
                <g key={`head-top-${i}`} transform={`translate(-18 + ${i * 7}, 48)`}>
                  <circle cx="0" cy="0" r="3" fill="#facc15" />
                  <line x1="0" y1="3" x2="0" y2="14" stroke="#a3e635" strokeWidth="1" />
                </g>
              ))}

              {/* Central Channel Protein (The Gate of Tabayyun) */}
              <rect x="-30" y="95" width="60" height="50" rx="8" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M-15 95 Q0 120 -15 145 M15 95 Q0 120 15 145" fill="none" stroke="#bae6fd" strokeWidth="2" />
              <text x="0" y="124" textAnchor="middle" fill="#f0fdf4" fontSize="9" fontWeight="bold">GERBANG</text>

              {/* Lower membrane block */}
              <rect x="-24" y="145" width="48" height="55" rx="6" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
              {[...Array(6)].map((_, i) => (
                <g key={`head-bot-${i}`} transform={`translate(-18 + ${i * 7}, 188)`}>
                  <circle cx="0" cy="0" r="3" fill="#facc15" />
                  <line x1="0" y1="-3" x2="0" y2="-14" stroke="#a3e635" strokeWidth="1" />
                </g>
              ))}

              {/* Tabayyun Glowing Shield Effect on Wall */}
              <ellipse cx="-20" cy="68" rx={10 * shieldPulse} ry={25 * shieldPulse} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.75" />
            </g>

            {/* Nutrisi Baik (Lolos / Terverifikasi) */}
            <g transform={`translate(${goodX}, ${goodY})`}>
              <circle cx="0" cy="0" r="11" fill="#22c55e" stroke="#86efac" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">✓</text>
              <text x="0" y="-15" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">Nutrisi Valid</text>
            </g>

            {/* Hoaks / Racun Ditolak (Memantul Balik) */}
            <g transform={`translate(${badX}, ${badY})`}>
              <circle cx="0" cy="0" r="10" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
              <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">✕</text>
              <text x="0" y="-14" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">Hoaks / Toksin</text>
            </g>

            {/* Banner */}
            <rect x="20" y="195" width="260" height="26" rx="6" fill="#065f46" opacity="0.9" />
            <text x="150" y="212" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">
              🛡️ Tabayyun: Saring Sebelum Masuk ke Diri
            </text>
          </svg>
        );
      }

      // 4. Mitokondria & Letupan Energi Kebaikan (ATP)
      case 'lvl8-s4': {
        const pulse = 1 + 0.05 * Math.sin(tick * 0.15);
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <radialGradient id="s4-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#78350f" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1c1917" stopOpacity="0.9" />
              </radialGradient>
              <radialGradient id="s4-atp" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s4-bg)" rx="16" />

            {/* Radiating ATP sparks */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI) / 4 + tick * 0.02;
              const dist = 60 + ((tick * 2 + i * 25) % 130);
              const sparkX = 300 + Math.cos(angle) * dist;
              const sparkY = 120 + Math.sin(angle) * (dist * 0.55);
              const sparkOp = Math.max(0, 1 - dist / 190);
              return (
                <g key={i} transform={`translate(${sparkX}, ${sparkY})`} opacity={sparkOp}>
                  <circle cx="0" cy="0" r="12" fill="url(#s4-atp)" />
                  <circle cx="0" cy="0" r="4" fill="#fff" />
                  <text x="0" y="14" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="bold">ATP</text>
                </g>
              );
            })}

            {/* Mitochondria Body */}
            <g transform={`translate(300, 120) scale(${pulse})`}>
              {/* Outer Membrane */}
              <ellipse cx="0" cy="0" rx="90" ry="50" fill="#ea580c" stroke="#fed7aa" strokeWidth="3" />
              {/* Inner Membrane Space */}
              <ellipse cx="0" cy="0" rx="80" ry="42" fill="#c2410c" stroke="#fdba74" strokeWidth="1.5" />
              {/* Cristae Folds */}
              <path
                d="M-65 -15 C-50 -10 -40 -30 -30 -25 C-20 -20 -15 20 -5 15 C5 10 15 -25 30 -20 C45 -15 50 15 65 10"
                fill="none"
                stroke="#fed7aa"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M-55 10 C-40 20 -25 5 -15 22 C-5 10 15 25 35 15 C50 8 55 -5 60 5"
                fill="none"
                stroke="#fef08a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Center Energy Core */}
              <circle cx="0" cy="0" r="14" fill="#facc15" filter="drop-shadow(0 0 8px #fef08a)" />
              <text x="0" y="4" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">ENERGI</text>
            </g>

            <rect x="20" y="16" width="220" height="24" rx="6" fill="#9a3412" opacity="0.85" />
            <text x="130" y="32" textAnchor="middle" fill="#ffedd5" fontSize="10" fontWeight="bold">
              ⚡ Mitokondria: Pembangkit Tenaga Kebaikan
            </text>
          </svg>
        );
      }

      // 5. Kesempurnaan Ciptaan (Itqan Nanometer QS. Al-Mulk 3-4)
      case 'lvl8-s5': {
        const scanX = 140 + Math.sin(tick * 0.05) * 160;
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <linearGradient id="s5-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e1065" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s5-bg)" rx="16" />

            {/* Grid Lines for Nanoscale Precision */}
            {[...Array(9)].map((_, i) => (
              <line key={`gx-${i}`} x1={100 + i * 50} y1="30" x2={100 + i * 50} y2="210" stroke="#475569" strokeWidth="0.5" strokeDasharray="3 3" />
            ))}
            {[...Array(5)].map((_, i) => (
              <line key={`gy-${i}`} x1="80" y1={50 + i * 35} x2="520" y2={50 + i * 35} stroke="#475569" strokeWidth="0.5" strokeDasharray="3 3" />
            ))}

            {/* DNA Double Helix Loop */}
            {[...Array(18)].map((_, i) => {
              const x = 110 + i * 22;
              const wave = Math.sin(tick * 0.08 + i * 0.45);
              const y1 = 120 + wave * 36;
              const y2 = 120 - wave * 36;
              return (
                <g key={i}>
                  <line x1={x} y1={y1} x2={x} y2={y2} stroke="#c084fc" strokeWidth="1.8" opacity="0.6" />
                  <circle cx={x} cy={y1} r="5" fill="#a855f7" stroke="#f3e8ff" strokeWidth="1.5" />
                  <circle cx={x} cy={y2} r="5" fill="#06b6d4" stroke="#cffafe" strokeWidth="1.5" />
                </g>
              );
            })}

            {/* Holographic Laser Scan Bar */}
            <line x1={scanX} y1="30" x2={scanX} y2="210" stroke="#38bdf8" strokeWidth="2.5" />
            <rect x={scanX - 15} y="30" width="30" height="180" fill="#38bdf8" opacity="0.12" />

            {/* Diagnostic Stamp */}
            <rect x="360" y="180" width="180" height="32" rx="8" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
            <text x="450" y="200" textAnchor="middle" fill="#f5d0fe" fontSize="10" fontWeight="bold">
              DESAIN ITQAN: 0 CACAT (QS 67:3)
            </text>

            <rect x="20" y="16" width="220" height="24" rx="6" fill="#6b21a8" opacity="0.85" />
            <text x="130" y="32" textAnchor="middle" fill="#fae8ff" fontSize="10" fontWeight="bold">
              🔬 Presisi Molekuler Nanometer
            </text>
          </svg>
        );
      }

      // 6. Keseimbangan Homeostasis & Tawazun (QS. Al-Qamar 49)
      case 'lvl8-s6': {
        const tilt = Math.sin(tick * 0.05) * 6; // gentle balance oscillation
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <linearGradient id="s6-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s6-bg)" rx="16" />

            {/* Center Fulcrum */}
            <polygon points="300,105 285,165 315,165" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="300" cy="105" r="7" fill="#facc15" />
            <rect x="260" y="165" width="80" height="14" rx="4" fill="#0369a1" />

            {/* Balance Beam with Tilt */}
            <g transform={`translate(300, 105) rotate(${tilt})`}>
              {/* Beam */}
              <line x1="-160" y1="0" x2="160" y2="0" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" />

              {/* Left Chamber (Cairan & Ion Na+) */}
              <g transform="translate(-150, 0)">
                <line x1="0" y1="0" x2="0" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
                <rect x="-35" y="35" width="70" height="50" rx="8" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
                {/* Fluid Wave */}
                <path d="M-35 55 Q-15 50 0 55 T35 55 L35 85 L-35 85 Z" fill="#22d3ee" opacity="0.6" />
                <circle cx="-15" cy="70" r="6" fill="#facc15" />
                <text x="-15" y="73" textAnchor="middle" fill="#78350f" fontSize="7" fontWeight="bold">Na⁺</text>
                <circle cx="15" cy="65" r="7" fill="#38bdf8" />
                <text x="15" y="68" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold">pH 7.3</text>
                <text x="0" y="100" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold">Cairan Ekstrasel</text>
              </g>

              {/* Right Chamber (Cairan & Ion K+) */}
              <g transform="translate(150, 0)">
                <line x1="0" y1="0" x2="0" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
                <rect x="-35" y="35" width="70" height="50" rx="8" fill="#047857" stroke="#34d399" strokeWidth="2" />
                {/* Fluid Wave */}
                <path d="M-35 55 Q-15 60 0 55 T35 55 L35 85 L-35 85 Z" fill="#34d399" opacity="0.6" />
                <circle cx="-12" cy="68" r="6.5" fill="#facc15" />
                <text x="-12" y="71" textAnchor="middle" fill="#78350f" fontSize="7" fontWeight="bold">K⁺</text>
                <circle cx="14" cy="67" r="6" fill="#a7f3d0" />
                <text x="14" y="70" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold">ATP</text>
                <text x="0" y="100" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">Cairan Intrasel</text>
              </g>
            </g>

            <rect x="20" y="16" width="230" height="24" rx="6" fill="#0e7490" opacity="0.85" />
            <text x="135" y="32" textAnchor="middle" fill="#ecfeff" fontSize="10" fontWeight="bold">
              ⚖️ Tawazun: Keseimbangan Hidup & Sel
            </text>
          </svg>
        );
      }

      // 7. Air sebagai Basis Kehidupan & Sitosol (QS. Al-Anbiya 30)
      case 'lvl8-s7': {
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <linearGradient id="s7-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s7-bg)" rx="16" />

            {/* Ripple Waves */}
            {[...Array(3)].map((_, i) => {
              const r = 20 + ((tick * 1.5 + i * 40) % 130);
              const op = Math.max(0, 0.8 - r / 130);
              return (
                <ellipse key={i} cx="300" cy="120" rx={r * 1.6} ry={r * 0.7} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={op} />
              );
            })}

            {/* Floating H2O Molecules */}
            {[...Array(8)].map((_, i) => {
              const mx = 80 + ((i * 65 + tick * 0.5) % 460);
              const my = 50 + ((i * 45 + Math.sin(tick * 0.05 + i) * 20) % 150);
              return (
                <g key={i} transform={`translate(${mx}, ${my})`}>
                  {/* Oxygen */}
                  <circle cx="0" cy="0" r="11" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
                  <text x="0" y="3.5" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">O</text>
                  {/* Hydrogen 1 */}
                  <circle cx="-10" cy="-9" r="6" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1" />
                  <text x="-10" y="-7" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold">H</text>
                  {/* Hydrogen 2 */}
                  <circle cx="10" cy="-9" r="6" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1" />
                  <text x="10" y="-7" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold">H</text>
                </g>
              );
            })}

            <rect x="20" y="16" width="240" height="24" rx="6" fill="#0369a1" opacity="0.85" />
            <text x="140" y="32" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="bold">
              💧 Sitosol: 70–80% Air Penghidup Reaksi Sel
            </text>
          </svg>
        );
      }

      // 8. Pusat Komando Nukleus & Kebersihan Hati (HR. Bukhari)
      case 'lvl8-s8': {
        const heartBeat = 1 + 0.12 * Math.pow(Math.sin(tick * 0.1), 3);
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <radialGradient id="s8-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
              <radialGradient id="s8-aura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s8-bg)" rx="16" />

            {/* Glowing Spiritual Wave Pulses */}
            {[...Array(4)].map((_, i) => {
              const r = 35 + ((tick * 1.8 + i * 35) % 150);
              const op = Math.max(0, 0.75 - r / 150);
              return (
                <circle key={i} cx="300" cy="120" r={r} fill="none" stroke="#c084fc" strokeWidth="2" opacity={op} />
              );
            })}

            {/* Beating Nucleus / Qalb Core */}
            <g transform={`translate(300, 120) scale(${heartBeat})`}>
              <circle cx="0" cy="0" r="45" fill="url(#s8-aura)" />
              <circle cx="0" cy="0" r="32" fill="#4f46e5" stroke="#a5b4fc" strokeWidth="2.5" />
              {/* Nucleolus / The Pure Spark */}
              <circle cx="0" cy="0" r="14" fill="#facc15" filter="drop-shadow(0 0 10px #fde047)" />
              <text x="0" y="4" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">QALB</text>
            </g>

            {/* Subordinate organelles listening to command */}
            <g transform="translate(130, 90)">
              <ellipse rx="15" ry="9" fill="#15803d" stroke="#86efac" strokeWidth="1" />
              <text x="0" y="19" textAnchor="middle" fill="#bbf7d0" fontSize="8">Kloroplas Patuh</text>
            </g>
            <g transform="translate(470, 90)">
              <ellipse rx="16" ry="10" fill="#ea580c" stroke="#fed7aa" strokeWidth="1" />
              <text x="0" y="20" textAnchor="middle" fill="#fed7aa" fontSize="8">Mitokondria Selaras</text>
            </g>

            <rect x="20" y="16" width="250" height="24" rx="6" fill="#4338ca" opacity="0.85" />
            <text x="145" y="32" textAnchor="middle" fill="#e0e7ff" fontSize="10" fontWeight="bold">
              ❤️ Jika Hati / Komando Baik, Seluruh Tubuh Baik
            </text>
          </svg>
        );
      }

      // 9. Daur Ulang Lisosom & Konsep Muhasabah / Tazkiyah
      case 'lvl8-s9': {
        const rot = tick * 2;
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <linearGradient id="s9-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#134e4a" />
                <stop offset="100%" stopColor="#042f2e" />
              </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s9-bg)" rx="16" />

            {/* Recycling Orbit Ring */}
            <g transform="translate(300, 120)">
              <circle cx="0" cy="0" r="70" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeDasharray="8 8" opacity="0.5" />

              {/* Central Lysosome with Digestive Enzymes */}
              <circle cx="0" cy="0" r="38" fill="#0f766e" stroke="#5eead4" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="24" fill="#14b8a6" opacity="0.8" />
              <text x="0" y="4" textAnchor="middle" fill="#f0fdfa" fontSize="10" fontWeight="bold">LISOSOM</text>
              <text x="0" y="16" textAnchor="middle" fill="#ccfbf1" fontSize="8">Autofagi</text>

              {/* Damaged Organelle Inflow (Tazkiyah) */}
              <g transform={`rotate(${rot}) translate(70, 0)`}>
                <circle cx="0" cy="0" r="10" fill="#f43f5e" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">✕</text>
                <text x="0" y="-14" textAnchor="middle" fill="#fecdd3" fontSize="8">Materi Rusak</text>
              </g>

              {/* Purified Nutrients Outflow (Renewed Soul) */}
              <g transform={`rotate(${rot + 180}) translate(70, 0)`}>
                <circle cx="0" cy="0" r="11" fill="#10b981" stroke="#a7f3d0" strokeWidth="1.5" />
                <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">★</text>
                <text x="0" y="-14" textAnchor="middle" fill="#a7f3d0" fontSize="8">Nutrisi Baru</text>
              </g>
            </g>

            <rect x="20" y="16" width="240" height="24" rx="6" fill="#115e59" opacity="0.85" />
            <text x="140" y="32" textAnchor="middle" fill="#ccfbf1" fontSize="10" fontWeight="bold">
              ♻️ Muhasabah: Bersihkan Noda Jadi Kebaikan Baru
            </text>
          </svg>
        );
      }

      // 12. Harmoni Sains & Iman (Refleksi Akhir)
      case 'lvl8-s12':
      default: {
        const treePulse = 1 + 0.04 * Math.sin(tick * 0.1);
        return (
          <svg viewBox="0 0 600 240" className="w-full h-full select-none">
            <defs>
              <linearGradient id="s12-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="50%" stopColor="#042f2e" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="600" height="240" fill="url(#s12-bg)" rx="16" />

            {/* Tree of Life with intertwining DNA Helices */}
            <g transform={`translate(300, 130) scale(${treePulse})`}>
              {/* Glowing Canopy */}
              <circle cx="0" cy="-45" r="55" fill="#10b981" opacity="0.3" filter="drop-shadow(0 0 15px #34d399)" />
              <circle cx="-25" cy="-35" r="35" fill="#059669" opacity="0.4" />
              <circle cx="25" cy="-35" r="35" fill="#047857" opacity="0.4" />

              {/* Trunk & Intertwined Helix */}
              <path d="M-8 40 Q-2 0 -12 -35 M8 40 Q2 0 12 -35" fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
              <path d="M-14 -10 Q0 -5 14 -10 M-12 15 Q0 20 12 15" fill="none" stroke="#fbbf24" strokeWidth="2" />

              {/* Shining Crest */}
              <circle cx="0" cy="-55" r="14" fill="#facc15" filter="drop-shadow(0 0 12px #fde047)" />
              <text x="0" y="-51" textAnchor="middle" fill="#78350f" fontSize="9" fontWeight="bold">IMAN</text>
              <text x="0" y="55" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">POHON KEHIDUPAN SEL</text>
            </g>

            {/* Orbiting Starlight */}
            {[...Array(10)].map((_, i) => {
              const a = (i * Math.PI) / 5 + tick * 0.02;
              const ox = 300 + Math.cos(a) * 150;
              const oy = 115 + Math.sin(a) * 65;
              return (
                <circle key={i} cx={ox} cy={oy} r="2.5" fill="#fde047" opacity="0.75" />
              );
            })}

            <rect x="20" y="16" width="250" height="24" rx="6" fill="#065f46" opacity="0.85" />
            <text x="145" y="32" textAnchor="middle" fill="#ecfdf5" fontSize="10" fontWeight="bold">
              🌳 Harmoni Abadi: Integrasi Sains & Iman
            </text>
          </svg>
        );
      }
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-amber-200/90 shadow-xl bg-slate-900 flex flex-col transition-all group cursor-pointer"
      onClick={triggerReaction}
      title="Sentuh untuk memicu denyut energi sains"
    >
      {/* Dynamic Header Badge */}
      <div className="bg-slate-950/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span 
            className="px-2.5 py-0.5 rounded-full font-bold text-[11px] shadow-sm flex items-center gap-1"
            style={{ backgroundColor: meta.themeColor, color: '#ffffff' }}
          >
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
            {meta.badge}
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline text-[11px]">
            {meta.subBadge}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {meta.verseRef && (
            <span className="text-[10px] text-amber-300/90 font-mono bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
              {meta.verseRef}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={isPlaying ? "Jeda animasi" : "Putar animasi"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Animation Canvas Container */}
      <div className="relative w-full aspect-[2.5/1] min-h-[170px] max-h-[220px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {renderAnimationContent()}

        {/* Pulse Ripple Reaction on Click */}
        {pulseKey > 0 && (
          <div 
            key={pulseKey}
            className="absolute inset-0 pointer-events-none border-2 border-amber-300 rounded-3xl animate-ping opacity-30"
            style={{ animationDuration: '0.8s' }}
          />
        )}
      </div>

      {/* Interactive Micro-footer caption */}
      <div className="bg-slate-950/90 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <Zap className="w-3 h-3" />
          Animasi AI Interaktif • Refleksi Nilai BioVillage
        </span>
        <span className="text-slate-500 hidden sm:inline">
          Klik visual untuk memicu resonansi
        </span>
      </div>
    </div>
  );
};
