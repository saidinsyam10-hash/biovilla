import React, { useState, useEffect, useRef } from 'react';
import { 
  saveMediaBlob, 
  deleteMediaBlob, 
  getMediaBlob, 
  getMediaObjectURL, 
  getCustomMediaUrl, 
  saveCustomMediaUrl, 
  deleteCustomMediaUrl,
  onMediaUpdated 
} from '../utils/mediaStore';
import { sfx } from '../utils/audio';
import { 
  X, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Link as LinkIcon, 
  Play, 
  Layers, 
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';

interface Level3MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'video' | 'image' | 'dragdrop';
}

export const Level3MediaModal: React.FC<Level3MediaModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'video'
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'dragdrop'>(initialTab);
  
  // Custom media states
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [bgSrc, setBgSrc] = useState<string | null>(null);
  const [organelleSrcs, setOrganelleSrcs] = useState<Record<string, string | null>>({});

  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [hasCustomBg, setHasCustomBg] = useState(false);

  // URL input states
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showVideoUrlBox, setShowVideoUrlBox] = useState(false);
  const [showImageUrlBox, setShowImageUrlBox] = useState(false);

  // Status & loading
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const organelleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const organelleList = [
    { id: 'asset_042', filename: 'asset_042.jpeg', label: '1. Ribosom', desc: 'Tempat translasi sintesis protein awal' },
    { id: 'asset_041', filename: 'asset_041.jpeg', label: '2. RE Kasar', desc: 'Modifikasi & pelipatan rantai polipeptida' },
    { id: 'asset_039', filename: 'asset_039.jpeg', label: '3. Vesikel Transport', desc: 'Membawa molekul menuju Badan Golgi' },
    { id: 'asset_038', filename: 'asset_038.jpeg', label: '4. Badan Golgi', desc: 'Penyortiran, pengemasan, & labelisasi' },
    { id: 'asset_040', filename: 'asset_040.jpeg', label: '5. Membran Sel', desc: 'Eksositosis pelepasan protein ke luar sel' }
  ];

  // Refresh media URLs from IndexedDB and localStorage
  const refreshMedia = async () => {
    // 1. Video (asset_035.mp4)
    const customVUrl = getCustomMediaUrl('asset_035.mp4') || getCustomMediaUrl('asset_035');
    const blobV = await getMediaObjectURL('asset_035.mp4') || await getMediaObjectURL('asset_035');
    if (customVUrl) {
      setVideoSrc(customVUrl);
      setHasCustomVideo(true);
    } else if (blobV) {
      setVideoSrc(blobV);
      setHasCustomVideo(true);
    } else {
      setVideoSrc('/assets/asset_035.mp4');
      setHasCustomVideo(false);
    }

    // 2. Image (asset_036.png)
    const customIUrl = getCustomMediaUrl('asset_036.png') || getCustomMediaUrl('asset_036');
    const blobI = await getMediaObjectURL('asset_036.png') || await getMediaObjectURL('asset_036');
    if (customIUrl) {
      setImageSrc(customIUrl);
      setHasCustomImage(true);
    } else if (blobI) {
      setImageSrc(blobI);
      setHasCustomImage(true);
    } else {
      setImageSrc('/assets/asset_036.png');
      setHasCustomImage(false);
    }

    // 3. Background (asset_037.png)
    const customBgUrl = getCustomMediaUrl('asset_037.png') || getCustomMediaUrl('asset_037');
    const blobBg = await getMediaObjectURL('asset_037.png') || await getMediaObjectURL('asset_037');
    if (customBgUrl) {
      setBgSrc(customBgUrl);
      setHasCustomBg(true);
    } else if (blobBg) {
      setBgSrc(blobBg);
      setHasCustomBg(true);
    } else {
      setBgSrc('/assets/asset_037.png');
      setHasCustomBg(false);
    }

    // 4. Organelles
    const orgMap: Record<string, string | null> = {};
    for (const org of organelleList) {
      const url = getCustomMediaUrl(org.filename) || getCustomMediaUrl(org.id);
      const b = await getMediaObjectURL(org.filename) || await getMediaObjectURL(org.id);
      orgMap[org.id] = url || b || `/assets/${org.filename}`;
    }
    setOrganelleSrcs(orgMap);
  };

  useEffect(() => {
    if (isOpen) {
      refreshMedia();
    }
    const unsub = onMediaUpdated(() => {
      refreshMedia();
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // --- Handlers for Video ---
  const handleUploadVideo = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
      alert('Mohon pilih berkas video (format MP4, WEBM, MOV).');
      return;
    }
    try {
      setIsSaving(true);
      sfx.playClick();
      await saveMediaBlob('asset_035.mp4', file);
      await saveMediaBlob('asset_035', file);
      deleteCustomMediaUrl('asset_035.mp4');
      deleteCustomMediaUrl('asset_035');
      await refreshMedia();
      showToast('Video simulasi berhasil diunggah dan disimpan!');
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat menyimpan video.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    sfx.playClick();
    saveCustomMediaUrl('asset_035.mp4', videoUrlInput.trim());
    saveCustomMediaUrl('asset_035', videoUrlInput.trim());
    setShowVideoUrlBox(false);
    setVideoUrlInput('');
    showToast('Tautan link video berhasil disimpan!');
    refreshMedia();
  };

  const handleResetVideo = async () => {
    if (!confirm('Kembalikan video Slide 1 ke video simulasi bawaan?')) return;
    sfx.playClick();
    await deleteMediaBlob('asset_035.mp4');
    await deleteMediaBlob('asset_035');
    deleteCustomMediaUrl('asset_035.mp4');
    deleteCustomMediaUrl('asset_035');
    await refreshMedia();
    showToast('Video dikembalikan ke video bawaan.');
  };

  // --- Handlers for Image ---
  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar (format PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    try {
      setIsSaving(true);
      sfx.playClick();
      await saveMediaBlob('asset_036.png', file);
      await saveMediaBlob('asset_036', file);
      deleteCustomMediaUrl('asset_036.png');
      deleteCustomMediaUrl('asset_036');
      await refreshMedia();
      showToast('Gambar skema berhasil diunggah dan disimpan!');
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat menyimpan gambar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    sfx.playClick();
    saveCustomMediaUrl('asset_036.png', imageUrlInput.trim());
    saveCustomMediaUrl('asset_036', imageUrlInput.trim());
    setShowImageUrlBox(false);
    setImageUrlInput('');
    showToast('Tautan link gambar berhasil disimpan!');
    refreshMedia();
  };

  const handleResetImage = async () => {
    if (!confirm('Kembalikan gambar Slide 2 ke skema bawaan?')) return;
    sfx.playClick();
    await deleteMediaBlob('asset_036.png');
    await deleteMediaBlob('asset_036');
    deleteCustomMediaUrl('asset_036.png');
    deleteCustomMediaUrl('asset_036');
    await refreshMedia();
    showToast('Gambar dikembalikan ke gambar bawaan.');
  };

  // --- Handlers for Background ---
  const handleUploadBg = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setIsSaving(true);
      sfx.playClick();
      await saveMediaBlob('asset_037.png', file);
      await saveMediaBlob('asset_037', file);
      deleteCustomMediaUrl('asset_037.png');
      deleteCustomMediaUrl('asset_037');
      await refreshMedia();
      showToast('Gambar latar alur berhasil diperbarui!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetBg = async () => {
    if (!confirm('Kembalikan gambar latar alur ke bawaan?')) return;
    sfx.playClick();
    await deleteMediaBlob('asset_037.png');
    await deleteMediaBlob('asset_037');
    deleteCustomMediaUrl('asset_037.png');
    deleteCustomMediaUrl('asset_037');
    await refreshMedia();
    showToast('Latar dikembalikan ke bawaan.');
  };

  // --- Handlers for Organelles ---
  const handleUploadOrganelle = async (orgId: string, filename: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setIsSaving(true);
      sfx.playClick();
      await saveMediaBlob(filename, file);
      await saveMediaBlob(orgId, file);
      deleteCustomMediaUrl(filename);
      deleteCustomMediaUrl(orgId);
      await refreshMedia();
      showToast(`Gambar organel berhasil diperbarui!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOrganelle = async (orgId: string, filename: string) => {
    sfx.playClick();
    await deleteMediaBlob(filename);
    await deleteMediaBlob(orgId);
    deleteCustomMediaUrl(filename);
    deleteCustomMediaUrl(orgId);
    await refreshMedia();
    showToast(`Gambar organel dikembalikan ke bawaan.`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-xl font-fredoka text-amber-200">
                Kelola Media Level 3 (Video & Gambar)
              </h3>
              <p className="text-xs text-emerald-100">
                Unggah video dan gambar buatanmu sendiri untuk ditampilkan langsung di Level 3
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup Jendela"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 border-b border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-amber-500 text-slate-950 shadow ring-2 ring-amber-300'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-800" />
            <span>Slide 1: Video Simulasi</span>
            {hasCustomVideo && (
              <span className="w-2 h-2 rounded-full bg-emerald-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'image'
                ? 'bg-amber-500 text-slate-950 shadow ring-2 ring-amber-300'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-800" />
            <span>Slide 2: Gambar Skema</span>
            {hasCustomImage && (
              <span className="w-2 h-2 rounded-full bg-emerald-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dragdrop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dragdrop'
                ? 'bg-amber-500 text-slate-950 shadow ring-2 ring-amber-300'
                : 'bg-white hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-800" />
            <span>Slide 3: Gambar Latar & Organel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* TAB 1: VIDEO */}
          {activeTab === 'video' && (
            <div className="flex flex-col gap-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 font-fredoka flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-700" />
                    Video Simulasi Produksi Protein (Slide 1)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Berkas tujuan: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">asset_035.mp4</code>. Mendukung file MP4, WebM, MOV atau tautan video online.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasCustomVideo ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Video Kustom Aktif
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                      Video Standar Sistem
                    </span>
                  )}
                </div>
              </div>

              {/* Video Preview Card */}
              <div className="rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-950 shadow-lg aspect-video max-h-[340px] flex items-center justify-center relative">
                {videoSrc ? (
                  <video 
                    key={videoSrc}
                    src={videoSrc} 
                    controls 
                    className="w-full h-full object-contain"
                  >
                    Browser tidak mendukung tag video.
                  </video>
                ) : (
                  <div className="text-center text-slate-400 p-6 flex flex-col items-center">
                    <Video className="w-12 h-12 text-slate-500 mb-2" />
                    <span className="text-sm font-semibold text-slate-300">Belum ada video</span>
                    <span className="text-xs text-slate-500">Silakan unggah video dari tombol di bawah</span>
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300/40 flex items-center gap-1">
                  <Play className="w-3 h-3 text-amber-400" />
                  Pratinjau Langsung Slide 1
                </div>
              </div>

              {/* Actions & Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Upload File Box */}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadVideo(f);
                    if (videoInputRef.current) videoInputRef.current.value = '';
                  }}
                />

                <div 
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleUploadVideo(f);
                  }}
                  className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      {isSaving ? 'Menyimpan video...' : 'Pilih / Seret Video (MP4 / WebM)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Klik untuk memilih dari laptop atau HP Anda
                    </span>
                  </div>
                </div>

                {/* Direct Link or Reset */}
                <div className="flex flex-col gap-2.5 justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Opsi Tambahan:
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Anda juga dapat memasukkan tautan langsung video online (misal URL hosted CDN / Google Drive direct link / MP4 link).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowVideoUrlBox(!showVideoUrlBox)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{showVideoUrlBox ? 'Tutup Input URL' : 'Tautan Link URL'}</span>
                    </button>

                    {hasCustomVideo && (
                      <button
                        type="button"
                        onClick={handleResetVideo}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Kembalikan Bawaan</span>
                      </button>
                    )}
                  </div>

                  {showVideoUrlBox && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={e => setVideoUrlInput(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveVideoUrl}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow"
                      >
                        Simpan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE */}
          {activeTab === 'image' && (
            <div className="flex flex-col gap-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 font-fredoka flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    Gambar Skema Perjalanan Molekul Protein (Slide 2)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Berkas tujuan: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">asset_036.png</code>. Mendukung gambar PNG, JPG, JPEG, WEBP.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasCustomImage ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Gambar Kustom Aktif
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                      Gambar Standar Sistem
                    </span>
                  )}
                </div>
              </div>

              {/* Image Preview Card */}
              <div className="rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-900 shadow-lg min-h-[220px] max-h-[340px] flex items-center justify-center p-2 relative">
                {imageSrc ? (
                  <img 
                    key={imageSrc}
                    src={imageSrc} 
                    alt="Pratinjau Skema" 
                    className="max-h-[320px] w-auto max-w-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-6 flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 text-slate-500 mb-2" />
                    <span className="text-sm font-semibold text-slate-300">Belum ada gambar</span>
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300/40 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-400" />
                  Pratinjau Langsung Slide 2
                </div>
              </div>

              {/* Actions & Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Upload File Box */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadImage(f);
                    if (imageInputRef.current) imageInputRef.current.value = '';
                  }}
                />

                <div 
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleUploadImage(f);
                  }}
                  className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      {isSaving ? 'Menyimpan gambar...' : 'Pilih / Seret Gambar Skema (PNG / JPG)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Klik untuk memilih dari laptop atau HP Anda
                    </span>
                  </div>
                </div>

                {/* Direct Link or Reset */}
                <div className="flex flex-col gap-2.5 justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Opsi Tambahan:
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Gunakan foto diagram alur protein buatan sendiri atau poster infografis sel.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowImageUrlBox(!showImageUrlBox)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{showImageUrlBox ? 'Tutup Input URL' : 'Tautan Link URL'}</span>
                    </button>

                    {hasCustomImage && (
                      <button
                        type="button"
                        onClick={handleResetImage}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Kembalikan Bawaan</span>
                      </button>
                    )}
                  </div>

                  {showImageUrlBox && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
                        placeholder="https://example.com/skema.png"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveImageUrl}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow"
                      >
                        Simpan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DRAG & DROP MEDIA */}
          {activeTab === 'dragdrop' && (
            <div className="flex flex-col gap-6">
              {/* Background uploader */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <h5 className="font-bold text-sm text-slate-800 font-fredoka">
                      Gambar Latar Alur Produksi (<code className="text-xs font-mono">asset_037.png</code>)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500">
                    Gambar banner latar belakang di atas area pengerjaan urutan sintesis protein.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {bgSrc && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 flex-shrink-0">
                      <img src={bgSrc} alt="Latar" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <input
                    ref={bgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadBg(f);
                      if (bgInputRef.current) bgInputRef.current.value = '';
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => bgInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ganti Latar</span>
                  </button>

                  {hasCustomBg && (
                    <button
                      type="button"
                      onClick={handleResetBg}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                      title="Reset ke Latar Bawaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Organelle Cards List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Foto 5 Komponen Organel Slide 3:
                  </h5>
                  <span className="text-[11px] text-slate-400">
                    Dapat diganti per organel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {organelleList.map(org => {
                    const curSrc = organelleSrcs[org.id] || `/assets/${org.filename}`;
                    return (
                      <div 
                        key={org.id} 
                        className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between gap-2.5 shadow-sm hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex-shrink-0 flex items-center justify-center">
                            <img 
                              src={curSrc} 
                              alt={org.label} 
                              className="w-full h-full object-cover" 
                              onError={e => {
                                (e.target as HTMLImageElement).src = '/assets/asset_002.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h6 className="font-bold text-xs text-slate-800 truncate font-fredoka">
                              {org.label}
                            </h6>
                            <p className="text-[10px] text-slate-500 line-clamp-2">
                              {org.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <input
                            ref={el => { organelleInputRefs.current[org.id] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) handleUploadOrganelle(org.id, org.filename, f);
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => organelleInputRefs.current[org.id]?.click()}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3 h-3 text-emerald-700" />
                            <span>Ganti Foto</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetOrganelle(org.id, org.filename)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Reset Organel Ini"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Toast */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {successToast ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Media otomatis tersimpan di peramban Anda untuk Level 3.</span>
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm cursor-pointer shadow active:scale-95 transition-all ml-auto"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
