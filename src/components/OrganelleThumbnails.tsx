import React from 'react';
import {
  RealisticGolgiIllustration,
  RealisticCellMembraneIllustration,
  RealisticRibosomeIllustration,
  RealisticRoughERIllustration,
  RealisticTransportVesicleIllustration
} from './RealisticOrganelleIllustrations';

interface ThumbnailProps {
  className?: string;
}

// 1. Nukleus (Level 1: Mengenal Warga Desa Sel / Pusat Komando)
export const NucleusIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#7C3AED" />
    <circle cx="32" cy="32" r="25" fill="#8B5CF6" />
    {/* Nuclear envelope pores */}
    <circle cx="32" cy="8" r="1.5" fill="#DDD6FE" />
    <circle cx="56" cy="32" r="1.5" fill="#DDD6FE" />
    <circle cx="32" cy="56" r="1.5" fill="#DDD6FE" />
    <circle cx="8" cy="32" r="1.5" fill="#DDD6FE" />
    {/* Chromatin threads */}
    <path d="M22 24C26 20 38 22 42 28C46 34 38 40 34 44" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M24 38C28 42 36 44 40 38" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    {/* Nucleolus */}
    <circle cx="30" cy="30" r="9" fill="#5B21B6" />
    <circle cx="28" cy="28" r="7" fill="#4C1D95" />
    <circle cx="26" cy="26" r="2" fill="#A78BFA" />
  </svg>
);

// 2. Organel Sel Campuran (Level 2: Cocokkan Organel & Perannya)
export const CellMultiIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#0284C7" />
    <circle cx="32" cy="32" r="25" fill="#38BDF8" />
    {/* Cytoplasm glow */}
    <circle cx="32" cy="32" r="22" fill="#BAE6FD" />
    {/* Mini nucleus */}
    <circle cx="24" cy="26" r="8" fill="#7C3AED" />
    <circle cx="23" cy="25" r="3" fill="#4C1D95" />
    {/* Mini mitochondrion */}
    <ellipse cx="44" cy="24" rx="6" ry="3.5" transform="rotate(25 44 24)" fill="#EA580C" />
    {/* Mini Golgi folds */}
    <path d="M36 44C40 42 46 44 48 48" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    <path d="M34 48C38 46 44 48 46 52" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    {/* Ribosome dots */}
    <circle cx="22" cy="44" r="1.5" fill="#BE185D" />
    <circle cx="26" cy="48" r="1.5" fill="#BE185D" />
    <circle cx="42" cy="36" r="1.5" fill="#BE185D" />
  </svg>
);

// 3. Ribosom & Sintesis Protein (Level 3: Alur Produksi Protein)
export const RibosomeProteinIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#DB2777" />
    <circle cx="32" cy="32" r="25" fill="#EC4899" />
    {/* Endoplasmic reticulum membranes with attached ribosomes */}
    <path d="M12 24C24 20 40 28 52 24" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" />
    <path d="M14 36C26 32 38 40 50 36" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" />
    <path d="M16 48C28 44 38 52 48 48" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" />
    {/* Ribosome beads */}
    <circle cx="18" cy="20" r="2.5" fill="#9D174D" />
    <circle cx="28" cy="24" r="2.5" fill="#9D174D" />
    <circle cx="38" cy="24" r="2.5" fill="#9D174D" />
    <circle cx="48" cy="20" r="2.5" fill="#9D174D" />
    <circle cx="20" cy="33" r="2.5" fill="#9D174D" />
    <circle cx="32" cy="36" r="2.5" fill="#9D174D" />
    <circle cx="44" cy="34" r="2.5" fill="#9D174D" />
    {/* Emerging protein peptide chain */}
    <path d="M28 27C30 31 34 32 36 29" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 4. Mitokondria (Level 4: Energi Sel & Pembangkit Listrik Desa)
export const MitochondriaIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#D97706" />
    <circle cx="32" cy="32" r="25" fill="#F59E0B" />
    {/* Outer membrane oval */}
    <ellipse cx="32" cy="32" rx="19" ry="12" transform="rotate(-25 32 32)" fill="#EA580C" stroke="#FED7AA" strokeWidth="1.5" />
    {/* Inner cristae folds */}
    <path
      d="M20 37C22 34 26 38 29 34C32 30 35 34 38 31C41 28 44 31 46 27"
      stroke="#FEF08A"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* ATP energy spark */}
    <path d="M42 16L38 23H43L39 30" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#FEF08A" />
  </svg>
);

