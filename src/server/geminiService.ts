import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
  updatedAt?: string;
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
  depthScore: number; // 1 - 5
  valuesScore: number; // 1 - 5
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

const CONFIG_FILE = path.join(process.cwd(), 'public', 'gemini_config.json');

// Default Config
let currentConfig: GeminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-2.5-flash',
  enabled: true
};

// Initialize config from disk if available
export function getGeminiConfig(): GeminiConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (data && typeof data === 'object') {
        currentConfig = {
          apiKey: data.apiKey || process.env.GEMINI_API_KEY || '',
          model: data.model || 'gemini-2.5-flash',
          enabled: data.enabled !== undefined ? !!data.enabled : true,
          updatedAt: data.updatedAt
        };
      }
    } else if (process.env.GEMINI_API_KEY) {
      currentConfig.apiKey = process.env.GEMINI_API_KEY;
    }
  } catch (err) {
    console.error('[GeminiConfig] Gagal membaca konfigurasi:', err);
  }
  return currentConfig;
}

export function updateGeminiConfig(newConfig: Partial<GeminiConfig>): GeminiConfig {
  const existing = getGeminiConfig();
  currentConfig = {
    ...existing,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
    console.log('[GeminiConfig] Berhasil memperbarui konfigurasi Gemini AI.');
  } catch (err) {
    console.error('[GeminiConfig] Gagal menyimpan konfigurasi ke disk:', err);
  }

  return currentConfig;
}

export function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

// Inisialisasi klien SDK GoogleGenAI
function createGenAIClient(apiKeyOverride?: string): GoogleGenAI | null {
  const config = getGeminiConfig();
  const key = (apiKeyOverride || config.apiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.error('[GoogleGenAI Init Error]:', err);
    return null;
  }
}

// 1. Tes Koneksi Gemini API
export async function testGeminiConnection(apiKeyOverride?: string): Promise<{
  success: boolean;
  model: string;
  message: string;
  sampleResponse?: string;
}> {
  const config = getGeminiConfig();
  const key = apiKeyOverride || config.apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      success: false,
      model: config.model || 'gemini-2.5-flash',
      message: 'API Key Gemini belum diisi. Silakan masukkan API Key Anda dari Google AI Studio.'
    };
  }

  try {
    const ai = createGenAIClient(key);
    if (!ai) throw new Error('Gagal menginisialisasi GoogleGenAI client');

    const modelName = config.model || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Tanggapi dalam 1 kalimat singkat Bahasa Indonesia: Konfirmasi bahwa sistem AI BioVillage siap berjalan.',
      config: {
        maxOutputTokens: 60,
        temperature: 0.3
      }
    });

    const reply = response.text || 'Koneksi sukses!';
    return {
      success: true,
      model: modelName,
      message: 'Koneksi Google Gemini AI berhasil terhubung!',
      sampleResponse: reply.trim()
    };
  } catch (err: any) {
    console.error('[Gemini Test Error]:', err);
    return {
      success: false,
      model: config.model || 'gemini-2.5-flash',
      message: err?.message || 'Gagal menghubungi server Google Gemini.'
    };
  }
}

