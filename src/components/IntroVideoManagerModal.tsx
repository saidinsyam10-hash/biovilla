import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Video, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Link as LinkIcon,
  HardDrive,
  Cloud,
  Film
} from 'lucide-react';
import { sfx } from '../utils/audio';
import { 
  getWelcomeVideoUrl, 
  uploadWelcomeVideo, 
  resetWelcomeVideo, 
  LANDING_PAGE_VIDEO_KEY 
} from '../utils/welcomeVideoStore';
import { saveCustomMediaUrl } from '../utils/mediaStore';

interface IntroVideoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUpdated?: (newUrl: string) => void;
}

export const IntroVideoManagerModal: React.FC<IntroVideoManagerModalProps> = ({
  isOpen,
  onClose,
  onVideoUpdated
}) => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [showUrlBox, setShowUrlBox] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVideo = async () => {
    try {
      const url = await getWelcomeVideoUrl();
      setCurrentVideoUrl(url);
    } catch {
      setCurrentVideoUrl('/assets/landing_page_video.mp4');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadVideo();
      setErrorMessage(null);
      setToastMessage(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
      setErrorMessage('Format berkas tidak didukung! Mohon pilih berkas video berformat MP4 atau WebM.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadProgress(5);
      setUploadStatusText('Menyiapkan dan mengunggah video langsung ke server...');
      sfx.playClick();

      const result = await uploadWelcomeVideo(file, (percent) => {
        setUploadProgress(percent);
        setUploadStatusText(`Mengunggah ke server: ${percent}%`);
      });

      if (result.success && result.url) {
        setCurrentVideoUrl(result.url);
        showToast('Video intro berhasil diunggah langsung ke server dan berkas lama telah dihapus!');
        if (onVideoUpdated) {
          onVideoUpdated(result.url);
        }
      } else {
        setErrorMessage(result.error || 'Gagal mengunggah video ke server.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Terjadi kesalahan saat memproses video.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    sfx.playClick();
    saveCustomMediaUrl(LANDING_PAGE_VIDEO_KEY, trimmed);
    saveCustomMediaUrl('landing_page_video.mp4', trimmed);
    setCurrentVideoUrl(trimmed);
    setUrlInput('');
    setShowUrlBox(false);
    showToast('Tautan URL video landing page berhasil disimpan!');
    if (onVideoUpdated) {
      onVideoUpdated(trimmed);
    }
  };

  const handleReset = async () => {
    if (!confirm('Kembalikan video intro landing page ke video bawaan?')) return;
    sfx.playClick();
    try {
      await resetWelcomeVideo();
      await loadVideo();
      showToast('Video dikembalikan ke video bawaan.');
      if (onVideoUpdated) {
        onVideoUpdated('/assets/landing_page_video.mp4');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-white my-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-5 flex items-center justify-between border-b border-emerald-600/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-fredoka text-amber-300">
                Kelola Video Landing Page (landing_page_video.mp4)
              </h2>
              <p className="text-xs text-emerald-200">
                Ganti video pengantar misi petualangan desa sel pada halaman sesudah login
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl text-emerald-200 text-sm flex items-center gap-2.5 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-400/50 rounded-2xl text-rose-200 text-sm flex items-center gap-2.5 animate-in slide-in-from-top-2">
              <X className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Video Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400" />
              Pratinjau Video Intro Saat Ini
            </label>
            <div className="rounded-2xl overflow-hidden bg-black/60 border border-emerald-500/30 flex items-center justify-center aspect-[16/10] max-h-[260px] relative shadow-inner">
              {currentVideoUrl ? (
                <video
                  key={currentVideoUrl}
                  src={currentVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              ) : (
                <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                  <Video className="w-10 h-10 text-slate-500" />
                  <span>Belum ada video yang dimuat</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Sumber: <span className="text-slate-300 font-mono">{currentVideoUrl || 'Bawaan (/assets/landing_page_video.mp4)'}</span>
            </p>

            {/* Banner Jaminan Isolasi Level */}
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
              <span className="text-base leading-none">🛡️</span>
              <span className="leading-relaxed">
                <strong>Jaminan Isolasi:</strong> Penggantian video ini hanya berlaku khusus untuk Landing Page (Welcome Screen) dan <strong>tidak akan mempengaruhi</strong> video materi, peta gambar, maupun kuis pada Level 1 sampai 8.
              </span>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                Unggah Video Baru ke Server Proyek
              </label>
              <span className="text-[11px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                Format: MP4 / WebM
              </span>
            </div>

            {/* Drag & Drop Card */}
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isUploading 
                  ? 'border-emerald-500/50 bg-emerald-500/10 cursor-not-allowed' 
                  : 'border-emerald-500/40 hover:border-amber-400/80 bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />

              {isUploading ? (
                <div className="w-full max-w-sm space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-amber-200">{uploadStatusText}</p>
                  <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{uploadProgress}% selesai</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Klik atau seret berkas video baru ke sini
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Video disimpan langsung di server disk (<span className="text-amber-300 font-mono">/public/assets/landing_page_video.mp4</span>) untuk pemutaran cepat.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Secondary Options: Link URL & Reset */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUrlBox(!showUrlBox)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Gunakan Tautan URL</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 hover:text-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-800/40 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset ke Bawaan</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Selesai &amp; Tutup
            </button>
          </div>

          {/* URL Input Box (Collapsed by default) */}
          {showUrlBox && (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 animate-in fade-in-50">
              <label className="text-xs font-bold text-slate-300 block">
                Masukkan Tautan Video Langsung (HTTPS MP4/WebM):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/video-intro.mp4"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow cursor-pointer active:scale-95"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
