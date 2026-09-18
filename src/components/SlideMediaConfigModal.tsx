import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, Link as LinkIcon, RotateCcw, CheckCircle2, 
  AlertCircle, Film, Image as ImageIcon, Sparkles, ExternalLink, SlidersHorizontal, Loader2 
} from 'lucide-react';
import { 
  saveMediaBlob, 
  deleteMediaBlob, 
  saveCustomMediaUrl, 
  getCustomMediaUrl, 
  deleteCustomMediaUrl, 
  getMediaResolvedURL,
  getAssetCandidates,
  formatVideoEmbed
} from '../utils/mediaStore';
import { sfx } from '../utils/audio';

interface SlideMediaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideTitle: string;
  slideId?: string;
  slotKey: string;
  type: 'image' | 'video';
  currentResolvedUrl?: string | null;
  isLevel3?: boolean;
  onOpenLevel3Manager?: () => void;
  onUpdated: () => void;
}

export const SlideMediaConfigModal: React.FC<SlideMediaConfigModalProps> = ({
  isOpen,
  onClose,
  slideTitle,
  slotKey,
  type,
  currentResolvedUrl,
  isLevel3 = false,
  onOpenLevel3Manager,
  onUpdated
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const cleanKey = slotKey.replace(/^__MEDIA__/, '').trim();
  const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      const existingUrl = getCustomMediaUrl(cleanKey) || getCustomMediaUrl(baseKey) || '';
      setUrlInput(existingUrl);
      loadCurrentPreview();
    }
  }, [isOpen, cleanKey, baseKey]);

  const loadCurrentPreview = async () => {
    const resolved = await getMediaResolvedURL(cleanKey);
    if (resolved) {
      setPreviewUrl(resolved);
    } else {
      const candidates = getAssetCandidates(cleanKey, type === 'video' ? 'mp4' : 'png');
      setPreviewUrl(candidates[0] || currentResolvedUrl || null);
    }
  };

  if (!isOpen) return null;

  const showToast = (text: string, isError = false) => {
    setFeedback({ type: isError ? 'error' : 'success', text });
    if (!isError) {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (type === 'video' && !file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v|3gp)$/i)) {
      showToast('Mohon pilih berkas video yang valid (MP4, WebM, MOV, MKV).', true);
      return;
    }
    if (type === 'image' && !file.type.startsWith('image/')) {
      showToast('Mohon pilih berkas gambar yang valid (PNG, JPG, WEBP).', true);
      return;
    }

    try {
      setIsProcessing(true);
      sfx.playClick();

      // STRICT ISOLATION: Save only to this specific slot key and base key
      await saveMediaBlob(cleanKey, file);
      if (baseKey !== cleanKey) {
        await saveMediaBlob(baseKey, file);
      }
      deleteCustomMediaUrl(cleanKey);
      deleteCustomMediaUrl(baseKey);

      sfx.playCorrect();
      showToast(`Berkas ${type === 'video' ? 'video' : 'gambar'} berhasil disimpan permanen khusus slide ini!`);
      await loadCurrentPreview();
      onUpdated();
    } catch (err: any) {
      console.error('[SlideMediaConfigModal] Upload error:', err);
      showToast(err?.message || 'Gagal menyimpan berkas media.', true);
      sfx.playWrong();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      showToast('Mohon ketikkan atau tempel tautan URL media.', true);
      return;
    }

    try {
      setIsProcessing(true);
      sfx.playClick();

      saveCustomMediaUrl(cleanKey, trimmed);
      if (baseKey !== cleanKey) {
        saveCustomMediaUrl(baseKey, trimmed);
      }

      sfx.playCorrect();
      showToast(`Tautan URL khusus berhasil disimpan untuk slot ${cleanKey}!`);
      await loadCurrentPreview();
      onUpdated();
    } catch (err: any) {
      console.error('[SlideMediaConfigModal] URL error:', err);
      showToast('Gagal menyimpan tautan URL.', true);
      sfx.playWrong();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm(`Kembalikan media untuk slide ini (${cleanKey}) ke berkas bawaan sistem?`)) return;

    try {
      setIsProcessing(true);
      sfx.playClick();

      // Delete only this specific slot's overrides
      await deleteMediaBlob(cleanKey);
      if (baseKey !== cleanKey) {
        await deleteMediaBlob(baseKey);
      }
      deleteCustomMediaUrl(cleanKey);
      deleteCustomMediaUrl(baseKey);
      setUrlInput('');

      sfx.playCorrect();
      showToast('Media berhasil dikembalikan ke berkas bawaan sistem.');
      await loadCurrentPreview();
      onUpdated();
    } catch (err: any) {
      console.error('[SlideMediaConfigModal] Reset error:', err);
      showToast('Gagal mengembalikan media.', true);
      sfx.playWrong();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              {type === 'video' ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-fredoka">
                  Atur Media Slide
                </h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                  Khusus Slide Ini
                </span>
              </div>
              <p className="text-xs text-emerald-200 line-clamp-1">
                {slideTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isolation Notice Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/40 px-5 py-2.5 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="leading-tight">
            Perubahan hanya diterapkan pada slot <strong>{cleanKey}</strong> dan <strong>tidak akan memengaruhi level atau slide lain</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Feedback alert */}
          {feedback && (
            <div className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
              feedback.type === 'success' 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Current Preview Container */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Pratinjau Saat Ini: <code className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">{cleanKey}</code>
              </span>
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isProcessing}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Kembalikan media ke file bawaan sistem"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Bawaan</span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center max-h-48 relative">
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-amber-300">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-2" />
                  <span className="text-xs font-bold text-white">Sedang memproses media...</span>
                </div>
              )}
              {type === 'video' ? (
                previewUrl ? (
                  (() => {
                    const embed = formatVideoEmbed(previewUrl);
                    if (embed.isEmbed) {
                      return (
                        <iframe
                          src={embed.embedUrl}
                          title="Pratinjau Video"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    return <video src={previewUrl} controls playsInline className="w-full h-full object-contain" />;
                  })()
                ) : (
                  <span className="text-xs text-slate-400">Belum ada pratinjau video</span>
                )
              ) : (
                previewUrl ? (
                  <img src={previewUrl} alt={slideTitle} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">Belum ada pratinjau gambar</span>
                )
              )}
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Berkas Baru</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Gunakan Tautan URL</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={type === 'video' ? 'video/*,.mp4,.webm,.mov,.mkv' : 'image/*,.png,.jpg,.jpeg,.webp'}
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                className="p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Pilih atau Seret Berkas {type === 'video' ? 'Video' : 'Gambar'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mb-3">
                  Format: {type === 'video' ? 'MP4, WebM, MOV, MKV (hingga 500MB)' : 'PNG, JPG, JPEG, WEBP'}. Berkas otomatis disimpan permanen khusus slide ini.
                </p>
                <span className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs">
                  {isProcessing ? 'Memproses Berkas...' : 'Jelajahi Berkas Komputer/HP'}
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: External URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tautan Langsung (Direct Link):
                </label>
                <input
                  type="url"
                  placeholder={type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/gambar.png'}
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Mendukung link langsung gambar/video atau Google Drive direct view link.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveUrl}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Simpan Tautan Khusus Slide Ini</span>
              </button>
            </div>
          )}

          {/* Level 3 Organelle Shortcut if applicable */}
          {isLevel3 && onOpenLevel3Manager && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Perlu mengatur 5 kartu organel Level 3?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLevel3Manager();
                }}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Buka Manajer Organel Level 3</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-5 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
