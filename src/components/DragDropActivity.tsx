import React, { useState, useEffect } from 'react';
import { DragDropTask, DragItem } from '../types';
import { resolveMediaPath, sfx } from '../utils/audio';
import { getMediaResolvedURL, onMediaUpdated } from '../utils/mediaStore';
import { getOrganelleIconByAsset } from './OrganelleThumbnails';
import { Level2TownDragDrop } from './Level2TownDragDrop';
import { Level3Challenge } from './Level3Challenge';
import { Level6ChainChallenge } from './Level6ChainChallenge';
import { MediaPlaceholder } from './MediaPlaceholder';
import { Check, X, RotateCcw, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface DragDropActivityProps {
  task: DragDropTask;
  onComplete: (scoreData?: { skor: number; skor_maksimal?: number }) => void;
  title?: string;
  isAlreadyCleared?: boolean;
}

export const DragDropActivity: React.FC<DragDropActivityProps> = ({
  task,
  onComplete,
  title,
  isAlreadyCleared = false
}) => {
  const isLevel2Task = task.backgroundImage?.includes('027') ||
                       task.backgroundImage?.includes('029') ||
                       title?.includes('Sarana Kota') ||
                       title?.includes('Level 2') ||
                       title?.includes('Cocokkan Organel');
  const isLevel3Task = task.backgroundImage?.includes('037') || title?.includes('Produksi Protein');
  const isLevel6Task = task.backgroundImage?.includes('050') || 
                       title?.includes('Rantai Sebab-Akibat') || 
                       task.dropZones.some(z => z.id.includes('chain'));

  if (isLevel2Task) {
    return (
      <Level2TownDragDrop
        onComplete={onComplete}
        isAlreadyCleared={isAlreadyCleared}
      />
    );
  }

  if (isLevel3Task) {
    return (
      <Level3Challenge
        onComplete={onComplete}
        isAlreadyCleared={isAlreadyCleared}
      />
    );
  }

  if (isLevel6Task) {
    return (
      <Level6ChainChallenge
        onComplete={(score, maxScore) => onComplete?.({ skor: score, skor_maksimal: maxScore })}
        isAlreadyCleared={isAlreadyCleared}
      />
    );
  }

  // Map of dropZoneId -> itemId
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [zoneImgErrors, setZoneImgErrors] = useState<Record<string, boolean>>({});
  const [resolvedBg, setResolvedBg] = useState<string>(resolveMediaPath(task.backgroundImage));
  const [resolvedItemImages, setResolvedItemImages] = useState<Record<string, string>>({});
  const [resolvedZoneImages, setResolvedZoneImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
      if (task.backgroundImage) {
        const bgUrl = await getMediaResolvedURL(task.backgroundImage);
        if (isMounted && bgUrl) {
          setResolvedBg(bgUrl);
          setBgError(false);
        }
      }

      const imgMap: Record<string, string> = {};
      for (const el of task.elements) {
        if (el.image) {
          const u = await getMediaResolvedURL(el.image);
          if (u) imgMap[el.id] = u;
        }
      }

      const zoneMap: Record<string, string> = {};
      for (const zone of task.dropZones) {
        if (zone.image) {
          const u = await getMediaResolvedURL(zone.image);
          if (u) zoneMap[zone.id] = u;
        }
      }

      if (isMounted) {
        setResolvedItemImages(imgMap);
        setResolvedZoneImages(zoneMap);
      }
    };

    fetchImages();
    const unsub = onMediaUpdated(() => {
      fetchImages();
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [task.backgroundImage, task.elements, task.dropZones]);

  // Available items not yet placed in any drop zone
  const placedItemIds = new Set(Object.values(placements));
  const availableItems = task.elements.filter(item => !placedItemIds.has(item.id));

  const handleSelectItem = (item: DragItem) => {
    if (hasChecked) return;
    sfx.playClick();
    if (selectedItemId === item.id) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(item.id);
    }
  };

  const handlePlaceInZone = (zoneId: string) => {
    if (hasChecked) return;
    if (!selectedItemId) {
      // If zone already has an item, clicking it unplaces it
      if (placements[zoneId]) {
        sfx.playClick();
        setPlacements(prev => {
          const next = { ...prev };
          delete next[zoneId];
          return next;
        });
      }
      return;
    }

    sfx.playClick();
    setPlacements(prev => ({
      ...prev,
      [zoneId]: selectedItemId
    }));
    setSelectedItemId(null);
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (hasChecked) return;
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (hasChecked) return;
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      sfx.playClick();
      setPlacements(prev => ({
        ...prev,
        [zoneId]: itemId
      }));
      setSelectedItemId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCheck = () => {
    setHasChecked(true);
    let allCorrect = true;
    task.dropZones.forEach(zone => {
      const placed = placements[zone.id];
      if (!placed || !zone.correctElementIds.includes(placed)) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      sfx.playCorrect();
    } else {
      sfx.playWrong();
    }
  };

  const handleRetry = () => {
    sfx.playClick();
    setPlacements({});
    setSelectedItemId(null);
    setHasChecked(false);
    setShowSolution(false);
  };

  const handleToggleSolution = () => {
    sfx.playClick();
    if (!showSolution) {
      // Populate correct answers
      const solved: Record<string, string> = {};
      task.dropZones.forEach(zone => {
        if (zone.correctElementIds.length > 0) {
          solved[zone.id] = zone.correctElementIds[0];
        }
      });
      setPlacements(solved);
      setShowSolution(true);
      setHasChecked(true);
    } else {
      setShowSolution(false);
    }
  };

  // Check results
  let correctZones = 0;
  task.dropZones.forEach(zone => {
    const placed = placements[zone.id];
    if (placed && zone.correctElementIds.includes(placed)) {
      correctZones++;
    }
  });
  const allCorrect = correctZones === task.dropZones.length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Title & Instructions Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 shadow-sm">
        <div>
          <h4 className="font-bold text-base sm:text-lg font-fredoka text-emerald-900">
            {title || "Tantangan Drag & Drop Desa Sel"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600">
            Seret (drag) atau <strong>ketuk item lalu ketuk kotak tujuan</strong> yang sesuai.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {Object.keys(placements).length} / {task.dropZones.length} Terpasang
          </span>
        </div>
      </div>

      {/* Optional Background Banner Image */}
      {task.backgroundImage && (
        <div className="rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-md bg-white max-h-64 flex items-center justify-center p-1 sm:p-2">
          {!bgError ? (
            <img
              src={resolvedBg}
              alt="Ilustrasi Misi"
              className="w-full h-auto max-h-56 object-contain"
              onError={() => setBgError(true)}
            />
          ) : (
            <div className="w-full p-2">
              <MediaPlaceholder
                slotKey={task.backgroundImage}
                type="image"
                title="Ilustrasi Misi Aktivitas"
                description="Gambar latar misi belum tersedia. Upload atau seret berkas gambar ke sini untuk disimpan permanen."
                onUploaded={(newUrl) => {
                  setResolvedBg(newUrl);
                  setBgError(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Interactive Drop Zones Area */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Area Sasaran / Kotak Tujuan:
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {task.dropZones.map(zone => {
            const placedItemId = placements[zone.id];
            const placedItem = task.elements.find(el => el.id === placedItemId);
            const isCorrect = hasChecked && placedItemId && zone.correctElementIds.includes(placedItemId);
            const isWrong = hasChecked && placedItemId && !zone.correctElementIds.includes(placedItemId);

            return (
              <div
                key={zone.id}
                onDrop={e => handleDrop(e, zone.id)}
                onDragOver={handleDragOver}
                onClick={() => handlePlaceInZone(zone.id)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[110px] cursor-pointer ${
                  selectedItemId && !placedItemId
                    ? 'border-dashed border-amber-400 bg-amber-50/70 hover:bg-amber-100/80 ring-2 ring-amber-300'
                    : isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                    : isWrong
                    ? 'border-red-400 bg-red-50 text-red-950 ring-2 ring-red-300'
                    : placedItem
                    ? 'border-slate-300 bg-white shadow-sm hover:border-slate-400'
                    : 'border-dashed border-slate-300 bg-slate-50/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  {zone.image && (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center p-1 relative shadow-inner">
                      {!zoneImgErrors[zone.id] ? (
                        <img
                          src={resolvedZoneImages[zone.id] || resolveMediaPath(zone.image)}
                          alt={zone.label}
                          className="w-full h-full object-contain"
                          onError={() => setZoneImgErrors(prev => ({ ...prev, [zone.id]: true }))}
                        />
                      ) : (
                        getOrganelleIconByAsset(zone.image, "w-full h-full")
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 font-fredoka">
                        {zone.label.replace(/<[^>]+>/g, '')}
                      </span>
                      {hasChecked && (
                        <span>
                          {isCorrect ? (
                            <Check className="w-5 h-5 text-emerald-600" />
                          ) : isWrong ? (
                            <X className="w-5 h-5 text-red-500" />
                          ) : null}
                        </span>
                      )}
                    </div>
                    {zone.description && (
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-0.5">
                        {zone.description}
                      </p>
                    )}
                  </div>
                </div>

                {placedItem ? (
                  <div className="flex items-center gap-3 p-2 bg-emerald-50/80 border-2 border-emerald-300 rounded-xl shadow-xs">
                    {placedItem.image && (
                      <img
                        src={resolvedItemImages[placedItem.id] || resolveMediaPath(placedItem.image)}
                        alt={placedItem.title}
                        className="w-8 h-8 object-contain rounded-lg bg-white p-0.5 border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="font-bold text-sm text-emerald-900 flex-1">
                      {placedItem.title}
                    </span>
                    {!hasChecked && (
                      <span className="text-[10px] text-slate-400 italic">
                        (lepas)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2 px-3 text-xs text-slate-400 font-medium rounded-xl border border-dashed border-slate-200 bg-white/60">
                    {selectedItemId ? "👉 Klik di sini untuk menaruh" : "Seret atau pilih nama organel ke sini"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Items Dock */}
      <div className="bg-emerald-900/90 text-white rounded-2xl p-4 shadow-lg border border-emerald-500/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Pilihan Organel / Istilah ({availableItems.length} Tersedia):
          </span>
          {selectedItemId && (
            <span className="text-xs font-semibold text-amber-300 animate-pulse">
              1 Item Dipilih — Sekarang klik salah satu kotak tujuan di atas!
            </span>
          )}
        </div>

        {availableItems.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {availableItems.map(item => {
              const isSelected = selectedItemId === item.id;

              return (
                <div
                  key={item.id}
                  draggable={!hasChecked}
                  onDragStart={e => handleDragStart(e, item.id)}
                  onClick={() => handleSelectItem(item)}
                  className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-grab active:cursor-grabbing select-none transition-all shadow-md active:scale-95 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 scale-105'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white hover:scale-102 border border-emerald-400/40'
                  }`}
                >
                  {item.image && (
                    <img
                      src={resolvedItemImages[item.id] || resolveMediaPath(item.image)}
                      alt={item.title}
                      className="w-6 h-6 object-contain rounded bg-white/20 p-0.5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-emerald-200 italic py-1">
            Semua item telah dipasangkan ke kotak tujuan. Silakan tekan tombol "Periksa Jawaban" di bawah!
          </p>
        )}
      </div>

      {/* Feedback Message */}
      {hasChecked && (
        <div className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
          allCorrect
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          {allCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <span className="font-bold block">
              {allCorrect ? "Luar Biasa!" : "Pengerjaan Tercatat!"}
            </span>
            <span>
              {allCorrect
                ? (task.feedbackSuccess || "Semua pasangan cocok sempurna! Misi berhasil.")
                : "Jawabanmu sudah diperiksa. Kamu dapat mencoba lagi untuk hasil sempurna, atau langsung menekan tombol hijau untuk melanjutkan dan membuka level berikutnya!"}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {hasChecked && !allCorrect && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset &amp; Coba Lagi</span>
            </button>
          )}

          {hasChecked && (
            <button
              type="button"
              onClick={handleToggleSolution}
              className="px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showSolution ? "Sembunyikan Kunci" : "Tampilkan Kunci Solusi"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!hasChecked ? (
            <button
              type="button"
              disabled={Object.keys(placements).length === 0}
              onClick={handleCheck}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                Object.keys(placements).length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sfx.playStageComplete();
                onComplete({
                  skor: correctZones,
                  skor_maksimal: task.dropZones.length
                });
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <span>{allCorrect ? "Misi Selesai & Buka Level Peta" : "Lanjut & Buka Level Peta"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