// 5. Badan Golgi (Level 5: Distribusi & Pengemasan Bahan)
export const GolgiIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#0D9488" />
    <circle cx="32" cy="32" r="25" fill="#14B8A6" />
    {/* Stacked cisternae curved folds */}
    <path d="M16 22C24 18 40 18 48 22" stroke="#CCFBF1" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M14 29C24 25 40 25 50 29" stroke="#CCFBF1" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M15 36C25 32 39 32 49 36" stroke="#CCFBF1" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M18 43C26 39 38 39 46 43" stroke="#CCFBF1" strokeWidth="3.5" strokeLinecap="round" />
    {/* Budding transport secretory vesicles */}
    <circle cx="12" cy="24" r="3" fill="#5EEAD4" />
    <circle cx="51" cy="22" r="2.5" fill="#5EEAD4" />
    <circle cx="53" cy="32" r="3" fill="#5EEAD4" />
    <circle cx="11" cy="38" r="2.5" fill="#5EEAD4" />
    <circle cx="32" cy="51" r="3" fill="#5EEAD4" />
  </svg>
);

// 6. Lisosom & Pengolahan Limbah (Level 6: Detektif Kerusakan Sistem Sel)
export const LysosomeIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#4F46E5" />
    <circle cx="32" cy="32" r="25" fill="#6366F1" />
    {/* Lysosome vesicle membrane */}
    <circle cx="32" cy="32" r="18" fill="#312E81" stroke="#A5B4FC" strokeWidth="2" />
    {/* Digestive enzymes inside */}
    <circle cx="26" cy="28" r="3" fill="#F43F5E" />
    <circle cx="37" cy="27" r="2.5" fill="#FB923C" />
    <circle cx="34" cy="37" r="3" fill="#FBBF24" />
    <circle cx="26" cy="38" r="2" fill="#34D399" />
    {/* Breakdown sparkles */}
    <path d="M29 32L32 35L35 32" stroke="#E0E7FF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 7. Sel Utuh & Interkoneksi Organel (Level 7: Laporan Darurat Desa Sel)
export const WholeCellIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#059669" />
    <circle cx="32" cy="32" r="25" fill="#10B981" />
    {/* Cross-section cell representation */}
    <circle cx="32" cy="32" r="20" fill="#6EE7B7" stroke="#A7F3D0" strokeWidth="1.5" />
    {/* Nucleus */}
    <circle cx="26" cy="30" r="7" fill="#7C3AED" />
    <circle cx="25" cy="29" r="3" fill="#4C1D95" />
    {/* Mitochondria */}
    <ellipse cx="40" cy="24" rx="4" ry="2.5" transform="rotate(30 40 24)" fill="#EA580C" />
    {/* Endoplasmic reticulum */}
    <path d="M20 40C24 38 30 42 34 39" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
    {/* Golgi */}
    <path d="M38 38C41 36 45 37 47 40" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 8. Kloroplas & Harmoni Alam (Level 8: Harmoni Alam & Refleksi Nilai)
export const ChloroplastTreeIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#15803D" />
    <circle cx="32" cy="32" r="25" fill="#22C55E" />
    {/* Chloroplast oval disk */}
    <ellipse cx="32" cy="32" rx="19" ry="12" fill="#166534" stroke="#86EFAC" strokeWidth="1.5" />
    {/* Thylakoid granum stacks (koin hijau tumpuk) */}
    <ellipse cx="23" cy="30" rx="4" ry="1.5" fill="#4ADE80" />
    <ellipse cx="23" cy="33" rx="4" ry="1.5" fill="#4ADE80" />
    <ellipse cx="23" cy="36" rx="4" ry="1.5" fill="#4ADE80" />

    <ellipse cx="32" cy="29" rx="4.5" ry="1.5" fill="#4ADE80" />
    <ellipse cx="32" cy="32" rx="4.5" ry="1.5" fill="#4ADE80" />
    <ellipse cx="32" cy="35" rx="4.5" ry="1.5" fill="#4ADE80" />

    <ellipse cx="41" cy="30" rx="4" ry="1.5" fill="#4ADE80" />
    <ellipse cx="41" cy="33" rx="4" ry="1.5" fill="#4ADE80" />
    <ellipse cx="41" cy="36" rx="4" ry="1.5" fill="#4ADE80" />
    {/* Radiating spiritual light */}
    <circle cx="32" cy="17" r="1.5" fill="#FEF08A" />
    <circle cx="44" cy="18" r="1.5" fill="#FEF08A" />
    <circle cx="20" cy="18" r="1.5" fill="#FEF08A" />
  </svg>
);

