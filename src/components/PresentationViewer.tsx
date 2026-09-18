import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PresentationSlide } from '../types';
import { resolveMediaPath, sfx } from '../utils/audio';
import { 
  getMediaResolvedURL, 
  saveMediaBlob, 
  deleteMediaBlob, 
  deleteCustomMediaUrl,
  formatVideoEmbed,
  onMediaUpdated 
} from '../utils/mediaStore';
import { QuizSingleChoice } from './QuizSingleChoice';
import { QuizMultiChoice } from './QuizMultiChoice';
import { QuizEssayReflection } from './QuizEssayReflection';
import { DragDropActivity } from './DragDropActivity';
import { FillBlanksActivity } from './FillBlanksActivity';
import { Level3MediaModal } from './Level3MediaModal';
import { Level3Challenge } from './Level3Challenge';
import { Level6ChainChallenge } from './Level6ChainChallenge';
import { MediaPlaceholder } from './MediaPlaceholder';
import { SlideMediaConfigModal } from './SlideMediaConfigModal';
import { Level8AiAnimation } from './Level8AiAnimation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Film, 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  RotateCcw, 
  Link as LinkIcon,
  Layers,
  Video,
  Loader2
} from 'lucide-react';

interface PresentationViewerProps {
  slides: PresentationSlide[];
  onComplete: (scoreData?: { skor: number; skor_maksimal?: number; status?: 'lulus' | 'belum_lulus' | 'selesai'; esai?: string }) => void;
  isAlreadyCleared?: boolean;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  slides,
  onComplete,
  isAlreadyCleared = false
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [videoError, setVideoError] = useState<Record<number, boolean>>({});
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [recordedScore, setRecordedScore] = useState<{ skor: number; skor_maksimal: number; esai?: string } | null>(null);
  const [essaySubmissions, setEssaySubmissions] = useState<Record<string, string>>({});
  const [level8CorrectMap, setLevel8CorrectMap] = useState<Record<string, boolean>>({});

  // Custom media management with strict per-slide isolation
  const [isSlideConfigOpen, setIsSlideConfigOpen] = useState(false);
  const [modalMediaType, setModalMediaType] = useState<'video' | 'image'>('video');
  const [isLevel3ModalOpen, setIsLevel3ModalOpen] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const curSlide = slides[currentSlideIdx];
  const isLevel3 = slides.some(s => s.id?.includes('lvl3') || s.videoSource?.includes('035') || s.imageSource?.includes('036'));
  const isLevel6Chain = curSlide?.id === 'lvl6-s1' || 
                        curSlide?.title?.includes('Rantai Sebab-Akibat') || 
                        (curSlide?.hasDragDrop && curSlide?.dragDropTask?.dropZones?.some(z => z.id.includes('chain')));
  const isLevel8 = slides.some(s => s.id?.startsWith('lvl8'));
  const isLevel8QuestionSlide = isLevel8 && (Boolean(curSlide?.hasMultiChoice) || Boolean(curSlide?.hasEssay));

