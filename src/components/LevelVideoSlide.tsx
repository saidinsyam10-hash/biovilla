import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  Upload, 
  Link as LinkIcon, 
  RotateCcw, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  getMediaResolvedURL, 
  saveMediaBlob, 
  deleteMediaBlob, 
  deleteCustomMediaUrl,
  formatVideoEmbed 
} from '../utils/mediaStore';
import { resolveMediaPath, sfx } from '../utils/audio';
import { SlideMediaConfigModal } from './SlideMediaConfigModal';
import { UserAccount } from '../types';

interface LevelVideoSlideProps {
  levelTitle: string;
  slideTitle: string;
  slideDescription: string;
  slotKey: string;
  slideId?: string;
  defaultVideoSource: string;
  nextButtonTitle: string;
  onNext: () => void;
  currentUser?: UserAccount | null;
}

export const LevelVideoSlide: React.FC<LevelVideoSlideProps> = ({
  levelTitle,
  slideTitle,
  slideDescription,
  slotKey,
  slideId,
  defaultVideoSource,
  nextButtonTitle,
  onNext,
  currentUser
}) => {
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isSlideConfigOpen, setIsSlideConfigOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanSlot = slotKey.replace(/^__MEDIA__/, '').replace(/\.(mp4|webm|mov|mkv)$/i, '');
  const slideSlotKey = slideId ? `slide_${slideId}_video` : `slide_${cleanSlot}_video`;

  const loadVideo = useCallback(async () => {
    // 1. Dedicated slide slot
    const customSlideVideo = await getMediaResolvedURL(slideSlotKey);
    if (customSlideVideo) {
      setResolvedVideoUrl(customSlideVideo);
      setHasCustomVideo(true);
      setVideoError(false);
      return;
    }

    // 2. Base slot
    const customBase = await getMediaResolvedURL(cleanSlot);
    if (customBase) {
      setResolvedVideoUrl(customBase);
      setHasCustomVideo(true);
      setVideoError(false);
      return;
    }

    // 3. Fallback default
    const fallback = resolveMediaPath(defaultVideoSource);
    setResolvedVideoUrl(fallback);
    setHasCustomVideo(false);
    setVideoError(false);
  }, [slideSlotKey, cleanSlot, defaultVideoSource]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v|3gp)$/i)) {
      alert('Mohon pilih berkas video yang valid (MP4, WebM, MOV, MKV).');
      return;
    }

    try {
      setIsVideoUploading(true);
      sfx.playClick();

      // Save to both slide dedicated slot and clean slot
      await saveMediaBlob(slideSlotKey, file);
      if (cleanSlot !== slideSlotKey) {
        await saveMediaBlob(cleanSlot, file);
      }
      deleteCustomMediaUrl(slideSlotKey);
      deleteCustomMediaUrl(cleanSlot);

      sfx.playCorrect();
      setStatusMessage('Video berhasil diunggah dan disimpan khusus untuk level ini!');
      setTimeout(() => setStatusMessage(null), 4000);
      await loadVideo();
    } catch (err: any) {
      console.error('[LevelVideoSlide] Upload error:', err);
      alert(err?.message || 'Gagal mengunggah video.');
      sfx.playWrong();
    } finally {
      setIsVideoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetVideo = async () => {
    if (!window.confirm('Kembalikan video slide ini ke video bawaan proyek?')) return;
    try {
      sfx.playClick();
      await deleteMediaBlob(slideSlotKey);
      await deleteMediaBlob(cleanSlot);
      deleteCustomMediaUrl(slideSlotKey);
      deleteCustomMediaUrl(cleanSlot);
      sfx.playCorrect();
      await loadVideo();
    } catch (err) {
      console.error('[LevelVideoSlide] Reset error:', err);
    }
  };

  const embedInfo = resolvedVideoUrl ? formatVideoEmbed(resolvedVideoUrl) : null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*,.mp4,.webm,.mov,.mkv"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Top Media Control Toolbar */}
      <div className="bg-amber-50/90 dark:bg-slate-900/90 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide">
                Slide 1 • Video
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-fredoka">
                {slideTitle}
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {hasCustomVideo ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Video kustom aktif diputar ({cleanSlot})
                </span>
              ) : (
                `Slot Media: ${cleanSlot} • Tersimpan permanen khusus level ini`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isVideoUploading}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
            title="Unggah berkas video dari laptop / HP khusus slide ini"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Video</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSlideConfigOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Atur tautan video YouTube / Google Drive"
          >
            <LinkIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Atur URL</span>
          </button>

          {hasCustomVideo && (
            <button
              type="button"
              onClick={handleResetVideo}
              className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-colors"
              title="Kembalikan ke video awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Video Player Display Container */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-amber-200 dark:border-slate-700 shadow-2xl bg-slate-950 aspect-video flex items-center justify-center">
        {isVideoUploading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-amber-300">
            <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
            <p className="text-base font-bold text-white">Sedang mengunggah video ke server...</p>
            <p className="text-xs text-amber-200">Video langsung disimpan tanpa konversi Base64 (hingga 500MB)</p>
          </div>
        ) : resolvedVideoUrl && !videoError ? (
          embedInfo?.isEmbed ? (
            <iframe
              key={embedInfo.embedUrl}
              src={embedInfo.embedUrl}
              title={slideTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={resolvedVideoUrl}
              src={resolvedVideoUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
              onError={() => {
                const defaultFallback = resolveMediaPath(defaultVideoSource);
                if (hasCustomVideo && resolvedVideoUrl !== defaultFallback) {
                  setResolvedVideoUrl(defaultFallback);
                  setHasCustomVideo(false);
                } else if (resolvedVideoUrl !== defaultFallback) {
                  setResolvedVideoUrl(defaultFallback);
                } else {
                  setVideoError(true);
                }
              }}
            >
              Browser Anda tidak mendukung tag video.
            </video>
          )
        ) : (
          /* Interactive Dropzone / Upload Area */
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="p-8 text-center text-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors w-full h-full group"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-1">
              {slideTitle}
            </h4>
            <p className="text-xs text-amber-200 max-w-sm mb-3">
              Klik atau seret berkas video ke area ini untuk memutar video pengantar ({cleanSlot}.mp4).
            </p>
            <span className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
              Pilih Berkas Video (MP4 / WebM / MOV)
            </span>
          </div>
        )}
      </div>

      {/* Description / Guide Box */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {levelTitle}
          </span>
          <p className="leading-relaxed">
            {slideDescription}
          </p>
        </div>
      </div>

      {/* Action Footer: Button to proceed to the level missions */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-500 font-medium">
          Tonton video di atas sebelum melanjutkan ke tantangan interaktif.
        </span>

        <button
          type="button"
          onClick={() => {
            sfx.playClick();
            onNext();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 transition-transform"
        >
          <span>{nextButtonTitle}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Media Config Modal for YouTube / Drive URL Embeds */}
      <SlideMediaConfigModal
        isOpen={isSlideConfigOpen}
        onClose={() => setIsSlideConfigOpen(false)}
        slideTitle={slideTitle}
        slideId={slideId}
        slotKey={slideSlotKey}
        type="video"
        currentResolvedUrl={resolvedVideoUrl}
        onUpdated={loadVideo}
      />
    </div>
  );
};