// Petunjuk & Peta default Icons
export const CompassGuideIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#D97706" />
    <circle cx="32" cy="32" r="25" fill="#F59E0B" />
    <circle cx="32" cy="32" r="20" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
    {/* Compass Needle */}
    <polygon points="32,17 37,32 32,29 27,32" fill="#DC2626" />
    <polygon points="32,47 37,32 32,35 27,32" fill="#475569" />
    <circle cx="32" cy="32" r="2.5" fill="#B45309" />
  </svg>
);

export const VillageMapIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#0284C7" />
    <circle cx="32" cy="32" r="25" fill="#38BDF8" />
    <rect x="18" y="18" width="28" height="28" rx="4" fill="#FEF3C7" stroke="#0369A1" strokeWidth="1.5" />
    {/* Map trails & rivers */}
    <path d="M22 28C26 34 36 26 42 32" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="25" cy="24" r="2" fill="#EF4444" />
    <circle cx="38" cy="36" r="2" fill="#EF4444" />
  </svg>
);

// Retikulum Endoplasma (asset_032: Kasar berbintik ribosom & Halus tubular)
export const EndoplasmicReticulumIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#0284C7" />
    <circle cx="32" cy="32" r="25" fill="#38BDF8" />
    {/* Rough ER folds (layered blue cisternae) */}
    <path d="M14 20C24 16 38 24 50 19" stroke="#E0F2FE" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M12 28C24 24 38 32 52 27" stroke="#E0F2FE" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M14 36C26 32 38 40 50 35" stroke="#E0F2FE" strokeWidth="3.5" strokeLinecap="round" />
    {/* Ribosome dots on rough ER */}
    <circle cx="16" cy="17" r="1.8" fill="#BE185D" />
    <circle cx="26" cy="21" r="1.8" fill="#BE185D" />
    <circle cx="36" cy="22" r="1.8" fill="#BE185D" />
    <circle cx="46" cy="18" r="1.8" fill="#BE185D" />
    <circle cx="18" cy="25" r="1.8" fill="#BE185D" />
    <circle cx="28" cy="29" r="1.8" fill="#BE185D" />
    <circle cx="42" cy="28" r="1.8" fill="#BE185D" />
    {/* Smooth ER tubular branching (purple curves at bottom) */}
    <path d="M16 45C22 41 28 48 36 44C44 40 48 46 52 44" stroke="#C084FC" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 51C28 47 34 53 42 50" stroke="#C084FC" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Membran Sel (asset_033: Fosfolipid bilayer dengan protein integral & glikolipid)
export const CellMembraneIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#047857" />
    <circle cx="32" cy="32" r="25" fill="#10B981" />
    {/* Upper lipid heads (yellow dots) */}
    {[14, 20, 26, 38, 44, 50].map((cx, i) => (
      <circle key={`top-h-${i}`} cx={cx} cy="24" r="2.2" fill="#FDE047" />
    ))}
    {/* Upper lipid tails */}
    {[14, 20, 26, 38, 44, 50].map((cx, i) => (
      <path key={`top-t-${i}`} d={`M${cx} 26L${cx} 30`} stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
    ))}
    {/* Lower lipid heads (yellow dots) */}
    {[14, 20, 26, 38, 44, 50].map((cx, i) => (
      <circle key={`bot-h-${i}`} cx={cx} cy="40" r="2.2" fill="#FDE047" />
    ))}
    {/* Lower lipid tails */}
    {[14, 20, 26, 38, 44, 50].map((cx, i) => (
      <path key={`bot-t-${i}`} d={`M${cx} 38L${cx} 34`} stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
    ))}
    {/* Large channel protein in center (purple) */}
    <rect x="29" y="20" width="6" height="24" rx="3" fill="#8B5CF6" stroke="#DDD6FE" strokeWidth="1" />
    {/* Pore tunnel down center */}
    <line x1="32" y1="21" x2="32" y2="43" stroke="#4C1D95" strokeWidth="1.5" strokeDasharray="2 1" />
    {/* Carbohydrate chain antenna on top */}
    <circle cx="32" cy="15" r="1.5" fill="#FB923C" />
    <circle cx="34" cy="12" r="1.5" fill="#FB923C" />
    <line x1="32" y1="20" x2="32" y2="15" stroke="#FB923C" strokeWidth="1.2" />
    <line x1="32" y1="15" x2="34" y2="12" stroke="#FB923C" strokeWidth="1.2" />
  </svg>
);