// 2. Evaluasi Esai Refleksi (Level 8)
export async function evaluateStudentEssay(req: EssayEvalRequest): Promise<EssayEvalResponse> {
  const config = getGeminiConfig();
  const ai = createGenAIClient();
  const wordCount = req.essayText.trim().split(/\s+/).filter(Boolean).length;

  // Jika API Key tersedia, gunakan model Gemini AI
  if (ai && config.enabled) {
    try {
      const systemInstruction = `Kamu adalah Guru Ahli Biologi Sel dan Pembina Karakter Islam untuk simulator pendidikan "BioVillage Simulator".
Tugasmu adalah menganalisis dan menilai esai refleksi siswa di Level 8 (Tadabbur Sains & Integrasi Nilai Islam).

Aspek Penilaian:
1. Kedalaman analogi sains organel sel (Nukleus, Mitokondria, Membran, Ribosom, Badan Golgi, Lisosom).
2. Pemaknaan filosofis/moral/keagamaan (nilai amanah, sinergi, tabayyun, keteraturan ciptaan Tuhan).
3. Penerapan komitmen akhlak nyata dalam kehidupan sehari-hari siswa.

Format Output WAJIB JSON persis seperti berikut (tanpa markdown tambahan, valid json):
{
  "score": <angka 70-100>,
  "predicate": "<Mumtaz (Istimewa) | Jayyid Jiddan (Sangat Baik) | Jayyid (Baik) | Maqbul (Cukup)>",
  "depthScore": <angka 1-5>,
  "valuesScore": <angka 1-5>,
  "feedback": "<Ulasan apresiatif 2-3 kalimat yang hangat, memotivasi, dan mendidik>",
  "strengths": ["<Poin keunggulan 1>", "<Poin keunggulan 2>"],
  "improvements": ["<Saran konstruktif 1 untuk memperkaya sudut pandang>"],
  "badge": "<Lencana unik, contoh: 'Cendekiawan Ulul Albab' / 'Arsitek Harmoni Sel' / 'Pelopor Sinergi Hayati'>"
}`;

      const promptUser = `Data Soal Refleksi:
- Judul: ${req.questionTitle || 'Refleksi Sel'}
- Kategori: ${req.category || 'Tadabbur Sains'}
- Pertanyaan Pemantik: ${req.prompt || ''}
- Referensi Dalil/Hikmah: ${req.verseRef || '-'}
- Korelasi Sains: ${req.scientificConnection || '-'}
- Panduan Berpikir: ${(req.guidingQuestions || []).join('; ')}

Tulisan Refleksi Siswa (${req.studentName ? 'Nama: ' + req.studentName : 'Siswa'}):
"${req.essayText}"

Beri evaluasi JSON objektif, apresiatif, dan membangun:`;

      const response = await ai.models.generateContent({
        model: config.model || 'gemini-2.5-flash',
        contents: promptUser,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      });

      const rawText = response.text || '{}';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        score: Math.min(100, Math.max(50, Number(parsed.score) || 85)),
        predicate: parsed.predicate || 'Jayyid Jiddan (Sangat Baik)',
        depthScore: Number(parsed.depthScore) || 4,
        valuesScore: Number(parsed.valuesScore) || 4,
        feedback: parsed.feedback || 'Refleksi yang sangat inspiratif dan menunjukkan pemahaman mendalam tentang keharmonisan organel sel.',
        strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 
          ? parsed.strengths 
          : ['Mengaitkan konsep organel dengan kehidupan nyata secara harmonis'],
        improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0
          ? parsed.improvements
          : ['Pertahankan semangat tadabbur ini dalam mengamati fenomena alam lainnya'],
        badge: parsed.badge || 'Cendekiawan BioVillage',
        isAiGenerated: true,
        engine: config.model || 'gemini-2.5-flash'
      };
    } catch (err) {
      console.warn('[Gemini AI Eval Warning] Beralih ke fallback heuristic:', err);
    }
  }

  // FALLBACK: Heuristic Simulator Cerdas Lokal
  return evaluateEssayHeuristic(req, wordCount);
}

