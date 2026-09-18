import React from 'react';

interface IllustrationProps {
  className?: string;
}

/**
 * 1. BADAN GOLGI (Golgi Apparatus)
 * Semi-realistic 3D molecular biology render:
 * - Curved, stacked parallel cisternae (cis to trans face)
 * - Fleshy pink & rose volumetric shading with deep lumen crevices
 * - Specular ridge highlights and organic curved edges
 * - Budding spherical secretory transport vesicles pinching off the margins
 * - Pure white background
 */
export const RealisticGolgiIllustration: React.FC<IllustrationProps> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 280 210" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ background: '#ffffff' }}
  >
    <defs>
      {/* 3D Cisternae gradients */}
      <linearGradient id="golgiFold1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="35%" stopColor="#ec4899" />
        <stop offset="70%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#9d174d" />
      </linearGradient>

      <linearGradient id="golgiFold2" x1="10%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="25%" stopColor="#f472b6" />
        <stop offset="60%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#881337" />
      </linearGradient>

      <linearGradient id="golgiFold3" x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stopColor="#f9a8d4" />
        <stop offset="40%" stopColor="#db2777" />
        <stop offset="85%" stopColor="#9f1239" />
        <stop offset="100%" stopColor="#4c0519" />
      </linearGradient>

      <radialGradient id="vesicleGradPink" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#fdf2f8" />
        <stop offset="30%" stopColor="#f472b6" />
        <stop offset="75%" stopColor="#be185d" />
        <stop offset="100%" stopColor="#831843" />
      </radialGradient>

      <radialGradient id="vesicleGradTrans" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#fbcfe8" />
        <stop offset="80%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#70072b" />
      </radialGradient>

      <filter id="softShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#831843" floodOpacity="0.22" />
      </filter>

      <linearGradient id="specularHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#fdf2f8" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
      </linearGradient>
    </defs>

    <rect width="280" height="210" fill="#ffffff" />

    {/* Group with soft drop shadow */}
    <g filter="url(#softShadow)">
      {/* Cisterna Layer 4 (Bottom / Trans face - deepest curve) */}
      <path 
        d="M52 145 C85 175, 195 175, 228 145 C236 138, 240 148, 232 156 C190 190, 90 190, 48 156 C40 148, 44 138, 52 145 Z" 
        fill="url(#golgiFold3)" 
      />
      {/* Specular ridge on fold 4 */}
      <path 
        d="M62 148 C95 174, 185 174, 218 148" 
        stroke="url(#specularHighlight)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {/* Cisterna Layer 3 (Lower-mid) */}
      <path 
        d="M44 118 C80 152, 200 152, 236 118 C246 109, 250 120, 240 130 C195 166, 85 166, 40 130 C30 120, 34 109, 44 118 Z" 
        fill="url(#golgiFold2)" 
      />
      <path 
        d="M56 122 C92 151, 188 151, 224 122" 
        stroke="url(#specularHighlight)" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
      />

      {/* Cisterna Layer 2 (Upper-mid) */}
      <path 
        d="M48 90 C84 122, 196 122, 232 90 C242 81, 245 92, 236 101 C192 136, 88 136, 44 101 C35 92, 38 81, 48 90 Z" 
        fill="url(#golgiFold1)" 
      />
      <path 
        d="M60 93 C94 120, 186 120, 220 93" 
        stroke="url(#specularHighlight)" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />

      {/* Cisterna Layer 1 (Top / Cis face) */}
      <path 
        d="M60 62 C92 90, 188 90, 220 62 C228 55, 232 64, 224 72 C188 102, 92 102, 56 72 C48 64, 52 55, 60 62 Z" 
        fill="url(#golgiFold2)" 
      />
      <path 
        d="M72 65 C100 89, 180 89, 208 65" 
        stroke="url(#specularHighlight)" 
        strokeWidth="2.8" 
        strokeLinecap="round" 
      />

      {/* Cisterna Layer 0 (Topmost thin fold) */}
      <path 
        d="M78 40 C104 62, 176 62, 202 40 C209 34, 213 42, 206 48 C174 72, 106 72, 74 48 C67 42, 71 34, 78 40 Z" 
        fill="url(#golgiFold1)" 
      />

      {/* Secretory vesicles budding on the left */}
      <circle cx="35" cy="85" r="9" fill="url(#vesicleGradPink)" />
      <circle cx="28" cy="115" r="11" fill="url(#vesicleGradTrans)" />
      <circle cx="36" cy="142" r="8" fill="url(#vesicleGradPink)" />
      <circle cx="22" cy="132" r="6" fill="url(#vesicleGradPink)" />

      {/* Secretory vesicles budding on the right */}
      <circle cx="245" cy="80" r="10" fill="url(#vesicleGradTrans)" />
      <circle cx="254" cy="112" r="12" fill="url(#vesicleGradPink)" />
      <circle cx="244" cy="140" r="9" fill="url(#vesicleGradTrans)" />
      <circle cx="260" cy="130" r="6" fill="url(#vesicleGradPink)" />

      {/* Pinching off connecting stalks */}
      <ellipse cx="237" cy="112" rx="6" ry="4" fill="#be185d" opacity="0.8" />
      <ellipse cx="43" cy="115" rx="5" ry="3.5" fill="#be185d" opacity="0.8" />
    </g>
  </svg>
);


