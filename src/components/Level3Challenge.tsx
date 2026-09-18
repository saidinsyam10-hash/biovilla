import React, { useState, useEffect } from 'react';
import { resolveMediaPath, sfx } from '../utils/audio';
import { getMediaResolvedURL, onMediaUpdated } from '../utils/mediaStore';
import { getOrganelleIconByAsset } from './OrganelleThumbnails';
import { getRealisticOrganelleIllustration } from './RealisticOrganelleIllustrations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Maximize2, 
  Star, 
  Lightbulb, 
  Target, 
  Check, 
  X,
  Layers,
  HelpCircle
} from 'lucide-react';

interface OrganelleCardData {
  id: string;
  name: string;
  assetKey: string;
  defaultSrc: string;
  correctSlotIndex: number; // 0 for Kartu 1, 1 for Kartu 2, etc.
}

const LEVEL3_ORGANELLE_CARDS: OrganelleCardData[] = [
  {
    id: 'golgi',
    name: 'Badan Golgi',
    assetKey: 'asset_038.jpeg',
    defaultSrc: '/assets/asset_038.jpeg',
    correctSlotIndex: 3 // Kartu 4
  },
  {
    id: 'membran',
    name: 'Membran Sel',
    assetKey: 'asset_040.jpeg',
    defaultSrc: '/assets/asset_040.jpeg',
    correctSlotIndex: 4 // Kartu 5
  },
  {
    id: 'ribosom',
    name: 'Ribosom + mRNA',
    assetKey: 'asset_042.jpeg',
    defaultSrc: '/assets/asset_042.jpeg',
    correctSlotIndex: 0 // Kartu 1
  },
  {
    id: 're_kasar',
    name: 'Retikulum Endoplasma Kasar',
    assetKey: 'asset_041.jpeg',
    defaultSrc: '/assets/asset_041.jpeg',
    correctSlotIndex: 1 // Kartu 2
  },
  {
    id: 'vesikel',
    name: 'Vesikel Transport ke Membran Sel',
    assetKey: 'asset_039.jpeg',
    defaultSrc: '/assets/asset_039.jpeg',
    correctSlotIndex: 2 // Kartu 3
  }
];

interface Level3ChallengeProps {
  onComplete: (scoreData?: { skor: number; skor_maksimal?: number }) => void;
  isAlreadyCleared?: boolean;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  currentSlideIdx?: number;
  totalSlides?: number;
  onOpenMediaModal?: () => void;
}