// Fallback Heuristic Evaluator
function evaluateEssayHeuristic(req: EssayEvalRequest, wordCount: number): EssayEvalResponse {
  const textLower = req.essayText.toLowerCase();

  // Kata kunci sains seluler
  const bioKeywords = [
    'sel', 'organel', 'mitokondria', 'nukleus', 'membran', 'ribosom', 
    'golgi', 'lisosom', 'sitoplasma', 'atp', 'energi', 'protein', 
    'pabrik', 'analog', 'fasilitas', 'desa', 'kristae', 'vesikel', 'kloroplas'
  ];

  // Kata kunci akhlak/karakter & keagamaan
  const moralKeywords = [
    'allah', 'tuhan', 'syukur', 'amanah', 'hikmah', 'keteraturan', 
    'harmoni', 'kerja sama', 'sinergi', 'akhlak', 'hati', 'tabayyun', 
    'kebaikan', 'manfaat', 'kebersamaan', 'disiplin', 'integritas', 'tanggung jawab'
  ];

  let bioHits = 0;
  for (const kw of bioKeywords) {
    if (textLower.includes(kw)) bioHits++;
  }

  let moralHits = 0;
  for (const kw of moralKeywords) {
    if (textLower.includes(kw)) moralHits++;
  }

  // Base score perhitungan
  let score = 75;
  if (wordCount >= 20) score += 5;
  if (wordCount >= 40) score += 5;
  if (wordCount >= 70) score += 5;

  score += Math.min(6, bioHits * 1.5);
  score += Math.min(6, moralHits * 1.5);
  score = Math.round(Math.min(98, Math.max(72, score)));

  let depthScore = 3;
  if (bioHits >= 2 && wordCount >= 30) depthScore = 4;
  if (bioHits >= 4 && wordCount >= 50) depthScore = 5;

  let valuesScore = 3;
  if (moralHits >= 2 && wordCount >= 30) valuesScore = 4;
  if (moralHits >= 4 && wordCount >= 50) valuesScore = 5;

  let predicate = 'Jayyid (Baik)';
  let badge = 'Penjelajah Sains BioVillage';

  if (score >= 93) {
    predicate = 'Mumtaz (Istimewa)';
    badge = 'Cendekiawan Ulul Albab';
  } else if (score >= 85) {
    predicate = 'Jayyid Jiddan (Sangat Baik)';
    badge = 'Arsitek Harmoni Sel';
  } else if (score >= 78) {
    predicate = 'Jayyid (Baik)';
    badge = 'Duta Karakter Hayati';
  }

  const strengths: string[] = [];
  if (bioHits >= 2) {
    strengths.push('Mampu mengenali analogi organel sel dan fungsinya dalam sistem kehidupan.');
  } else {
    strengths.push('Menguraikan pemikiran dengan alur kalimat yang runut dan lugas.');
  }

  if (moralHits >= 2) {
    strengths.push('Menginternalisasi hikmah keteraturan sel sebagai cerminan akhlak dan tanggung jawab pribadi.');
  } else {
    strengths.push('Menunjukkan kesungguhan reflektif dalam menghubungkan materi dengan pengalaman.');
  }

  const improvements: string[] = [];
  if (bioHits < 3) {
    improvements.push('Coba sebutkan lebih spesifik nama organel (seperti mitokondria atau nukleus) beserta peran analoginya.');
  }
  if (wordCount < 40) {
    improvements.push('Perluas komitmen tindakan nyata yang bisa kamu terapkan bersama teman atau di lingkungan sekolah.');
  }
  if (improvements.length === 0) {
    improvements.push('Lanjutkan refleksi kritis ini pada topik biologi dan fenomena sains lainnya.');
  }

  return {
    score,
    predicate,
    depthScore,
    valuesScore,
    feedback: `Refleksi yang sangat bagus! Kamu berhasil merenungkan bagaimana keterpaduan organel sel dapat menjadi teladan integritas dan sinergi bagi kita semua. Teruslah berpikir kritis dan senantiasa bersyukur atas anugerah keteraturan ciptaan-Nya.`,
    strengths,
    improvements,
    badge,
    isAiGenerated: false,
    engine: 'BioVillage Heuristic Engine (Simulator Offline)'
  };
}

