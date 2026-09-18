import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HardDrive, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Image as ImageIcon,
  Video,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  saveMediaBlob, 
  deleteMediaBlob, 
  getMediaObjectURL, 
  getMediaResolvedURL,
  syncAllMediaToProject, 
  downloadMediaBackup, 
  downloadMediaZip,
  restoreMediaBackup,
  onMediaUpdated
} from '../utils/mediaStore';
import { sfx } from '../utils/audio';
import { MediaPlaceholder } from './MediaPlaceholder';

interface MediaSlot {
  key: string;
  label: string;
  levelGroup: string;
  type: 'image' | 'video';
  description: string;
}

const ALL_LEVEL_SLOTS: MediaSlot[] = [
  // Welcome & Intro
  { key: 'landing_page_video', label: 'Video Intro Landing Page', levelGroup: 'Welcome Screen', type: 'video', description: 'Video pembuka Misi Petualangan Desa Sel pada Landing Page setelah login (terisolasi dari level)' },
  { key: 'asset_001', label: 'Video Intro Pembuka', levelGroup: 'Layar Utama', type: 'video', description: 'Video pengantar BioVillage Simulator pada layar judul' },
  { key: 'asset_002', label: 'Gambar Peta Desa Sel', levelGroup: 'Peta Utama', type: 'image', description: 'Latar belakang peta desa interaktif dengan rute dan titik misi' },

  // Stage 0: Petunjuk
  { key: 'asset_015', label: 'Papan Panduan Petunjuk', levelGroup: 'Tahap 0: Petunjuk', type: 'image', description: 'Gambar utama panduan petualangan desa sel' },
  { key: 'asset_003', label: 'Ceklis 1: Jelajahi Peta', levelGroup: 'Tahap 0: Petunjuk', type: 'image', description: 'Foto/ilustrasi ceklis jelajahi peta' },
  { key: 'asset_005', label: 'Ceklis 2: Misi Warga', levelGroup: 'Tahap 0: Petunjuk', type: 'image', description: 'Foto/ilustrasi ceklis misi warga desa' },
  { key: 'asset_007', label: 'Ceklis 3: Petunjuk Ragu', levelGroup: 'Tahap 0: Petunjuk', type: 'image', description: 'Foto/ilustrasi ceklis bantuan petunjuk' },
  { key: 'asset_009', label: 'Ceklis 4: Bintang Prestasi', levelGroup: 'Tahap 0: Petunjuk', type: 'image', description: 'Foto/ilustrasi ceklis bintang' },
  { key: 'asset_011', label: 'Ceklis 5: Keterhubungan', levelGroup: 'Tahap 0: Petunjuk', type: 'image', description: 'Foto/ilustrasi keterhubungan warga' },
  { key: 'asset_013', label: 'Ceklis 6: Siap Mulai', levelGroup: 'Tahap 0: Petunjuk', type: 'image', description: 'Foto/ilustrasi siap memulai misi' },

  // Stage 1: Peta Desa Hotspots
  { key: 'asset_027', label: 'Latar Fasilitas Desa', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Gambar utama sebaran fasilitas desa' },
  { key: 'asset_017', label: 'Pelabuhan (RE)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi pelabuhan desa dan Retikulum Endoplasma' },
  { key: 'asset_018', label: 'Pusat Kesehatan (Peroksisom)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi pusat kesehatan dan peroksisom' },
  { key: 'asset_019', label: 'Pasar Desa (Badan Golgi)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi pasar desa dan badan golgi' },
  { key: 'asset_020', label: 'Pusat Fotosintesis (Kloroplas)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi kloroplas tanaman' },
  { key: 'asset_021', label: 'Balai Desa (Inti Sel/Nukleus)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi balai desa dan nukleus' },
  { key: 'asset_022', label: 'Pusat Produksi (Ribosom)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi bengkel produksi dan ribosom' },
  { key: 'asset_023', label: 'Pembangkit Energi (Mitokondria)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi gardu listrik dan mitokondria' },
  { key: 'asset_024', label: 'Pengelolaan Sampah (Lisosom)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi TPA dan lisosom' },
  { key: 'asset_025', label: 'Lahan Pertanian (Kloroplas)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi kebun desa dan kloroplas' },
  { key: 'asset_026', label: 'Gerbang Masuk (Membran Sel)', levelGroup: 'Tahap 1: Peta Desa', type: 'image', description: 'Foto/analogi pos jaga dan membran sel' },

  // Level 2: Membran Sel
  { key: 'level2_town_bg', label: 'Latar Peta Sarana Kota (Level 2)', levelGroup: 'Level 2: Membran Sel', type: 'image', description: 'Gambar latar aktivitas interaktif seret sarana fasilitas kota Level 2 (terisolasi dari Tahap 1)' },
  { key: 'asset_028', label: 'Materi Membran Sel', levelGroup: 'Level 2: Membran Sel', type: 'image', description: 'Diagram struktur lipid bilayer dan protein kanal' },
  { key: 'asset_029', label: 'Latar Aktivitas Membran', levelGroup: 'Level 2: Membran Sel', type: 'image', description: 'Latar interaktif lalu lintas zat membran' },

  // Level 3: Inti Sel & Sekresi Protein
  { key: 'asset_035', label: 'Video Jalur Sekresi Protein', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'video', description: 'Video materi jalur sekresi protein endomembran' },
  { key: 'asset_036', label: 'Gambar Alur Sintesis Protein', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Infografis tahapan pembentukan protein' },
  { key: 'asset_037', label: 'Latar Drag & Drop Level 3', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Papan bagan alir proses sintesis protein' },
  { key: 'asset_037b', label: 'Diagram Kesimpulan Produksi Protein', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Infografis rangkuman kesimpulan harmoni sintesis protein slide 4' },
  { key: 'asset_042', label: 'Organel: Ribosom', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Potongan kartu organel Ribosom' },
  { key: 'asset_041', label: 'Organel: RE Kasar', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Potongan kartu organel RE Kasar' },
  { key: 'asset_039', label: 'Organel: Vesikel Transport', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Potongan kartu organel Vesikel Transport' },
  { key: 'asset_038', label: 'Organel: Badan Golgi', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Potongan kartu organel Badan Golgi' },
  { key: 'asset_040', label: 'Organel: Membran Sel', levelGroup: 'Level 3: Inti Sel & Sekresi', type: 'image', description: 'Potongan kartu organel Membran Sel' },

  // Level 4: RE & Badan Golgi
  { key: 'asset_043', label: 'Video Retikulum Endoplasma', levelGroup: 'Level 4: RE & Golgi', type: 'video', description: 'Video pengolahan makromolekul di RE' },
  { key: 'asset_047', label: 'Video Badan Golgi', levelGroup: 'Level 4: RE & Golgi', type: 'video', description: 'Video pengemasan dan sortir di Golgi' },
  { key: 'asset_048', label: 'Gambar Kolaborasi RE & Golgi', levelGroup: 'Level 4: RE & Golgi', type: 'image', description: 'Diagram alur vesikel transfer antara RE dan Golgi' },

  // Level 5: Mitokondria & Kloroplas
  { key: 'asset_049', label: 'Video Respirasi Seluler', levelGroup: 'Level 5: Mitokondria & Energi', type: 'video', description: 'Proses pembentukan energi ATP di mitokondria' },
  { key: 'asset_050', label: 'Latar Analisis Kaskade Energi', levelGroup: 'Level 5: Mitokondria & Energi', type: 'image', description: 'Papan kaskade rantai dampak krisis ATP' },
  { key: 'asset_054', label: 'Tahap 1: Gangguan Mitokondria', levelGroup: 'Level 5: Mitokondria & Energi', type: 'image', description: 'Kartu tahap 1 kaskade energi' },
  { key: 'asset_051', label: 'Tahap 2: Penurunan ATP', levelGroup: 'Level 5: Mitokondria & Energi', type: 'image', description: 'Kartu tahap 2 kaskade energi' },
  { key: 'asset_052', label: 'Tahap 3: Krisis Energi Sel', levelGroup: 'Level 5: Mitokondria & Energi', type: 'image', description: 'Kartu tahap 3 kaskade energi' },
  { key: 'asset_053', label: 'Tahap 4: Disfungsi Sel', levelGroup: 'Level 5: Mitokondria & Energi', type: 'image', description: 'Kartu tahap 4 kaskade energi' },

  // Level 6: Lisosom & Peroksisom
  { key: 'asset_056', label: 'Latar Pengolahan Sampah', levelGroup: 'Level 6: Lisosom & Limbah', type: 'image', description: 'Latar pusat daur ulang lisosom' },
  { key: 'asset_058', label: 'Materi Enzim Hidrolitik', levelGroup: 'Level 6: Lisosom & Limbah', type: 'image', description: 'Ilustrasi enzim pemecah makromolekul' },
  { key: 'asset_059', label: 'Materi Detoksifikasi Peroksisom', levelGroup: 'Level 6: Lisosom & Limbah', type: 'image', description: 'Diagram netralisasi hidrogen peroksida' },

  // Level 7: Vakuola & Dinding Sel
  { key: 'asset_061', label: 'Video Tekanan Turgor', levelGroup: 'Level 7: Turgor & Dinding Sel', type: 'video', description: 'Video dinamika vakuola dan kekakuan dinding sel' },
  { key: 'asset_062', label: 'Struktur Vakuola Pusat', levelGroup: 'Level 7: Turgor & Dinding Sel', type: 'image', description: 'Diagram tonoplas dan cairan vakuola' },
  { key: 'asset_063', label: 'Lapisan Selulosa Dinding Sel', levelGroup: 'Level 7: Turgor & Dinding Sel', type: 'image', description: 'Struktur mikrofibril pelindung sel tumbuhan' },

  // Level 8: Refleksi & Sintesis Akhir
  { key: 'asset_064', label: 'Infografis Ekosistem Sel', levelGroup: 'Level 8: Sintesis Akhir', type: 'image', description: 'Peta konsep holistik integrasi seluruh organel sel' }
];

interface ProjectMediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectMediaManagerModal: React.FC<ProjectMediaManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [mediaUrls, setMediaUrls] = useState<Record<string, string | null>>({});
  const [brokenSlots, setBrokenSlots] = useState<Record<string, boolean>>({});
  const [selectedGroup, setSelectedGroup] = useState<string>('Semua');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const activeSlotKeyRef = useRef<string | null>(null);

  const groups = ['Semua', ...Array.from(new Set(ALL_LEVEL_SLOTS.map(s => s.levelGroup)))];

  const refreshSlots = async () => {
    const urls: Record<string, string | null> = {};
    for (const slot of ALL_LEVEL_SLOTS) {
      const url = await getMediaResolvedURL(slot.key) || await getMediaObjectURL(slot.key);
      urls[slot.key] = url;
    }
    setMediaUrls(urls);
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshSlots();
    const unsub = onMediaUpdated(() => {
      refreshSlots();
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSlots = selectedGroup === 'Semua'
    ? ALL_LEVEL_SLOTS
    : ALL_LEVEL_SLOTS.filter(s => s.levelGroup === selectedGroup);

  const handleUploadClick = (slotKey: string) => {
    activeSlotKeyRef.current = slotKey;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = activeSlotKeyRef.current;
    if (!file || !key) return;

    try {
      setUploadingKey(key);
      sfx.playClick();
      await saveMediaBlob(key, file);
      // Clean extensions if present
      const clean = key.replace(/^__MEDIA__/, '').trim();
      if (clean !== key) {
        await saveMediaBlob(clean, file);
      }
      sfx.playCorrect();
      await refreshSlots();
      setSyncStatus(`✅ Gambar "${file.name}" berhasil disimpan permanen ke proyek!`);
      setTimeout(() => setSyncStatus(null), 3500);
    } catch (err) {
      console.error(err);
      sfx.playWrong();
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDeleteSlot = async (slotKey: string) => {
    if (confirm('Kembalikan media ini ke ilustrasi bawaan sistem?')) {
      sfx.playClick();
      await deleteMediaBlob(slotKey);
      await refreshSlots();
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncing(true);
      sfx.playClick();
      const res = await syncAllMediaToProject();
      sfx.playCorrect();
      setSyncStatus(`✅ Sinkronisasi Berhasil! ${res.synced} berkas tersimpan permanen di folder proyek server.`);
      setTimeout(() => setSyncStatus(null), 4000);
      await refreshSlots();
    } catch (err) {
      console.error(err);
      sfx.playWrong();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSyncing(true);
      sfx.playClick();
      const success = await restoreMediaBackup(file);
      if (success) {
        sfx.playCorrect();
        setSyncStatus('✅ Berhasil memulihkan semua gambar ke dalam proyek!');
        await refreshSlots();
      } else {
        sfx.playWrong();
        setSyncStatus('❌ Gagal memulihkan berkas cadangan.');
      }
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      console.error(err);
      sfx.playWrong();
    } finally {
      setIsSyncing(false);
      if (restoreInputRef.current) restoreInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.mp4,.webm,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleFileChosen}
      />
      <input
        ref={restoreInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleRestoreFile}
      />

      <div 
        className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-5xl w-full overflow-hidden flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-lg">
              <HardDrive className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-xl font-fredoka text-amber-200">
                  Penyimpanan Media &amp; Gambar Permanen Proyek
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 border border-emerald-400 text-amber-100 uppercase tracking-wider">
                  Permanen di Disk
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Semua gambar &amp; video di setiap level tersimpan aman di server proyek dan tidak akan hilang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Action Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-950 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              <strong>Status:</strong> Terkoneksi ke penyimpanan berkas permanen (<strong>public/assets/</strong>).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
              title="Sinkronkan semua media di browser ke folder proyek permanen"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Proyek'}</span>
            </button>

            <button
              type="button"
              onClick={downloadMediaZip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow cursor-pointer active:scale-95 transition-all"
              title="Unduh semua file gambar & video proyek dalam arsip .ZIP"
            >
              <Download className="w-3.5 h-3.5 text-amber-200" />
              <span>Unduh ZIP (.ZIP)</span>
            </button>

            <button
              type="button"
              onClick={downloadMediaBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer active:scale-95 transition-all"
              title="Unduh file backup semua gambar untuk disimpan di komputer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Cadangan</span>
            </button>

            <button
              type="button"
              onClick={() => restoreInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow cursor-pointer active:scale-95 transition-all"
              title="Pulihkan cadangan dari file JSON"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>Impor Cadangan</span>
            </button>
          </div>
        </div>

        {/* Sync status toast */}
        {syncStatus && (
          <div className="bg-amber-100 text-amber-950 border-b border-amber-300 px-4 py-2 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Filter Tabs by Level Group */}
        <div className="px-4 pt-3 pb-2 flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-50/50">
          {groups.map(grp => (
            <button
              key={grp}
              type="button"
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedGroup === grp
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map(slot => {
            const currentUrl = mediaUrls[slot.key];
            const isCustom = Boolean(currentUrl);
            const isUploading = uploadingKey === slot.key;

            return (
              <div 
                key={slot.key}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-400 p-3.5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md"
              >
                <div>
                  {/* Top tag & type */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 truncate">
                      {slot.levelGroup}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      {slot.type === 'video' ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Gambar</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & description */}
                  <h4 className="font-bold text-sm text-slate-900 leading-snug font-fredoka">
                    {slot.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {slot.description}
                  </p>

                  {/* Preview Area */}
                  <div className="mt-3 relative w-full h-32 rounded-xl bg-slate-900 overflow-hidden border border-slate-700 flex items-center justify-center">
                    {currentUrl && !brokenSlots[slot.key] ? (
                      slot.type === 'video' ? (
                        <video 
                          src={currentUrl} 
                          className="w-full h-full object-cover" 
                          muted 
                          playsInline 
                          onError={() => setBrokenSlots(prev => ({ ...prev, [slot.key]: true }))}
                        />
                      ) : (
                        <img 
                          src={currentUrl} 
                          alt={slot.label} 
                          className="w-full h-full object-contain"
                          onError={() => setBrokenSlots(prev => ({ ...prev, [slot.key]: true }))}
                        />
                      )
                    ) : brokenSlots[slot.key] ? (
                      <div 
                        onClick={() => handleUploadClick(slot.key)}
                        className="flex flex-col items-center justify-center p-2 text-center text-slate-300 hover:text-white cursor-pointer bg-slate-800/80 w-full h-full"
                      >
                        <Upload className="w-6 h-6 mb-1 text-amber-400 animate-pulse" />
                        <span className="text-[11px] font-bold text-amber-300">Aset Belum Tersedia</span>
                        <span className="text-[9px] text-slate-400">Klik untuk upload sekarang</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <Layers className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[10px] font-medium text-slate-400">
                          Menggunakan Ilustrasi Sistem
                        </span>
                      </div>
                    )}

                    {/* Badge status */}
                    <div className="absolute top-2 right-2">
                      {isCustom && !brokenSlots[slot.key] ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white shadow">
                          <CheckCircle2 className="w-3 h-3 text-amber-300" />
                          <span>Tersimpan di Proyek</span>
                        </span>
                      ) : brokenSlots[slot.key] ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 shadow">
                          <span>Perlu Upload</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800/90 text-slate-300 border border-slate-600 shadow">
                          <span>Bawaan</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUploadClick(slot.key)}
                    disabled={isUploading}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isUploading ? 'Menyimpan...' : isCustom ? 'Ganti Berkas' : 'Upload Berkas'}</span>
                  </button>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.key)}
                      className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      title="Kembalikan ke ilustrasi bawaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800">Total Media:</span>
            <span>{ALL_LEVEL_SLOTS.length} item di semua level permainan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer active:scale-95 shadow transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