export const Level3Challenge: React.FC<Level3ChallengeProps> = ({
  onComplete,
  isAlreadyCleared = false,
  onPrevSlide,
  onNextSlide,
  currentSlideIdx = 2,
  totalSlides = 4,
  onOpenMediaModal
}) => {
  // 5 slots: index 0 to 4 corresponding to Kartu 1 to Kartu 5
  // slotPlacements: { [slotIndex: number]: cardId | null }
  const [slotPlacements, setSlotPlacements] = useState<(string | null)[]>([
    null, null, null, null, null
  ]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isAllCorrect, setIsAllCorrect] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Background and asset image resolution
  const [bgUrl, setBgUrl] = useState<string>('/assets/asset_037.png');
  const [cardResolvedUrls, setCardResolvedUrls] = useState<Record<string, string>>({});
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchMedia = async () => {
      // 1. Background image
      const bg = await getMediaResolvedURL('asset_037.png');
      if (isMounted && bg) {
        setBgUrl(bg);
      }

      // 2. Organelle images
      const urls: Record<string, string> = {};
      for (const card of LEVEL3_ORGANELLE_CARDS) {
        const u = await getMediaResolvedURL(card.assetKey);
        if (u) urls[card.id] = u;
      }
      if (isMounted) {
        setCardResolvedUrls(urls);
      }
    };

    fetchMedia();
    const unsub = onMediaUpdated(() => {
      fetchMedia();
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Map of placed card IDs
  const placedCardIds = new Set(slotPlacements.filter(Boolean) as string[]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('text/plain', cardId);
    setDraggedCardId(cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId) return;
    placeCardInSlot(cardId, slotIndex);
    setDraggedCardId(null);
  };

  // Click-to-select and place
  const handleCardClick = (cardId: string) => {
    sfx.playClick();
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    // If a card is selected, place it in this slot
    if (selectedCardId) {
      placeCardInSlot(selectedCardId, slotIndex);
      setSelectedCardId(null);
      return;
    }

    // If slot has an item, clicking it removes it
    if (slotPlacements[slotIndex]) {
      sfx.playClick();
      setSlotPlacements(prev => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setHasChecked(false);
    }
  };

  const placeCardInSlot = (cardId: string, slotIndex: number) => {
    sfx.playClick();
    setSlotPlacements(prev => {
      const next = [...prev];
      // If this card is already in another slot, remove it from that slot
      const existingIdx = next.indexOf(cardId);
      if (existingIdx !== -1) {
        next[existingIdx] = null;
      }
      // Place in target slot
      next[slotIndex] = cardId;
      return next;
    });
    setHasChecked(false);
  };

  const handleReset = () => {
    sfx.playClick();
    setSlotPlacements([null, null, null, null, null]);
    setSelectedCardId(null);
    setHasChecked(false);
    setIsAllCorrect(false);
  };

  const handleCheckAnswer = () => {
    sfx.playClick();
    // Validate slots
    let allCorrect = true;
    let anyEmpty = false;

    slotPlacements.forEach((placedId, idx) => {
      if (!placedId) {
        anyEmpty = true;
        allCorrect = false;
        return;
      }
      const card = LEVEL3_ORGANELLE_CARDS.find(c => c.id === placedId);
      if (!card || card.correctSlotIndex !== idx) {
        allCorrect = false;
      }
    });

    let correctCount = 0;
    slotPlacements.forEach((placedId, idx) => {
      if (placedId) {
        const card = LEVEL3_ORGANELLE_CARDS.find(c => c.id === placedId);
        if (card && card.correctSlotIndex === idx) {
          correctCount++;
        }
      }
    });

    setHasChecked(true);
    setIsAllCorrect(allCorrect);

    if (allCorrect) {
      sfx.playCorrect();
      sfx.playStageComplete();
      setShowFeedbackModal(true);
      onComplete({ skor: correctCount, skor_maksimal: 5 });
    } else {
      sfx.playWrong();
      setShowFeedbackModal(true);
    }
  };

  const handleCompleteRegardless = () => {
    let correctCount = 0;
    slotPlacements.forEach((placedId, idx) => {
      if (placedId) {
        const card = LEVEL3_ORGANELLE_CARDS.find(c => c.id === placedId);
        if (card && card.correctSlotIndex === idx) {
          correctCount++;
        }
      }
    });
    sfx.playStageComplete();
    setShowFeedbackModal(false);
    onComplete({ skor: correctCount, skor_maksimal: 5 });
  };

  // Helper to render card thumbnail with 3D semi-realistic scientific illustration
  const renderCardThumbnail = (card: OrganelleCardData, sizeClass = "w-full h-full") => {
    const customUploadSrc = cardResolvedUrls[card.id];
    const hasError = imgErrors[card.id];

    // If user explicitly uploaded custom media, show that custom upload
    if (customUploadSrc && !hasError) {
      return (
        <img
          src={customUploadSrc}
          alt={card.name}
          className={`${sizeClass} object-contain`}
          onError={() => setImgErrors(prev => ({ ...prev, [card.id]: true }))}
        />
      );
    }

    // Default: 3D semi-realistic scientific illustration with light gradients, depth, and clean white background
    return (
      <div className={`${sizeClass} flex items-center justify-center bg-white p-0.5`}>
        {getRealisticOrganelleIllustration(card.id, "w-full h-full object-contain")}
      </div>
    );
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col font-sans select-none bg-slate-900 min-h-[640px]">
      {/* Background Village Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        {/* Subtle daylight ambient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Main Interactive Stage Canvas */}
      <div className="relative z-10 p-3 sm:p-5 md:p-6 flex flex-col justify-between flex-1">
        {/* TOP SECTION: Header (Left) + Reference Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* LEFT: Wooden Title & Instruction Box (cols 1 to 7) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Wooden Title Header: "TANTANGAN LEVEL 3" */}
            <div className="relative inline-flex items-center self-start">
              {/* Left Leaf Clusters */}
              <div className="absolute -left-5 -top-2 flex items-center -space-x-2 pointer-events-none z-0">
                <span className="text-3xl sm:text-4xl filter drop-shadow">🍃</span>
                <span className="text-2xl sm:text-3xl transform -rotate-45 filter drop-shadow -mt-3">🌿</span>
              </div>

              {/* Wooden Signboard */}
              <div className="relative z-10 bg-gradient-to-b from-[#b45309] via-[#92400e] to-[#78350f] px-6 sm:px-9 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl border-4 border-[#451a03] shadow-[0_8px_0_#290f02,0_12px_18px_rgba(0,0,0,0.5)] flex flex-col items-center">
                {/* Wood Grain Lines */}
                <div className="absolute inset-x-2 top-1.5 h-[1px] bg-amber-300/40 rounded-full" />
                <div className="absolute inset-x-4 bottom-1.5 h-[1px] bg-amber-950/40 rounded-full" />

                {/* Screw Nails on Corners */}
                <div className="absolute top-2 left-2.5 w-2 h-2 rounded-full bg-amber-950 border border-amber-400/50 shadow-inner" />
                <div className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-amber-950 border border-amber-400/50 shadow-inner" />
                <div className="absolute bottom-2 left-2.5 w-2 h-2 rounded-full bg-amber-950 border border-amber-400/50 shadow-inner" />
                <div className="absolute bottom-2 right-2.5 w-2 h-2 rounded-full bg-amber-950 border border-amber-400/50 shadow-inner" />

                <div className="flex flex-col items-center">
                  <span className="text-white font-black text-xl sm:text-2xl tracking-wider uppercase font-fredoka drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    TANTANGAN
                  </span>
                  
                  {/* LEVEL 3 with Yellow Radiance Dashes */}
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-extrabold text-lg transform -rotate-12">╲</span>
                    <span className="text-white font-black text-xl sm:text-2xl tracking-wider uppercase font-fredoka drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      LEVEL 3
                    </span>
                    <span className="text-amber-300 font-extrabold text-lg transform rotate-12">╱</span>
                  </div>
                </div>
              </div>

              {/* Right Leaf Clusters */}
              <div className="absolute -right-5 -top-2 flex items-center -space-x-2 pointer-events-none z-0">
                <span className="text-2xl sm:text-3xl transform rotate-45 filter drop-shadow -mt-3">🌿</span>
                <span className="text-3xl sm:text-4xl transform scale-x-[-1] filter drop-shadow">🍃</span>
              </div>
            </div>

            {/* Instruction Parchment Box */}
            <div className="bg-[#fefce8]/95 backdrop-blur-md border-4 border-[#f59e0b] rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3">
              {/* Top Banner Ribbon: "Susun Jalur Produksi Protein" */}
              <div className="relative -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 px-4 py-2 sm:py-2.5 shadow-md flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                  <Target className="w-5 h-5 text-white animate-pulse" />
                </div>
                <h3 className="text-white font-black text-base sm:text-lg md:text-xl tracking-wide font-fredoka drop-shadow">
                  Susun Jalur Produksi Protein
                </h3>
              </div>

              {/* Paragraph Intro */}
              <div className="pt-1 flex flex-col gap-1.5 text-slate-800">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Desa Sel membutuhkan bantuanmu!
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  Amati setiap tahapan proses produksi protein.
                  Susun kartu-kartu proses ke dalam urutan yang benar.
                </p>
              </div>

              {/* Misi Kamu Highlight Box */}
              <div className="bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-200 border-2 border-amber-300/80 rounded-2xl p-2.5 sm:p-3 flex items-start gap-2.5 shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow">
                  <Lightbulb className="w-4 h-4 text-amber-950" />
                </div>
                <div>
                  <h5 className="font-black text-xs sm:text-sm text-amber-950 font-fredoka flex items-center gap-1">
                    Misi Kamu:
                  </h5>
                  <p className="text-xs sm:text-[13px] text-amber-900 font-semibold leading-snug">
                    Hubungkan seluruh tahapan produksi protein dari awal hingga sampai ke tempat tujuan.
                  </p>
                </div>
              </div>

              {/* Concluding Question */}
              <div className="text-slate-900 font-extrabold text-xs sm:text-sm pt-0.5 flex items-center justify-between">
                <span>Siap menjalankan sistem Desa Sel?</span>
                {onOpenMediaModal && (
                  <button
                    type="button"
                    onClick={onOpenMediaModal}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                    title="Ubah foto atau video Level 3"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span>Ganti Media</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: 5 Reference Cards in 2 Columns (cols 8 to 12) */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                Kartu Organel Referensi (Tarik ke Slot)
              </span>
              {selectedCardId && (
                <span className="text-[11px] font-semibold text-amber-200 animate-pulse">
                  Klik slot di bawah untuk meletakkan
                </span>
              )}
            </div>

            {/* 2-Column Grid matching user's image */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {LEVEL3_ORGANELLE_CARDS.map((card, idx) => {
                const isPlaced = placedCardIds.has(card.id);
                const isSelected = selectedCardId === card.id;

                return (
                  <div
                    key={card.id}
                    draggable={!isPlaced}
                    onDragStart={e => handleDragStart(e, card.id)}
                    onClick={() => !isPlaced && handleCardClick(card.id)}
                    className={`group relative aspect-[4/3] rounded-2xl bg-white border-4 transition-all duration-200 overflow-hidden flex items-center justify-center p-1.5 shadow-xl ${
                      isPlaced 
                        ? 'opacity-40 border-slate-300 cursor-not-allowed scale-95 grayscale-[30%]' 
                        : isSelected
                        ? 'border-amber-400 ring-4 ring-amber-300 scale-105 cursor-pointer shadow-2xl z-20'
                        : 'border-white hover:border-amber-300 hover:scale-105 cursor-grab active:cursor-grabbing hover:shadow-2xl'
                    } ${idx === 4 ? 'col-span-2 sm:col-span-1 mx-auto w-full max-w-[190px] sm:max-w-none' : ''}`}
                    title={card.name}
                  >
                    {/* Render Image Thumbnail */}
                    {renderCardThumbnail(card)}

                    {/* Placed badge */}
                    {isPlaced && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Diletakkan</span>
                        </span>
                      </div>
                    )}

                    {/* Subtle hover tooltip showing organelle name */}
                    {!isPlaced && (
                      <div className="absolute bottom-1 inset-x-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold py-0.5 px-1.5 rounded-md text-center truncate">
                          {card.name}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Wooden Shelf with 5 Answer Slots */}
        <div className="mt-4 sm:mt-6 relative">
          {/* Leaves on left & right of shelf */}
          <div className="absolute -left-3 -top-3 text-3xl sm:text-4xl filter drop-shadow z-20 pointer-events-none">
            🍃
          </div>
          <div className="absolute -right-3 -top-3 text-3xl sm:text-4xl filter drop-shadow z-20 pointer-events-none transform scale-x-[-1]">
            🍃
          </div>

          {/* Wooden Shelf Plank */}
          <div className="relative bg-gradient-to-b from-[#854d0e] via-[#713f12] to-[#451a03] border-4 border-[#290f02] rounded-3xl p-3 sm:p-4 shadow-[0_10px_0_#1a0801,0_16px_25px_rgba(0,0,0,0.6)]">
            {/* Top Wood highlight */}
            <div className="absolute inset-x-3 top-1 h-[1.5px] bg-amber-300/40 rounded-full pointer-events-none" />

            {/* 5 Slots Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {[0, 1, 2, 3, 4].map(slotIdx => {
                const placedCardId = slotPlacements[slotIdx];
                const placedCard = LEVEL3_ORGANELLE_CARDS.find(c => c.id === placedCardId);
                const isCorrectPlacement = hasChecked && placedCard && placedCard.correctSlotIndex === slotIdx;
                const isWrongPlacement = hasChecked && placedCard && placedCard.correctSlotIndex !== slotIdx;

                return (
                  <div key={slotIdx} className="flex flex-col items-center gap-2">
                    {/* The Droppable/Clickable Slot Box */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={e => handleDropOnSlot(e, slotIdx)}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`relative w-full aspect-[4/3] rounded-2xl transition-all duration-200 flex items-center justify-center p-1.5 overflow-hidden group cursor-pointer ${
                        placedCard
                          ? 'bg-white border-2 border-solid shadow-lg'
                          : 'bg-[#fefce8]/90 border-2 border-dashed border-amber-300 hover:bg-amber-100/90 hover:border-amber-400'
                      } ${
                        isCorrectPlacement 
                          ? 'border-emerald-500 ring-2 ring-emerald-400' 
                          : isWrongPlacement 
                          ? 'border-rose-500 ring-2 ring-rose-400' 
                          : ''
                      }`}
                      title={placedCard ? `Klik untuk mencopot ${placedCard.name}` : `Slot Kartu ${slotIdx + 1}`}
                    >
                      {placedCard ? (
                        <>
                          {/* Image thumbnail (pure image, no text per requirement) */}
                          {renderCardThumbnail(placedCard, "w-full h-full")}

                          {/* Quick Remove Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSlotClick(slotIdx);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
                            title="Hapus dari slot"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        /* Empty Slot Waiting State */
                        <div className="flex flex-col items-center justify-center text-amber-800/40 text-center p-1">
                          <span className="text-lg sm:text-xl opacity-50">+</span>
                          <span className="text-[10px] font-semibold hidden sm:inline">Tarik ke sini</span>
                        </div>
                      )}
                    </div>

                    {/* Blue Pill Label with Leaf Icons: "🍃 Kartu X 🍃" */}
                    <div className="w-full max-w-[130px] bg-gradient-to-r from-sky-600 to-blue-600 border border-sky-300 rounded-full py-1 px-2 flex items-center justify-center gap-1 shadow-md">
                      <span className="text-[10px] sm:text-xs">🍃</span>
                      <span className="text-white font-extrabold text-[11px] sm:text-xs tracking-wide whitespace-nowrap font-fredoka">
                        Kartu {slotIdx + 1}
                      </span>
                      <span className="text-[10px] sm:text-xs transform scale-x-[-1]">🍃</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions inside Plank: Check Answer & Reset */}
            <div className="mt-3 sm:mt-4 pt-2 border-t border-amber-900/40 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-950 text-amber-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-amber-700/50 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Atur Ulang</span>
                </button>

                {hasChecked && !isAllCorrect && (
                  <span className="text-xs font-bold text-rose-300 bg-rose-950/70 px-3 py-1 rounded-xl border border-rose-700/50 animate-pulse">
                    Beberapa kartu belum tepat. Coba teliti urutannya!
                  </span>
                )}
                {hasChecked && isAllCorrect && (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/70 px-3 py-1 rounded-xl border border-emerald-700/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Urutan Sempurna!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none cursor-pointer flex items-center gap-2 transition-all font-fredoka"
                >
                  <Check className="w-4 h-4 text-emerald-900 stroke-[3]" />
                  <span>Periksa Jawaban</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR: Blue line, navigation arrows, page indicator (3 / 4), and star/fullscreen */}
      <div className="relative z-10 bg-slate-950/90 border-t border-slate-800 flex flex-col">
        {/* Blue Progress Track Line */}
        <div className="w-full h-1 bg-slate-800 relative">
          <div 
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${((currentSlideIdx + 1) / totalSlides) * 100}%` }}
          />
        </div>

        <div className="p-2 sm:p-2.5 px-4 flex items-center justify-between text-white text-xs">
          {/* Left Arrow Navigation */}
          <div className="flex items-center gap-1">
            {onPrevSlide && (
              <button
                type="button"
                onClick={onPrevSlide}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Slide Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center Page Indicator: ◀ 3 / 4 ▶ */}
          <div className="flex items-center gap-3 font-bold font-mono tracking-wider">
            {onPrevSlide && (
              <button 
                type="button"
                onClick={onPrevSlide} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ◀
              </button>
            )}
            <span className="text-sm sm:text-base text-slate-100">
              {currentSlideIdx + 1} / {totalSlides}
            </span>
            {onNextSlide && (
              <button 
                type="button" 
                onClick={onNextSlide} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ▶
              </button>
            )}
          </div>

          {/* Right Action Icons: Star / Selesai + Fullscreen */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompleteRegardless}
              className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              title="Buka Kunci Level Selanjutnya"
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-900" />
              <span className="hidden sm:inline">Selesai Level</span>
            </button>

            {onNextSlide && (
              <button
                type="button"
                onClick={onNextSlide}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Slide Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FEEDBACK POPUP MODAL */}
      {showFeedbackModal && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#fefce8] border-4 border-amber-400 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg ${
              isAllCorrect ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {isAllCorrect ? (
                <CheckCircle2 className="w-9 h-9" />
              ) : (
                <HelpCircle className="w-9 h-9" />
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-fredoka mb-1.5">
                {isAllCorrect ? '🎉 Luar Biasa!' : 'Tetap Semangat!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {isAllCorrect 
                  ? 'Urutan jalur produksi dan ekspor protein Desa Sel telah berhasil kamu susun dengan sempurna!'
                  : 'Kamu telah mencoba menyusun tahapan produksi protein. Kamu bisa mengulang atau lanjut membuka level berikutnya!'}
              </p>
            </div>

            {/* Hint of correct sequence if not correct */}
            {!isAllCorrect && (
              <div className="w-full bg-amber-100/80 border border-amber-300 rounded-2xl p-3 text-left text-xs text-amber-950 flex flex-col gap-1">
                <span className="font-bold">Urutan Biologis Jalur Produksi Protein:</span>
                <span className="text-[11px]">1. Ribosom (Sintesis awal)</span>
                <span className="text-[11px]">2. RE Kasar (Pemrosesan & pelipatan)</span>
                <span className="text-[11px]">3. Vesikel Transport (Kurir pengantar)</span>
                <span className="text-[11px]">4. Badan Golgi (Penyortiran & pengemasan)</span>
                <span className="text-[11px]">5. Membran Sel (Eksositosis keluar sel)</span>
              </div>
            )}

            <div className="flex items-center gap-3 w-full">
              {!isAllCorrect && (
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  Coba Lagi
                </button>
              )}
              <button
                type="button"
                onClick={handleCompleteRegardless}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Buka Level Berikutnya</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