/**
 * 2. MEMBRAN SEL (Cell Membrane / Phospholipid Bilayer)
 * Semi-realistic 3D molecular perspective slice:
 * - Fluid mosaic phospholipid bilayer with hydrophilic spherical heads
 * - Wavy intertwined hydrophobic fatty acid tails
 * - Large 3D purple channel protein spanning the bilayer with aqueous pore
 * - Peripheral surface protein & carbohydrate glycoprotein branching antenna
 * - Pure white background
 */
export const RealisticCellMembraneIllustration: React.FC<IllustrationProps> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 280 210" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ background: '#ffffff' }}
  >
    <defs>
      {/* 3D Phospholipid head spherical gradient (cyan / turquoise) */}
      <radialGradient id="lipidHeadTop" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="40%" stopColor="#34d399" />
        <stop offset="85%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064e3b" />
      </radialGradient>

      <radialGradient id="lipidHeadBot" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="45%" stopColor="#10b981" />
        <stop offset="85%" stopColor="#047857" />
        <stop offset="100%" stopColor="#022c22" />
      </radialGradient>

      {/* Integral Transmembrane Channel Protein gradient (violet/indigo 3D) */}
      <linearGradient id="channelProteinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="25%" stopColor="#8b5cf6" />
        <stop offset="65%" stopColor="#6d28d9" />
        <stop offset="100%" stopColor="#4c1d95" />
      </linearGradient>

      <linearGradient id="channelPoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2e1065" />
        <stop offset="50%" stopColor="#581c87" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>

      {/* Glycoprotein sugar chain balls */}
      <radialGradient id="sugarAmber" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </radialGradient>

      <radialGradient id="sugarRose" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#9d174d" />
      </radialGradient>

      <filter id="membraneShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="4" stdDeviation="4" floodColor="#064e3b" floodOpacity="0.2" />
      </filter>
    </defs>

    <rect width="280" height="210" fill="#ffffff" />

    <g filter="url(#membraneShadow)">
      {/* 1. UPPER PHOSPHOLIPID TAILS (Fatty Acid chains running down) */}
      {[22, 38, 54, 70, 86, 174, 190, 206, 222, 238, 254].map((x) => (
        <g key={`top-tail-${x}`} stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" opacity="0.85">
          <path d={`M${x - 2} 75 C${x - 4} 85, ${x + 2} 93, ${x - 1} 103`} />
          <path d={`M${x + 3} 75 C${x + 5} 84, ${x} 94, ${x + 3} 103`} />
        </g>
      ))}

      {/* 2. LOWER PHOSPHOLIPID TAILS (Fatty Acid chains running up) */}
      {[22, 38, 54, 70, 86, 174, 190, 206, 222, 238, 254].map((x) => (
        <g key={`bot-tail-${x}`} stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" opacity="0.85">
          <path d={`M${x - 2} 135 C${x - 3} 125, ${x + 2} 118, ${x - 1} 107`} />
          <path d={`M${x + 3} 135 C${x + 4} 126, ${x} 118, ${x + 2} 107`} />
        </g>
      ))}

      {/* 3. Hydrophobic core shading */}
      <rect x="15" y="100" width="250" height="10" fill="#fef3c7" opacity="0.4" />

      {/* 4. UPPER PHOSPHOLIPID HEADS (Spherical 3D heads) */}
      {[22, 38, 54, 70, 86, 174, 190, 206, 222, 238, 254].map((x) => (
        <circle key={`top-head-${x}`} cx={x} cy="70" r="8" fill="url(#lipidHeadTop)" />
      ))}

      {/* 5. LOWER PHOSPHOLIPID HEADS (Spherical 3D heads) */}
      {[22, 38, 54, 70, 86, 174, 190, 206, 222, 238, 254].map((x) => (
        <circle key={`bot-head-${x}`} cx={x} cy="140" r="8" fill="url(#lipidHeadBot)" />
      ))}

      {/* 6. INTEGRAL TRANSMEMBRANE CHANNEL PROTEIN (Large Center Protein) */}
      <g>
        {/* Main 3D Protein Body */}
        <path 
          d="M102 52 C115 50, 145 50, 158 52 C166 60, 164 150, 158 158 C145 160, 115 160, 102 158 C96 150, 94 60, 102 52 Z" 
          fill="url(#channelProteinGrad)" 
        />
        {/* 3D Cylindrical Helical contours */}
        <ellipse cx="130" cy="53" rx="28" ry="8" fill="#a78bfa" opacity="0.6" />
        <ellipse cx="130" cy="157" rx="28" ry="7" fill="#4c1d95" opacity="0.8" />

        {/* Aqueous Pore Tunnel in center */}
        <path 
          d="M125 53 C127 80, 127 130, 125 157 C135 157, 135 53, 125 53 Z" 
          fill="url(#channelPoreGrad)" 
        />
        {/* Pore opening rings */}
        <ellipse cx="130" cy="54" rx="7" ry="3" fill="#1e1b4b" />
        <ellipse cx="130" cy="156" rx="7" ry="2.5" fill="#0f172a" />

        {/* Molecular surface highlights */}
        <path d="M106 62 C108 90, 108 120, 106 148" stroke="#ddd6fe" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M154 62 C152 90, 152 120, 154 148" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* 7. GLYCOPROTEIN CARBOHYDRATE ANTENNA BRANCHING ON TOP */}
      <g stroke="#d97706" strokeWidth="2" strokeLinecap="round">
        <line x1="130" y1="50" x2="130" y2="34" />
        <line x1="130" y1="34" x2="118" y2="22" />
        <line x1="130" y1="34" x2="142" y2="24" />
        <line x1="142" y1="24" x2="152" y2="16" />
      </g>
      {/* Sugar residue spheres */}
      <circle cx="130" cy="34" r="4.5" fill="url(#sugarAmber)" />
      <circle cx="118" cy="22" r="4.5" fill="url(#sugarRose)" />
      <circle cx="142" cy="24" r="4.5" fill="url(#sugarAmber)" />
      <circle cx="152" cy="16" r="4.5" fill="url(#sugarRose)" />

      {/* Extracellular / Intracellular labels cues */}
      <text x="22" y="38" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">
        EKSTRASELULER
      </text>
      <text x="22" y="180" fill="#065f46" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">
        SITOPLASMA
      </text>
    </g>
  </svg>
);


