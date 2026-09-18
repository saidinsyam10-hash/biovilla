import React, { useState, useEffect, useRef } from 'react';
import { resolveMediaPath, sfx } from '../utils/audio';
import { getMediaResolvedURL, onMediaUpdated } from '../utils/mediaStore';
import { saveLevelScore } from '../utils/scoreStore';
import { getCurrentUser } from '../utils/authStore';
import { Check, RotateCcw, ArrowRight, HelpCircle, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export interface Level2TownDragDropProps {
  onComplete: (scoreData?: { skor: number; skor_maksimal?: number; status?: 'lulus' | 'belum_lulus' }) => void;
  isAlreadyCleared?: boolean;
}

interface Organelle {
  id: string;
  name: string;
  image: string;
  analogy: string;
}

interface DropZone {
  id: string;
  name: string;
  analogyHint: string;
  targetOrganelleId: string;
  left: number; // percentage
  top: number;  // percentage
  width: number; // percentage
  height: number; // percentage
}

const ORGANELLES: Organelle[] = [
  {
    id: 'nucleus',
    name: 'Nukleus',
    image: '/assets/organelle_nucleus.png',
    analogy: 'Pusat Komando & Pengatur Kegiatan Sel'
  },
  {
    id: 'golgi',
    name: 'Badan Golgi',
    image: '/assets/organelle_golgi.png',
    analogy: 'Pusat Penyortir, Modifikasi & Pengemas'
  },
  {
    id: 'endoplasmic',
    name: 'Retikulum Endoplasma',
    image: '/assets/organelle_endoplasmic.png',
    analogy: 'Jalur Transportasi Internal & Sintesis'
  },
  {
    id: 'mitochondria',
    name: 'Mitokondria',
    image: '/assets/organelle_mitochondria.png',
    analogy: 'Pembangkit Energi Sel (Respirasi/ATP)'
  },
  {
    id: 'membrane',
    name: 'Membran Sel',
    image: '/assets/organelle_membrane.png',
    analogy: 'Gerbang Pelindung & Lalu Lintas Zat'
  }
];

const DROP_ZONES: DropZone[] = [
  {
    id: 'balai_desa',
    name: 'Balai Desa',
    analogyHint: 'Rumah besar berbendera di pusat desa (Pusat Komando Sel)',
    targetOrganelleId: 'nucleus',
    left: 40,
    top: 13,
    width: 17,
    height: 18
  },
  {
    id: 'pabrik',
    name: 'Pabrik Cerobong Asap',
    analogyHint: 'Pabrik industri dengan 2 cerobong asap (Pembangkit Energi Sel)',
    targetOrganelleId: 'mitochondria',
    left: 58,
    top: 18,
    width: 17,
    height: 18
  },
  {
    id: 'greenhouse',
    name: 'Rumah Kaca & Labirin Produksi',
    analogyHint: 'Kubah kaca & fasilitas berlipat (Jalur Sintesis & Transportasi)',
    targetOrganelleId: 'endoplasmic',
    left: 17,
    top: 20,
    width: 17,
    height: 18
  },
  {
    id: 'pasar',
    name: 'Pasar Tenda Warna-Warni',
    analogyHint: 'Kios pasar bergaris warna-warni (Pusat Sortir & Pengemas)',
    targetOrganelleId: 'golgi',
    left: 15,
    top: 38,
    width: 17,
    height: 16
  },
  {
    id: 'dermaga',
    name: 'Dermaga & Gerbang Perahu',
    analogyHint: 'Dermaga tepi laut tempat keluar masuk kapal (Gerbang Pelindung)',
    targetOrganelleId: 'membrane',
    left: 14,
    top: 61,
    width: 18,
    height: 19
  }
];

export const Level2TownDragDrop: React.FC<Level2TownDragDropProps> = ({
  onComplete,
  isAlreadyCleared = false
}) => {
  // Map of dropZoneId -> organelleId
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedOrganelleId, setSelectedOrganelleId] = useState<string | null>(null);
  const [draggedOrganelleId, setDraggedOrganelleId] = useState<string | null>(null);
  const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null);
  const [highlightZoneId, setHighlightZoneId] = useState<string | null>(null);
  const [shakingOrganelleId, setShakingOrganelleId] = useState<string | null>(null);
  const [bgMapUrl, setBgMapUrl] = useState<string>('/assets/asset_027.jpeg');
  const [resolvedIcons, setResolvedIcons] = useState<Record<string, string>>({});
  
  // Feedback check state
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<{
    score: number;
    total: number;
    isPassed: boolean;
    feedbackMessage: string;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Load background map and organelle icons dynamically via mediaStore
  useEffect(() => {
    let isMounted = true;
    const loadAssets = async () => {
      // Background map image - strictly isolated from Stage 1
      const bg = await getMediaResolvedURL('__MEDIA__level2_town_bg.jpg') ||
                 await getMediaResolvedURL('level2_town_bg') ||
                 await getMediaResolvedURL('level2_bg');
      if (isMounted && bg) {
        setBgMapUrl(bg);
      } else if (isMounted) {
        setBgMapUrl('/assets/asset_027.webp');
      }

      // Organelle icons
      const icons: Record<string, string> = {};
      for (const org of ORGANELLES) {
        const resolved = await getMediaResolvedURL(org.image) || resolveMediaPath(org.image);
        icons[org.id] = resolved;
      }
      if (isMounted) {
        setResolvedIcons(icons);
      }
    };

    loadAssets();
    const unsub = onMediaUpdated(() => {
      loadAssets();
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Placed organelle IDs
  const placedOrganelleIds = new Set(Object.values(placements));
  const availableOrganelles = ORGANELLES.filter(org => !placedOrganelleIds.has(org.id));

  // Placement attempt logic (used by both drag-and-drop and click-to-place)
  const attemptPlacement = (organelleId: string, zoneId: string) => {
    const zone = DROP_ZONES.find(z => z.id === zoneId);
    if (!zone) return;

    if (zone.targetOrganelleId === organelleId) {
      // Correct placement!
      sfx.playCorrect();
      setPlacements(prev => ({
        ...prev,
        [zoneId]: organelleId
      }));
      setHighlightZoneId(zoneId);
      setTimeout(() => {
        setHighlightZoneId(null);
      }, 1200);
      setSelectedOrganelleId(null);
      setCheckResult(null); // Clear any previous check modal
    } else {
      // Incorrect placement!
      sfx.playWrong();
      setShakingOrganelleId(organelleId);
      setTimeout(() => {
        setShakingOrganelleId(null);
      }, 700);
      setSelectedOrganelleId(null);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, organelleId: string) => {
    setDraggedOrganelleId(organelleId);
    e.dataTransfer.setData('text/plain', organelleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedOrganelleId(null);
    setDragOverZoneId(null);
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverZoneId !== zoneId) {
      setDragOverZoneId(zoneId);
    }
  };

  const handleDragLeave = (zoneId: string) => {
    if (dragOverZoneId === zoneId) {
      setDragOverZoneId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    setDragOverZoneId(null);
    const organelleId = e.dataTransfer.getData('text/plain') || draggedOrganelleId;
    if (organelleId) {
      attemptPlacement(organelleId, zoneId);
    }
    setDraggedOrganelleId(null);
  };

  // Click-to-place handler (Touch-friendly for mobile/tablet)
  const handleSelectOrganelle = (organelle: Organelle) => {
    sfx.playClick();
    if (selectedOrganelleId === organelle.id) {
      setSelectedOrganelleId(null);
    } else {
      setSelectedOrganelleId(organelle.id);
    }
  };

  const handleZoneClick = (zoneId: string) => {
    if (selectedOrganelleId) {
      attemptPlacement(selectedOrganelleId, zoneId);
    } else if (placements[zoneId]) {
      // Unplace back to dock
      sfx.playClick();
      setPlacements(prev => {
        const next = { ...prev };
        delete next[zoneId];
        return next;
      });
      setCheckResult(null);
    }
  };

  // Check button handler
  const handleCheck = async () => {
    sfx.playClick();
    setIsChecking(true);

    const score = Object.keys(placements).length;
    const total = DROP_ZONES.length; // 5
    const isPassed = score >= 4; // Minimal 4/5 (80%)

    // Save score in Firestore
    const user = getCurrentUser();
    if (user?.username) {
      try {
        await saveLevelScore(user.username, 'level2', {
          skor: score,
          skor_maksimal: total
        });
      } catch (err) {
        console.warn('Gagal menyimpan skor Level 2 ke Firestore:', err);
      }
    }

    if (isPassed) {
      sfx.playStageComplete();
      setCheckResult({
        score,
        total,
        isPassed: true,
        feedbackMessage: "Hebat! Kamu berhasil memetakan organel sel ke sarana kota dengan tepat!"
      });
    } else {
      sfx.playWrong();
      setCheckResult({
        score,
        total,
        isPassed: false,
        feedbackMessage: `Kamu baru menempatkan ${score} dari ${total} sarana kota dengan tepat. Syarat kelulusan adalah minimal 4 benar (80%). Ayo coba lagi!`
      });
    }

    setIsChecking(false);
  };

  const handleRetry = () => {
    sfx.playClick();
    setCheckResult(null);
  };

  const handleResetAll = () => {
    sfx.playClick();
    setPlacements({});
    setSelectedOrganelleId(null);
    setCheckResult(null);
  };

  const handleProceedToNextLevel = () => {
    sfx.playClick();
    const score = Object.keys(placements).length;
    onComplete({
      skor: score,
      skor_maksimal: DROP_ZONES.length,
      status: 'lulus'
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      {/* Top Instruction Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-emerald-600/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Level 2
            </span>
            <h3 className="font-bold text-base sm:text-lg font-fredoka text-amber-300">
              Urutan Area Sarana Kota
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Seret (drag) tiap organel dari baris bawah ke bangunan kota yang sesuai dengan fungsinya.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-700/80 text-emerald-100 border border-emerald-500/50">
            {Object.keys(placements).length} / {DROP_ZONES.length} Terpasang
          </span>
          {Object.keys(placements).length > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-950 text-emerald-300 hover:text-white transition-colors cursor-pointer"
              title="Reset penempatan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Town Map Interactive Board */}
      <div 
        ref={mapContainerRef}
        className="relative w-full aspect-[1264/843] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-700/30 bg-slate-900 select-none"
      >
        {/* Town Map Background Image */}
        <img
          src={bgMapUrl}
          alt="Peta Sarana Kota Desa Sel"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          onError={() => setBgMapUrl('/assets/asset_027.jpeg')}
        />

        {/* 8 Transparent Drop Zones Overlay */}
        {DROP_ZONES.map(zone => {
          const placedOrganelleId = placements[zone.id];
          const placedOrganelle = ORGANELLES.find(o => o.id === placedOrganelleId);
          const isOver = dragOverZoneId === zone.id;
          const isHighlighted = highlightZoneId === zone.id;
          const isTargetSelected = selectedOrganelleId !== null && !placedOrganelleId;

          return (
            <div
              key={zone.id}
              onDragOver={e => handleDragOver(e, zone.id)}
              onDragLeave={() => handleDragLeave(zone.id)}
              onDrop={e => handleDrop(e, zone.id)}
              onClick={() => handleZoneClick(zone.id)}
              style={{
                left: `${zone.left}%`,
                top: `${zone.top}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`
              }}
              title={placedOrganelle ? `${zone.name}: ${placedOrganelle.name} (Ketuk untuk melepas)` : `${zone.name}: ${zone.analogyHint}`}
              className={`absolute rounded-2xl transition-all flex items-center justify-center cursor-pointer ${
                isHighlighted
                  ? 'border-4 border-emerald-400 bg-emerald-400/30 ring-8 ring-emerald-300/50 shadow-2xl animate-pulse z-30'
                  : isOver
                  ? 'border-3 border-dashed border-amber-300 bg-amber-400/30 ring-4 ring-amber-300/50 shadow-xl scale-105 z-25'
                  : isTargetSelected
                  ? 'border-2 border-dashed border-white/60 bg-white/15 hover:bg-white/25 hover:border-amber-300 transition-all z-20'
                  : placedOrganelle
                  ? 'border border-emerald-400/40 bg-emerald-950/20 hover:bg-emerald-950/40 z-20'
                  : 'border border-transparent hover:border-white/40 hover:bg-white/10 z-10'
              }`}
            >
              {/* Placed Organelle Badge on Building */}
              {placedOrganelle && (
                <div className="flex flex-col items-center gap-1 animate-in zoom-in-75 duration-200">
                  <div className="relative group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/95 border-2 border-emerald-500 shadow-xl flex items-center justify-center p-1 hover:scale-110 transition-transform">
                      <img
                        src={resolvedIcons[placedOrganelle.id] || resolveMediaPath(placedOrganelle.image)}
                        alt={placedOrganelle.name}
                        className="w-full h-full object-contain drop-shadow-sm"
                      />
                    </div>
                    {/* Small success checkmark badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md border border-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  </div>

                  {/* Name pill */}
                  <span className="text-[10px] sm:text-xs font-bold font-fredoka px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-300/40 shadow-md backdrop-blur-xs whitespace-nowrap">
                    {placedOrganelle.name}
                  </span>
                </div>
              )}

              {/* Empty drop zone placeholder during active drag */}
              {!placedOrganelle && (isOver || isTargetSelected) && (
                <div className="px-2 py-1 rounded-lg bg-slate-950/70 text-amber-200 text-[10px] sm:text-xs font-bold shadow-md text-center pointer-events-none border border-amber-300/50 backdrop-blur-xs">
                  {zone.name}
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom Left Dock: Drag Items & Check Button */}
        <div className="absolute bottom-2.5 left-2.5 max-w-[95%] sm:max-w-[80%] md:max-w-[70%] z-40 bg-white/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col gap-2">
          {/* Dock Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold font-fredoka uppercase tracking-wider text-slate-700">
              Item Organel ({availableOrganelles.length} tersisa):
            </span>
            {selectedOrganelleId && (
              <span className="text-[10px] font-semibold text-blue-600 animate-pulse">
                Ketuk bangunan tujuan!
              </span>
            )}
          </div>

          {/* Horizontal Row of 8 Organelle Cards */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {ORGANELLES.map(org => {
              const isPlaced = placedOrganelleIds.has(org.id);
              const isSelected = selectedOrganelleId === org.id;
              const isShaking = shakingOrganelleId === org.id;

              if (isPlaced) {
                return (
                  <div
                    key={org.id}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-dashed border-slate-300 bg-slate-100/60 flex items-center justify-center opacity-40 flex-shrink-0"
                    title={`${org.name} (sudah terpasang)`}
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                );
              }

              return (
                <div
                  key={org.id}
                  draggable={true}
                  onDragStart={e => handleDragStart(e, org.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleSelectOrganelle(org)}
                  title={`${org.name}: ${org.analogy}`}
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl border-2 bg-white flex items-center justify-center p-1 cursor-grab active:cursor-grabbing select-none transition-all shadow-sm flex-shrink-0 ${
                    isShaking
                      ? 'animate-shake border-red-500 bg-red-50 ring-2 ring-red-300'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50 ring-3 ring-blue-300 scale-105 shadow-md'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <img
                    src={resolvedIcons[org.id] || resolveMediaPath(org.image)}
                    alt={org.name}
                    className="w-full h-full object-contain pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle label tooltip on hover */}
                  <span className="sr-only">{org.name}</span>
                </div>
              );
            })}
          </div>

          {/* Under Cards: Blue Pill Check Button & Status */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200">
            <button
              type="button"
              disabled={isChecking || Object.keys(placements).length === 0}
              onClick={handleCheck}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                Object.keys(placements).length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Check</span>
            </button>

            <span className="text-[11px] text-slate-500 font-medium">
              Minimal <strong>6/8 (70%)</strong> untuk lulus
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Modal / Overlay when Check is pressed */}
      {checkResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              checkResult.isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {checkResult.isPassed ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <AlertCircle className="w-10 h-10" />
              )}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hasil Penilaian Level 2
              </span>
              <h4 className="font-bold text-xl sm:text-2xl font-fredoka text-slate-900 mt-1">
                {checkResult.isPassed ? "Misi Berhasil!" : "Coba Lagi!"}
              </h4>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {checkResult.feedbackMessage}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-800 border border-slate-200">
              <span>Skor:</span>
              <span className={`text-base ${checkResult.isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {checkResult.score} / {checkResult.total}
              </span>
              <span className="text-xs text-slate-500">
                ({Math.round((checkResult.score / checkResult.total) * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-3 w-full justify-center pt-2">
              {!checkResult.isPassed ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedToNextLevel}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Lanjut ke Level 3</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