  // Update media paths whenever slide changes or media updates with strict slide slot isolation
  const updateSlideMedia = useCallback(async () => {
    // 1. Check slide's dedicated video slot first
    const slideVideoSlot = curSlide.id ? `slide_${curSlide.id}_video` : `slide_${currentSlideIdx}_video`;
    const customSlideVideo = await getMediaResolvedURL(slideVideoSlot);

    if (customSlideVideo) {
      setResolvedVideoUrl(customSlideVideo);
      setHasCustomVideo(true);
      setVideoError(prev => ({ ...prev, [currentSlideIdx]: false }));
    } else if (curSlide.videoSource) {
      const customUrl = await getMediaResolvedURL(curSlide.videoSource);
      if (customUrl) {
        setResolvedVideoUrl(customUrl);
        setHasCustomVideo(true);
        setVideoError(prev => ({ ...prev, [currentSlideIdx]: false }));
      } else {
        setResolvedVideoUrl(resolveMediaPath(curSlide.videoSource));
        setHasCustomVideo(false);
      }
    } else {
      setResolvedVideoUrl(null);
    }

    // 2. Check slide's dedicated image slot first
    const slideImageSlot = curSlide.id ? `slide_${curSlide.id}_image` : `slide_${currentSlideIdx}_image`;
    const customSlideImg = await getMediaResolvedURL(slideImageSlot);

    if (customSlideImg) {
      setResolvedImageUrl(customSlideImg);
      setHasCustomImage(true);
      setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: false }));
    } else if (curSlide.imageSource) {
      const customImg = await getMediaResolvedURL(curSlide.imageSource);
      if (customImg) {
        setResolvedImageUrl(customImg);
        setHasCustomImage(true);
        setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: false }));
      } else {
        setResolvedImageUrl(resolveMediaPath(curSlide.imageSource));
        setHasCustomImage(false);
      }
    } else {
      setResolvedImageUrl(null);
    }
  }, [curSlide.videoSource, curSlide.imageSource, curSlide.id, currentSlideIdx]);

  useEffect(() => {
    updateSlideMedia();
    const unsub = onMediaUpdated(() => {
      updateSlideMedia();
    });
    return unsub;
  }, [updateSlideMedia]);

  const handleNextSlide = (extraScore?: { skor: number; skor_maksimal: number; esai?: string }) => {
    sfx.playClick();
    setCompletedSlides(prev => new Set(prev).add(currentSlideIdx));
    const effectiveScore = extraScore || recordedScore;
    if (extraScore) {
      setRecordedScore(extraScore);
    }
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx(prev => prev + 1);
    } else {
      sfx.playStageComplete();
      const formattedEssays = Object.entries(essaySubmissions)
        .map(([title, text]) => `[${title}]\n${text}`)
        .join('\n\n');

      const l8Correct = isLevel8 ? Object.values(level8CorrectMap).filter(Boolean).length : undefined;
      onComplete({
        ...(effectiveScore || { skor: 0, skor_maksimal: 0 }),
        skor: isLevel8 ? (l8Correct ?? 10) : (effectiveScore?.skor ?? 0),
        skor_maksimal: isLevel8 ? 10 : (effectiveScore?.skor_maksimal ?? 0),
        status: isLevel8 ? 'selesai' : undefined,
        esai: formattedEssays || extraScore?.esai || effectiveScore?.esai
      });
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      sfx.playClick();
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  const markCurrentSlideCompleted = () => {
    setCompletedSlides(prev => new Set(prev).add(currentSlideIdx));
  };

  // Quick Inline Video upload - strictly scoped to this slide's slot
  const handleQuickVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
      alert('Mohon pilih berkas video yang valid (MP4, WebM, MOV, MKV).');
      return;
    }
    try {
      setIsVideoUploading(true);
      sfx.playClick();
      const slideVideoSlot = curSlide.id ? `slide_${curSlide.id}_video` : `slide_${currentSlideIdx}_video`;

      // Strict slot isolation: Save to slide's dedicated video slot so no other slide is affected
      await saveMediaBlob(slideVideoSlot, file);
      if (curSlide.videoSource) {
        const cleanSource = curSlide.videoSource.replace(/^__MEDIA__/, '').trim();
        await saveMediaBlob(cleanSource, file);
      }

      deleteCustomMediaUrl(slideVideoSlot);
      setVideoError(prev => ({ ...prev, [currentSlideIdx]: false }));
      sfx.playCorrect();
      await updateSlideMedia();
    } catch (err: any) {
      console.error('Video upload failed:', err);
      alert(err?.message || 'Gagal mengunggah video. Pastikan ukuran file tidak melebihi batas dan coba kembali.');
      sfx.playWrong();
    } finally {
      setIsVideoUploading(false);
    }
  };

  const handleResetCurrentVideo = async () => {
    sfx.playClick();
    const slideVideoSlot = curSlide.id ? `slide_${curSlide.id}_video` : `slide_${currentSlideIdx}_video`;
    await deleteMediaBlob(slideVideoSlot);
    if (curSlide.videoSource) {
      const cleanSource = curSlide.videoSource.replace(/^__MEDIA__/, '').trim();
      await deleteMediaBlob(cleanSource);
    }
    deleteCustomMediaUrl(slideVideoSlot);
    setVideoError(prev => ({ ...prev, [currentSlideIdx]: false }));
    await updateSlideMedia();
  };

  // Quick Inline Image upload - strictly scoped to this slide's slot
  const handleQuickImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (PNG, JPG, WEBP).');
      return;
    }
    sfx.playClick();
    const slideImageSlot = curSlide.id ? `slide_${curSlide.id}_image` : `slide_${currentSlideIdx}_image`;

    // Strict slot isolation: Save to slide's dedicated image slot so no other slide is affected
    await saveMediaBlob(slideImageSlot, file);
    if (curSlide.imageSource) {
      const cleanSource = curSlide.imageSource.replace(/^__MEDIA__/, '').trim();
      await saveMediaBlob(cleanSource, file);
    }

    deleteCustomMediaUrl(slideImageSlot);
    setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: false }));
    await updateSlideMedia();
  };

  const handleResetCurrentImage = async () => {
    sfx.playClick();
    const slideImageSlot = curSlide.id ? `slide_${curSlide.id}_image` : `slide_${currentSlideIdx}_image`;
    await deleteMediaBlob(slideImageSlot);
    if (curSlide.imageSource) {
      const cleanSource = curSlide.imageSource.replace(/^__MEDIA__/, '').trim();
      await deleteMediaBlob(cleanSource);
    }
    deleteCustomMediaUrl(slideImageSlot);
    setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: false }));
    await updateSlideMedia();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hidden file inputs for quick inline uploads */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.mov"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleQuickVideoUpload(f);
          if (videoFileInputRef.current) videoFileInputRef.current.value = '';
        }}
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleQuickImageUpload(f);
          if (imageFileInputRef.current) imageFileInputRef.current.value = '';
        }}
      />

      {/* Slide Navigation Top Bar */}
      {!isLevel6Chain && (
        <div className="bg-emerald-900/90 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md border border-emerald-500/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={currentSlideIdx === 0}
              onClick={handlePrevSlide}
              className={`p-1.5 rounded-lg transition-colors ${
                currentSlideIdx > 0
                  ? 'hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                  : 'text-emerald-500/40 cursor-not-allowed'
              }`}
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs sm:text-sm font-bold tracking-wide">
              Slide {currentSlideIdx + 1} / {slides.length}
              {curSlide.title && (
                <span className="hidden sm:inline text-emerald-200 font-normal ml-2">
                  • {curSlide.title}
                </span>
              )}
            </span>

            <button
              type="button"
              disabled={currentSlideIdx === slides.length - 1 && !isAlreadyCleared && !completedSlides.has(currentSlideIdx)}
              onClick={() => handleNextSlide()}
              className={`p-1.5 rounded-lg transition-colors ${
                currentSlideIdx < slides.length - 1
                  ? 'hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                  : 'text-emerald-500/40 cursor-not-allowed'
              }`}
              title="Slide Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons: Media Manager + Progress Dots + Quick Complete */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Slide Media Config Trigger Button */}
            {!isLevel8QuestionSlide && (curSlide.videoSource || curSlide.imageSource) && (
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setModalMediaType(curSlide.videoSource ? 'video' : 'image');
                  setIsSlideConfigOpen(true);
                }}
                className="px-2.5 sm:px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Atur media gambar/video khusus untuk slide ini"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
                <span className="hidden sm:inline">Media Slide Ini</span>
                <span className="sm:hidden">Media</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLevel8 && !isAlreadyCleared && !completedSlides.has(idx) && idx > currentSlideIdx}
                  onClick={() => {
                    if (isLevel8 && !isAlreadyCleared && !completedSlides.has(idx) && idx > currentSlideIdx) return;
                    sfx.playClick();
                    setCurrentSlideIdx(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    isLevel8 && !isAlreadyCleared && !completedSlides.has(idx) && idx > currentSlideIdx
                      ? 'w-2 bg-slate-400/40 cursor-not-allowed opacity-50'
                      : 'cursor-pointer ' + (
                          idx === currentSlideIdx
                            ? 'w-7 bg-amber-400'
                            : completedSlides.has(idx) || isAlreadyCleared
                            ? 'w-2.5 bg-emerald-400'
                            : 'w-2.5 bg-emerald-700/80 hover:bg-emerald-600'
                        )
                  }`}
                  title={
                    isLevel8 && !isAlreadyCleared && !completedSlides.has(idx) && idx > currentSlideIdx
                      ? `Selesaikan slide sebelumnya terlebih dahulu`
                      : `Ke Slide ${idx + 1}`
                  }
                />
              ))}
            </div>

            {!isLevel8 && (
              <button
                type="button"
                onClick={() => {
                  sfx.playStageComplete();
                  onComplete(recordedScore || undefined);
                }}
                className="px-2.5 sm:px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Selesaikan pengerjaan level ini dan buka kunci level selanjutnya"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">Selesai Misi</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Slide Content Display */}
      <div className="relative min-h-[400px]">
        {/* Type A: Video Slide */}
        {curSlide.videoSource && (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {/* Inline Quick Media Control Toolbar */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-fredoka flex items-center gap-1.5">
                    {curSlide.title ? `Video: ${curSlide.title}` : `Video Slide ${currentSlideIdx + 1}`}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {hasCustomVideo ? (
                      <span className="text-emerald-700 font-semibold">
                        ✅ Video khusus slide ini aktif diputar ({curSlide.videoSource.replace('__MEDIA__', '')})
                      </span>
                    ) : (
                      `Slot: ${curSlide.videoSource.replace('__MEDIA__', '')} • Tersimpan khusus slide ini`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
                  title="Unggah berkas video khusus slide ini"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalMediaType('video');
                    setIsSlideConfigOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Atur link URL atau opsi video khusus slide ini"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Atur</span>
                </button>

                {hasCustomVideo && (
                  <button
                    type="button"
                    onClick={handleResetCurrentVideo}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    title="Kembalikan ke video bawaan slide ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Video Player Display Container */}
            <div className="relative rounded-3xl overflow-hidden border-4 border-amber-200 shadow-2xl bg-slate-950 aspect-video flex items-center justify-center">
              {isVideoUploading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-amber-300">
                  <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
                  <p className="text-base font-bold text-white">Sedang mengunggah video ke server...</p>
                  <p className="text-xs text-amber-200">Mohon tunggu beberapa detik hingga proses selesai</p>
                </div>
              ) : resolvedVideoUrl && !videoError[currentSlideIdx] ? (
                (() => {
                  const embed = formatVideoEmbed(resolvedVideoUrl);
                  if (embed.isEmbed) {
                    return (
                      <iframe
                        key={embed.embedUrl}
                        src={embed.embedUrl}
                        title="Video Player"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      key={resolvedVideoUrl}
                      src={resolvedVideoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      onError={() => {
                        if (hasCustomVideo && curSlide.videoSource && resolvedVideoUrl !== resolveMediaPath(curSlide.videoSource)) {
                          setResolvedVideoUrl(resolveMediaPath(curSlide.videoSource));
                          setHasCustomVideo(false);
                        } else if (resolvedVideoUrl !== '/assets/intro_welcome.mp4') {
                          setResolvedVideoUrl('/assets/intro_welcome.mp4');
                        } else {
                          setVideoError(prev => ({ ...prev, [currentSlideIdx]: true }));
                        }
                      }}
                    >
                      Browser Anda tidak mendukung tag video.
                    </video>
                  );
                })()
              ) : (
                /* Interactive Drag & Drop / Click to Upload Dropzone */
                <div 
                  onClick={() => videoFileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleQuickVideoUpload(f);
                  }}
                  className="p-8 text-center text-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors w-full h-full group"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                    {curSlide.title ? `Video: ${curSlide.title}` : `Video Slide ${currentSlideIdx + 1}`}
                  </h4>
                  <p className="text-xs text-amber-200 max-w-sm mb-3">
                    Klik atau seret berkas video (MP4, WebM, MOV hingga 500MB) ke area ini untuk memutar video ({curSlide.videoSource.replace('__MEDIA__', '')})
                  </p>
                  <span className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
                    Pilih Berkas Video
                  </span>
                </div>
              )}
            </div>

            {/* Next Step Action Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleNextSlide()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <span>{curSlide.nextButtonTitle || "Lanjut ke Misi Berikutnya"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Type B: Image Presentation Slide */}
        {curSlide.imageSource && !curSlide.hasSingleChoiceSet && !curSlide.hasMultiChoice && !curSlide.hasFillBlanks && !curSlide.hasEssay && (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {/* Inline Quick Media Control Toolbar */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-fredoka flex items-center gap-1.5">
                    {curSlide.title ? `Gambar: ${curSlide.title}` : `Gambar Slide ${currentSlideIdx + 1}`}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {hasCustomImage ? (
                      <span className="text-emerald-700 font-semibold">
                        ✅ Gambar khusus slide ini aktif ({curSlide.imageSource.replace('__MEDIA__', '')})
                      </span>
                    ) : (
                      `Slot: ${curSlide.imageSource.replace('__MEDIA__', '')} • Tersimpan khusus slide ini`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
                  title="Unggah berkas gambar khusus slide ini"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Gambar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalMediaType('image');
                    setIsSlideConfigOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Atur link URL atau opsi gambar khusus slide ini"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Atur</span>
                </button>

                {hasCustomImage && (
                  <button
                    type="button"
                    onClick={handleResetCurrentImage}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    title="Kembalikan ke gambar bawaan slide ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Image Viewer Display Container */}
            <div className="rounded-3xl overflow-hidden border-4 border-amber-200 shadow-2xl bg-white p-2">
              {resolvedImageUrl && !imageError[curSlide.id || currentSlideIdx.toString()] ? (
                <div className="relative group">
                  <img
                    key={resolvedImageUrl}
                    src={resolvedImageUrl}
                    alt={curSlide.title || "Slide Penjelasan"}
                    className="w-full h-auto max-h-[520px] object-contain mx-auto rounded-2xl"
                    onError={() => {
                      if (hasCustomImage && curSlide.imageSource && resolvedImageUrl !== resolveMediaPath(curSlide.imageSource)) {
                        setResolvedImageUrl(resolveMediaPath(curSlide.imageSource));
                        setHasCustomImage(false);
                      } else {
                        setImageError(prev => ({ ...prev, [curSlide.id || currentSlideIdx.toString()]: true }));
                      }
                    }}
                  />
                  <div 
                    onClick={() => imageFileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer"
                  >
                    <span className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Ganti Gambar Slide Ini
                    </span>
                  </div>
                </div>
              ) : (
                /* Interactive Drag & Drop / Click to Upload Dropzone for Image */
                <div 
                  onClick={() => imageFileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleQuickImageUpload(f);
                  }}
                  className="p-8 text-center text-slate-600 flex flex-col items-center justify-center bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 cursor-pointer hover:bg-amber-100/50 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1 font-fredoka">
                    {curSlide.title ? `Unggah Gambar: ${curSlide.title}` : `Gambar Slide ${currentSlideIdx + 1}`}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-3">
                    Klik atau seret file gambar (PNG / JPG / WEBP) ke sini khusus untuk slide ini ({curSlide.imageSource.replace('__MEDIA__', '')})
                  </p>
                  <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md">
                    Pilih Berkas Gambar
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleNextSlide()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <span>{curSlide.nextButtonTitle || "Misi Selanjutnya"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Type C: Single Choice Set */}
        {curSlide.hasSingleChoiceSet && curSlide.singleChoiceQuestions && (
          <div className="flex flex-col gap-6">
            {curSlide.imageSource && (
              <div className="max-w-2xl mx-auto w-full rounded-2xl overflow-hidden shadow-sm bg-white">
                {!imageError[`sc-${curSlide.id || currentSlideIdx}`] ? (
                  <img
                    src={resolvedImageUrl || resolveMediaPath(curSlide.imageSource)}
                    alt="Ilustrasi Soal"
                    className="w-full h-auto max-h-48 object-contain mx-auto rounded-2xl border-2 border-slate-200"
                    onError={() => {
                      setImageError(prev => ({ ...prev, [`sc-${curSlide.id || currentSlideIdx}`]: true }));
                    }}
                  />
                ) : (
                  <MediaPlaceholder
                    slotKey={curSlide.imageSource}
                    type="image"
                    title={`Upload Ilustrasi Soal (${curSlide.title || 'Materi'})`}
                    description="Gambar sebelumnya belum tersedia. Upload atau seret file gambar untuk mengisi slot ini secara permanen."
                    onUploaded={() => {
                      setImageError(prev => ({ ...prev, [`sc-${curSlide.id || currentSlideIdx}`]: false }));
                    }}
                  />
                )}
              </div>
            )}
            <QuizSingleChoice
              questions={curSlide.singleChoiceQuestions}
              onComplete={(score, rawCorrect, total) => {
                markCurrentSlideCompleted();
                const totalQ = total ?? curSlide.singleChoiceQuestions.length;
                const scoreData = {
                  skor: rawCorrect ?? Math.round((score / 100) * totalQ),
                  skor_maksimal: totalQ
                };
                handleNextSlide(scoreData);
              }}
            />
          </div>
        )}

        {/* Type D: Multiple Choice (Reflection Level 8) */}
        {curSlide.hasMultiChoice && curSlide.multiChoiceQuestion && (
          <div className="flex flex-col gap-6">
            {isLevel8 ? (
              <Level8AiAnimation
                key={`lvl8-anim-${curSlide.id || currentSlideIdx}`}
                slideId={curSlide.id}
                title={curSlide.title}
              />
            ) : (
              curSlide.imageSource && (
                <div className="max-w-2xl mx-auto w-full rounded-2xl overflow-hidden shadow-sm bg-white">
                  {!imageError[`mc-${curSlide.id || currentSlideIdx}`] ? (
                    <img
                      src={resolvedImageUrl || resolveMediaPath(curSlide.imageSource)}
                      alt="Ilustrasi Refleksi"
                      className="w-full h-auto max-h-56 object-contain mx-auto rounded-2xl border-2 border-slate-200"
                      onError={() => {
                        setImageError(prev => ({ ...prev, [`mc-${curSlide.id || currentSlideIdx}`]: true }));
                      }}
                    />
                  ) : (
                    <MediaPlaceholder
                      slotKey={curSlide.imageSource}
                      type="image"
                      title={`Upload Gambar Refleksi (${curSlide.title})`}
                      description="Upload gambar refleksi untuk Level 8. Berkas akan otomatis dikompresi dan disimpan secara permanen."
                      onUploaded={() => {
                        setImageError(prev => ({ ...prev, [`mc-${curSlide.id || currentSlideIdx}`]: false }));
                      }}
                    />
                  )}
                </div>
              )
            )}
            <QuizMultiChoice
              key={curSlide.id || curSlide.multiChoiceQuestion.id || `slide-${currentSlideIdx}`}
              question={curSlide.multiChoiceQuestion}
              nextButtonLabel={curSlide.nextButtonTitle || (currentSlideIdx === slides.length - 1 ? "Selesaikan Petualangan Paripurna" : "Lanjut")}
              onAnswerSubmit={(isCorrect) => {
                markCurrentSlideCompleted();
                if (isLevel8 && curSlide.multiChoiceQuestion) {
                  const qKey = curSlide.multiChoiceQuestion.id || `mc_${currentSlideIdx}`;
                  setLevel8CorrectMap(prev => ({ ...prev, [qKey]: isCorrect }));
                }
                handleNextSlide();
              }}
            />
          </div>
        )}

        {/* Type E: Drag and Drop Task inside Slide (Slide 3 Level 3 & Level 6 Chain) */}
        {curSlide.hasDragDrop && curSlide.dragDropTask && (
          <div className="flex flex-col gap-4">
            {isLevel3 ? (
              <Level3Challenge
                onComplete={() => {
                  markCurrentSlideCompleted();
                  if (currentSlideIdx < slides.length - 1) {
                    handleNextSlide();
                  } else {
                    onComplete();
                  }
                }}
                isAlreadyCleared={isAlreadyCleared}
                onPrevSlide={currentSlideIdx > 0 ? handlePrevSlide : undefined}
                onNextSlide={currentSlideIdx < slides.length - 1 ? handleNextSlide : undefined}
                currentSlideIdx={currentSlideIdx}
                totalSlides={slides.length}
                onOpenMediaModal={() => {
                  setIsLevel3ModalOpen(true);
                }}
              />
            ) : isLevel6Chain ? (
              <Level6ChainChallenge
                onComplete={(score, maxScore) => {
                  markCurrentSlideCompleted();
                  if (currentSlideIdx < slides.length - 1) {
                    handleNextSlide({ skor: score, skor_maksimal: maxScore });
                  } else {
                    onComplete();
                  }
                }}
                isAlreadyCleared={isAlreadyCleared}
              />
            ) : (
              <DragDropActivity
                task={curSlide.dragDropTask}
                title={curSlide.title}
                isAlreadyCleared={isAlreadyCleared}
                onComplete={() => {
                  markCurrentSlideCompleted();
                  handleNextSlide();
                }}
              />
            )}
          </div>
        )}

        {/* Type F: Fill in the Blanks inside Slide */}
        {curSlide.hasFillBlanks && curSlide.fillBlanksText && (
          <FillBlanksActivity
            rawText={curSlide.fillBlanksText}
            isAlreadyCleared={isAlreadyCleared}
            onComplete={() => {
              markCurrentSlideCompleted();
              handleNextSlide();
            }}
          />
        )}

        {/* Type G: Essay Reflection (Refleksi Esai Level 8) */}
        {curSlide.hasEssay && curSlide.essayQuestion && (
          <div className="flex flex-col gap-6">
            <QuizEssayReflection
              key={curSlide.id || curSlide.essayQuestion.id || `slide-essay-${currentSlideIdx}`}
              question={curSlide.essayQuestion}
              nextButtonLabel={curSlide.nextButtonTitle || (currentSlideIdx === slides.length - 1 ? "Selesaikan Petualangan" : "Refleksi Selanjutnya")}
              onSubmit={(text) => {
                markCurrentSlideCompleted();
                const qTitle = curSlide.essayQuestion?.title || curSlide.title || `Refleksi Esai ${currentSlideIdx + 1}`;
                setEssaySubmissions(prev => ({
                  ...prev,
                  [qTitle]: text
                }));
              }}
              onNext={() => {
                markCurrentSlideCompleted();
                handleNextSlide();
              }}
            />
          </div>
        )}
      </div>

      {/* Strict Isolated Per-Slide Media Modal */}
      {curSlide && (
        <SlideMediaConfigModal
          isOpen={isSlideConfigOpen}
          onClose={() => setIsSlideConfigOpen(false)}
          slideTitle={curSlide.title || `Slide ${currentSlideIdx + 1}`}
          slideId={curSlide.id}
          slotKey={
            modalMediaType === 'video'
              ? (curSlide.videoSource || `slide_${curSlide.id || currentSlideIdx}_video`)
              : (curSlide.imageSource || `slide_${curSlide.id || currentSlideIdx}_image`)
          }
          type={modalMediaType}
          currentResolvedUrl={modalMediaType === 'video' ? resolvedVideoUrl : resolvedImageUrl}
          isLevel3={isLevel3}
          onOpenLevel3Manager={() => setIsLevel3ModalOpen(true)}
          onUpdated={updateSlideMedia}
        />
      )}

      {/* Level 3 Media Manager Modal for full organelle suite */}
      {isLevel3 && (
        <Level3MediaModal
          isOpen={isLevel3ModalOpen}
          onClose={() => setIsLevel3ModalOpen(false)}
        />
      )}
    </div>
  );
};