/**
 * 3. RIBOSOM + mRNA (Ribosome & mRNA Translation Complex)
 * Semi-realistic 3D molecular surface / cryo-EM style:
 * - Asymmetric Large 60S subunit & Small 40S subunit with molecular surface bumps
 * - Vibrant crimson mRNA nucleotide strand looping through the translation cleft
 * - Nascent polypeptide peptide chain emerging from exit tunnel
 * - P-site / A-site tRNA molecular keys in golden yellow
 * - Pure white background
 */
export const RealisticRibosomeIllustration: React.FC<IllustrationProps> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 280 210" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ background: '#ffffff' }}
  >
    <defs>
      {/* Large subunit 3D molecular surface (deep violet / indigo) */}
      <radialGradient id="largeSubunitGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="30%" stopColor="#818cf8" />
        <stop offset="70%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#312e81" />
      </radialGradient>

      {/* Small subunit 3D molecular surface (cyan / cobalt blue) */}
      <radialGradient id="smallSubunitGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="35%" stopColor="#3b82f6" />
        <stop offset="75%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </radialGradient>

      {/* mRNA ribbon (crimson / ruby glow) */}
      <linearGradient id="mrnaRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fda4af" />
        <stop offset="40%" stopColor="#f43f5e" />
        <stop offset="80%" stopColor="#be123c" />
        <stop offset="100%" stopColor="#881337" />
      </linearGradient>

      {/* Nascent polypeptide chain bead */}
      <radialGradient id="aminoAcidBead" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#eab308" />
        <stop offset="85%" stopColor="#a16207" />
        <stop offset="100%" stopColor="#713f12" />
      </radialGradient>

      {/* tRNA molecule */}
      <linearGradient id="trnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="60%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>

      <filter id="ribosomeShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#1e1b4b" floodOpacity="0.25" />
      </filter>
    </defs>

    <rect width="280" height="210" fill="#ffffff" />

    <g filter="url(#ribosomeShadow)">
      {/* 1. LARGE RIBOSOMAL SUBUNIT (Upper bulky globular structure) */}
      <g>
        {/* Main contour with globular protein bumps */}
        <path 
          d="M75 110 C60 70, 95 30, 150 28 C205 26, 235 60, 225 105 C220 125, 200 135, 175 130 C150 125, 125 132, 95 130 C75 128, 80 118, 75 110 Z" 
          fill="url(#largeSubunitGrad)" 
        />
        {/* Surface globular nodes (giving 3D cryo-EM molecular texture) */}
        <circle cx="105" cy="55" r="22" fill="#818cf8" opacity="0.3" />
        <circle cx="150" cy="48" r="26" fill="#a5b4fc" opacity="0.35" />
        <circle cx="190" cy="70" r="20" fill="#6366f1" opacity="0.3" />
        <circle cx="130" cy="85" r="24" fill="#4338ca" opacity="0.3" />
        
        {/* Exit Tunnel cleft for polypeptide at top */}
        <ellipse cx="148" cy="30" rx="9" ry="5" fill="#1e1b4b" />
      </g>

      {/* 2. EMERGING POLYPEPTIDE PEPTIDE CHAIN (growing out of top exit tunnel) */}
      <g>
        <path 
          d="M148 29 C148 18, 162 14, 168 8 C172 4, 180 5, 185 3" 
          stroke="#ca8a04" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        {/* Individual amino acid beads */}
        <circle cx="149" cy="23" r="4.5" fill="url(#aminoAcidBead)" />
        <circle cx="158" cy="16" r="4.5" fill="url(#aminoAcidBead)" />
        <circle cx="168" cy="11" r="4.5" fill="url(#aminoAcidBead)" />
        <circle cx="178" cy="6" r="4.5" fill="url(#aminoAcidBead)" />
      </g>

      {/* 3. tRNA MOLECULE IN CATALYTIC CLEFT */}
      <g>
        {/* Cloverleaf tRNA stem in translation center */}
        <path 
          d="M152 92 L146 122 L156 122 Z" 
          fill="url(#trnaGrad)" 
        />
        <circle cx="151" cy="90" r="5" fill="#fde047" />
      </g>

      {/* 4. mRNA STRAND (Vibrant red nucleotide ribbon threading through cleft) */}
      <g>
        <path 
          d="M25 132 C55 125, 95 135, 140 128 C185 120, 220 138, 258 126" 
          stroke="url(#mrnaRibbon)" 
          strokeWidth="6.5" 
          strokeLinecap="round" 
        />
        {/* mRNA Codon triplet dashes */}
        {[42, 60, 78, 100, 120, 140, 165, 185, 205, 225, 245].map((x) => (
          <line 
            key={`codon-${x}`} 
            x1={x} 
            y1="126" 
            x2={x} 
            y2="134" 
            stroke="#ffffff" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
          />
        ))}
      </g>

      {/* 5. SMALL RIBOSOMAL SUBUNIT (Lower subunit clamping mRNA) */}
      <g>
        <path 
          d="M80 138 C80 132, 105 128, 145 128 C185 128, 210 132, 210 138 C215 168, 185 192, 145 192 C105 192, 75 168, 80 138 Z" 
          fill="url(#smallSubunitGrad)" 
        />
        {/* 3D molecular volume contours */}
        <circle cx="115" cy="162" r="20" fill="#60a5fa" opacity="0.3" />
        <circle cx="155" cy="165" r="22" fill="#93c5fd" opacity="0.25" />
        <circle cx="178" cy="155" r="16" fill="#2563eb" opacity="0.3" />
      </g>
    </g>
  </svg>
);


