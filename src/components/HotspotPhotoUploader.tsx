import React, { useState, useEffect, useRef } from 'react';
import { saveMediaBlob, deleteMediaBlob, getMediaBlob } from '../utils/mediaStore';
import { sfx } from '../utils/audio';
import { Upload, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Hotspot } from '../types';

interface HotspotPhotoUploaderProps {
  hotspot: Hotspot;
  onUploaded?: () => void;
  compact?: boolean;
}

export const HotspotPhotoUploader: React.FC<HotspotPhotoUploaderProps> = ({
  hotspot,
  onUploaded,
  compact = false
}) => {
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hotspotKey = `hotspot_${hotspot.id}`;
  const imageItem = hotspot.contents.find(c => c.type === 'image');
  const cleanKey = imageItem?.filePath ? imageItem.filePath.replace('__MEDIA__', '') : '';

  // Check if custom photo exists in IndexedDB
  useEffect(() => {
    let isMounted = true;
    const checkPhoto = async () => {
      const blob = await getMediaBlob(hotspotKey);
      if (isMounted) {
        setHasCustomPhoto(Boolean(blob));
      }
    };
    checkPhoto();
    return () => {
      isMounted = false;
    };
  }, [hotspotKey]);

  const handleSaveFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (PNG, JPG, WEBP, atau JPEG).');
      return;
    }

    try {
      setIsSaving(true);
      sfx.playClick();
      // Strict slot isolation: Save only to this specific hotspot's dedicated key
      await saveMediaBlob(hotspotKey, file);
      setHasCustomPhoto(true);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('Gagal menyimpan foto:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSaveFile(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSaveFile(file);
    }
  };

  const handleReset = async () => {
    if (confirm('Kembalikan gambar ke ilustrasi bawaan?')) {
      sfx.playClick();
      await deleteMediaBlob(hotspotKey);
      setHasCustomPhoto(false);
      if (onUploaded) onUploaded();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow transition-transform active:scale-95 cursor-pointer"
          title="Unggah Foto untuk Ceklis Ini"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Menyimpan...' : hasCustomPhoto ? 'Ganti Foto' : 'Upload Foto'}</span>
        </button>

        {hasCustomPhoto && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-[11px] transition-colors cursor-pointer"
            title="Kembalikan ke Ilustrasi Bawaan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col gap-2.5 shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800 font-fredoka">
              Foto Khusus Ceklis
            </h5>
            <p className="text-[11px] text-slate-500">
              {hasCustomPhoto ? '✅ Foto kustom tersimpan di browser Anda' : 'Ilustrasi bawaan sistem'}
            </p>
          </div>
        </div>

        {hasCustomPhoto && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>
        )}
      </div>

      {/* Drop area & click */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 bg-white text-slate-600'
        }`}
      >
        <Upload className={`w-5 h-5 ${isDragging ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span className="text-xs font-semibold">
          {isSaving ? 'Sedang mengunggah...' : 'Klik atau seret foto ke sini'}
        </span>
        <span className="text-[10px] text-slate-400">
          Mendukung file JPG, PNG, WEBP untuk ceklis ini
        </span>
      </div>

      {successMsg && (
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>Foto berhasil diperbarui dan tersimpan!</span>
        </div>
      )}
    </div>
  );
};
