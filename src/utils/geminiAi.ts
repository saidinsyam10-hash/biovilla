export interface AiConfigStatus {
  hasKey: boolean;
  maskedKey: string;
  model: string;
  enabled: boolean;
}

export interface EssayEvalRequest {
  essayText: string;
  questionTitle?: string;
  category?: string;
  prompt?: string;
  verseRef?: string;
  scientificConnection?: string;
  guidingQuestions?: string[];
  studentName?: string;
}

export interface EssayEvalResponse {
  score: number;
  predicate: string;
  depthScore: number;
  valuesScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  badge: string;
  isAiGenerated: boolean;
  engine: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
}

export interface ChatTutorRequest {
  messages: ChatMessage[];
  currentLevel?: string;
  activeOrganelle?: string;
  studentName?: string;
}

export interface ChatTutorResponse {
  reply: string;
  isAiGenerated: boolean;
  engine: string;
}

// 1. Dapatkan status konfigurasi AI
export async function fetchAiConfig(): Promise<AiConfigStatus> {
  let localKey = '';
  let localModel = 'gemini-2.5-flash';
  let localEnabled = true;

  if (typeof window !== 'undefined') {
    localKey = localStorage.getItem('biovillage_gemini_key') || '';
    localModel = localStorage.getItem('biovillage_gemini_model') || 'gemini-2.5-flash';
    const storedEnabled = localStorage.getItem('biovillage_gemini_enabled');
    if (storedEnabled !== null) localEnabled = storedEnabled === 'true';
  }

  try {
    const res = await fetch('/api/ai/config');
    if (res.ok) {
      const data = await res.json();
      const hasKey = !!(data.hasKey || localKey);
      return {
        hasKey,
        maskedKey: data.maskedKey || (localKey ? maskApiKey(localKey) : ''),
        model: data.model || localModel,
        enabled: data.enabled !== undefined ? !!data.enabled : localEnabled
      };
    }
  } catch (err) {
    console.warn('Gagal memuat status konfigurasi AI dari server, fallback ke local storage:', err);
  }

  return {
    hasKey: !!localKey,
    maskedKey: localKey ? maskApiKey(localKey) : '',
    model: localModel,
    enabled: localEnabled
  };
}

function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

// 2. Simpan konfigurasi AI
export async function saveAiConfig(config: { apiKey?: string; model?: string; enabled?: boolean }): Promise<{ success: boolean; message?: string }> {
  if (typeof window !== 'undefined') {
    if (config.apiKey !== undefined && config.apiKey.trim()) {
      localStorage.setItem('biovillage_gemini_key', config.apiKey.trim());
    }
    if (config.model) {
      localStorage.setItem('biovillage_gemini_model', config.model);
    }
    if (config.enabled !== undefined) {
      localStorage.setItem('biovillage_gemini_enabled', String(config.enabled));
    }
  }

  try {
    const res = await fetch('/api/ai/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: !!data.success, message: data.message };
    }
  } catch (err: any) {
    console.warn('Gagal sync ke server backend, tersimpan di browser lokal:', err);
  }

  return { success: true, message: 'Konfigurasi Gemini AI tersimpan di browser' };
}

// 3. Uji koneksi AI
export async function testAiConnection(apiKey?: string): Promise<{ success: boolean; message: string; sampleResponse?: string; model?: string }> {
  const effectiveKey = apiKey?.trim() || (typeof window !== 'undefined' ? localStorage.getItem('biovillage_gemini_key') || '' : '');
  
  try {
    const res = await fetch('/api/ai/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: effectiveKey })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    console.warn('Test via server gagal, mencoba direct client test...');
  }

  // Client-side direct test fallback if server endpoint unavailable
  if (!effectiveKey) {
    return {
      success: false,
      model: 'gemini-2.5-flash',
      message: 'API Key Gemini belum diisi. Silakan masukkan API Key Anda dari Google AI Studio.'
    };
  }

  try {
    const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Halo BioVillage! Jawab dalam 5 kata.' }] }]
      })
    });

    if (directRes.ok) {
      const data = await directRes.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Terhubung dengan sukses!';
      return {
        success: true,
        message: 'Koneksi Google Gemini AI berhasil terhubung langsung!',
        sampleResponse: text.trim(),
        model: 'gemini-2.5-flash'
      };
    } else {
      const errData = await directRes.json();
      return {
        success: false,
        message: errData?.error?.message || `HTTP ${directRes.status}: Gagal terhubung ke Google Gemini`,
        model: 'gemini-2.5-flash'
      };
    }
  } catch (directErr: any) {
    return {
      success: false,
      message: directErr?.message || 'Gagal menghubungi server Google Gemini.',
      model: 'gemini-2.5-flash'
    };
  }
}