/**
 * 4. RETIKULUM ENDOPLASMA KASAR (Rough Endoplasmic Reticulum)
 * Semi-realistic 3D molecular biology render:
 * - Interconnected sheet-like folded membrane cisternae in cyan/cobalt blue
 * - Outer cytosolic surface densely studded with hundreds of tiny red/magenta ribosomes
 * - Lumen cross-section with subtle interior depth and lighting
 * - Pure white background
 */
export const RealisticRoughERIllustration: React.FC<IllustrationProps> = ({ className = "w-full h-full" }) => {
  // Generate regular array of ribosome dots on the membrane folds
  const ribosomeDots = [
    // Top fold ribosomes
    { cx: 58, cy: 45 }, { cx: 78, cy: 41 }, { cx: 98, cy: 40 }, { cx: 118, cy: 42 }, 
    { cx: 138, cy: 40 }, { cx: 158, cy: 42 }, { cx: 178, cy: 40 }, { cx: 198, cy: 43 }, 
    { cx: 218, cy: 48 }, { cx: 235, cy: 56 },
    // Mid fold 1 ribosomes
    { cx: 48, cy: 78 }, { cx: 68, cy: 73 }, { cx: 88, cy: 71 }, { cx: 108, cy: 70 }, 
    { cx: 128, cy: 72 }, { cx: 148, cy: 71 }, { cx: 168, cy: 70 }, { cx: 188, cy: 73 }, 
    { cx: 208, cy: 77 }, { cx: 228, cy: 84 },
    // Mid fold 2 ribosomes
    { cx: 42, cy: 112 }, { cx: 62, cy: 107 }, { cx: 82, cy: 104 }, { cx: 102, cy: 103 }, 
    { cx: 122, cy: 105 }, { cx: 142, cy: 104 }, { cx: 162, cy: 103 }, { cx: 182, cy: 106 }, 
    { cx: 202, cy: 110 }, { cx: 222, cy: 118 },
    // Lower fold ribosomes
    { cx: 48, cy: 148 }, { cx: 68, cy: 142 }, { cx: 88, cy: 139 }, { cx: 108, cy: 138 }, 
    { cx: 128, cy: 140 }, { cx: 148, cy: 139 }, { cx: 168, cy: 138 }, { cx: 188, cy: 141 }, 
    { cx: 208, cy: 146 }, { cx: 228, cy: 154 }
  ];

  return (
    <svg 
      viewBox="0 0 280 210" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: '#ffffff' }}
    >
      <defs>
        {/* RER Membrane Cisternae Gradient (Cyan/Teal/Cobalt) */}
        <linearGradient id="rerMembrane1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#0284c7" />
          <stop offset="75%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        <linearGradient id="rerMembrane2" x1="5%" y1="0%" x2="95%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="40%" stopColor="#0ea5e9" />
          <stop offset="80%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Lumen Interior Cavity */}
        <linearGradient id="rerLumen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>

        {/* Tiny Ribosome spherical gradient (Deep Magenta / Crimson) */}
        <radialGradient id="ribosomeSphere" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="40%" stopColor="#e11d48" />
          <stop offset="85%" stopColor="#9f1239" />
          <stop offset="100%" stopColor="#4c0519" />
        </radialGradient>

        <filter id="rerShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#082f49" floodOpacity="0.22" />
        </filter>
      </defs>

      <rect width="280" height="210" fill="#ffffff" />

      <g filter="url(#rerShadow)">
        {/* FOLD 4 (Bottom Cisterna) */}
        <g>
          <path 
            d="M38 155 C75 142, 195 142, 238 160 C248 165, 246 178, 234 182 C190 196, 75 196, 30 178 C22 172, 25 160, 38 155 Z" 
            fill="url(#rerMembrane1)" 
          />
          {/* Lumen cross section slit */}
          <path 
            d="M48 162 C85 151, 185 151, 222 166" 
            stroke="url(#rerLumen)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </g>

        {/* FOLD 3 (Lower-mid Cisterna) */}
        <g>
          <path 
            d="M32 118 C70 106, 190 106, 232 124 C242 129, 240 142, 228 146 C185 160, 70 160, 24 142 C16 136, 19 124, 32 118 Z" 
            fill="url(#rerMembrane2)" 
          />
          <path 
            d="M42 125 C80 115, 180 115, 216 130" 
            stroke="url(#rerLumen)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </g>

        {/* FOLD 2 (Upper-mid Cisterna) */}
        <g>
          <path 
            d="M38 84 C75 72, 195 72, 238 90 C248 95, 246 108, 234 112 C190 126, 75 126, 30 108 C22 102, 25 90, 38 84 Z" 
            fill="url(#rerMembrane1)" 
          />
          <path 
            d="M48 91 C85 81, 185 81, 222 96" 
            stroke="url(#rerLumen)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </g>

        {/* FOLD 1 (Top Cisterna) */}
        <g>
          <path 
            d="M48 50 C85 38, 205 38, 248 56 C258 61, 256 74, 244 78 C200 92, 85 92, 40 74 C32 68, 35 56, 48 50 Z" 
            fill="url(#rerMembrane2)" 
          />
          <path 
            d="M58 57 C95 47, 195 47, 232 62" 
            stroke="url(#rerLumen)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </g>

        {/* Dense coating of 3D Ribosome beads across all folds */}
        {ribosomeDots.map((dot, i) => (
          <circle 
            key={`ribosome-dot-${i}`} 
            cx={dot.cx} 
            cy={dot.cy} 
            r="3.4" 
            fill="url(#ribosomeSphere)" 
          />
        ))}
      </g>
    </svg>
  );
};