// 3. AI Tutor Biologi Sel ("Kepala Desa Sel")
export async function chatWithAiTutor(req: ChatTutorRequest): Promise<ChatTutorResponse> {
  const config = getGeminiConfig();
  const ai = createGenAIClient();

  const userMessages = req.messages || [];
  const lastUserMsg = userMessages.length > 0 
    ? userMessages[userMessages.length - 1].content 
    : '';

  if (ai && config.enabled) {
    try {
      const systemInstruction = `Kamu adalah "Kepala Desa Sel" (Prof. Bio), asisten virtual dan mentor ramah di game edukasi "BioVillage Simulator".

Kepribadian & Gaya Komunikasi:
- Ramah, antusias, mendidik, bersahabat dengan siswa SMA/MA.
- Selalu menggunakan sapaan akrab seperti: "Halo Sobat Penjelajah Sel!", "Salam hangat dari Balai Desa Sel!", "Pertanyaan yang luar biasa!".
- Menguasai materi Biologi Sel SMA dan analogi Desa BioVillage:
  * Balai Desa = Nukleus (Pusat kendali dan arsip genetik DNA/RNA).
  * Pembangkit Listrik = Mitokondria (Penghasil energi daya ATP melalui respirasi seluler).
  * Bengkel/UMKM = Ribosom (Tempat sintesis protein dari bahan baku asam amino).
  * Pos Logistik / Ekspedisi = Badan Golgi (Penyortir, pemodifikasi, dan pengemas glikoprotein dengan vesikel).
  * Tim Daur Ulang & Kebersihan = Lisosom (Enzim hidrolitik untuk autofagi dan perombakan materi usang).
  * Gerbang & Pagar Desa = Membran Sel (Lapisan fosfolipid ganda, semipermeabel / selektif permeabel).
  * Saluran Transportasi Desa = Retikulum Endoplasma (RE Kasar & RE Halus).
  * Gudang Cadangan Air & Nutrisi = Vakuola.
- Jika siswa menanyakan jawaban kuis langsung, JANGAN berikan jawaban secara instan. Berikan petunjuk konseptual dan analogi agar mereka memecahkannya sendiri.
- Tambahkan sentuhan hikmah syukur dan kekaguman atas keteraturan sel yang maha dahsyat.
- Jaga jawaban tetap ringkas, padat (2-4 paragraf kecil), jelas, dan enak dibaca.

Konteks Pemain Saat Ini:
- Level/Stage: ${req.currentLevel || 'Peta Utama BioVillage'}
- Topik/Organel Fokus: ${req.activeOrganelle || 'Semua Organel Sel'}
- Nama Siswa: ${req.studentName || 'Penjelajah Sel'}`;

      // Susun riwayat percakapan untuk Gemini
      const contents = userMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      if (contents.length === 0) {
        contents.push({
          role: 'user',
          parts: [{ text: 'Halo Kepala Desa Sel!' }]
        });
      }

      const response = await ai.models.generateContent({
        model: config.model || 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 600
        }
      });

      const reply = response.text || 'Halo! Senang bisa menyapamu di BioVillage. Ada konsep sel yang ingin kamu diskusikan?';
      return {
        reply: reply.trim(),
        isAiGenerated: true,
        engine: config.model || 'gemini-2.5-flash'
      };
    } catch (err) {
      console.warn('[Gemini AI Tutor Warning] Beralih ke fallback chatbot cerdas:', err);
    }
  }

  // FALLBACK: Contextual Intelligent Tutor Bot
  const reply = generateHeuristicTutorReply(lastUserMsg, req.currentLevel, req.activeOrganelle);
  return {
    reply,
    isAiGenerated: false,
    engine: 'BioVillage Rule-based Tutor (Offline)'
  };
}