// 4. Minta penilaian esai otomatis
export async function requestEssayEvaluation(req: EssayEvalRequest): Promise<EssayEvalResponse> {
  try {
    const res = await fetch('/api/ai/evaluate-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (res.ok) {
      const data: EssayEvalResponse = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Error saat memanggil endpoint AI evaluate-essay, fallback ke heuristik lokal:', err);
  }

  // Heuristik pintar client-side jika server offline
  const text = (req.essayText || '').trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const lower = text.toLowerCase();

  const bioTerms = ['organel', 'mitokondria', 'nukleus', 'ribosom', 'golgi', 'membran', 'lisosom', 'energi', 'atp', 'protein', 'sel'];
  const bioHits = bioTerms.filter(t => lower.includes(t)).length;

  let score = 75;
  if (wordCount >= 30) score += 5;
  if (wordCount >= 60) score += 5;
  if (bioHits >= 2) score += 5;
  if (bioHits >= 4) score += 5;
  score = Math.min(score, 95);

  let predicate = 'Jayyid (Baik)';
  let badge = 'Peneliti Sel Muda';
  if (score >= 90) {
    predicate = 'Mumtaz (Sangat Memuaskan)';
    badge = 'Cendekiawan Ulul Albab';
  } else if (score >= 82) {
    predicate = 'Jayyid Jiddan (Sangat Baik)';
    badge = 'Arsitek Kehidupan';
  }

  return {
    score,
    predicate,
    depthScore: Math.min(5, Math.max(3, Math.round(score / 20))),
    valuesScore: 4,
    feedback: 'Refleksi yang sangat bermakna! Kamu berhasil menghubungkan harmoni kerja organel sel dengan nilai-nilai tanggung jawab, kerjasama, dan rasa syukur atas keteraturan ciptaan-Nya.',
    strengths: ['Mengaitkan konsep organel dengan analogi desa secara runtut', 'Menunjukkan kesadaran reflektif yang mendalam'],
    improvements: ['Perkuat lagi contoh implementasi nyata dalam menjaga kelestarian lingkungan sekitar'],
    badge,
    isAiGenerated: false,
    engine: 'BioVillage Client Heuristic Engine'
  };
}

// 5. Chat interaktif dengan Kepala Desa Sel
export async function requestAiTutorChat(req: ChatTutorRequest): Promise<ChatTutorResponse> {
  const userMessages = req.messages || [];
  const lastUserMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';

  try {
    const res = await fetch('/api/ai/chat-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Endpoint AI tutor offline / tidak merespons, beralih ke engine lokal Kepala Desa Sel:', err);
  }

  // Client-side direct Gemini call if user saved key in localStorage
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('biovillage_gemini_key');
    const localModel = localStorage.getItem('biovillage_gemini_model') || 'gemini-2.5-flash';
    if (localKey) {
      try {
        const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${localModel}:generateContent?key=${localKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: userMessages.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            })),
            systemInstruction: {
              parts: [{
                text: `Kamu adalah "Kepala Desa Sel" (Prof. Bio), mentor ramah di game edukasi "BioVillage Simulator". Sapa hangat siswa, jawab ringkas, jelas, gunakan analogi BioVillage (Balai Desa = Nukleus, Pembangkit Listrik = Mitokondria, Bengkel = Ribosom, Pos Logistik = Golgi, Tim Kebersihan/Daur Ulang = Lisosom, Gerbang = Membran Sel).`
              }]
            }
          })
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          const reply = directData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return {
              reply: reply.trim(),
              isAiGenerated: true,
              engine: `${localModel} (Direct Client)`
            };
          }
        }
      } catch (clientErr) {
        console.warn('Direct client Gemini fetch failed, fallback to local rule-based tutor:', clientErr);
      }
    }
  }

  // Cerdas & kontekstual: Jawaban edukasi lengkap Kepala Desa Sel (Offline Heuristic Knowledge Base)
  const fallbackReply = generateClientFallbackTutorReply(lastUserMsg, req.currentLevel, req.activeOrganelle);
  return {
    reply: fallbackReply,
    isAiGenerated: false,
    engine: 'BioVillage Built-in Mentor (Offline)'
  };
}