/**
 * 5. VESIKEL TRANSPORT KE MEMBRAN SEL (Transport Vesicle on Microtubule)
 * Semi-realistic 3D molecular biology render:
 * - Spherical translucent transport vesicle with lipid bilayer outer rim
 * - Concentrated cargo proteins visible inside (golden & pink globular proteins)
 * - Microtubule rail running diagonally (cylindrical protofilament track)
 * - Kinesin motor protein walking along microtubule, carrying the vesicle cargo
 * - Pure white background
 */
export const RealisticTransportVesicleIllustration: React.FC<IllustrationProps> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 280 210" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ background: '#ffffff' }}
  >
    <defs>
      {/* 3D Translucent Vesicle Sphere */}
      <radialGradient id="vesicleOuterSphere" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#dbeafe" />
        <stop offset="40%" stopColor="#60a5fa" stopOpacity="0.85" />
        <stop offset="80%" stopColor="#2563eb" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </radialGradient>

      {/* Cargo protein beads */}
      <radialGradient id="cargoGold" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#854d0e" />
      </radialGradient>

      <radialGradient id="cargoPink" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#9d174d" />
      </radialGradient>

      {/* Microtubule protofilament cylinder */}
      <linearGradient id="microtubuleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="40%" stopColor="#3b82f6" />
        <stop offset="80%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>

      {/* Motor protein kinesin */}
      <linearGradient id="kinesinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>

      <filter id="vesicleShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="3" dy="6" stdDeviation="6" floodColor="#1e3a8a" floodOpacity="0.22" />
      </filter>
    </defs>

    <rect width="280" height="210" fill="#ffffff" />

    <g filter="url(#vesicleShadow)">
      {/* 1. MICROTUBULE TRACK (Diagonal Cylindrical Rail) */}
      <g>
        {/* Main tubular rod */}
        <path 
          d="M20 182 L260 142 L260 156 L20 196 Z" 
          fill="url(#microtubuleGrad)" 
        />
        {/* Repeating tubulin heterodimer segments */}
        {[30, 60, 90, 120, 150, 180, 210, 240].map((x) => (
          <line 
            key={`tubulin-${x}`} 
            x1={x} 
            y1={182 - (x - 20) * 0.166} 
            x2={x} 
            y2={196 - (x - 20) * 0.166} 
            stroke="#93c5fd" 
            strokeWidth="1.5" 
            opacity="0.7" 
          />
        ))}
      </g>

      {/* 2. KINESIN MOTOR PROTEIN (Walking feet & coiled tail) */}
      <g>
        {/* Coiled tail attached to vesicle base */}
        <path 
          d="M140 120 C140 135, 136 142, 138 152" 
          stroke="url(#kinesinGrad)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        {/* Two motor head feet on the microtubule track */}
        <ellipse cx="132" cy="158" rx="6" ry="4" transform="rotate(-10 132 158)" fill="#d97706" />
        <ellipse cx="145" cy="156" rx="6" ry="4" transform="rotate(-10 145 156)" fill="#f59e0b" />
        {/* Leg connectors */}
        <path d="M138 152 L132 157" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M138 152 L145 155" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* 3. TRANSPORT VESICLE SPHERE */}
      <g>
        {/* Outer lipid membrane sphere */}
        <circle cx="140" cy="78" r="50" fill="url(#vesicleOuterSphere)" />

        {/* Inner cargo proteins visible through translucent membrane */}
        <circle cx="125" cy="70" r="7.5" fill="url(#cargoGold)" />
        <circle cx="142" cy="65" r="8.5" fill="url(#cargoPink)" />
        <circle cx="155" cy="76" r="7" fill="url(#cargoGold)" />
        <circle cx="132" cy="85" r="8" fill="url(#cargoPink)" />
        <circle cx="148" cy="88" r="6.5" fill="url(#cargoGold)" />

        {/* Translucent rim membrane highlight */}
        <circle 
          cx="140" 
          cy="78" 
          r="48" 
          stroke="#ffffff" 
          strokeWidth="2.5" 
          strokeOpacity="0.4" 
          fill="none" 
        />

        {/* Specular glass highlight reflection on top-left of sphere */}
        <path 
          d="M115 54 C122 45, 138 42, 150 45 C142 50, 126 55, 115 54 Z" 
          fill="#ffffff" 
          opacity="0.65" 
        />
        <circle cx="118" cy="62" r="3.5" fill="#ffffff" opacity="0.7" />
      </g>

      {/* 4. MOTION BREEZE ARROWS (Direction of transport towards membrane) */}
      <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.65">
        <path d="M205 65 L225 60" />
        <path d="M210 75 L232 70" />
        <path d="M208 85 L226 80" />
      </g>
    </g>
  </svg>
);


