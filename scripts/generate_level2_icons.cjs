const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// 8 Organelles SVG definitions with 3D isometric Township/Hay Day style
function getOrganelleSvg(index, size = 160) {
  const cx = size / 2;
  const cy = size / 2;

  switch (index) {
    case 0: // 1. Nukleus — bola ungu gelap dengan tekstur benang kromatin melingkar halus di dalamnya
      return `
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="${cy + 52}" rx="46" ry="14" fill="#0f172a" opacity="0.14" filter="url(#shadowBlur)" />
        
        <!-- Outer Sphere -->
        <circle cx="${cx}" cy="${cy}" r="46" fill="url(#nucleusGrad)" stroke="#4c1d95" stroke-width="2.5" />
        
        <!-- Nuclear Pores on rim -->
        <circle cx="${cx - 36}" cy="${cy - 16}" r="2" fill="#3b0764" opacity="0.7" />
        <circle cx="${cx - 40}" cy="${cy + 8}" r="2" fill="#3b0764" opacity="0.7" />
        <circle cx="${cx + 34}" cy="${cy - 18}" r="2" fill="#3b0764" opacity="0.7" />
        <circle cx="${cx + 38}" cy="${cy + 10}" r="2" fill="#3b0764" opacity="0.7" />
        <circle cx="${cx - 12}" cy="${cy + 40}" r="2" fill="#3b0764" opacity="0.7" />
        <circle cx="${cx + 16}" cy="${cy + 38}" r="2" fill="#3b0764" opacity="0.7" />

        <!-- Cutaway / Chromatin Core Window -->
        <circle cx="${cx}" cy="${cy + 2}" r="32" fill="url(#coreGrad)" stroke="#6b21a8" stroke-width="2" />
        
        <!-- Coiled Chromatin Threads -->
        <path d="M ${cx - 20} ${cy - 12} C ${cx - 10} ${cy - 22}, ${cx + 14} ${cy - 20}, ${cx + 18} ${cy - 8} C ${cx + 22} ${cy + 4}, ${cx + 10} ${cy + 16}, ${cx - 4} ${cy + 14} C ${cx - 18} ${cy + 12}, ${cx - 16} ${cy - 2}, ${cx - 2} ${cy - 4} C ${cx + 10} ${cy - 6}, ${cx + 12} ${cy + 6}, ${cx + 2} ${cy + 6}" 
              fill="none" stroke="#e9d5ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
        <path d="M ${cx - 14} ${cy + 8} C ${cx - 8} ${cy + 20}, ${cx + 12} ${cy + 20}, ${cx + 16} ${cy + 10}" 
              fill="none" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round" />
        
        <!-- Nucleolus (Dense Inner Ball) -->
        <circle cx="${cx - 2}" cy="${cy + 2}" r="11" fill="url(#nucleolusGrad)" stroke="#3b0764" stroke-width="1.5" />
        <circle cx="${cx - 5}" cy="${cy - 1}" r="3" fill="#ffffff" opacity="0.6" />

        <!-- Glossy Specular Highlights -->
        <path d="M ${cx - 30} ${cy - 28} C ${cx - 24} ${cy - 38}, ${cx - 6} ${cy - 42}, ${cx + 8} ${cy - 40} C ${cx - 2} ${cy - 36}, ${cx - 18} ${cy - 32}, ${cx - 26} ${cy - 20} Z" 
              fill="#ffffff" opacity="0.55" />
        <circle cx="${cx + 16}" cy="${cy - 34}" r="3" fill="#ffffff" opacity="0.45" />
      `;

    case 1: // 2. Mitokondria — bentuk oval memanjang warna oranye-merah dengan lipatan membran dalam (krista) bergelombang
      return `
        <!-- Shadow -->
        <ellipse cx="${cx + 2}" cy="${cy + 50}" rx="50" ry="14" fill="#0f172a" opacity="0.14" filter="url(#shadowBlur)" />

        <!-- Outer Capsule (Isometric Angled Bean) -->
        <g transform="rotate(-26, ${cx}, ${cy})">
          <rect x="${cx - 48}" y="${cy - 24}" width="96" height="48" rx="24" fill="url(#mitoOuterGrad)" stroke="#9a3412" stroke-width="2.5" />
          
          <!-- Inner Matrix Window -->
          <rect x="${cx - 40}" y="${cy - 18}" width="80" height="36" rx="18" fill="url(#mitoInnerGrad)" stroke="#c2410c" stroke-width="1.5" />
          
          <!-- Wavy Cristae Folds (Alternating Ribbon Ridges) -->
          <path d="M ${cx - 32} ${cy - 18} Q ${cx - 30} ${cy - 4}, ${cx - 24} ${cy + 2} Q ${cx - 28} ${cy + 14}, ${cx - 32} ${cy + 18}" 
                fill="none" stroke="#fef08a" stroke-width="4" stroke-linecap="round" />
          <path d="M ${cx - 16} ${cy + 18} Q ${cx - 14} ${cy + 2}, ${cx - 8} ${cy - 6} Q ${cx - 12} ${cy - 14}, ${cx - 16} ${cy - 18}" 
                fill="none" stroke="#fde047" stroke-width="4" stroke-linecap="round" />
          <path d="M ${cx} ${cy - 18} Q ${cx + 2} ${cy - 4}, ${cx + 8} ${cy + 2} Q ${cx + 4} ${cy + 14}, ${cx} ${cy + 18}" 
                fill="none" stroke="#fef08a" stroke-width="4" stroke-linecap="round" />
          <path d="M ${cx + 16} ${cy + 18} Q ${cx + 18} ${cy + 2}, ${cx + 24} ${cy - 6} Q ${cx + 20} ${cy - 14}, ${cx + 16} ${cy - 18}" 
                fill="none" stroke="#fde047" stroke-width="4" stroke-linecap="round" />
          <path d="M ${cx + 30} ${cy - 18} Q ${cx + 32} ${cy - 4}, ${cx + 34} ${cy + 4}" 
                fill="none" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round" />

          <!-- Glossy Edge Highlights -->
          <path d="M ${cx - 40} ${cy - 20} Q ${cx} ${cy - 24}, ${cx + 40} ${cy - 20} Q ${cx} ${cy - 18}, ${cx - 40} ${cy - 20} Z" 
                fill="#ffffff" opacity="0.5" />
        </g>
      `;

    case 2: // 3. Kloroplas — bentuk oval hijau dengan lapisan tumpukan kecil (grana) berwarna hijau tua di dalamnya
      return `
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="${cy + 50}" rx="48" ry="14" fill="#0f172a" opacity="0.14" filter="url(#shadowBlur)" />

        <!-- Outer Oval Capsule (Green Lens) -->
        <ellipse cx="${cx}" cy="${cy}" rx="48" ry="34" fill="url(#chloroOuterGrad)" stroke="#14532d" stroke-width="2.5" />
        
        <!-- Inner Stroma Window -->
        <ellipse cx="${cx}" cy="${cy}" rx="40" ry="26" fill="url(#chloroInnerGrad)" stroke="#15803d" stroke-width="1.5" />

        <!-- Stroma Lamellae Connecting Strands -->
        <path d="M ${cx - 24} ${cy} L ${cx} ${cy - 4} L ${cx + 24} ${cy + 2}" stroke="#86efac" stroke-width="2" opacity="0.7" />
        <path d="M ${cx - 24} ${cy + 8} L ${cx} ${cy + 6} L ${cx + 24} ${cy + 10}" stroke="#86efac" stroke-width="2" opacity="0.7" />

        <!-- Grana Stacks (Coin / Thylakoid Discs) -->
        <!-- Stack 1 (Left) -->
        <g transform="translate(${cx - 24}, ${cy})">
          <ellipse cx="0" cy="-8" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="-3" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="2" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="7" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="12" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="-8" rx="5" ry="1.8" fill="#4ade80" opacity="0.5" />
        </g>

        <!-- Stack 2 (Center) -->
        <g transform="translate(${cx}, ${cy - 2})">
          <ellipse cx="0" cy="-10" rx="9" ry="3.5" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="-5" rx="9" ry="3.5" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="0" rx="9" ry="3.5" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="5" rx="9" ry="3.5" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="10" rx="9" ry="3.5" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="-10" rx="6" ry="2" fill="#4ade80" opacity="0.6" />
        </g>

        <!-- Stack 3 (Right) -->
        <g transform="translate(${cx + 24}, ${cy + 2})">
          <ellipse cx="0" cy="-8" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="-3" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="2" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="7" rx="8" ry="3.2" fill="#14532d" stroke="#166534" stroke-width="0.8" />
          <ellipse cx="0" cy="-8" rx="5" ry="1.8" fill="#4ade80" opacity="0.5" />
        </g>

        <!-- Glossy Highlight Curve -->
        <path d="M ${cx - 36} ${cy - 20} Q ${cx} ${cy - 30}, ${cx + 36} ${cy - 20} Q ${cx} ${cy - 24}, ${cx - 36} ${cy - 20} Z" 
              fill="#ffffff" opacity="0.55" />
      `;

    case 3: // 4. Aparatus Golgi — tumpukan lapisan melengkung berwarna biru muda seperti tumpukan pita/kantung pipih
      return `
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="${cy + 52}" rx="46" ry="13" fill="#0f172a" opacity="0.13" filter="url(#shadowBlur)" />

        <!-- 4 Curved Stacked Cisternae Ribbons -->
        <!-- Layer 1 (Bottom/Trans face) -->
        <path d="M ${cx - 34} ${cy + 28} C ${cx - 20} ${cy + 34}, ${cx + 20} ${cy + 34}, ${cx + 34} ${cy + 28} C ${cx + 38} ${cy + 24}, ${cx + 38} ${cy + 20}, ${cx + 32} ${cy + 18} C ${cx + 18} ${cy + 24}, ${cx - 18} ${cy + 24}, ${cx - 32} ${cy + 18} C ${cx - 38} ${cy + 20}, ${cx - 38} ${cy + 24}, ${cx - 34} ${cy + 28} Z" 
              fill="url(#golgiGrad1)" stroke="#0369a1" stroke-width="2" />
        
        <!-- Layer 2 -->
        <path d="M ${cx - 38} ${cy + 14} C ${cx - 24} ${cy + 20}, ${cx + 24} ${cy + 20}, ${cx + 38} ${cy + 14} C ${cx + 42} ${cy + 10}, ${cx + 42} ${cy + 6}, ${cx + 36} ${cy + 4} C ${cx + 20} ${cy + 10}, ${cx - 20} ${cy + 10}, ${cx - 36} ${cy + 4} C ${cx - 42} ${cy + 6}, ${cx - 42} ${cy + 10}, ${cx - 38} ${cy + 14} Z" 
              fill="url(#golgiGrad2)" stroke="#0284c7" stroke-width="2" />

        <!-- Layer 3 -->
        <path d="M ${cx - 36} ${cy - 2} C ${cx - 22} ${cy + 6}, ${cx + 22} ${cy + 6}, ${cx + 36} ${cy - 2} C ${cx + 40} ${cy - 6}, ${cx + 40} ${cy - 10}, ${cx + 34} ${cy - 12} C ${cx + 18} ${cy - 6}, ${cx - 18} ${cy - 6}, ${cx - 34} ${cy - 12} C ${cx - 40} ${cy - 10}, ${cx - 40} ${cy - 6}, ${cx - 36} ${cy - 2} Z" 
              fill="url(#golgiGrad3)" stroke="#0ea5e9" stroke-width="2" />

        <!-- Layer 4 (Top/Cis face) -->
        <path d="M ${cx - 32} ${cy - 16} C ${cx - 18} ${cy - 8}, ${cx + 18} ${cy - 8}, ${cx + 32} ${cy - 16} C ${cx + 36} ${cy - 20}, ${cx + 36} ${cy - 24}, ${cx + 30} ${cy - 26} C ${cx + 16} ${cy - 20}, ${cx - 16} ${cy - 20}, ${cx - 30} ${cy - 26} C ${cx - 36} ${cy - 24}, ${cx - 36} ${cy - 20}, ${cx - 32} ${cy - 16} Z" 
              fill="url(#golgiGrad4)" stroke="#38bdf8" stroke-width="2" />

        <!-- Budding Secretory Vesicles -->
        <circle cx="${cx - 42}" cy="${cy + 24}" r="5.5" fill="url(#vesicleGrad)" stroke="#0284c7" stroke-width="1.5" />
        <circle cx="${cx - 40}" cy="${cy - 18}" r="4.5" fill="url(#vesicleGrad)" stroke="#0284c7" stroke-width="1.5" />
        <circle cx="${cx + 42}" cy="${cy + 22}" r="5.5" fill="url(#vesicleGrad)" stroke="#0284c7" stroke-width="1.5" />
        <circle cx="${cx + 40}" cy="${cy - 16}" r="4.5" fill="url(#vesicleGrad)" stroke="#0284c7" stroke-width="1.5" />
        <circle cx="${cx + 28}" cy="${cy + 38}" r="4" fill="url(#vesicleGrad)" stroke="#0284c7" stroke-width="1.5" />

        <!-- Glossy Ribbon Highlights -->
        <path d="M ${cx - 24} ${cy - 24} Q ${cx} ${cy - 16}, ${cx + 24} ${cy - 24}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.65" />
        <path d="M ${cx - 28} ${cy - 10} Q ${cx} ${cy - 2}, ${cx + 28} ${cy - 10}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.55" />
      `;

    case 4: // 5. Lisosom — bulatan kecil berwarna kuning dengan tekstur granular di permukaannya
      return `
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="${cy + 48}" rx="42" ry="13" fill="#0f172a" opacity="0.14" filter="url(#shadowBlur)" />

        <!-- Main Golden-Yellow Sphere -->
        <circle cx="${cx}" cy="${cy}" r="42" fill="url(#lysoGrad)" stroke="#b45309" stroke-width="2.5" />

        <!-- Granular Texture Spots / Enzymes -->
        <g fill="#d97706" opacity="0.55">
          <circle cx="${cx - 16}" cy="${cy - 14}" r="3" />
          <circle cx="${cx - 8}" cy="${cy - 24}" r="2" />
          <circle cx="${cx + 12}" cy="${cy - 18}" r="3.5" />
          <circle cx="${cx - 24}" cy="${cy + 4}" r="3" />
          <circle cx="${cx - 10}" cy="${cy + 12}" r="4" />
          <circle cx="${cx + 6}" cy="${cy + 6}" r="3.5" />
          <circle cx="${cx + 22}" cy="${cy - 4}" r="2.5" />
          <circle cx="${cx + 18}" cy="${cy + 18}" r="3.5" />
          <circle cx="${cx - 4}" cy="${cy + 26}" r="3" />
          <circle cx="${cx - 18}" cy="${cy + 22}" r="2.5" />
          <circle cx="${cx + 8}" cy="${cy + 28}" r="2" />
        </g>
        <g fill="#fef08a" opacity="0.75">
          <circle cx="${cx - 17}" cy="${cy - 15}" r="1.5" />
          <circle cx="${cx + 11}" cy="${cy - 19}" r="1.5" />
          <circle cx="${cx - 11}" cy="${cy + 11}" r="2" />
          <circle cx="${cx + 5}" cy="${cy + 5}" r="1.8" />
        </g>

        <!-- Big Glossy Specular Reflection -->
        <path d="M ${cx - 26} ${cy - 24} C ${cx - 20} ${cy - 34}, ${cx - 4} ${cy - 38}, ${cx + 8} ${cy - 36} C ${cx - 2} ${cy - 32}, ${cx - 16} ${cy - 28}, ${cx - 22} ${cy - 16} Z" 
              fill="#ffffff" opacity="0.65" />
        <circle cx="${cx + 16}" cy="${cy - 30}" r="3.5" fill="#ffffff" opacity="0.5" />
      `;

    case 5: // 6. Ribosom — bintik-bintik kecil bulat berwarna ungu muda berkelompok seperti titik-titik kecil menyatu
      return `
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="${cy + 48}" rx="46" ry="14" fill="#0f172a" opacity="0.14" filter="url(#shadowBlur)" />

        <!-- Cluster of Lavender-Purple 3D Spheres (Subunits) -->
        <g stroke="#6b21a8" stroke-width="1.5">
          <!-- Back layer dots -->
          <circle cx="${cx - 24}" cy="${cy - 8}" r="12" fill="url(#riboGradDark)" />
          <circle cx="${cx + 22}" cy="${cy - 10}" r="13" fill="url(#riboGradDark)" />
          <circle cx="${cx - 12}" cy="${cy + 20}" r="11" fill="url(#riboGradDark)" />
          <circle cx="${cx + 18}" cy="${cy + 18}" r="12" fill="url(#riboGradDark)" />

          <!-- Center Large Ribosomal Subunit (50S/60S) -->
          <circle cx="${cx - 6}" cy="${cy - 12}" r="18" fill="url(#riboGrad)" />
          <circle cx="${cx + 10}" cy="${cy + 2}" r="16" fill="url(#riboGrad)" />

          <!-- Small Ribosomal Subunit (30S/40S) -->
          <circle cx="${cx - 16}" cy="${cy + 6}" r="14" fill="url(#riboGradLight)" />
          <circle cx="${cx + 2}" cy="${cy + 20}" r="13" fill="url(#riboGradLight)" />

          <!-- Surrounding active micro-dots -->
          <circle cx="${cx - 30}" cy="${cy + 14}" r="6.5" fill="url(#riboGradLight)" />
          <circle cx="${cx + 32}" cy="${cy + 4}" r="7" fill="url(#riboGradLight)" />
          <circle cx="${cx - 2}" cy="${cy - 28}" r="7.5" fill="url(#riboGradLight)" />
          <circle cx="${cx + 18}" cy="${cy - 24}" r="6" fill="url(#riboGradLight)" />
        </g>

        <!-- Specular shine on each dot -->
        <circle cx="${cx - 10}" cy="${cy - 18}" r="4" fill="#ffffff" opacity="0.7" />
        <circle cx="${cx + 6}" cy="${cy - 4}" r="3.5" fill="#ffffff" opacity="0.7" />
        <circle cx="${cx - 19}" cy="${cy + 2}" r="3" fill="#ffffff" opacity="0.65" />
        <circle cx="${cx}" cy="${cy + 15}" r="3" fill="#ffffff" opacity="0.65" />
        <circle cx="${cx - 26}" cy="${cy - 12}" r="2" fill="#ffffff" opacity="0.6" />
        <circle cx="${cx + 20}" cy="${cy - 14}" r="2.5" fill="#ffffff" opacity="0.6" />
      `;

    case 6: // 7. Membran Sel — garis bergelombang tipis berwarna biru muda transparan membentuk lingkaran pembatas
      return `
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="${cy + 50}" rx="48" ry="14" fill="#0f172a" opacity="0.14" filter="url(#shadowBlur)" />

        <!-- Translucent Cytoplasm Base Fill -->
        <circle cx="${cx}" cy="${cy}" r="44" fill="url(#membraneInnerGlow)" opacity="0.35" />

        <!-- Double Wavy Bilayer Boundary Ring -->
        <!-- Outer Undulating Wave -->
        <path d="M ${cx + 46} ${cy} 
                 C ${cx + 46} ${cy + 18}, ${cx + 32} ${cy + 36}, ${cx + 14} ${cy + 44}
                 C ${cx - 4} ${cy + 48}, ${cx - 24} ${cy + 42}, ${cx - 38} ${cy + 28}
                 C ${cx - 48} ${cy + 14}, ${cx - 46} ${cy - 8}, ${cx - 36} ${cy - 26}
                 C ${cx - 24} ${cy - 40}, ${cx - 6} ${cy - 46}, ${cx + 16} ${cy - 44}
                 C ${cx + 34} ${cy - 40}, ${cx + 46} ${cy - 18}, ${cx + 46} ${cy} Z" 
              fill="none" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />

        <!-- Inner Complementary Wave -->
        <path d="M ${cx + 38} ${cy} 
                 C ${cx + 38} ${cy + 14}, ${cx + 26} ${cy + 30}, ${cx + 12} ${cy + 36}
                 C ${cx - 2} ${cy + 40}, ${cx - 20} ${cy + 34}, ${cx - 30} ${cy + 22}
                 C ${cx - 40} ${cy + 10}, ${cx - 38} ${cy - 6}, ${cx - 30} ${cy - 20}
                 C ${cx - 20} ${cy - 32}, ${cx - 4} ${cy - 38}, ${cx + 14} ${cy - 36}
                 C ${cx + 28} ${cy - 32}, ${cx + 38} ${cy - 14}, ${cx + 38} ${cy} Z" 
              fill="none" stroke="#7dd3fc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />

        <!-- Phospholipid Spherical Beadlets along the Ring -->
        <g fill="#bae6fd" stroke="#0284c7" stroke-width="1">
          <circle cx="${cx - 42}" cy="${cy - 8}" r="3.2" />
          <circle cx="${cx - 34}" cy="${cy - 24}" r="3.2" />
          <circle cx="${cx - 18}" cy="${cy - 36}" r="3.2" />
          <circle cx="${cx}" cy="${cy - 42}" r="3.2" />
          <circle cx="${cx + 18}" cy="${cy - 38}" r="3.2" />
          <circle cx="${cx + 34}" cy="${cy - 26}" r="3.2" />
          <circle cx="${cx + 43}" cy="${cy - 8}" r="3.2" />
          <circle cx="${cx + 41}" cy="${cy + 12}" r="3.2" />
          <circle cx="${cx + 30}" cy="${cy + 28}" r="3.2" />
          <circle cx="${cx + 14}" cy="${cy + 38}" r="3.2" />
          <circle cx="${cx - 4}" cy="${cy + 41}" r="3.2" />
          <circle cx="${cx - 22}" cy="${cy + 36}" r="3.2" />
          <circle cx="${cx - 36}" cy="${cy + 22}" r="3.2" />
        </g>

        <!-- Transport Protein Canal / Gate Block in Membrane -->
        <rect x="${cx - 7}" y="${cy - 45}" width="14" height="10" rx="3" fill="#f59e0b" stroke="#b45309" stroke-width="1" />
        <rect x="${cx - 7}" y="${cy + 35}" width="14" height="10" rx="3" fill="#10b981" stroke="#047857" stroke-width="1" />

        <!-- Glossy Specular Arc -->
        <path d="M ${cx - 28} ${cy - 32} C ${cx - 14} ${cy - 40}, ${cx + 14} ${cy - 40}, ${cx + 28} ${cy - 32}" 
              stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8" />
      `;

    case 7: // 8. Vakuola — bentuk gelembung besar bulat transparan kebiruan dengan sedikit highlight cahaya di permukaannya
      return `
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="${cy + 52}" rx="46" ry="14" fill="#0f172a" opacity="0.14" filter="url(#shadowBlur)" />

        <!-- Liquid Bubble Base -->
        <circle cx="${cx}" cy="${cy}" r="45" fill="url(#vacuoleBodyGrad)" stroke="#0284c7" stroke-width="2.5" />

        <!-- Internal Liquid Horizon / Meniscus Glow -->
        <path d="M ${cx - 42} ${cy + 10} Q ${cx} ${cy + 24}, ${cx + 42} ${cy + 10} A 45 45 0 0 1 ${cx - 42} ${cy + 10} Z" 
              fill="url(#vacuoleWaterGrad)" opacity="0.55" />

        <!-- Inner Caustic Light Refraction Ring -->
        <ellipse cx="${cx}" cy="${cy + 26}" rx="28" ry="10" fill="#ffffff" opacity="0.25" filter="url(#glowBlur)" />

        <!-- Twin Specular Highlights (Bubble Shine) -->
        <!-- Primary Top-Left Crescent Glow -->
        <path d="M ${cx - 28} ${cy - 24} C ${cx - 20} ${cy - 36}, ${cx - 4} ${cy - 40}, ${cx + 12} ${cy - 38} C ${cx} ${cy - 34}, ${cx - 16} ${cy - 30}, ${cx - 22} ${cy - 18} Z" 
              fill="#ffffff" opacity="0.75" />
        
        <!-- Small Secondary Dot -->
        <circle cx="${cx + 22}" cy="${cy - 28}" r="4" fill="#ffffff" opacity="0.6" />
        
        <!-- Bottom-Right Secondary Rim Bounce Light -->
        <path d="M ${cx + 14} ${cy + 34} C ${cx + 26} ${cy + 28}, ${cx + 34} ${cy + 18}, ${cx + 38} ${cy + 6}" 
              stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.45" />
      `;

    default:
      return '';
  }
}

