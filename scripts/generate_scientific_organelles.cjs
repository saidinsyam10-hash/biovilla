const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const WIDTH = 240;
const HEIGHT = 240;
const RADIUS = 28;

// Common defs for card frame, filters, and gradients
const DEFS = `
  <defs>
    <!-- Card Frame Shadows & Blurs -->
    <filter id="cardDropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
    <filter id="organelleGroundShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" />
    </filter>

    <!-- NUKLEUS GRADIENTS (Ungu Gelap ke Ungu Muda) -->
    <radialGradient id="nucEnvelopeGrad" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="25%" stop-color="#9333ea" />
      <stop offset="60%" stop-color="#6b21a8" />
      <stop offset="90%" stop-color="#4c1d95" />
      <stop offset="100%" stop-color="#2e1065" />
    </radialGradient>
    <radialGradient id="nucNucleoplasmGrad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#7e22ce" />
      <stop offset="50%" stop-color="#581c87" />
      <stop offset="100%" stop-color="#3b0764" />
    </radialGradient>
    <radialGradient id="nucNucleolusGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="40%" stop-color="#581c87" />
      <stop offset="85%" stop-color="#3b0764" />
      <stop offset="100%" stop-color="#1e0538" />
    </radialGradient>
    <linearGradient id="nucPoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d8b4fe" />
      <stop offset="100%" stop-color="#3b0764" />
    </linearGradient>

    <!-- BADAN GOLGI GRADIENTS (Oranye ke Kuning) -->
    <linearGradient id="golgiCisternae1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="30%" stop-color="#facc15" />
      <stop offset="70%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#9a3412" />
    </linearGradient>
    <linearGradient id="golgiCisternae2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="35%" stop-color="#fb923c" />
      <stop offset="75%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#7c2d12" />
    </linearGradient>
    <radialGradient id="golgiVesicleGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#f59e0b" />
      <stop offset="80%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#9a3412" />
    </radialGradient>

    <!-- RETIKULUM ENDOPLASMA GRADIENTS (Biru Muda ke Biru Tua) -->
    <linearGradient id="erSheetGrad1" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="25%" stop-color="#38bdf8" />
      <stop offset="65%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0c4a6e" />
    </linearGradient>
    <linearGradient id="erSheetGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="35%" stop-color="#0ea5e9" />
      <stop offset="75%" stop-color="#0369a1" />
      <stop offset="100%" stop-color="#082f49" />
    </linearGradient>
    <radialGradient id="ribosomeGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f2fe" />
      <stop offset="40%" stop-color="#38bdf8" />
      <stop offset="90%" stop-color="#0369a1" />
      <stop offset="100%" stop-color="#082f49" />
    </radialGradient>

    <!-- MITOKONDRIA GRADIENTS (Merah-Oranye) -->
    <linearGradient id="mitoOuterGrad" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="30%" stop-color="#ef4444" />
      <stop offset="65%" stop-color="#dc2626" />
      <stop offset="90%" stop-color="#991b1b" />
      <stop offset="100%" stop-color="#450a0a" />
    </linearGradient>
    <radialGradient id="mitoMatrixGrad" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="50%" stop-color="#c2410c" />
      <stop offset="90%" stop-color="#7c2d12" />
      <stop offset="100%" stop-color="#431407" />
    </radialGradient>
    <linearGradient id="cristaeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="35%" stop-color="#f97316" />
      <stop offset="75%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#9a3412" />
    </linearGradient>

    <!-- MEMBRAN SEL GRADIENTS (Hijau Muda Transparan) -->
    <radialGradient id="lipidHeadGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#dcfce7" />
      <stop offset="35%" stop-color="#86efac" />
      <stop offset="70%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#15803d" />
    </radialGradient>
    <linearGradient id="tailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="50%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#166534" />
    </linearGradient>
    <linearGradient id="proteinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac" />
      <stop offset="30%" stop-color="#3b82f6" />
      <stop offset="70%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1e40af" />
    </linearGradient>
    <radialGradient id="proteinPoreGrad" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="60%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#172554" />
    </radialGradient>
  </defs>
`;