/**
 * Unified lookup helper: Returns the matching semi-realistic 3D biological illustration
 */
export function getRealisticOrganelleIllustration(
  identifier: string,
  className = "w-full h-full"
): React.ReactNode {
  const clean = identifier.toLowerCase();

  // 1. Badan Golgi
  if (clean.includes('golgi') || clean.includes('038') || clean.includes('034')) {
    return <RealisticGolgiIllustration className={className} />;
  }

  // 2. Membran Sel
  if (clean.includes('membran') || clean.includes('040') || clean.includes('033') || clean.includes('026')) {
    return <RealisticCellMembraneIllustration className={className} />;
  }

  // 3. Ribosom (+ mRNA)
  if (clean.includes('ribosom') || clean.includes('042') || clean.includes('022') || clean.includes('035')) {
    return <RealisticRibosomeIllustration className={className} />;
  }

  // 4. Retikulum Endoplasma Kasar (RE Kasar)
  if (clean.includes('re_kasar') || clean.includes('kasar') || clean.includes('041') || clean.includes('032')) {
    return <RealisticRoughERIllustration className={className} />;
  }

  // 5. Vesikel Transport
  if (clean.includes('vesikel') || clean.includes('039') || clean.includes('vesicle')) {
    return <RealisticTransportVesicleIllustration className={className} />;
  }

  // Fallback to Golgi if unknown
  return <RealisticGolgiIllustration className={className} />;
}
