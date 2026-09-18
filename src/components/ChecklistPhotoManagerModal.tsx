import React, { useState } from 'react';
import { Hotspot } from '../types';
import { HotspotIllustration } from './HotspotIllustration';
import { HotspotPhotoUploader } from './HotspotPhotoUploader';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChecklistPhotoManagerModalProps {
  hotspots: Hotspot[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ChecklistPhotoManagerModal: React.FC<ChecklistPhotoManagerModalProps> = ({
  hotspots,
  isOpen,
  onClose,
  title = "Kelola & Upload Foto Ceklis Peta"
}) => {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(hotspots[0]?.id || '');

  if (!isOpen) return null;

  const selectedHotspot = hotspots.find(h => h.id === selectedHotspotId) || hotspots[0];
  const selectedIndex = hotspots.findIndex(h => h.id === selectedHotspot?.id);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-4 text-white flex items-center justify-between border-b border-emerald-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-fredoka">
                {title}
              </h3>
              <p className="text-xs text-emerald-100">
                Pilih nomor ceklis dan unggah foto sesuai keinginan Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Left: List of all Checklists */}
          <div className="w-full md:w-5/12 flex flex-col gap-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Daftar Ceklis ({hotspots.length} Titik)
            </div>

            <div className="flex flex-col gap-2 max-h-[360px] md:max-h-[440px] overflow-y-auto pr-1">
              {hotspots.map((hotspot, idx) => {
                const isSelected = hotspot.id === selectedHotspot?.id;

                return (
                  <button
                    key={hotspot.id}
                    type="button"
                    onClick={() => setSelectedHotspotId(hotspot.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/80 shadow-md ring-2 ring-amber-300'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700">
                      <HotspotIllustration
                        hotspotId={hotspot.id}
                        filePath={hotspot.contents.find(c => c.type === 'image')?.filePath}
                        title={hotspot.title}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Title */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="font-bold text-xs text-slate-800 truncate font-fredoka">
                          {hotspot.title || `Ceklis Titik #${idx + 1}`}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Ketuk untuk upload foto
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Checklist Details & Uploader */}
          <div className="w-full md:w-7/12 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            {selectedHotspot ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {selectedIndex + 1}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 font-fredoka">
                      {selectedHotspot.title || `Ceklis #${selectedIndex + 1}`}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Foto yang diunggah akan otomatis ditampilkan pada pin ceklis, pratinjau hover, dan jendela detail.
                  </p>
                </div>

                {/* Big Preview */}
                <div className="rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-950 h-44 sm:h-52 w-full flex items-center justify-center shadow-inner relative">
                  <HotspotIllustration
                    hotspotId={selectedHotspot.id}
                    filePath={selectedHotspot.contents.find(c => c.type === 'image')?.filePath}
                    title={selectedHotspot.title}
                    className="w-full h-full"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-300/40">
                    Pratinjau Langsung
                  </div>
                </div>

                {/* Uploader Box */}
                <HotspotPhotoUploader
                  hotspot={selectedHotspot}
                />
              </>
            ) : (
              <div className="text-center text-slate-400 py-12 text-sm">
                Pilih salah satu nomor ceklis di sebelah kiri
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Foto otomatis tersimpan di peramban Anda.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm cursor-pointer shadow active:scale-95 transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