// Knowledge Base Lokal Kepala Desa Sel (Edukasi Lengkap Sel & BioVillage)
function generateClientFallbackTutorReply(query: string, currentLevel?: string, activeOrganelle?: string): string {
  const q = (query || '').toLowerCase();

  if (!q || q.includes('halo') || q.includes('hai') || q.includes('pagi') || q.includes('siang') || q.includes('salam')) {
    return `🌱 **Salam hangat dari Balai Desa Sel!**\n\nSaya **Kepala Desa Sel (Prof. Bio)**, siap membantumu menjelajahi misteri dan keajaiban struktur sel hayati. Ada konsep organel sel yang ingin kamu diskusikan? Kamu bisa menanyakan tentang analogi organel, cara kerja pembangkit ATP di mitokondria, atau sistem logistik di Golgi!`;
  }

  // Nukleus
  if (q.includes('nukleus') || q.includes('inti') || q.includes('dna') || q.includes('balai desa')) {
    return `🏛️ **Nukleus = Kantor Pusat & Balai Desa Sel**\n\nDi dalam nukleus tersimpan **DNA**, yaitu materi genetik utama dan cetak biru (*blueprint*) kehidupan yang memuat instruksi pembuatan seluruh protein seluler. Di dalamnya juga ada **nukleolus** tempat merakit ribosom.\n\n💡 *Analogi Desa:* Nukleus bagaikan kantor kepala desa yang menyimpan arsip aturan, rencana pembangunan, dan kebijakan induk bagi seluruh aktivitas warga desa BioVillage!`;
  }

  // Mitokondria
  if (q.includes('mitokondria') || q.includes('pembangkit') || q.includes('energi') || q.includes('atp') || q.includes('listrik')) {
    return `⚡ **Mitokondria = Pembangkit Listrik Mandiri BioVillage**\n\nMitokondria memiliki membran ganda dengan lipatan dalam bernama *krista*. Di sinilah sari makanan (glukosa) dan oksigen diolah melalui siklus Krebs dan rantai transpor elektron untuk menghasilkan **ATP (Adenosin Trifosfat)**—mata uang energi utama sel!\n\n💡 *Analogi Desa:* Seperti turbin pembangkit listrik desa yang memasok daya ke setiap bengkel dan rumah. Tanpa mitokondria, seluruh aktivitas desa akan padam!`;
  }

  // Badan Golgi
  if (q.includes('golgi') || q.includes('pos') || q.includes('logistik') || q.includes('vesikel') || q.includes('paket') || q.includes('ekspedisi')) {
    return `📦 **Badan Golgi = Sentra Ekspedisi & Logistik Desa**\n\nBadan Golgi menerima rantai polipeptida atau protein mentah dari Retikulum Endoplasma, lalu memodifikasinya (seperti menambahkan gugus gula/glikosilasi), menyortirnya, dan membungkusnya ke dalam **vesikel sekretori** untuk diantar ke tujuan yang tepat.\n\n💡 *Analogi Desa:* Seperti kantor pos kilat modern yang memeriksa alamat, membungkus paket rapi, lalu mengirim armada kurir ke gerbang perbatasan atau organel lain!`;
  }

  // Ribosom
  if (q.includes('ribosom') || q.includes('protein') || q.includes('bengkel') || q.includes('sintesis') || q.includes('umkm')) {
    return `🔧 **Ribosom = Bengkel Produksi & Sentra UMKM Protein**\n\nRibosom membaca pesan sandi mRNA dari nukleus (transkripsi) lalu merangkai asam-asam amino menjadi rantai polipeptida protein yang fungsional (translasi). Ada yang menempel di RE Kasar, ada pula yang bebas di sitoplasma.\n\n💡 *Analogi Desa:* Para perajin dan teknisi desa yang tekun merakit material kebutuhan hidup seluruh warga BioVillage tanpa henti!`;
  }

  // Membran Sel
  if (q.includes('membran') || q.includes('gerbang') || q.includes('fosfolipid') || q.includes('selektif') || q.includes('permeabel') || q.includes('pagar')) {
    return `🛡️ **Membran Sel = Gerbang Berpagar Selektif Permeabel**\n\nTersusun atas lapisan ganda fosfolipid (*phospholipid bilayer*) yang dihiasi protein membran dan kolesterol. Bersifat **selektif permeabel** (hanya zat tertentu yang diizinkan lewat), baik lewat transpor pasif (difusi, osmosis) maupun transpor aktif berbantu ATP.\n\n💡 *Analogi Desa:* Pos satpam gerbang desa yang menjaga keamanan, menyaring siapa pun atau barang apa pun yang boleh masuk maupun keluar desa!`;
  }

  // Lisosom
  if (q.includes('lisosom') || q.includes('daur ulang') || q.includes('sampah') || q.includes('autofagi') || q.includes('kebersihan')) {
    return `♻️ **Lisosom = Fasilitas Daur Ulang & Pengolahan Limbah Desa**\n\nLisosom dipersenjatai dengan **enzim hidrolitik** yang aktif dalam suasana asam. Fungsinya mencerna zat asing yang masuk (fagositosis) serta merombak organel sel yang rusak atau sudah tua agar material dasarnya bisa dipakai ulang (**autofagi**).\n\n💡 *Analogi Desa:* Tim kebersihan dan sanitasi desa yang memastikan desa selalu bersih higienis dan tidak tertimbun sampah sisa aktivitas!`;
  }

  // Retikulum Endoplasma
  if (q.includes('retikulum') || q.includes('re ') || q.includes('transportasi') || q.includes('saluran') || q.includes('endoplasma')) {
    return `🛣️ **Retikulum Endoplasma (RE) = Jalur Jalan Raya & Transportasi Desa**\n\nRE terbagi menjadi dua:\n1. **RE Kasar:** Ditempeli ribosom, bertugas memproses dan mengalirkan protein baru.\n2. **RE Halus:** Tanpa ribosom, bertugas mensintesis lipid, metabolisme karbohidrat, dan detoksifikasi racun.\n\n💡 *Analogi Desa:* Jaringan jalan arteri desa yang menghubungkan pusat kantor desa langsung ke sentra-sentra produksi!`;
  }

  // Vakuola
  if (q.includes('vakuola') || q.includes('gudang') || q.includes('cadangan') || q.includes('turgor') || q.includes('air')) {
    return `💧 **Vakuola = Gudang Lumbung Logistik & Tandon Air Desa**\n\nPada sel tumbuhan, vakuola berukuran sangat besar (vakuola sentral) untuk menyimpan cadangan makanan, pigmen, sisa metabolit, serta menjaga **tekanan turgor** agar sel tetap kokoh tegar.\n\n💡 *Analogi Desa:* Lumbung padi desa dan tandon penampungan air raksasa untuk menjaga stabilitas cadangan desa!`;
  }

  // Kloroplas
  if (q.includes('kloroplas') || q.includes('klorofil') || q.includes('fotosintesis') || q.includes('surya') || q.includes('matahari')) {
    return `☀️ **Kloroplas = Pembangkit Listrik Tenaga Surya & Dapur Makanan**\n\nHanya ada pada sel tumbuhan dan alga! Mengandung pigmen **klorofil** pada tilakoid untuk menangkap foton cahaya matahari, mengubah air dan CO2 menjadi glukosa melalui fotosintesis.\n\n💡 *Analogi Desa:* Ladang panel surya desa yang mengubah cahaya matahari menjadi sumber pangan utama bagi seluruh warga!`;
  }

  // Dinding Sel
  if (q.includes('dinding') || q.includes('tembok') || q.includes('benteng') || q.includes('selulosa')) {
    return `🏰 **Dinding Sel = Tembok Benteng Pertahanan Desa**\n\nLapisan luar sel tumbuhan yang kaku dan tersusun atas polimer **selulosa**, hemiselulosa, dan pektin. Memberi bentuk kaku yang tetap dan melindungi sel dari tekanan osmotik berlebih.\n\n💡 *Analogi Desa:* Tembok batu benteng kokoh yang mengelilingi perbatasan desa agar desa tahan dari guncangan luar!`;
  }

  // Bantuan / Tips Kuis & Permainan
  if (q.includes('bantuan') || q.includes('petunjuk') || q.includes('tips') || q.includes('cara main') || q.includes('bingung')) {
    return `🎯 **Tips Petualangan BioVillage:**\n\n1. **Kuasai Pasangan Analogi:** Ingatlah hubungan fungsional antara fasilitas desa dengan organel biologi.\n2. **Sinergi Antar-Organel:** Sel tidak bekerja sendirian, melainkan estafet: Nukleus (resep DNA) → Ribosom (sintesis) → RE (saluran) → Golgi (kemas) → Membran (kirim).\n3. **Cermati Tantangan:** Pada skenario krisis desa, pikirkan organel mana yang sedang terganggu fungsi vitalnya!\n\nJangan ragu bertanya bagian spesifik mana yang membuatmu ragu ya!`;
  }

  return `🔬 **Catatan Edukasi Kepala Desa Sel:**\n\nPertanyaan yang sangat menarik tentang: *"${query}"*!\n\nDi BioVillage, setiap organel memiliki peran krusial yang saling melengkapi dalam menjaga **homeostasis** (keseimbangan hidup). Tidak ada satu pun organel yang menganggur atau berjalan sendiri-sendiri; semuanya bersinergi dalam harmoni yang luar biasa.\n\nCoba tanyakan seputar organel tertentu, misalnya: *"Apa fungsi Mitokondria?"*, *"Mengapa Nukleus disebut Balai Desa?"*, atau *"Apa tugas Badan Golgi?"*. Selamat berpetualang dan semangat belajar!`;
}