// Vesikel Transport (asset_039: Vesikel kurir pengangkut protein)
export const VesicleTransportIcon: React.FC<ThumbnailProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#3B82F6" />
    <circle cx="32" cy="32" r="25" fill="#60A5FA" />
    {/* Microtubule track */}
    <path d="M10 44L54 20" stroke="#93C5FD" strokeWidth="3" strokeDasharray="3 3" strokeLinecap="round" />
    {/* Main vesicle sphere */}
    <circle cx="32" cy="30" r="16" fill="#1D4ED8" stroke="#BFDBFE" strokeWidth="2.5" />
    {/* Protein cargo inside */}
    <circle cx="28" cy="27" r="3.5" fill="#FDE047" />
    <circle cx="36" cy="28" r="3" fill="#F472B6" />
    <circle cx="31" cy="34" r="3" fill="#34D399" />
    {/* Motor protein legs attached to track */}
    <path d="M28 42L26 38L30 38" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 38L34 35L38 35" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Movement breeze sparks */}
    <path d="M48 26L52 24" stroke="#EFF6FF" strokeWidth="2" strokeLinecap="round" />
    <path d="M46 32L51 31" stroke="#EFF6FF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function getOrganelleIconByAsset(assetName: string | undefined, className = "w-full h-full"): React.ReactNode {
  if (!assetName) return <CellMultiIcon className={className} />;
  const clean = assetName.toLowerCase();
  if (clean.includes('030') || clean.includes('nukleus')) {
    return <NucleusIcon className={className} />;
  }
  if (clean.includes('031') || clean.includes('mitokondria')) {
    return <MitochondriaIcon className={className} />;
  }
  if (clean.includes('041')) {
    return <RealisticRoughERIllustration className={className} />;
  }
  if (clean.includes('032') || clean.includes('retikulum') || clean.includes('re')) {
    return <RealisticRoughERIllustration className={className} />;
  }
  if (clean.includes('040')) {
    return <RealisticCellMembraneIllustration className={className} />;
  }
  if (clean.includes('033') || clean.includes('membran')) {
    return <RealisticCellMembraneIllustration className={className} />;
  }
  if (clean.includes('038')) {
    return <RealisticGolgiIllustration className={className} />;
  }
  if (clean.includes('034') || clean.includes('golgi')) {
    return <RealisticGolgiIllustration className={className} />;
  }
  if (clean.includes('039') || clean.includes('vesikel')) {
    return <RealisticTransportVesicleIllustration className={className} />;
  }
  if (clean.includes('042')) {
    return <RealisticRibosomeIllustration className={className} />;
  }
  if (clean.includes('035') || clean.includes('036') || clean.includes('037') || clean.includes('ribosom')) {
    return <RealisticRibosomeIllustration className={className} />;
  }
  if (clean.includes('020') || clean.includes('068') || clean.includes('kloroplas') || clean.includes('pohon')) {
    return <ChloroplastTreeIcon className={className} />;
  }
  if (clean.includes('022') || clean.includes('042') || clean.includes('035') || clean.includes('036') || clean.includes('037') || clean.includes('ribosom')) {
    return <RealisticRibosomeIllustration className={className} />;
  }
  if (clean.includes('024') || clean.includes('049') || clean.includes('lisosom') || clean.includes('limbah') || clean.includes('sampah')) {
    return <LysosomeIcon className={className} />;
  }
  if (clean.includes('061') || clean.includes('062') || clean.includes('sel')) {
    return <WholeCellIcon className={className} />;
  }
  return <CellMultiIcon className={className} />;
}

export function getOrganelleThumbnail(stageIndex: number, className = "w-full h-full") {
  switch (stageIndex) {
    case 0:
      return <CompassGuideIcon className={className} />;
    case 1:
      return <VillageMapIcon className={className} />;
    case 2:
      return <NucleusIcon className={className} />;
    case 3:
      return <CellMultiIcon className={className} />;
    case 4:
      return <RibosomeProteinIcon className={className} />;
    case 5:
      return <MitochondriaIcon className={className} />;
    case 6:
      return <GolgiIcon className={className} />;
    case 7:
      return <LysosomeIcon className={className} />;
    case 8:
      return <WholeCellIcon className={className} />;
    case 9:
      return <ChloroplastTreeIcon className={className} />;
    default:
      return <CellMultiIcon className={className} />;
  }
}
