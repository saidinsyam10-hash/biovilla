import React, { useState, useEffect, useCallback } from 'react';
import { getAssetCandidates, getMediaResolvedURL, onMediaUpdated } from '../utils/mediaStore';
import { resolveMediaPath } from '../utils/audio';

interface HotspotIllustrationProps {
  hotspotId: string;
  filePath?: string;
  title?: string;
  className?: string;
}

export const HotspotIllustration: React.FC<HotspotIllustrationProps> = ({
  hotspotId,
  filePath,
  title,
  className = "w-full h-full"
}) => {
  const [customSrc, setCustomSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [candidateIdx, setCandidateIdx] = useState(0);

  const cleanKey = filePath ? filePath.replace('__MEDIA__', '') : '';
  const candidates = cleanKey ? getAssetCandidates(cleanKey, 'png') : [];

  const loadMedia = useCallback(async () => {
    setImgError(false);
    setCandidateIdx(0);

    // 1. Check dedicated hotspot key (e.g. hotspot_balai_desa)
    const hotspotKey = `hotspot_${hotspotId}`;
    const byHotspot = await getMediaResolvedURL(hotspotKey);
    if (byHotspot) {
      setCustomSrc(byHotspot);
      return;
    }

    // 2. Check cleanKey from file path
    if (cleanKey) {
      const byCleanKey = await getMediaResolvedURL(cleanKey);
      if (byCleanKey) {
        setCustomSrc(byCleanKey);
        return;
      }
    }

    setCustomSrc(null);
  }, [hotspotId, cleanKey]);

  useEffect(() => {
    loadMedia();
    const unsubscribe = onMediaUpdated(() => {
      loadMedia();
    });
    return unsubscribe;
  }, [loadMedia]);

  const activeSrc = customSrc || candidates[candidateIdx] || resolveMediaPath(filePath);

  const handleImageError = () => {
    if (customSrc) {
      setImgError(true);
      return;
    }
    if (candidateIdx < candidates.length - 1) {
      setCandidateIdx(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  if (!imgError && activeSrc) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 flex items-center justify-center ${className}`}>
        <img
          src={activeSrc}
          alt={title || "Ilustrasi Hotspot"}
          className="w-full h-full object-contain select-none"
          onError={handleImageError}
        />
      </div>
    );
  }

  // Fallback vector illustration tailored specifically to each hotspot
  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-2 ${className}`}>
      {renderFallbackIllustration(hotspotId, title)}
    </div>
  );
};

function renderFallbackIllustration(id: string, title: string = '') {
  const lowerTitle = title.toLowerCase();

  // 1. PETUNJUK: Papan Petunjuk / Jelajahi Peta Desa
  if (id === 'hotspot-0-0' || id === 'hotspot-1-0' || lowerTitle.includes('petunjuk') || lowerTitle.includes('peta desa')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="10" width="130" height="80" rx="8" fill="#FEF3C7" stroke="#92400E" strokeWidth="2.5" />
        <path d="M50 10 L50 90 M95 10 L95 90" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />
        {/* Winding River */}
        <path d="M25 80 Q 55 55 80 65 T 135 25" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
        <path d="M25 80 Q 55 55 80 65 T 135 25" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        {/* Dirt Roads */}
        <path d="M30 30 Q 60 40 85 30 T 130 70" stroke="#B45309" strokeWidth="3" strokeDasharray="4 3" />
        {/* Landmark Pins */}
        <circle cx="45" cy="35" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="85" cy="30" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="115" cy="65" r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Compass Rose in Corner */}
        <circle cx="130" cy="25" r="10" fill="#FFFBEB" stroke="#92400E" strokeWidth="1" />
        <polygon points="130,17 132.5,25 130,23 127.5,25" fill="#EF4444" />
        <polygon points="130,33 132.5,25 130,27 127.5,25" fill="#64748B" />
      </svg>
    );
  }

  // 2. PETUNJUK 2: Selesaikan Misi Tiap Warga
  if (id === 'hotspot-0-1' || lowerTitle.includes('misi')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Target Bullseye */}
        <circle cx="50" cy="50" r="36" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
        <circle cx="50" cy="50" r="26" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
        <circle cx="50" cy="50" r="16" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
        <circle cx="50" cy="50" r="7" fill="#DC2626" />
        {/* Arrow hitting center */}
        <line x1="18" y1="20" x2="48" y2="48" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="50,50 42,46 46,42" fill="#1E293B" />
        <polygon points="18,20 14,26 24,16" fill="#F59E0B" />
        {/* Quest Checklist Parchment */}
        <rect x="95" y="16" width="52" height="68" rx="6" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="2" />
        <line x1="104" y1="28" x2="138" y2="28" stroke="#854D0E" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="104" y1="42" x2="138" y2="42" stroke="#854D0E" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="104" y1="56" x2="138" y2="56" stroke="#854D0E" strokeWidth="2.5" strokeLinecap="round" />
        <polyline points="100,28 103,31 108,24" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="100,42 103,45 108,38" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 3. PETUNJUK 3: Gunakan Petunjuk Jika Ragu
  if (id === 'hotspot-0-2' || lowerTitle.includes('petunjuk jika ragu')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="45" r="28" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
        {/* Glow rays */}
        <line x1="80" y1="8" x2="80" y2="2" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="20" x2="45" y2="15" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        <line x1="110" y1="20" x2="115" y2="15" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="45" x2="34" y2="45" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        <line x1="120" y1="45" x2="126" y2="45" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        {/* Filament */}
        <path d="M72 45 C 72 35 88 35 88 45" stroke="#CA8A04" strokeWidth="2.5" fill="none" />
        {/* Bulb base */}
        <path d="M70 65 L90 65 L88 78 L72 78 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
        <line x1="71" y1="70" x2="89" y2="70" stroke="#475569" strokeWidth="1.5" />
        <line x1="72" y1="74" x2="88" y2="74" stroke="#475569" strokeWidth="1.5" />
        <circle cx="80" cy="81" r="3" fill="#334155" />
      </svg>
    );
  }

  // 4. PETUNJUK 4: Kumpulkan Bintang
  if (id === 'hotspot-0-3' || lowerTitle.includes('bintang')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Big Center Golden Star */}
        <polygon
          points="80,15 88,38 112,38 93,52 100,75 80,60 60,75 67,52 48,38 72,38"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="2.5"
        />
        {/* Small Accompanying Stars */}
        <polygon points="35,30 38,40 48,40 40,46 43,56 35,50 27,56 30,46 22,40 32,40" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
        <polygon points="125,45 128,55 138,55 130,61 133,71 125,65 117,71 120,61 112,55 122,55" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
        {/* Sparkles */}
        <circle cx="80" cy="44" r="5" fill="#FEF9C3" opacity="0.8" />
        <path d="M55 20 L58 24 L55 28 L52 24 Z" fill="#FFFFFF" />
        <path d="M105 25 L108 29 L105 33 L102 29 Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 5. PETUNJUK 5: Ingat, Semua Warga Saling Terhubung
  if (id === 'hotspot-0-4' || lowerTitle.includes('terhubung')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Network Nodes */}
        <line x1="40" y1="50" x2="80" y2="25" stroke="#38BDF8" strokeWidth="3" />
        <line x1="80" y1="25" x2="120" y2="50" stroke="#38BDF8" strokeWidth="3" />
        <line x1="40" y1="50" x2="80" y2="75" stroke="#38BDF8" strokeWidth="3" />
        <line x1="80" y1="75" x2="120" y2="50" stroke="#38BDF8" strokeWidth="3" />
        <line x1="80" y1="25" x2="80" y2="75" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="3 3" />

        {/* Node 1: Balai Desa */}
        <circle cx="80" cy="25" r="14" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="80" cy="25" r="6" fill="#DDD6FE" />

        {/* Node 2: Pelabuhan */}
        <circle cx="40" cy="50" r="13" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="40" cy="50" r="5" fill="#BAE6FD" />

        {/* Node 3: Energi */}
        <circle cx="120" cy="50" r="13" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="120" cy="50" r="5" fill="#FEF08A" />

        {/* Node 4: Pasar */}
        <circle cx="80" cy="75" r="13" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="80" cy="75" r="5" fill="#A7F3D0" />
      </svg>
    );
  }

  // 6. PETUNJUK 6: Siap Memulai?
  if (id === 'hotspot-0-5' || lowerTitle.includes('memulai')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stars in space background */}
        <circle cx="30" cy="20" r="1.5" fill="#FFFFFF" />
        <circle cx="130" cy="30" r="1.5" fill="#FFFFFF" />
        <circle cx="45" cy="70" r="2" fill="#FDE047" />
        <circle cx="120" cy="75" r="1.5" fill="#FFFFFF" />
        {/* Rocket Flame */}
        <polygon points="65,70 80,95 95,70 80,82" fill="#EF4444" />
        <polygon points="70,70 80,90 90,70 80,78" fill="#F59E0B" />
        <polygon points="75,70 80,85 85,70" fill="#FEF08A" />
        {/* Rocket Body */}
        <ellipse cx="80" cy="48" rx="15" ry="24" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
        <polygon points="80,18 70,36 90,36" fill="#DC2626" />
        {/* Rocket Window */}
        <circle cx="80" cy="45" r="6" fill="#38BDF8" stroke="#1E293B" strokeWidth="2" />
        <circle cx="78" cy="43" r="2" fill="#FFFFFF" />
        {/* Rocket Fins */}
        <polygon points="65,58 50,72 65,70" fill="#DC2626" />
        <polygon points="95,58 110,72 95,70" fill="#DC2626" />
      </svg>
    );
  }

  // 7. PELABUHAN DESA: Retikulum Endoplasma
  if (id === 'hotspot-1-1' || lowerTitle.includes('pelabuhan') || lowerTitle.includes('retikulum')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Harbor Water / Canal */}
        <rect x="0" y="45" width="160" height="55" fill="#0284C7" />
        <path d="M0 50 Q 40 45 80 50 T 160 50" stroke="#38BDF8" strokeWidth="2.5" fill="none" />
        <path d="M0 65 Q 40 60 80 65 T 160 65" stroke="#0369A1" strokeWidth="2" fill="none" />
        {/* Wooden Harbor Pier / Dock (Endoplasmic Reticulum Channels) */}
        <rect x="25" y="25" width="40" height="42" fill="#B45309" stroke="#78350F" strokeWidth="2" rx="3" />
        <rect x="30" y="28" width="12" height="15" fill="#F59E0B" rx="2" />
        <rect x="46" y="28" width="14" height="15" fill="#F97316" rx="2" />
        {/* Cargo Transport Boat */}
        <path d="M85 55 L135 55 L125 72 L95 72 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
        {/* Cargo Crates (Proteins & Lipids) */}
        <rect x="95" y="42" width="11" height="13" fill="#FBBF24" stroke="#78350F" strokeWidth="1" rx="1" />
        <rect x="108" y="38" width="12" height="17" fill="#10B981" stroke="#065F46" strokeWidth="1" rx="1" />
        {/* Crane Hook */}
        <path d="M60 25 L60 12 L90 12 L90 32" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="90" cy="35" r="2.5" fill="#1E293B" />
        {/* Vesicles floating */}
        <circle cx="138" cy="46" r="4.5" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
        <circle cx="148" cy="55" r="3.5" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
      </svg>
    );
  }

  // 8. GERBANG DESA: Membran Sel
  if (id === 'hotspot-1-10' || lowerTitle.includes('gerbang') || lowerTitle.includes('membran')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Phospholipid bilayer style stone wall */}
        <rect x="15" y="30" width="40" height="58" fill="#64748B" stroke="#334155" strokeWidth="2" rx="4" />
        <rect x="105" y="30" width="40" height="58" fill="#64748B" stroke="#334155" strokeWidth="2" rx="4" />
        {/* Tower Battlements */}
        <rect x="15" y="20" width="10" height="10" fill="#475569" />
        <rect x="30" y="20" width="10" height="10" fill="#475569" />
        <rect x="45" y="20" width="10" height="10" fill="#475569" />
        <rect x="105" y="20" width="10" height="10" fill="#475569" />
        <rect x="120" y="20" width="10" height="10" fill="#475569" />
        <rect x="135" y="20" width="10" height="10" fill="#475569" />
        {/* Arch Gate (Selective Channel) */}
        <path d="M55 88 L55 52 Q 80 32 105 52 L105 88 Z" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
        <path d="M55 52 Q 80 32 105 52" stroke="#B45309" strokeWidth="3" fill="none" />
        {/* Selective Entry Icons (Molecules Passing) */}
        <circle cx="72" cy="62" r="4" fill="#22C55E" />
        <circle cx="88" cy="62" r="4" fill="#3B82F6" />
        <circle cx="80" cy="74" r="4" fill="#EAB308" />
      </svg>
    );
  }

  // 9. BALAI DESA: Inti Sel (Nukleus)
  if (id === 'hotspot-1-5' || lowerTitle.includes('balai') || lowerTitle.includes('inti') || lowerTitle.includes('nukleus')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dome Hall */}
        <path d="M40 78 L40 50 Q 80 15 120 50 L120 78 Z" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="2" />
        <circle cx="80" cy="38" r="14" fill="#5B21B6" stroke="#EDE9FE" strokeWidth="2" />
        {/* DNA Helix in center */}
        <path d="M75 32 Q 80 38 85 44" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        <path d="M85 32 Q 80 38 75 44" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        {/* Columns */}
        <rect x="48" y="52" width="6" height="26" fill="#DDD6FE" />
        <rect x="68" y="52" width="6" height="26" fill="#DDD6FE" />
        <rect x="86" y="52" width="6" height="26" fill="#DDD6FE" />
        <rect x="106" y="52" width="6" height="26" fill="#DDD6FE" />
        <rect x="35" y="78" width="90" height="8" fill="#4C1D95" rx="2" />
      </svg>
    );
  }

  // 10. PASAR DESA: Badan Golgi
  if (id === 'hotspot-1-3' || lowerTitle.includes('pasar') || lowerTitle.includes('golgi')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Market Stalls (Stacked Cisternae) */}
        <path d="M30 35 Q 80 25 130 35 L125 45 Q 80 35 35 45 Z" fill="#14B8A6" stroke="#0F766E" strokeWidth="1.5" />
        <path d="M35 48 Q 80 38 125 48 L120 58 Q 80 48 40 58 Z" fill="#0D9488" stroke="#0F766E" strokeWidth="1.5" />
        <path d="M40 61 Q 80 51 120 61 L115 71 Q 80 61 45 71 Z" fill="#115E59" stroke="#042F2E" strokeWidth="1.5" />
        {/* Packaged Delivery Vesicles */}
        <circle cx="138" cy="38" r="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="144" cy="52" r="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="134" cy="65" r="5.5" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
        {/* Shipping Crate */}
        <rect x="45" y="75" width="16" height="14" fill="#B45309" stroke="#78350F" strokeWidth="1" rx="1" />
        <rect x="65" y="73" width="18" height="16" fill="#D97706" stroke="#78350F" strokeWidth="1" rx="1" />
      </svg>
    );
  }

  // 11. PEMBANGKIT ENERGI: Mitokondria
  if (id === 'hotspot-1-7' || lowerTitle.includes('energi') || lowerTitle.includes('mitokondria')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Power Turbine / Mitochondria Oval */}
        <ellipse cx="80" cy="50" rx="55" ry="32" fill="#EA580C" stroke="#C2410C" strokeWidth="2.5" />
        {/* Cristae Power Folds */}
        <path
          d="M40 50 C 45 38 52 62 58 45 C 65 30 72 70 80 40 C 88 25 95 65 102 45 C 108 35 115 55 120 50"
          stroke="#FEF08A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* ATP Lightning Sparks */}
        <polygon points="80,18 74,30 82,30 76,42 88,27 80,27" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
        <circle cx="45" cy="25" r="3" fill="#FDE047" />
        <circle cx="115" cy="25" r="3" fill="#FDE047" />
      </svg>
    );
  }

  // 12. PUSAT PRODUKSI: Ribosom
  if (id === 'hotspot-1-6' || lowerTitle.includes('produksi') || lowerTitle.includes('ribosom')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Workshop Forge & Ribosome Subunits */}
        <circle cx="80" cy="42" r="24" fill="#DB2777" stroke="#9D174D" strokeWidth="2" />
        <circle cx="80" cy="62" r="16" fill="#F472B6" stroke="#BE185D" strokeWidth="2" />
        {/* mRNA Chain passing through */}
        <path d="M25 50 Q 55 45 80 50 T 135 50" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />
        {/* Peptide Chain Growing */}
        <circle cx="80" cy="20" r="4" fill="#38BDF8" />
        <circle cx="84" cy="14" r="4" fill="#34D399" />
        <circle cx="78" cy="8" r="4" fill="#F59E0B" />
        <line x1="80" y1="24" x2="80" y2="30" stroke="#94A3B8" strokeWidth="2" />
      </svg>
    );
  }

  // 13. PUSAT FOTOSINTESIS / LAHAN PERTANIAN: Kloroplas
  if (id === 'hotspot-1-4' || id === 'hotspot-1-9' || lowerTitle.includes('fotosintesis') || lowerTitle.includes('kloroplas') || lowerTitle.includes('pertanian')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="80" cy="50" rx="55" ry="32" fill="#16A34A" stroke="#15803D" strokeWidth="2.5" />
        {/* Granum Thylakoid Stacks */}
        <rect x="42" y="36" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="42" y="44" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="42" y="52" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="42" y="60" width="16" height="5" rx="2" fill="#86EFAC" />

        <rect x="72" y="32" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="72" y="40" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="72" y="48" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="72" y="56" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="72" y="64" width="16" height="5" rx="2" fill="#86EFAC" />

        <rect x="102" y="38" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="102" y="46" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="102" y="54" width="16" height="5" rx="2" fill="#86EFAC" />
        <rect x="102" y="62" width="16" height="5" rx="2" fill="#86EFAC" />

        {/* Sunlight energy rays */}
        <polygon points="80,10 83,18 92,18 85,23 88,31 80,26 72,31 75,23 68,18 77,18" fill="#FEF08A" />
      </svg>
    );
  }

  // 14. PUSAT KESEHATAN: Peroksisom
  if (id === 'hotspot-1-2' || lowerTitle.includes('kesehatan') || lowerTitle.includes('peroksisom')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="50" r="32" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
        {/* Crystal Core (Catalase) */}
        <polygon points="80,32 94,44 88,65 72,65 66,44" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
        <rect x="76" y="40" width="8" height="18" fill="#38BDF8" />
        {/* Detoxification bubbles (H2O2 -> H2O + O2) */}
        <circle cx="58" cy="35" r="4.5" fill="#BAE6FD" />
        <circle cx="104" cy="38" r="5.5" fill="#BAE6FD" />
        <circle cx="60" cy="65" r="4" fill="#BAE6FD" />
        <circle cx="100" cy="62" r="4" fill="#BAE6FD" />
      </svg>
    );
  }

  // 15. PENGELOLAAN SAMPAH: Lisosom
  if (id === 'hotspot-1-8' || lowerTitle.includes('sampah') || lowerTitle.includes('lisosom')) {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="50" r="34" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
        {/* Breakdown Digestive Enzymes */}
        <circle cx="70" cy="40" r="5" fill="#FEF08A" />
        <circle cx="92" cy="42" r="6" fill="#FEF08A" />
        <circle cx="75" cy="60" r="5" fill="#FEF08A" />
        <circle cx="90" cy="58" r="4.5" fill="#FEF08A" />
        {/* Debris being broken down */}
        <polygon points="62,52 68,48 65,58" fill="#475569" />
        <polygon points="82,48 88,46 86,54" fill="#475569" />
        {/* Recycling icon */}
        <path d="M50 25 L56 20 L62 25" stroke="#FDE047" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  // Default biology/facility generic
  return (
    <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="50" r="34" fill="#0D9488" stroke="#042F2E" strokeWidth="2" />
      <circle cx="80" cy="50" r="18" fill="#2DD4BF" />
      <circle cx="80" cy="50" r="7" fill="#CCFBF1" />
    </svg>
  );
}