function wrapCard(content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${DEFS}

  <!-- White Rounded Square Card Base Frame (Clean White Background) -->
  <rect x="2" y="2" width="${WIDTH - 4}" height="${HEIGHT - 4}" rx="${RADIUS}" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />

  <!-- Organelle Artwork (No Text, No Numbers) -->
  ${content}
</svg>`;
}

// 1. NUKLEUS
function getNucleusSvg() {
  const cx = 120;
  const cy = 115;
  return wrapCard(`
    <!-- Soft Ground Shadow for 3D depth -->
    <ellipse cx="${cx}" cy="${cy + 70}" rx="68" ry="18" fill="#0f172a" opacity="0.10" filter="url(#organelleGroundShadow)" />

    <!-- Outer Double Membrane Envelope (Selubung Nukleus) -->
    <g>
      <!-- Outer sphere base -->
      <circle cx="${cx}" cy="${cy}" r="66" fill="url(#nucEnvelopeGrad)" stroke="#3b0764" stroke-width="2.5" />

      <!-- Nuclear Pores (Pori-pori nukleus) dotted across outer surface -->
      <g>
        <!-- Top left pores -->
        <circle cx="${cx - 42}" cy="${cy - 30}" r="4.5" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.8" />
        <circle cx="${cx - 42}" cy="${cy - 30}" r="2" fill="#1e0538" />

        <circle cx="${cx - 20}" cy="${cy - 52}" r="4.5" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.8" />
        <circle cx="${cx - 20}" cy="${cy - 52}" r="2" fill="#1e0538" />

        <circle cx="${cx + 15}" cy="${cy - 54}" r="4.5" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.8" />
        <circle cx="${cx + 15}" cy="${cy - 54}" r="2" fill="#1e0538" />

        <circle cx="${cx + 44}" cy="${cy - 35}" r="4.5" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.8" />
        <circle cx="${cx + 44}" cy="${cy - 35}" r="2" fill="#1e0538" />

        <!-- Bottom rim pores -->
        <circle cx="${cx - 52}" cy="${cy + 15}" r="4" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.5" />
        <circle cx="${cx - 30}" cy="${cy + 48}" r="4" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.5" />
        <circle cx="${cx + 18}" cy="${cy + 52}" r="4" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.5" />
        <circle cx="${cx + 48}" cy="${cy + 25}" r="4" fill="#2e1065" stroke="#d8b4fe" stroke-width="1.5" />
      </g>

      <!-- Front Cutaway Window revealing Inner Core & Chromatin -->
      <path d="M ${cx - 45} ${cy - 20} 
               C ${cx - 20} ${cy - 48}, ${cx + 38} ${cy - 45}, ${cx + 52} ${cy - 10}
               C ${cx + 60} ${cy + 25}, ${cx + 30} ${cy + 50}, ${cx - 10} ${cy + 50}
               C ${cx - 40} ${cy + 45}, ${cx - 55} ${cy + 15}, ${cx - 45} ${cy - 20} Z" 
            fill="url(#nucNucleoplasmGrad)" stroke="#4c1d95" stroke-width="3" />

      <!-- Inner Double Membrane Rim Outline (Ketebalan Selubung Ganda) -->
      <path d="M ${cx - 43} ${cy - 18} 
               C ${cx - 19} ${cy - 45}, ${cx + 36} ${cy - 42}, ${cx + 50} ${cy - 8}
               C ${cx + 57} ${cy + 23}, ${cx + 28} ${cy + 47}, ${cx - 8} ${cy + 47}
               C ${cx - 37} ${cy + 42}, ${cx - 52} ${cy + 13}, ${cx - 43} ${cy - 18} Z" 
            fill="none" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.6" />

      <!-- Delicate Tangled Chromatin Threads (Benang-benang Kromatin) -->
      <g opacity="0.85">
        <path d="M ${cx - 25} ${cy - 25} Q ${cx - 5} ${cy - 38}, ${cx + 20} ${cy - 25} Q ${cx + 35} ${cy - 10}, ${cx + 25} ${cy + 10} Q ${cx + 10} ${cy + 25}, ${cx - 5} ${cy + 15} Q ${cx - 25} ${cy + 5}, ${cx - 20} ${cy - 10} Q ${cx - 15} ${cy - 20}, ${cx} ${cy - 20} Q ${cx + 15} ${cy - 18}, ${cx + 20} ${cy - 5}" 
              fill="none" stroke="#e9d5ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        
        <path d="M ${cx - 32} ${cy + 5} Q ${cx - 15} ${cy + 28}, ${cx + 10} ${cy + 32} Q ${cx + 32} ${cy + 25}, ${cx + 36} ${cy + 2}" 
              fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" />
        
        <path d="M ${cx - 10} ${cy - 30} Q ${cx + 15} ${cy - 35}, ${cx + 32} ${cy - 22} Q ${cx + 42} ${cy - 5}, ${cx + 30} ${cy + 15}" 
              fill="none" stroke="#f3e8ff" stroke-width="1.8" stroke-linecap="round" />
        
        <path d="M ${cx - 35} ${cy - 8} Q ${cx - 20} ${cy + 15}, ${cx} ${cy + 25}" 
              fill="none" stroke="#d8b4fe" stroke-width="2" stroke-linecap="round" />
      </g>

      <!-- Nucleolus (Nukleolus / Anak Inti - Bulatan Padat Gelap di Tengah) -->
      <circle cx="${cx - 4}" cy="${cy + 2}" r="17" fill="url(#nucNucleolusGrad)" stroke="#1e0538" stroke-width="2" />
      <circle cx="${cx - 8}" cy="${cy - 3}" r="4.5" fill="#c084fc" opacity="0.6" filter="url(#softGlow)" />

      <!-- Glossy 3D Highlights on Envelope Dome -->
      <path d="M ${cx - 45} ${cy - 40} C ${cx - 30} ${cy - 55}, ${cx + 10} ${cy - 60}, ${cx + 35} ${cy - 50} C ${cx + 15} ${cy - 52}, ${cx - 20} ${cy - 48}, ${cx - 35} ${cy - 35} Z" 
            fill="#ffffff" opacity="0.45" />
      <circle cx="${cx + 38}" cy="${cy - 44}" r="4" fill="#ffffff" opacity="0.55" />
    </g>
  `);
}

// 2. BADAN GOLGI
function getGolgiSvg() {
  const cx = 120;
  const cy = 115;
  return wrapCard(`
    <!-- Soft Ground Shadow for 3D depth -->
    <ellipse cx="${cx}" cy="${cy + 72}" rx="72" ry="18" fill="#0f172a" opacity="0.10" filter="url(#organelleGroundShadow)" />

    <g>
      <!-- Stack of 5 Curved Flattened Cisternae (Tumpukan 5 Kantung Pipih Melengkung) -->
      <!-- Cisterna 1 (Bottom Trans-face - Most curved) -->
      <path d="M ${cx - 58} ${cy + 42} 
               C ${cx - 35} ${cy + 54}, ${cx + 35} ${cy + 54}, ${cx + 58} ${cy + 42}
               C ${cx + 66} ${cy + 37}, ${cx + 64} ${cy + 28}, ${cx + 54} ${cy + 28}
               C ${cx + 30} ${cy + 38}, ${cx - 30} ${cy + 38}, ${cx - 54} ${cy + 28}
               C ${cx - 64} ${cy + 28}, ${cx - 66} ${cy + 37}, ${cx - 58} ${cy + 42} Z" 
            fill="url(#golgiCisternae2)" stroke="#7c2d12" stroke-width="2" />
      <circle cx="${cx - 58}" cy="${cy + 35}" r="7" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />
      <circle cx="${cx + 58}" cy="${cy + 35}" r="7" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />

      <!-- Cisterna 2 -->
      <path d="M ${cx - 64} ${cy + 20} 
               C ${cx - 38} ${cy + 34}, ${cx + 38} ${cy + 34}, ${cx + 64} ${cy + 20}
               C ${cx + 72} ${cy + 15}, ${cx + 70} ${cy + 6}, ${cx + 60} ${cy + 6}
               C ${cx + 34} ${cy + 18}, ${cx - 34} ${cy + 18}, ${cx - 60} ${cy + 6}
               C ${cx - 70} ${cy + 6}, ${cx - 72} ${cy + 15}, ${cx - 64} ${cy + 20} Z" 
            fill="url(#golgiCisternae1)" stroke="#9a3412" stroke-width="2" />
      <circle cx="${cx - 64}" cy="${cy + 13}" r="7.5" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />
      <circle cx="${cx + 64}" cy="${cy + 13}" r="7.5" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />

      <!-- Cisterna 3 (Middle Medial Cisterna) -->
      <path d="M ${cx - 62} ${cy - 2} 
               C ${cx - 36} ${cy + 12}, ${cx + 36} ${cy + 12}, ${cx + 62} ${cy - 2}
               C ${cx + 70} ${cy - 7}, ${cx + 68} ${cy - 16}, ${cx + 58} ${cy - 16}
               C ${cx + 32} ${cy - 4}, ${cx - 32} ${cy - 4}, ${cx - 58} ${cy - 16}
               C ${cx - 68} ${cy - 16}, ${cx - 70} ${cy - 7}, ${cx - 62} ${cy - 2} Z" 
            fill="url(#golgiCisternae2)" stroke="#9a3412" stroke-width="2" />
      <circle cx="${cx - 62}" cy="${cy - 9}" r="7.5" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />
      <circle cx="${cx + 62}" cy="${cy - 9}" r="7.5" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />

      <!-- Cisterna 4 -->
      <path d="M ${cx - 56} ${cy - 24} 
               C ${cx - 32} ${cy - 10}, ${cx + 32} ${cy - 10}, ${cx + 56} ${cy - 24}
               C ${cx + 64} ${cy - 29}, ${cx + 62} ${cy - 38}, ${cx + 52} ${cy - 38}
               C ${cx + 28} ${cy - 26}, ${cx - 28} ${cy - 26}, ${cx - 52} ${cy - 38}
               C ${cx - 62} ${cy - 38}, ${cx - 64} ${cy - 29}, ${cx - 56} ${cy - 24} Z" 
            fill="url(#golgiCisternae1)" stroke="#ea580c" stroke-width="2" />
      <circle cx="${cx - 56}" cy="${cy - 31}" r="7" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />
      <circle cx="${cx + 56}" cy="${cy - 31}" r="7" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />

      <!-- Cisterna 5 (Top Cis-face) -->
      <path d="M ${cx - 48} ${cy - 46} 
               C ${cx - 28} ${cy - 34}, ${cx + 28} ${cy - 34}, ${cx + 48} ${cy - 46}
               C ${cx + 56} ${cy - 51}, ${cx + 54} ${cy - 59}, ${cx + 44} ${cy - 59}
               C ${cx + 24} ${cy - 48}, ${cx - 24} ${cy - 48}, ${cx - 44} ${cy - 59}
               C ${cx - 54} ${cy - 59}, ${cx - 56} ${cy - 51}, ${cx - 48} ${cy - 46} Z" 
            fill="url(#golgiCisternae2)" stroke="#ea580c" stroke-width="2" />
      <circle cx="${cx - 46}" cy="${cy - 52}" r="6.5" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />
      <circle cx="${cx + 46}" cy="${cy - 52}" r="6.5" fill="url(#golgiVesicleGrad)" stroke="#9a3412" stroke-width="1.5" />

      <!-- Budding & Floating Transport Vesicles (Gelembung Vesikel di Ujung-Ujung) -->
      <!-- Left side budding vesicles -->
      <circle cx="${cx - 78}" cy="${cy + 28}" r="8" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.8" />
      <circle cx="${cx - 76}" cy="${cy + 25}" r="2.5" fill="#ffffff" opacity="0.6" />

      <circle cx="${cx - 72}" cy="${cy - 18}" r="6.5" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.8" />
      <circle cx="${cx - 70}" cy="${cy - 20}" r="2" fill="#ffffff" opacity="0.6" />

      <circle cx="${cx - 58}" cy="${cy - 66}" r="5.5" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.5" />

      <!-- Right side budding vesicles -->
      <circle cx="${cx + 78}" cy="${cy + 24}" r="8.5" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.8" />
      <circle cx="${cx + 80}" cy="${cy + 21}" r="2.5" fill="#ffffff" opacity="0.6" />

      <circle cx="${cx + 74}" cy="${cy - 15}" r="7" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.8" />
      <circle cx="${cx + 76}" cy="${cy - 17}" r="2" fill="#ffffff" opacity="0.6" />

      <circle cx="${cx + 56}" cy="${cy - 68}" r="6" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.5" />

      <!-- Bottom Secretory Vesicles -->
      <circle cx="${cx - 15}" cy="${cy + 58}" r="7" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.8" />
      <circle cx="${cx + 22}" cy="${cy + 60}" r="7.5" fill="url(#golgiVesicleGrad)" stroke="#c2410c" stroke-width="1.8" />

      <!-- Glossy Curved Tubular Highlights on each layer -->
      <path d="M ${cx - 38} ${cy - 50} Q ${cx} ${cy - 42}, ${cx + 38} ${cy - 50}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <path d="M ${cx - 44} ${cy - 28} Q ${cx} ${cy - 20}, ${cx + 44} ${cy - 28}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <path d="M ${cx - 48} ${cy - 6} Q ${cx} ${cy + 2}, ${cx + 48} ${cy - 6}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.55" />
      <path d="M ${cx - 48} ${cy + 16} Q ${cx} ${cy + 24}, ${cx + 48} ${cy + 16}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.5" />
    </g>
  `);
}

// 3. RETIKULUM ENDOPLASMA (Rough ER & Labirin Tabung Membran)
function getEndoplasmicReticulumSvg() {
  const cx = 120;
  const cy = 115;
  return wrapCard(`
    <!-- Soft Ground Shadow for 3D depth -->
    <ellipse cx="${cx}" cy="${cy + 72}" rx="72" ry="18" fill="#0f172a" opacity="0.10" filter="url(#organelleGroundShadow)" />

    <g>
      <!-- Interconnected Branching Labyrinth Sheets & Tubules (Labirin Membran Berlipat & Bercabang) -->
      <!-- Background Fold Layer -->
      <path d="M ${cx - 65} ${cy - 20} 
               C ${cx - 75} ${cy + 20}, ${cx - 50} ${cy + 50}, ${cx - 20} ${cy + 45}
               C ${cx + 10} ${cy + 40}, ${cx + 25} ${cy + 55}, ${cx + 55} ${cy + 45}
               C ${cx + 75} ${cy + 35}, ${cx + 70} ${cy - 10}, ${cx + 45} ${cy - 25}
               C ${cx + 25} ${cy - 35}, ${cx + 45} ${cy - 55}, ${cx + 10} ${cy - 60}
               C ${cx - 25} ${cy - 65}, ${cx - 45} ${cy - 45}, ${cx - 65} ${cy - 20} Z" 
            fill="url(#erSheetGrad2)" stroke="#0c4a6e" stroke-width="2.5" />

      <!-- Folded Cisternal Convolutions (Lipatan-lipatan labirin bergelombang) -->
      <!-- Fold Sheet 1 (Top Left to Center) -->
      <path d="M ${cx - 50} ${cy - 40} 
               C ${cx - 30} ${cy - 25}, ${cx - 10} ${cy - 50}, ${cx + 15} ${cy - 40}
               C ${cx + 35} ${cy - 32}, ${cx + 15} ${cy - 10}, ${cx - 5} ${cy - 15}
               C ${cx - 25} ${cy - 20}, ${cx - 40} ${cy - 5}, ${cx - 55} ${cy - 25} Z" 
            fill="url(#erSheetGrad1)" stroke="#0284c7" stroke-width="2" />

      <!-- Fold Sheet 2 (Center Labyrinth Loop) -->
      <path d="M ${cx - 45} ${cy - 5} 
               C ${cx - 25} ${cy + 8}, ${cx} ${cy - 8}, ${cx + 25} ${cy + 5}
               C ${cx + 45} ${cy + 18}, ${cx + 55} ${cy - 5}, ${cx + 35} ${cy - 20}
               C ${cx + 15} ${cy - 30}, ${cx - 10} ${cy - 25}, ${cx - 30} ${cy - 18} Z" 
            fill="url(#erSheetGrad1)" stroke="#0369a1" stroke-width="2" />

      <!-- Fold Sheet 3 (Middle-Bottom Convolution) -->
      <path d="M ${cx - 55} ${cy + 15} 
               C ${cx - 35} ${cy + 30}, ${cx - 15} ${cy + 15}, ${cx + 10} ${cy + 25}
               C ${cx + 30} ${cy + 35}, ${cx + 50} ${cy + 20}, ${cx + 58} ${cy + 8}
               C ${cx + 62} ${cy + 22}, ${cx + 35} ${cy + 48}, ${cx + 10} ${cy + 42}
               C ${cx - 15} ${cy + 38}, ${cx - 40} ${cy + 45}, ${cx - 60} ${cy + 28} Z" 
            fill="url(#erSheetGrad1)" stroke="#0284c7" stroke-width="2" />

      <!-- Connecting Branching Tubules (Tabung Penghubung) -->
      <path d="M ${cx - 18} ${cy - 48} C ${cx - 15} ${cy - 25}, ${cx - 20} ${cy - 5}, ${cx - 16} ${cy + 18}" 
            fill="none" stroke="#7dd3fc" stroke-width="6" stroke-linecap="round" opacity="0.85" />
      <path d="M ${cx + 22} ${cy - 36} C ${cx + 26} ${cy - 12}, ${cx + 18} ${cy + 10}, ${cx + 25} ${cy + 32}" 
            fill="none" stroke="#7dd3fc" stroke-width="6" stroke-linecap="round" opacity="0.85" />

      <!-- Granular Texture Dots: Ribosomes on Rough ER (Tekstur Kasar Berbintik Ribosom) -->
      <g>
        <!-- Top fold ribosomes -->
        <circle cx="${cx - 42}" cy="${cy - 35}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 34}" cy="${cy - 38}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 25}" cy="${cy - 32}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 16}" cy="${cy - 38}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 6}" cy="${cy - 44}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 5}" cy="${cy - 42}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 15}" cy="${cy - 45}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 26}" cy="${cy - 38}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />

        <!-- Mid fold ribosomes -->
        <circle cx="${cx - 48}" cy="${cy - 14}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 38}" cy="${cy - 18}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 28}" cy="${cy - 12}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 18}" cy="${cy - 16}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 8}" cy="${cy - 10}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 2}" cy="${cy - 15}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 14}" cy="${cy - 8}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 26}" cy="${cy - 14}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 38}" cy="${cy - 10}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 48}" cy="${cy - 4}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />

        <!-- Lower fold ribosomes -->
        <circle cx="${cx - 50}" cy="${cy + 8}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 38}" cy="${cy + 6}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 28}" cy="${cy + 12}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 16}" cy="${cy + 8}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 4}" cy="${cy + 15}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 8}" cy="${cy + 12}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 20}" cy="${cy + 18}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 32}" cy="${cy + 14}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 44}" cy="${cy + 18}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />

        <!-- Bottom fold ribosomes -->
        <circle cx="${cx - 45}" cy="${cy + 28}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 30}" cy="${cy + 34}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx - 15}" cy="${cy + 28}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx}" cy="${cy + 35}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 16}" cy="${cy + 32}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 32}" cy="${cy + 38}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
        <circle cx="${cx + 48}" cy="${cy + 30}" r="2.8" fill="url(#ribosomeGrad)" stroke="#082f49" stroke-width="0.8" />
      </g>

      <!-- Glossy 3D Highlight Reflections on Curved Ridge Sheets -->
      <path d="M ${cx - 45} ${cy - 42} Q ${cx - 10} ${cy - 52}, ${cx + 25} ${cy - 44}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.65" />
      <path d="M ${cx - 40} ${cy - 20} Q ${cx} ${cy - 12}, ${cx + 40} ${cy - 22}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
      <path d="M ${cx - 35} ${cy + 4} Q ${cx} ${cy + 14}, ${cx + 38} ${cy + 6}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.55" />
    </g>
  `);
}

// 4. MITOKONDRIA
function getMitochondriaSvg() {
  const cx = 120;
  const cy = 115;
  return wrapCard(`
    <!-- Soft Ground Shadow for 3D depth -->
    <ellipse cx="${cx}" cy="${cy + 70}" rx="74" ry="18" fill="#0f172a" opacity="0.10" filter="url(#organelleGroundShadow)" />

    <!-- Rotated 3D Capsule (Bentuk Oval / Kapsul Membran Ganda) -->
    <g transform="rotate(-24, ${cx}, ${cy})">
      <!-- Outer Capsule Shell (Smooth outer membrane) -->
      <rect x="${cx - 72}" y="${cy - 36}" width="144" height="72" rx="36" fill="url(#mitoOuterGrad)" stroke="#7f1d1d" stroke-width="3" />

      <!-- Cutaway Window: Inner Mitochondrial Space & Matrix -->
      <rect x="${cx - 60}" y="${cy - 27}" width="120" height="54" rx="27" fill="url(#mitoMatrixGrad)" stroke="#b91c1c" stroke-width="2" />

      <!-- Folded Inner Membrane Cristae (Lipatan Membran Dalam Bergelombang Seperti Jari-Jari) -->
      <!-- Crista 1 (Left top) -->
      <path d="M ${cx - 46} ${cy - 27} 
               C ${cx - 44} ${cy - 8}, ${cx - 36} ${cy - 2}, ${cx - 32} ${cy + 6}
               C ${cx - 38} ${cy + 18}, ${cx - 44} ${cy + 22}, ${cx - 46} ${cy + 27}" 
            fill="none" stroke="url(#cristaeGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Crista 2 (Bottom left finger projecting upward) -->
      <path d="M ${cx - 24} ${cy + 27} 
               C ${cx - 22} ${cy + 6}, ${cx - 16} ${cy - 2}, ${cx - 18} ${cy - 16}
               C ${cx - 22} ${cy - 22}, ${cx - 24} ${cy - 24}, ${cx - 24} ${cy - 27}" 
            fill="none" stroke="url(#cristaeGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Crista 3 (Center top finger projecting downward) -->
      <path d="M ${cx - 4} ${cy - 27} 
               C ${cx - 2} ${cy - 6}, ${cx + 6} ${cy + 2}, ${cx + 4} ${cy + 18}
               C ${cx + 2} ${cy + 24}, ${cx - 2} ${cy + 26}, ${cx - 4} ${cy + 27}" 
            fill="none" stroke="url(#cristaeGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Crista 4 (Bottom right finger projecting upward) -->
      <path d="M ${cx + 18} ${cy + 27} 
               C ${cx + 20} ${cy + 8}, ${cx + 26} ${cy - 2}, ${cx + 24} ${cy - 16}
               C ${cx + 20} ${cy - 22}, ${cx + 18} ${cy - 25}, ${cx + 18} ${cy - 27}" 
            fill="none" stroke="url(#cristaeGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Crista 5 (Far right finger wave) -->
      <path d="M ${cx + 38} ${cy - 27} 
               C ${cx + 40} ${cy - 8}, ${cx + 46} ${cy - 2}, ${cx + 44} ${cy + 12}
               C ${cx + 42} ${cy + 20}, ${cx + 38} ${cy + 24}, ${cx + 38} ${cy + 27}" 
            fill="none" stroke="url(#cristaeGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Sleek Glossy Specular Highlight along outer capsule dome -->
      <path d="M ${cx - 55} ${cy - 30} 
               C ${cx - 20} ${cy - 36}, ${cx + 20} ${cy - 36}, ${cx + 55} ${cy - 30}
               C ${cx + 25} ${cy - 27}, ${cx - 25} ${cy - 27}, ${cx - 55} ${cy - 30} Z" 
            fill="#ffffff" opacity="0.6" />
      <circle cx="${cx + 56}" cy="${cy - 18}" r="4.5" fill="#ffffff" opacity="0.65" />
    </g>
  `);
}

// 5. MEMBRAN SEL (Phospholipid Bilayer & Transmembrane Protein)
function getMembraneSvg() {
  const cx = 120;
  const cy = 115;
  return wrapCard(`
    <!-- Soft Ground Shadow for 3D depth -->
    <ellipse cx="${cx}" cy="${cy + 70}" rx="75" ry="18" fill="#0f172a" opacity="0.10" filter="url(#organelleGroundShadow)" />

    <g>
      <!-- Translucent Fluid Cytoplasm Background (Warna hijau muda transparan) -->
      <rect x="22" y="${cy - 48}" width="196" height="96" rx="20" fill="#dcfce7" opacity="0.45" stroke="#86efac" stroke-width="1.5" stroke-dasharray="4 3" />

      <!-- Phospholipid Bilayer Structure (Dua Baris Molekul dengan Kepala Bulat & Ekor Bergelombang) -->

      <!-- TOP ROW: Phospholipid Heads & Tails pointing DOWNWARD -->
      ${[35, 52, 69, 142, 159, 176, 193].map(x => `
        <!-- Dual wavy hydrophobic tails -->
        <path d="M ${x - 3} ${cy - 26} Q ${x - 6} ${cy - 14}, ${x - 2} ${cy - 2}" fill="none" stroke="url(#tailGrad)" stroke-width="2" stroke-linecap="round" />
        <path d="M ${x + 3} ${cy - 26} Q ${x + 6} ${cy - 14}, ${x + 2} ${cy - 2}" fill="none" stroke="url(#tailGrad)" stroke-width="2" stroke-linecap="round" />
        <!-- Hydrophilic Phosphate Head (Kepala Bulat) -->
        <circle cx="${x}" cy="${cy - 32}" r="7.5" fill="url(#lipidHeadGrad)" stroke="#15803d" stroke-width="1.5" />
        <circle cx="${x - 2.5}" cy="${cy - 34.5}" r="2" fill="#ffffff" opacity="0.7" />
      `).join('')}

      <!-- BOTTOM ROW: Phospholipid Heads & Tails pointing UPWARD -->
      ${[35, 52, 69, 142, 159, 176, 193].map(x => `
        <!-- Dual wavy hydrophobic tails -->
        <path d="M ${x - 3} ${cy + 26} Q ${x - 6} ${cy + 14}, ${x - 2} ${cy + 2}" fill="none" stroke="url(#tailGrad)" stroke-width="2" stroke-linecap="round" />
        <path d="M ${x + 3} ${cy + 26} Q ${x + 6} ${cy + 14}, ${x + 2} ${cy + 2}" fill="none" stroke="url(#tailGrad)" stroke-width="2" stroke-linecap="round" />
        <!-- Hydrophilic Phosphate Head (Kepala Bulat) -->
        <circle cx="${x}" cy="${cy + 32}" r="7.5" fill="url(#lipidHeadGrad)" stroke="#15803d" stroke-width="1.5" />
        <circle cx="${x - 2.5}" cy="${cy + 29.5}" r="2" fill="#ffffff" opacity="0.7" />
      `).join('')}

      <!-- INTEGRAL TRANSMEMBRANE PROTEIN CHANNEL (Protein Transmembran Tertanam di Antara Lapisan) -->
      <!-- Left Subunit of Channel -->
      <path d="M ${cx - 28} ${cy - 42} 
               C ${cx - 36} ${cy - 25}, ${cx - 38} ${cy + 25}, ${cx - 26} ${cy + 42}
               C ${cx - 14} ${cy + 42}, ${cx - 10} ${cy + 25}, ${cx - 12} ${cy}
               C ${cx - 10} ${cy - 25}, ${cx - 14} ${cy - 42}, ${cx - 28} ${cy - 42} Z" 
            fill="url(#proteinGrad)" stroke="#1e3a8a" stroke-width="2" />

      <!-- Right Subunit of Channel -->
      <path d="M ${cx + 28} ${cy - 42} 
               C ${cx + 36} ${cy - 25}, ${cx + 38} ${cy + 25}, ${cx + 26} ${cy + 42}
               C ${cx + 14} ${cy + 42}, ${cx + 10} ${cy + 25}, ${cx + 12} ${cy}
               C ${cx + 10} ${cy - 25}, ${cx + 14} ${cy - 42}, ${cx + 28} ${cy - 42} Z" 
            fill="url(#proteinGrad)" stroke="#1e3a8a" stroke-width="2" />

      <!-- Central Pore Tunnel Through Membrane (Kanal Porus) -->
      <ellipse cx="${cx}" cy="${cy - 38}" rx="12" ry="5.5" fill="url(#proteinPoreGrad)" stroke="#1e40af" stroke-width="1.5" />
      <ellipse cx="${cx}" cy="${cy + 38}" rx="12" ry="5.5" fill="url(#proteinPoreGrad)" stroke="#1e40af" stroke-width="1.5" />

      <!-- Peripheral Carbohydrate Glycoprotein Antenna (Rantai Glikoprotein) -->
      <path d="M ${cx - 22} ${cy - 42} Q ${cx - 30} ${cy - 55}, ${cx - 24} ${cy - 64}" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="${cx - 24}" cy="${cy - 64}" r="4" fill="#86efac" stroke="#15803d" stroke-width="1.2" />
      <circle cx="${cx - 30}" cy="${cy - 55}" r="3.5" fill="#4ade80" stroke="#15803d" stroke-width="1.2" />

      <!-- Glossy 3D Highlight Reflections on Protein and Lipid heads -->
      <path d="M ${cx - 28} ${cy - 36} C ${cx - 33} ${cy - 20}, ${cx - 34} ${cy + 10}, ${cx - 26} ${cy + 32}" 
            fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
      <path d="M ${cx + 28} ${cy - 36} C ${cx + 33} ${cy - 20}, ${cx + 34} ${cy + 10}, ${cx + 26} ${cy + 32}" 
            fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.5" />
    </g>
  `);
}

// Generate all 5 files as SVG and PNG
async function run() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const organelles = [
    { name: 'organelle_nucleus', svg: getNucleusSvg() },
    { name: 'organelle_golgi', svg: getGolgiSvg() },
    { name: 'organelle_endoplasmic', svg: getEndoplasmicReticulumSvg() },
    { name: 'organelle_mitochondria', svg: getMitochondriaSvg() },
    { name: 'organelle_membrane', svg: getMembraneSvg() }
  ];

  for (const org of organelles) {
    const svgPath = path.join(assetsDir, `${org.name}.svg`);
    const pngPath = path.join(assetsDir, `${org.name}.png`);

    fs.writeFileSync(svgPath, org.svg, 'utf8');

    // Render high resolution PNG
    const resvg = new Resvg(org.svg, {
      fitTo: { mode: 'width', value: 240 }
    });
    const pngBuffer = resvg.render().asPng();
    fs.writeFileSync(pngPath, pngBuffer);
    console.log(`Generated ${org.name}.svg and ${org.name}.png (${pngBuffer.length} bytes)`);
  }

  // Also update public/media_manifest.json
  const manifestPath = path.join(process.cwd(), 'public', 'media_manifest.json');
  let manifest = { updatedAt: new Date().toISOString(), items: {} };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      console.error(e);
    }
  }

  for (const org of organelles) {
    const pngFile = `${org.name}.png`;
    const fullPngPath = path.join(assetsDir, pngFile);
    const stat = fs.statSync(fullPngPath);
    manifest.items[org.name] = {
      key: org.name,
      filename: pngFile,
      url: `/assets/${pngFile}`,
      updatedAt: new Date().toISOString(),
      size: stat.size,
      mimeType: 'image/png'
    };
    manifest.items[`__MEDIA__${pngFile}`] = {
      key: `__MEDIA__${pngFile}`,
      filename: pngFile,
      url: `/assets/${pngFile}`,
      updatedAt: new Date().toISOString(),
      size: stat.size,
      mimeType: 'image/png'
    };
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Updated public/media_manifest.json with the 5 scientific organelles successfully.');
}

run().catch(console.error);
