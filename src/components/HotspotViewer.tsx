import React, { useState, useEffect, useRef } from 'react';
import { Hotspot } from '../types';
import { resolveMediaPath, sfx } from '../utils/audio';
import { AudioPlayer } from './AudioPlayer';
import { getMediaObjectURL, getMediaResolvedURL, saveMediaBlob, getAssetCandidates, onMediaUpdated } from '../utils/mediaStore';
import { HotspotIllustration } from './HotspotIllustration';
import { HotspotPhotoUploader } from './HotspotPhotoUploader';
import { ChecklistPhotoManagerModal } from './ChecklistPhotoManagerModal';
import { Check, CheckCircle2, Eye, X, Info, Upload, Image as ImageIcon, Sparkles, Camera, BookOpen, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export interface HotspotInfo {
  title: string;
  subtitle: string;
  description: string;
  spokenNarration: string;
}

export const HOTSPOT_EXPLANATIONS: Record<string, HotspotInfo> = {
  // Stage 0: Ceklis Petunjuk Peta (Suara perempuan membaca ceria & santun sampai tuntas)
  'hotspot-0-0': {
    title: '1. Jelajahi Peta Desa',
    subtitle: 'Petunjuk 1',
    description: 'Jelajahi peta desa sel untuk menemukan berbagai fasilitas dan bangunan organel.',
    spokenNarration: 'Ini adalah nomor satu. Jelajahi peta desa. Jelajahi peta desa sel untuk menemukan berbagai fasilitas dan bangunan organel.'
  },
  'hotspot-0-1': {
    title: '2. Selesaikan Misi Tiap Warga',
    subtitle: 'Petunjuk 2',
    description: 'Selesaikan misi tiap warga desa untuk memahami fungsi masing-masing bagian sel.',
    spokenNarration: 'Ini adalah nomor dua. Selesaikan misi tiap warga. Selesaikan misi tiap warga desa untuk memahami fungsi masing-masing bagian sel.'
  },
  'hotspot-0-2': {
    title: '3. Gunakan Petunjuk Jika Ragu',
    subtitle: 'Petunjuk 3',
    description: 'Gunakan petunjuk jika ragu saat menjelajahi desa dan menghadapi tantangan kuis.',
    spokenNarration: 'Ini adalah nomor tiga. Gunakan petunjuk jika ragu. Gunakan petunjuk jika ragu saat menjelajahi desa dan menghadapi tantangan kuis.'
  },
  'hotspot-0-3': {
    title: '4. Kumpulkan Bintang',
    subtitle: 'Petunjuk 4',
    description: 'Kumpulkan bintang dari setiap tantangan organel yang berhasil diselesaikan.',
    spokenNarration: 'Ini adalah nomor empat. Kumpulkan bintang. Kumpulkan bintang dari setiap tantangan organel yang berhasil diselesaikan.'
  },
  'hotspot-0-4': {
    title: '5. Ingat, Semua Warga Saling Terhubung',
    subtitle: 'Petunjuk 5',
    description: 'Ingat, semua warga saling terhubung dan bekerjasama menjaga kehidupan sel.',
    spokenNarration: 'Ini adalah nomor lima. Ingat, semua warga saling terhubung. Ingat, semua warga saling terhubung dan bekerjasama menjaga kehidupan sel.'
  },
  'hotspot-0-5': {
    title: '6. Siap Memulai?',
    subtitle: 'Petunjuk 6',
    description: 'Siap memulai? Tekan tombol Peta Desa untuk memulai petualangan belajarmu!',
    spokenNarration: 'Ini adalah nomor enam. Siap memulai? Tekan tombol Peta Desa untuk memulai petualangan belajarmu!'
  },

  // Stage 1 - Ceklis 1: Petunjuk (Papan Petunjuk Desa - dibacakan tuntas)
  'hotspot-1-0': {
    title: 'Petunjuk',
    subtitle: 'Petunjuk',
    description: 'Kepala desa akan mengenali bagian-bagian desa dan analoginya untuk sel. Silakan tekan setiap keterangan di desa untuk melihat informasinya! Setelah selesai semua dibaca, silakan tekan Level 1 untuk memulai tantangan!',
    spokenNarration: 'Ini adalah Petunjuk. Kepala desa akan mengenali bagian-bagian desa dan analoginya untuk sel. Silakan tekan setiap keterangan di desa untuk melihat informasinya! Setelah selesai semua dibaca, silakan tekan Level 1 untuk memulai tantangan!'
  },
  'hotspot-1-1': {
    title: 'Pelabuhan Desa - Retikulum Endoplasma',
    subtitle: 'Retikulum Endoplasma',
    description: 'Pelabuhan Desa - Retikulum Endoplasma. Berfungsi sebagai saluran transportasi antarsel dan tempat perakitan protein serta lipid.',
    spokenNarration: 'Ini adalah Pelabuhan Desa, Retikulum Endoplasma. Berfungsi sebagai saluran transportasi antarsel dan tempat perakitan protein serta lipid.'
  },
  'hotspot-1-2': {
    title: 'Pusat Kesehatan - Peroksisom',
    subtitle: 'Peroksisom',
    description: 'Pusat Kesehatan - Peroksisom. Bertugas menetralkan racun berbahaya seperti hidrogen peroksida menjadi air dan oksigen yang aman.',
    spokenNarration: 'Ini adalah Pusat Kesehatan, Peroksisom. Bertugas menetralkan racun berbahaya seperti hidrogen peroksida menjadi air dan oksigen yang aman.'
  },
  'hotspot-1-3': {
    title: 'Pasar Desa - Badan Golgi',
    subtitle: 'Badan Golgi',
    description: 'Pasar Desa - Badan Golgi. Berperan menerima, mengolah, mengemas, dan mendistribusikan protein ke tujuan yang tepat.',
    spokenNarration: 'Ini adalah Pasar Desa, Badan Golgi. Berperan menerima, mengolah, mengemas, dan mendistribusikan protein ke tujuan yang tepat.'
  },
  'hotspot-1-4': {
    title: 'Pusat Fotosintesis - Kloroplas',
    subtitle: 'Kloroplas',
    description: 'Pusat Fotosintesis - Kloroplas. Menangkap energi cahaya matahari untuk fotosintesis menghasilkan glukosa dan oksigen.',
    spokenNarration: 'Ini adalah Pusat Fotosintesis, Kloroplas. Menangkap energi cahaya matahari untuk fotosintesis menghasilkan glukosa dan oksigen.'
  },
  'hotspot-1-5': {
    title: 'Balai Desa - Inti Sel (Nukleus)',
    subtitle: 'Inti Sel (Nukleus)',
    description: 'Balai Desa - Inti Sel atau Nukleus. Pusat kendali utama yang mengatur seluruh aktivitas sel dan menyimpan informasi genetik DNA.',
    spokenNarration: 'Ini adalah Balai Desa, Inti Sel atau Nukleus. Pusat kendali utama yang mengatur seluruh aktivitas sel dan menyimpan informasi genetik DNA.'
  },
  'hotspot-1-6': {
    title: 'Pusat Produksi - Ribosom',
    subtitle: 'Ribosom',
    description: 'Pusat Produksi - Ribosom. Berperan dalam menghasilkan dan merakit protein yang dibutuhkan untuk membangun sel.',
    spokenNarration: 'Ini adalah Pusat Produksi, Ribosom. Berperan dalam menghasilkan dan merakit protein yang dibutuhkan untuk membangun sel.'
  },
  'hotspot-1-7': {
    title: 'Pembangkit Energi - Mitokondria',
    subtitle: 'Mitokondria',
    description: 'Pembangkit Energi - Mitokondria. Menghasilkan energi ATP melalui proses respirasi seluler untuk menopang kehidupan sel.',
    spokenNarration: 'Ini adalah Pembangkit Energi, Mitokondria. Menghasilkan energi ATP melalui proses respirasi seluler untuk menopang kehidupan sel.'
  },
  'hotspot-1-8': {
    title: 'Pengelolaan Sampah - Lisosom',
    subtitle: 'Lisosom',
    description: 'Pengelolaan Sampah - Lisosom. Berfungsi menguraikan zat sisa, limbah seluler, dan organel yang telah usang atau rusak.',
    spokenNarration: 'Ini adalah Pengelolaan Sampah, Lisosom. Berfungsi menguraikan zat sisa, limbah seluler, dan organel yang telah usang atau rusak.'
  },
  'hotspot-1-9': {
    title: 'Lahan Pertanian - Kloroplas',
    subtitle: 'Kloroplas',
    description: 'Lahan Pertanian - Kloroplas. Mengubah bahan anorganik menjadi bahan organik dengan bantuan sinar matahari.',
    spokenNarration: 'Ini adalah Lahan Pertanian, Kloroplas. Mengubah bahan anorganik menjadi bahan organik dengan bantuan sinar matahari.'
  },
  'hotspot-1-10': {
    title: 'Membran Sel',
    subtitle: 'Membran Sel',
    description: 'Membran Sel. Menjaga bentuk sel, mengatur pertukaran zat, dan memelihara keseimbangan lingkungan internal sel.',
    spokenNarration: 'Ini adalah Membran Sel. Menjaga bentuk sel, mengatur pertukaran zat, dan memelihara keseimbangan lingkungan internal sel.'
  }
};

interface HotspotViewerProps {
  image: string;
  hotspots: Hotspot[];
  onComplete: () => void;
  onClose?: () => void;
  isAlreadyCleared?: boolean;
  isTeacher?: boolean;
}

export const HotspotViewer: React.FC<HotspotViewerProps> = ({
  image,
  hotspots,
  onComplete,
  onClose,
  isAlreadyCleared = false,
  isTeacher = false
}) => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [viewedHotspots, setViewedHotspots] = useState<Set<string>>(new Set());
  const [baseImageError, setBaseImageError] = useState(false);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const keepAliveTimerRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Pre-load voices on browser
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const fetchVoices = () => {
        window.speechSynthesis.getVoices();
      };
      fetchVoices();
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
    return () => {
      stopNarration();
    };
  }, []);

  const stopNarration = () => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    currentUtteranceRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const playNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    stopNarration();

    // Play cheerful sparkling chime first
    sfx.playCheerfulChime();

    // Clean text for clearer cheerful Indonesian speech
    let cleanText = text
      .replace(/#/g, 'Nomor ')
      .replace(/(\d+)\./g, 'Nomor $1, ')
      .replace(/-/g, ', ')
      .trim();

    // Pastikan kata awal selalu seragam: "Ini adalah "
    if (!cleanText.toLowerCase().startsWith('ini adalah')) {
      cleanText = `Ini adalah ${cleanText}`;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtteranceRef.current = utterance;
    (window as any).__activeUtterance = utterance;

    utterance.lang = 'id-ID';
    // Nada cerah dan bersahabat suara perempuan pengisi edukasi
    utterance.pitch = 1.22;
    utterance.rate = 0.98;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Prioritaskan suara perempuan Indonesia (Gadis, Damayanti, Google Bahasa Indonesia wanita, Siti, dll.)
    const femaleVoice = voices.find(v => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      const isIndo = lang.includes('id') || lang.includes('ind');
      const isFemale = name.includes('gadis') || name.includes('damayanti') || name.includes('female') || 
                       name.includes('wanita') || name.includes('perempuan') || name.includes('siti') ||
                       name.includes('google') || name.includes('natural');
      return isIndo && isFemale;
    }) || voices.find(v => {
      const lang = v.lang.toLowerCase();
      return lang.includes('id') || lang.includes('ind');
    }) || voices.find(v => {
      const name = v.name.toLowerCase();
      return name.includes('female') || name.includes('gadis') || name.includes('zira') || name.includes('samantha');
    });

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      // Keep-alive timer untuk mencegah browser menghentikan pembacaan di tengah kalimat panjang
      keepAliveTimerRef.current = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          if (keepAliveTimerRef.current) {
            clearInterval(keepAliveTimerRef.current);
            keepAliveTimerRef.current = null;
          }
        }
      }, 9000);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (keepAliveTimerRef.current) {
        clearInterval(keepAliveTimerRef.current);
        keepAliveTimerRef.current = null;
      }
      currentUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (keepAliveTimerRef.current) {
        clearInterval(keepAliveTimerRef.current);
        keepAliveTimerRef.current = null;
      }
      currentUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const cleanKey = image.replace(/^__MEDIA__/, '').trim();
  const candidates = getAssetCandidates(image, 'jpeg');

  // Setiap kali ceklis diklik (termasuk petunjuk dan peta), otomatis suara perempuan membaca
  useEffect(() => {
    if (activeHotspot) {
      const fallbackNarration = activeHotspot.title?.toLowerCase().startsWith('ini adalah')
        ? activeHotspot.title
        : `Ini adalah ${activeHotspot.title || "fasilitas Desa Sel"}.`;
      const info = HOTSPOT_EXPLANATIONS[activeHotspot.id] || {
        title: activeHotspot.title || "Detail Ceklis",
        subtitle: "Penjelasan",
        description: activeHotspot.title || "Keterangan fasilitas Desa Sel.",
        spokenNarration: fallbackNarration
      };
      const textToRead = info.spokenNarration || `Ini adalah ${info.title}. ${info.description}`;
      const timer = setTimeout(() => {
        playNarration(textToRead);
      }, 150);

      return () => {
        clearTimeout(timer);
        stopNarration();
      };
    } else {
      stopNarration();
    }
  }, [activeHotspot]);

  // Load custom stored image from IndexedDB or server cache and listen to updates
  const loadCustomMedia = () => {
    const baseName = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
    const probeKeys = baseName !== cleanKey ? [cleanKey, baseName] : [cleanKey];

    Promise.all(probeKeys.map(async k => (await getMediaResolvedURL(k)) || (await getMediaObjectURL(k)))).then(urls => {
      const found = urls.find(u => !!u);
      if (found) {
        setCustomUrl(found);
        setBaseImageError(false);
      }
    });
  };

  useEffect(() => {
    loadCustomMedia();
    const unsubscribe = onMediaUpdated(() => {
      loadCustomMedia();
    });
    return unsubscribe;
  }, [cleanKey]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objUrl = URL.createObjectURL(file);
    setCustomUrl(objUrl);
    setBaseImageError(false);
    sfx.playCorrect();

    const baseName = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

    // Strict slot isolation: Save only to this specific slot's key
    await saveMediaBlob(cleanKey, file);
    if (baseName !== cleanKey) {
      await saveMediaBlob(baseName, file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const objUrl = URL.createObjectURL(file);
      setCustomUrl(objUrl);
      setBaseImageError(false);
      sfx.playCorrect();

      const baseName = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

      // Strict slot isolation: Save only to this specific slot's key
      await saveMediaBlob(cleanKey, file);
      if (baseName !== cleanKey) {
        await saveMediaBlob(baseName, file);
      }
    }
  };

  const handleImageError = () => {
    if (customUrl) {
      setBaseImageError(true);
      return;
    }
    if (candidateIdx < candidates.length - 1) {
      setCandidateIdx(prev => prev + 1);
    } else {
      setBaseImageError(true);
    }
  };

  const activeImageSrc = customUrl || candidates[candidateIdx] || resolveMediaPath(image);
  const isPetunjukView = cleanKey.includes('015') || cleanKey.includes('petunjuk') || hotspots.some(h => h.id.startsWith('hotspot-0'));

  const handleHotspotClick = (hotspot: Hotspot) => {
    sfx.playClick();
    setActiveHotspot(hotspot);
    setHoveredHotspot(null);
    setViewedHotspots(prev => {
      const next = new Set(prev);
      next.add(hotspot.id);
      return next;
    });
  };

  const handleStageTouchMove = (e: React.TouchEvent) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const pin = elem?.closest('[data-hotspot-id]');
    if (pin) {
      const id = pin.getAttribute('data-hotspot-id');
      const found = hotspots.find(h => h.id === id);
      if (found && found.id !== hoveredHotspot?.id) {
        setHoveredHotspot(found);
      }
    }
  };

  const allViewed = hotspots.every(h => viewedHotspots.has(h.id)) || isAlreadyCleared;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Guide */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base">Titik Informasi Interaktif</p>
            <p className="text-xs text-slate-600">
              Ketuk setiap lingkaran berkedip di gambar untuk melihat analogi dan penjelasan detail.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {viewedHotspots.size} / {hotspots.length} Dibuka
          </span>
          <button
            type="button"
            onClick={() => {
              sfx.playStageComplete();
              onComplete();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              allViewed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesai &amp; Buka Level Berikutnya</span>
          </button>
        </div>
      </div>

      {/* Image Controls Toolbar (Only for Teacher / Admin) */}
      {isTeacher && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">Tampilan Petunjuk:</span>
            <span className="text-slate-500 font-mono text-[11px] truncate max-w-[200px] sm:max-w-none bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {customUrl ? 'Berkas Pilihan Pengguna (Aktif)' : cleanKey}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManagerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md border border-teal-500/50 cursor-pointer active:scale-95 transition-all"
              title="Kelola dan unggah foto untuk setiap ceklis"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Upload Foto Ceklis ({hotspots.length})</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md border border-amber-600/30 cursor-pointer active:scale-95 transition-all"
              title="Klik untuk memilih berkas gambar petunjuk yang Anda simpan di perangkat"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ganti Gambar Petunjuk</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Image Stage with Hotspot Pins & Drag-Drop */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onTouchMove={handleStageTouchMove}
        className="relative rounded-2xl overflow-hidden border-2 border-emerald-300/60 bg-emerald-950/20 shadow-inner select-none flex items-center justify-center min-h-[380px] sm:min-h-[500px]"
      >
        {!baseImageError ? (
          <img
            src={activeImageSrc}
            alt="Panduan Petunjuk Desa Sel"
            className="w-full h-auto object-contain block"
            onError={handleImageError}
          />
        ) : (
          /* High-Fidelity Interactive Visual Fallback matching Gemini_Generated_Image */
          <div className="relative w-full aspect-[16/9] min-h-[400px] bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200 flex items-stretch overflow-hidden border border-emerald-400">
            {/* Landscape background decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-60">
              <div className="absolute -top-10 left-1/4 w-96 h-32 bg-white/50 rounded-full blur-xl" />
              <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-emerald-600/40 via-emerald-400/20 to-transparent" />
            </div>

            {/* Content Layout */}
            <div className="relative z-10 w-full h-full flex flex-col sm:flex-row items-center justify-between p-4 sm:p-8 gap-4">
              {/* Left Column: Hijab Scout Student with Speech Bubble */}
              <div className="flex flex-col items-center sm:items-start max-w-[220px] flex-shrink-0">
                {/* Speech Bubble "PETUNJUK" */}
                <div className="relative mb-3 bg-amber-300 border-4 border-amber-950 px-5 py-2 rounded-3xl shadow-xl animate-pulse">
                  <span className="font-fredoka font-black text-lg sm:text-xl text-slate-950 tracking-wider">
                    PETUNJUK
                  </span>
                  <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-amber-950" />
                  <div className="absolute -bottom-2 left-[33px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-300" />
                </div>

                {/* Hijab Student Visual Card */}
                <div className="w-32 h-44 sm:w-40 sm:h-56 bg-amber-100/90 rounded-3xl border-4 border-amber-900 shadow-2xl p-3 flex flex-col items-center justify-between text-center">
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-amber-800 shadow-inner flex items-center justify-center text-3xl">
                    🧕
                  </div>
                  <div className="bg-amber-900 text-amber-100 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-700">
                    Panduan Warga
                  </div>
                  <div className="text-[10px] text-amber-900 font-semibold leading-tight">
                    Ketuk tiap nomor ceklis di papan untuk membaca petunjuk dan penjelasan!
                  </div>
                </div>
              </div>

              {/* Right Column: Wooden Planks Signboard */}
              <div className="flex-1 w-full max-w-xl bg-amber-100/95 border-4 border-amber-900 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-2 relative">
                <div className="absolute -top-3.5 right-6 bg-amber-800 text-amber-100 text-[10px] sm:text-xs font-black px-3 py-0.5 rounded-full border border-amber-600">
                  Desa Sel • Biologi
                </div>

                {/* 6 Wooden Plank Rows */}
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <div className="flex items-center gap-3 bg-amber-200/80 border-2 border-amber-800/80 rounded-2xl px-3 py-2 shadow-sm">
                    <span className="text-xl sm:text-2xl">🗺️</span>
                    <span className="font-bold text-xs sm:text-sm text-amber-950 font-fredoka">1. Jelajahi peta desa</span>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-200/80 border-2 border-amber-800/80 rounded-2xl px-3 py-2 shadow-sm">
                    <span className="text-xl sm:text-2xl">🎯</span>
                    <span className="font-bold text-xs sm:text-sm text-amber-950 font-fredoka">2. Selesaikan misi tiap warga</span>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-200/80 border-2 border-amber-800/80 rounded-2xl px-3 py-2 shadow-sm">
                    <span className="text-xl sm:text-2xl">💡</span>
                    <span className="font-bold text-xs sm:text-sm text-amber-950 font-fredoka">3. Gunakan petunjuk jika ragu</span>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-200/80 border-2 border-amber-800/80 rounded-2xl px-3 py-2 shadow-sm">
                    <span className="text-xl sm:text-2xl">⭐</span>
                    <span className="font-bold text-xs sm:text-sm text-amber-950 font-fredoka">4. Kumpulkan bintang</span>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-200/80 border-2 border-amber-800/80 rounded-2xl px-3 py-2 shadow-sm">
                    <span className="text-xl sm:text-2xl">🔗</span>
                    <span className="font-bold text-xs sm:text-sm text-amber-950 font-fredoka">5. Ingat, semua warga saling terhubung</span>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-200/80 border-2 border-amber-800/80 rounded-2xl px-3 py-2 shadow-sm">
                    <span className="text-xl sm:text-2xl">🚀</span>
                    <span className="font-bold text-xs sm:text-sm text-amber-950 font-fredoka">6. Siap memulai?</span>
                  </div>
                </div>

                {/* Bottom Wooden Sign "PETA DESA" & Info */}
                <div className="mt-2 pt-2 border-t border-amber-300 flex items-center justify-between text-xs">
                  {isTeacher ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-amber-800 hover:text-amber-950 underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Pasang file asli Gemini_Generated_Image...</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-800 font-semibold">
                      Panduan Petualangan Desa Sel
                    </span>
                  )}
                  <div className="px-3 py-1 bg-emerald-700 text-white font-black text-xs font-fredoka rounded-xl border border-emerald-900 shadow">
                    PETA DESA
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hotspots Overlay */}
        {hotspots.map((hotspot, idx) => {
          const isVisited = viewedHotspots.has(hotspot.id);
          const isHovered = hoveredHotspot?.id === hotspot.id;

          return (
            <React.Fragment key={hotspot.id}>
              {/* Optional full-row hitbox for each wooden plank in Petunjuk mode */}
              {isPetunjukView && (
                <div
                  style={{
                    left: '59%',
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '63%',
                    height: '8.2%'
                  }}
                  onClick={() => handleHotspotClick(hotspot)}
                  onMouseEnter={() => setHoveredHotspot(hotspot)}
                  onMouseLeave={() => setHoveredHotspot(prev => (prev?.id === hotspot.id ? null : prev))}
                  className="absolute z-10 cursor-pointer rounded-2xl hover:bg-amber-400/20 active:bg-amber-400/30 transition-colors border border-transparent hover:border-amber-400/50"
                  title={hotspot.title}
                />
              )}

              <button
                type="button"
                id={`hotspot-pin-${idx}`}
                data-hotspot-id={hotspot.id}
                onClick={() => handleHotspotClick(hotspot)}
                onMouseEnter={() => setHoveredHotspot(hotspot)}
                onMouseLeave={() => setHoveredHotspot(prev => (prev?.id === hotspot.id ? null : prev))}
                onTouchStart={() => setHoveredHotspot(hotspot)}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`absolute group z-20 transition-transform duration-150 ${isHovered ? 'scale-125 z-30' : 'hover:scale-115'} active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-full cursor-pointer flex items-center justify-center`}
                title={hotspot.title || `Ceklis Petunjuk #${idx + 1}`}
              >
                {/* Subtle pulsing ring animation */}
                {!isVisited && (
                  <span className="absolute -inset-1 rounded-full animate-ping opacity-30 bg-purple-400 pointer-events-none" />
                )}

                {/* Pin button circle - uniform, crisp, and neat across all 6 items */}
                <div
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-[2.5px] border-white shadow-lg transition-all ${
                    isVisited
                      ? 'bg-[#5c1254] text-white ring-2 ring-purple-300/60'
                      : isHovered
                      ? 'bg-[#92218b] text-white ring-2 ring-amber-300'
                      : 'bg-[#7b1b75] hover:bg-[#92218b] text-white'
                  }`}
                >
                  <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white stroke-[3.5]" />
                </div>

                {/* Mini Tooltip on hover if popover is not rendered */}
                <span className="sr-only">
                  {hotspot.title || `Ceklis #${idx + 1}`}
                </span>
              </button>
            </React.Fragment>
          );
        })}

        {/* Floating Live Image Preview on Hover / Slide across checkmarks */}
        {hoveredHotspot && (
          <div
            style={{
              left: hoveredHotspot.x < 50 ? `${hoveredHotspot.x + 3.5}%` : `${hoveredHotspot.x - 3.5}%`,
              top: `${Math.max(8, Math.min(62, hoveredHotspot.y))}%`,
              transform: hoveredHotspot.x < 50 ? 'translate(0, -20%)' : 'translate(-100%, -20%)'
            }}
            className="absolute z-40 pointer-events-auto w-64 sm:w-72 md:w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-2xl overflow-hidden transition-all duration-150 animate-in fade-in zoom-in-95 cursor-pointer"
            onClick={() => handleHotspotClick(hoveredHotspot)}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-3 py-2 flex items-center justify-between border-b border-emerald-700/60">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                  {hotspots.indexOf(hoveredHotspot) + 1}
                </span>
                <h4 className="font-bold text-xs text-amber-200 font-fredoka truncate">
                  {hoveredHotspot.title || "Detail Gambar"}
                </h4>
              </div>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {isTeacher && <HotspotPhotoUploader hotspot={hoveredHotspot} compact={true} />}
                <span className="text-[9px] bg-emerald-600/70 text-emerald-100 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  Buka
                </span>
              </div>
            </div>

            {/* Illustration / Image preview */}
            <div className="h-36 sm:h-40 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800">
              <HotspotIllustration
                hotspotId={hoveredHotspot.id}
                filePath={hoveredHotspot.contents.find(c => c.type === 'image')?.filePath}
                title={hoveredHotspot.title}
                className="w-full h-full"
              />
            </div>

            {/* Footer Prompt */}
            <div className="px-3 py-1.5 bg-slate-900 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold text-[10px]">
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                <span>Ketuk untuk dengar suara pembaca perempuan &amp; lihat gambar</span>
              </span>
              <span className="text-emerald-400 text-[10px] font-bold">➔</span>
            </div>
          </div>
        )}

        {/* Interactive Clickable Area for PETA DESA button in picture */}
        <button
          type="button"
          onClick={() => {
            sfx.playClick();
            if (onClose) onClose();
            else onComplete();
          }}
          style={{
            left: '90.8%',
            top: '94.1%',
            transform: 'translate(-50%, -50%)',
            width: '15%',
            height: '7.5%'
          }}
          className="absolute z-20 rounded-xl cursor-pointer hover:bg-white/20 active:scale-95 transition-all border-2 border-transparent hover:border-emerald-300 shadow-xs"
          title="Kembali ke Peta Desa"
          aria-label="Kembali ke Peta Desa"
        />
      </div>

      {/* Hotspot Card Modal / Drawer */}
      {activeHotspot && (() => {
        const isPetunjuk = activeHotspot.id === 'hotspot-1-0' || activeHotspot.id.startsWith('hotspot-0') || cleanKey.includes('015') || cleanKey.includes('petunjuk') || activeHotspot.title.toLowerCase().includes('petunjuk');
        const fallbackNarration = activeHotspot.title?.toLowerCase().startsWith('ini adalah')
          ? activeHotspot.title
          : `Ini adalah ${activeHotspot.title || "fasilitas Desa Sel"}.`;
        const activeExplanation: HotspotInfo = HOTSPOT_EXPLANATIONS[activeHotspot.id] || {
          title: activeHotspot.title || "Detail Ceklis",
          subtitle: isPetunjuk ? "Petunjuk" : "Keterangan Organel",
          description: activeHotspot.title || "Keterangan fasilitas Desa Sel.",
          spokenNarration: fallbackNarration
        };

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={() => {
              stopNarration();
              setActiveHotspot(null);
            }}
          >
            <div 
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-3 sm:border-4 border-amber-300 max-w-md w-full overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-3 sm:p-4 text-white flex items-center justify-between border-b border-emerald-600">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black flex-shrink-0 shadow">
                    {hotspots.indexOf(activeHotspot) + 1}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base font-fredoka tracking-wide truncate text-amber-100">
                    {activeExplanation.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopNarration();
                    setActiveHotspot(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer flex-shrink-0"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-3 sm:p-4 overflow-y-auto flex flex-col gap-3">
                {/* Voice Narration Audio Bar - Aktif untuk SEMUA Ceklis (Termasuk Petunjuk dan Organel) */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-300/80 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs transition-all ${isSpeaking ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 scale-105 ring-2 ring-emerald-300' : 'bg-slate-700'}`}>
                      {isSpeaking ? (
                        <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-emerald-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-950 font-fredoka flex items-center gap-1.5">
                        <span>Pengisi Suara Perempuan</span>
                        {isSpeaking ? (
                          <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                            Membaca Riang...
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-sans font-medium">
                            Suara Aktif ✨
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        {isSpeaking ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <span>Membacakan teks panduan</span>
                            <span className="flex items-center gap-0.5">
                              <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
                              <span className="w-1 h-3.5 bg-amber-500 rounded-full animate-bounce [animation-delay:150ms]" />
                              <span className="w-1 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:300ms]" />
                            </span>
                          </span>
                        ) : (
                          <span>Otomatis membaca saat ceklis dibuka</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isSpeaking ? (
                      <button
                        type="button"
                        onClick={stopNarration}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        title="Hentikan Pengisi Suara"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Hentikan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          playNarration(activeExplanation.spokenNarration || `${activeExplanation.title}. ${activeExplanation.description}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                        title="Dengarkan Ulang Suara Perempuan"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Baca Ulang</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Compact Image / Illustration - Muncul di setiap ceklis */}
                <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-950 h-36 sm:h-44 w-full flex items-center justify-center relative">
                  <HotspotIllustration
                    hotspotId={activeHotspot.id}
                    filePath={activeHotspot.contents.find(c => c.type === 'image')?.filePath}
                    title={activeExplanation.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-sm text-amber-300 text-[9px] px-2 py-0.5 rounded-full font-bold border border-amber-300/30">
                    {activeExplanation.subtitle}
                  </div>
                </div>

                {/* Text Display dengan Suara Pembaca */}
                <div className="bg-amber-50/95 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 text-slate-800 shadow-xs relative">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5 font-fredoka">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isPetunjuk ? 'Suara Pembaca Petunjuk:' : 'Suara Penjelasan Organel:'}</span>
                    </span>
                    {isSpeaking ? (
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse shadow-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        Dibacakan Narator 🔊
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        Suara Aktif ✨
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-amber-950 font-bold leading-relaxed">
                    "{activeExplanation.spokenNarration}"
                  </p>
                  {activeExplanation.description && activeExplanation.description !== activeExplanation.spokenNarration && (
                    <div className="mt-2 text-xs text-amber-900/85 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200 leading-relaxed font-medium">
                      {activeExplanation.description}
                    </div>
                  )}
                </div>

                {/* Pre-recorded audio track if any */}
                {activeHotspot.contents.some(c => c.type === 'audio') && (
                  <div>
                    {activeHotspot.contents.map((item, idx) => {
                      if (item.type === 'audio') {
                        return (
                          <div key={idx} className="mt-1">
                            <AudioPlayer
                              src={item.filePath || ""}
                              title={item.title || activeExplanation.title}
                              autoPlay={false}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                {/* Upload photo feature for this specific checklist hotspot */}
                <div className="mt-1">
                  <HotspotPhotoUploader
                    hotspot={activeHotspot}
                  />
                </div>
              </div>

              {/* Modal Footer - TUTUP ONLY */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium truncate mr-2">
                  Ceklis #{hotspots.indexOf(activeHotspot) + 1} • Tutup untuk memilih ceklis lain di peta
                </span>
                <button
                  type="button"
                  onClick={() => {
                    stopNarration();
                    setActiveHotspot(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95 transition-all flex-shrink-0"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Checklist Photo Manager Modal (Teachers only) */}
      {isTeacher && (
        <ChecklistPhotoManagerModal
          hotspots={hotspots}
          isOpen={isManagerOpen}
          onClose={() => setIsManagerOpen(false)}
          title="Kelola & Upload Foto Ceklis Peta"
        />
      )}
    </div>
  );
};