// Generate the master 8-icon horizontal showcase SVG
function generateMasterSvg() {
  const width = 1600;
  const height = 360;
  const cardWidth = 166;
  const cardHeight = 260;
  const cardRadius = 24;
  const totalCards = 8;
  const marginX = (width - (totalCards * cardWidth)) / (totalCards + 1);

  let cardsSvg = '';

  for (let i = 0; i < totalCards; i++) {
    const cardX = marginX + i * (cardWidth + marginX);
    const cardY = (height - cardHeight) / 2;
    const iconSize = 160;
    const iconX = cardX + (cardWidth - iconSize) / 2;
    const iconY = cardY + (cardHeight - iconSize) / 2 - 4;

    cardsSvg += `
      <!-- Card Container ${i + 1} -->
      <g id="card-${i}">
        <!-- Subtle Card Drop Shadow -->
        <rect x="${cardX + 2}" y="${cardY + 8}" width="${cardWidth}" height="${cardHeight}" rx="${cardRadius}" 
              fill="#0f172a" opacity="0.07" filter="url(#cardShadowBlur)" />
        <rect x="${cardX}" y="${cardY + 3}" width="${cardWidth}" height="${cardHeight}" rx="${cardRadius}" 
              fill="#0f172a" opacity="0.05" />

        <!-- Card Surface (White with thin subtle border) -->
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="${cardRadius}" 
              fill="#ffffff" stroke="#e2e8f0" stroke-width="1.8" />
        
        <!-- Card Inner Soft Gradient (Township style interactive token) -->
        <rect x="${cardX + 2}" y="${cardY + 2}" width="${cardWidth - 4}" height="${cardHeight - 4}" rx="${cardRadius - 2}" 
              fill="url(#cardInnerGrad)" />

        <!-- Subtle Top Specular Shine on Card -->
        <rect x="${cardX + 6}" y="${cardY + 4}" width="${cardWidth - 12}" height="14" rx="7" 
              fill="#ffffff" opacity="0.8" />

        <!-- Interactive Drag Handle Pill Dots at bottom of card -->
        <g fill="#cbd5e1" opacity="0.65">
          <circle cx="${cardX + cardWidth / 2 - 10}" cy="${cardY + cardHeight - 16}" r="2" />
          <circle cx="${cardX + cardWidth / 2}" cy="${cardY + cardHeight - 16}" r="2" />
          <circle cx="${cardX + cardWidth / 2 + 10}" cy="${cardY + cardHeight - 16}" r="2" />
        </g>

        <!-- 3D Organelle Icon Content -->
        <g transform="translate(${iconX}, ${iconY})">
          ${getOrganelleSvg(i, iconSize)}
        </g>
      </g>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Card & Element Filters -->
    <filter id="shadowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" />
    </filter>
    <filter id="cardShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <filter id="glowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" />
    </filter>

    <!-- Card Background Gradient -->
    <linearGradient id="cardInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <!-- 1. Nukleus Gradients -->
    <radialGradient id="nucleusGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="35%" stop-color="#7e22ce" />
      <stop offset="75%" stop-color="#581c87" />
      <stop offset="100%" stop-color="#3b0764" />
    </radialGradient>
    <radialGradient id="coreGrad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#7e22ce" />
      <stop offset="60%" stop-color="#4c1d95" />
      <stop offset="100%" stop-color="#2e1065" />
    </radialGradient>
    <radialGradient id="nucleolusGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="45%" stop-color="#6b21a8" />
      <stop offset="100%" stop-color="#3b0764" />
    </radialGradient>

    <!-- 2. Mitokondria Gradients -->
    <linearGradient id="mitoOuterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="30%" stop-color="#ea580c" />
      <stop offset="85%" stop-color="#c2410c" />
      <stop offset="100%" stop-color="#7c2d12" />
    </linearGradient>
    <linearGradient id="mitoInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="40%" stop-color="#c2410c" />
      <stop offset="100%" stop-color="#9a3412" />
    </linearGradient>

    <!-- 3. Kloroplas Gradients -->
    <linearGradient id="chloroOuterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="35%" stop-color="#22c55e" />
      <stop offset="80%" stop-color="#15803d" />
      <stop offset="100%" stop-color="#14532d" />
    </linearGradient>
    <radialGradient id="chloroInnerGrad" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#22c55e" />
      <stop offset="60%" stop-color="#15803d" />
      <stop offset="100%" stop-color="#14532d" />
    </radialGradient>

    <!-- 4. Golgi Gradients -->
    <linearGradient id="golgiGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="golgiGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="100%" stop-color="#0ea5e9" />
    </linearGradient>
    <linearGradient id="golgiGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="golgiGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe" />
      <stop offset="100%" stop-color="#7dd3fc" />
    </linearGradient>
    <radialGradient id="vesicleGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e0f2fe" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </radialGradient>

    <!-- 5. Lisosom Gradients -->
    <radialGradient id="lysoGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="35%" stop-color="#facc15" />
      <stop offset="75%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </radialGradient>

    <!-- 6. Ribosom Gradients -->
    <radialGradient id="riboGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e9d5ff" />
      <stop offset="40%" stop-color="#a855f7" />
      <stop offset="85%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#4c1d95" />
    </radialGradient>
    <radialGradient id="riboGradLight" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f3e8ff" />
      <stop offset="45%" stop-color="#c084fc" />
      <stop offset="90%" stop-color="#9333ea" />
      <stop offset="100%" stop-color="#581c87" />
    </radialGradient>
    <radialGradient id="riboGradDark" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="50%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#3b0764" />
    </radialGradient>

    <!-- 7. Membran Sel Gradients -->
    <radialGradient id="membraneInnerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="70%" stop-color="#7dd3fc" />
      <stop offset="100%" stop-color="#0284c7" />
    </radialGradient>

    <!-- 8. Vakuola Gradients -->
    <radialGradient id="vacuoleBodyGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#7dd3fc" stop-opacity="0.75" />
      <stop offset="80%" stop-color="#0284c7" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0.85" />
    </radialGradient>
    <linearGradient id="vacuoleWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>

  <!-- Clean Pure White Background -->
  <rect width="${width}" height="${height}" fill="#ffffff" />

  <!-- The 8 Cards Row -->
  ${cardsSvg}
</svg>`;
}

// Generate single card SVG for individual drag item icon
function generateSingleCardSvg(index, size = 180) {
  const cardWidth = size;
  const cardHeight = size;
  const cardRadius = 24;
  const iconSize = 140;
  const iconX = (cardWidth - iconSize) / 2;
  const iconY = (cardHeight - iconSize) / 2 - 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" />
    </filter>
    <filter id="cardShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <filter id="glowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" />
    </filter>

    <linearGradient id="cardInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <!-- Gradients -->
    <radialGradient id="nucleusGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="35%" stop-color="#7e22ce" />
      <stop offset="75%" stop-color="#581c87" />
      <stop offset="100%" stop-color="#3b0764" />
    </radialGradient>
    <radialGradient id="coreGrad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#7e22ce" />
      <stop offset="60%" stop-color="#4c1d95" />
      <stop offset="100%" stop-color="#2e1065" />
    </radialGradient>
    <radialGradient id="nucleolusGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="45%" stop-color="#6b21a8" />
      <stop offset="100%" stop-color="#3b0764" />
    </radialGradient>

    <linearGradient id="mitoOuterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="30%" stop-color="#ea580c" />
      <stop offset="85%" stop-color="#c2410c" />
      <stop offset="100%" stop-color="#7c2d12" />
    </linearGradient>
    <linearGradient id="mitoInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="40%" stop-color="#c2410c" />
      <stop offset="100%" stop-color="#9a3412" />
    </linearGradient>

    <linearGradient id="chloroOuterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="35%" stop-color="#22c55e" />
      <stop offset="80%" stop-color="#15803d" />
      <stop offset="100%" stop-color="#14532d" />
    </linearGradient>
    <radialGradient id="chloroInnerGrad" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#22c55e" />
      <stop offset="60%" stop-color="#15803d" />
      <stop offset="100%" stop-color="#14532d" />
    </radialGradient>

    <linearGradient id="golgiGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="golgiGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="100%" stop-color="#0ea5e9" />
    </linearGradient>
    <linearGradient id="golgiGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="golgiGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe" />
      <stop offset="100%" stop-color="#7dd3fc" />
    </linearGradient>
    <radialGradient id="vesicleGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e0f2fe" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </radialGradient>

    <radialGradient id="lysoGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="35%" stop-color="#facc15" />
      <stop offset="75%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </radialGradient>

    <radialGradient id="riboGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e9d5ff" />
      <stop offset="40%" stop-color="#a855f7" />
      <stop offset="85%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#4c1d95" />
    </radialGradient>
    <radialGradient id="riboGradLight" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f3e8ff" />
      <stop offset="45%" stop-color="#c084fc" />
      <stop offset="90%" stop-color="#9333ea" />
      <stop offset="100%" stop-color="#581c87" />
    </radialGradient>
    <radialGradient id="riboGradDark" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="50%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#3b0764" />
    </radialGradient>

    <radialGradient id="membraneInnerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="70%" stop-color="#7dd3fc" />
      <stop offset="100%" stop-color="#0284c7" />
    </radialGradient>

    <radialGradient id="vacuoleBodyGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#7dd3fc" stop-opacity="0.75" />
      <stop offset="80%" stop-color="#0284c7" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0.85" />
    </radialGradient>
    <linearGradient id="vacuoleWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>

  <rect width="${size}" height="${size}" rx="${cardRadius}" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.8" />
  <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${cardRadius - 2}" fill="url(#cardInnerGrad)" />
  <g transform="translate(${iconX}, ${iconY})">
    ${getOrganelleSvg(index, iconSize)}
  </g>
</svg>`;
}

async function run() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Generate Master 8-icons horizontal showcase
  const masterSvgContent = generateMasterSvg();
  const masterSvgPath = path.join(assetsDir, 'asset_029.svg');
  const masterPngPath = path.join(assetsDir, 'asset_029.png');

  fs.writeFileSync(masterSvgPath, masterSvgContent, 'utf8');

  const resvgMaster = new Resvg(masterSvgContent, {
    fitTo: { mode: 'width', value: 1600 }
  });
  const masterPngData = resvgMaster.render().asPng();
  fs.writeFileSync(masterPngPath, masterPngData);
  console.log('Generated master showcase: asset_029.svg & asset_029.png (1600x360)');

  // 2. Generate individual organelle icons (0 to 7)
  const organelleNames = [
    'organelle_nucleus',
    'organelle_mitochondria',
    'organelle_chloroplast',
    'organelle_golgi',
    'organelle_lysosome',
    'organelle_ribosome',
    'organelle_membrane',
    'organelle_vacuole'
  ];

  for (let i = 0; i < 8; i++) {
    const name = organelleNames[i];
    const singleSvg = generateSingleCardSvg(i, 200);
    const sSvgPath = path.join(assetsDir, `${name}.svg`);
    const sPngPath = path.join(assetsDir, `${name}.png`);

    fs.writeFileSync(sSvgPath, singleSvg, 'utf8');
    const resvgSingle = new Resvg(singleSvg, {
      fitTo: { mode: 'width', value: 200 }
    });
    fs.writeFileSync(sPngPath, resvgSingle.render().asPng());
    console.log(`Generated organelle ${i + 1} (${name}): .svg & .png`);
  }

  // 3. Update media manifest
  const manifestPath = path.join(process.cwd(), 'public', 'media_manifest.json');
  let manifest = { updatedAt: new Date().toISOString(), items: {} };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {}
  }

  // Register asset_029.png and asset_029
  manifest.items['asset_029.png'] = {
    key: 'asset_029.png',
    filename: 'asset_029.png',
    url: '/assets/asset_029.png',
    updatedAt: new Date().toISOString(),
    size: masterPngData.length,
    mimeType: 'image/png'
  };
  manifest.items['asset_029'] = {
    key: 'asset_029',
    filename: 'asset_029.png',
    url: '/assets/asset_029.png',
    updatedAt: new Date().toISOString(),
    size: masterPngData.length,
    mimeType: 'image/png'
  };
  manifest.items['__MEDIA__asset_029.png'] = {
    key: '__MEDIA__asset_029.png',
    filename: 'asset_029.png',
    url: '/assets/asset_029.png',
    updatedAt: new Date().toISOString(),
    size: masterPngData.length,
    mimeType: 'image/png'
  };

  organelleNames.forEach((name, idx) => {
    manifest.items[name] = {
      key: name,
      filename: `${name}.png`,
      url: `/assets/${name}.png`,
      updatedAt: new Date().toISOString(),
      size: fs.statSync(path.join(assetsDir, `${name}.png`)).size,
      mimeType: 'image/png'
    };
  });

  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Updated public/media_manifest.json successfully.');
}

run().catch(console.error);