function generateHeuristicTutorReply(query: string, currentLevel?: string, activeOrganelle?: string): string {
  const q = query.toLowerCase();

  if (!q || q.includes('halo') || q.includes('hai') || q.includes('pagi') || q.includes('siang') || q.includes('salam')) {
    return `🌱 **Salam hangat dari Balai Desa Sel!**\n\nSaya **Kepala Desa Sel (Prof. Bio)**, siap membantumu menjelajahi misteri dan keajaiban struktur sel hayati. Apa yang sedang kamu pelajari sekarang? Kamu bisa menanyakan tentang analogi organel, cara kerja pembangkit ATP, atau alur pengemasan protein di Golgi!`;
  }

  if (q.includes('mitokondria') || q.includes('pembangkit') || q.includes('energi') || q.includes('atp')) {
    return `⚡ **Mitokondria = Pembangkit Listrik Mandiri BioVillage**\n\nMitokondria memiliki membran ganda dengan lipatan dalam bernama *krista*. Di sinilah molekul glukosa dan oksigen diolah melalui siklus Krebs dan rantai transpor elektron untuk menghasilkan **ATP (Adenosin Trifosfat)**—mata uang energi utama sel!\n\n💡 *Analogi Desa:* Seperti turbin listrik desa yang memasok daya ke setiap rumah, tanpa mitokondria, seluruh aktivitas sel akan padam!`;
  }

  if (q.includes('nukleus') || q.includes('inti') || q.includes('dna') || q.includes('balai desa')) {
    return `🏛️ **Nukleus = Kantor Pusat & Balai Desa Sel**\n\nDi dalam nukleus tersimpan **DNA**, yaitu cetak biru (blueprint) kehidupan yang memuat instruksi seluruh sintesis protein seluler. Terdapat pula *nukleolus* tempat perakitan ribosom.\n\n💡 *Analogi Desa:* Nukleus bagaikan kantor kepala desa yang menyimpan arsip aturan dan kebijakan induk untuk seluruh warga desa.`;
  }

  if (q.includes('golgi') || q.includes('pos') || q.includes('logistik') || q.includes('vesikel') || q.includes('paket')) {
    return `📦 **Badan Golgi = Pusat Pengemasan & Ekspedisi Logistik Desa**\n\nBadan Golgi menerima rantai polipeptida/protein mentah dari Retikulum Endoplasma, lalu memodifikasinya (misalnya dengan glikosilasi), menyortirnya, dan memasukkannya ke dalam **vesikel sekretori** untuk dikirim ke tujuan yang tepat.\n\n💡 *Analogi Desa:* Seperti kantor pos modern yang mengecek alamat, membungkus paket rapi, lalu mengirim armada kurir ke gerbang perbatasan atau warga desa.`;
  }

  if (q.includes('ribosom') || q.includes('protein') || q.includes('bengkel') || q.includes('sintesis')) {
    return `🔧 **Ribosom = Bengkel Produksi & Sentra UMKM Protein**\n\nRibosom membaca pesan mRNA dari nukleus dan merangkai asam amino menjadi protein yang fungsional. Sebagian menempel di membran RE Kasar, sebagian lagi melayang bebas di sitosol.\n\n💡 *Analogi Desa:* Para perajin dan teknisi desa yang tekun merakit alat-alat kebutuhan warga setiap detik tanpa lelah!`;
  }

  if (q.includes('membran') || q.includes('gerbang') || q.includes('fosfolipid') || q.includes('selektif')) {
    return `🛡️ **Membran Sel = Gerbang Berpagar Selektif Permeabel**\n\nTersusun atas lapisan ganda fosfolipid (*phospholipid bilayer*) dengan protein integral dan perifer. Membran ini memiliki sifat *selektif permeabel*: hanya zat tertentu yang boleh keluar masuk, baik secara transpor pasif (difusi/osmosis) maupun transpor aktif yang memakai energi ATP.\n\n💡 *Analogi Desa:* Seperti pos satpam gerbang desa yang memverifikasi setiap orang yang ingin bertamu!`;
  }

  if (q.includes('lisosom') || q.includes('daur ulang') || q.includes('sampah') || q.includes('autofagi')) {
    return `♻️ **Lisosom = Fasilitas Daur Ulang & Pengolahan Limbah Desa**\n\nLisosom berisi **enzim hidrolitik** asam yang mampu mencerna makromolekul, menetralkan patogen yang masuk (fagositosis), dan merombak organel tua yang rusak untuk didaur ulang komponennya (**autofagi**).\n\n💡 *Analogi Desa:* Petugas sanitasi desa yang memastikan desa selalu bersih, higienis, dan material bekas bisa dimanfaatkan kembali!`;
  }

  if (q.includes('bantuan') || q.includes('petunjuk') || q.includes('tips') || q.includes('cara main')) {
    return `🎯 **Tips Petualangan BioVillage:**\n\n1. **Pahami Analoginya:** Ingatlah selalu hubungan antara fasilitas desa dan organel biologis.\n2. **Perhatikan Keterkaitan:** Organel tidak bekerja sendiri; mereka bekerja berantai (misal: Nukleus memberi kode → Ribosom merakit protein → RE mentranspor → Golgi mengemas).\n3. **Teliti Soal:** Baca skenario krisis dan kuis dengan seksama sebelum memilih keputusan strategis!\n\nAda bagian atau level yang membuatmu ragu? Ceritakan padaku, Sobat Penjelajah!`;
  }

  return `🔬 **Catatan Edukasi Kepala Desa Sel:**\n\nMenarik sekali pertanyaannmu tentang: *"${query}"*!\n\nDi BioVillage, setiap organel memiliki peran krusial yang saling melengkapi dalam menjaga **homeostasis** (keseimbangan hidup). Tidak ada satu organel pun yang sombong atau menganggur; semuanya bekerja harmonis dalam ketundukan pada hukum alam ciptaan-Nya.\n\nKamu bisa coba menanyakan hal-hal spesifik seperti: *"Bagaimana fungsi Mitokondria?"*, *"Apa tugas Badan Golgi?"*, atau *"Mengapa sel membutuhkan lisosom?"*. Semangat belajarnya!`;
}
