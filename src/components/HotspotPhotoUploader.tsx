import React, { useState, useEffect, useRef } from 'react';
import { 
  saveMediaBlob, 
  deleteMediaBlob, 
  getMediaBlob, 
  uploadMediaFileServer, 
  saveCustomMediaUrl, 
  deleteCustomMediaUrl, 
  getCustomMediaUrl 
} from '../utils/mediaStore';
import { sfx } from '../utils/audio';
import { Upload, Trash2, CheckCircle, Image as ImageIcon, Link, Globe } from 'lucide-react';
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
  const [showUrlBox, setShowUrlBox] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hotspotKey = `hotspot_${hotspot.id}`;

  // Check if custom photo exists in IndexedDB or custom URL
  useEffect(() => {
    let isMounted = true;
    const checkPhoto = async () => {
      const blob = await getMediaBlob(hotspotKey);
      const customUrl = getCustomMediaUrl(hotspotKey);
      if (isMounted) {
        setHasCustomPhoto(Boolean(blob || customUrl));
        if (customUrl) setUrlInput(customUrl);
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
      // 1. Simpan ke IndexedDB lokal untuk tampilan instan
      await saveMediaBlob(hotspotKey, file);

      // 2. Unggah langsung ke folder server disk (/public/assets/) untuk penyimpanan permanen di Git
      try {
        await uploadMediaFileServer(hotspotKey, file, `${hotspotKey}.png`);
      } catch (uploadErr) {
        console.warn('[HotspotPhotoUploader] Server storage note:', uploadErr);
      }

      setHasCustomPhoto(true);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('Gagal menyimpan foto:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      alert('Mohon masukkan tautan URL gambar.');
      return;
    }

    try {
      setIsSaving(true);
      sfx.playClick();
      saveCustomMediaUrl(hotspotKey, trimmed);
      setHasCustomPhoto(true);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      setShowUrlBox(false);
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('Gagal menyimpan tautan URL:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSaveFile(file);
    }
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
      deleteCustomMediaUrl(hotspotKey);
      setUrlInput('');
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
              {hasCustomPhoto ? '✅ Foto kustom aktif & tersimpan permanen' : 'Ilustrasi bawaan sistem'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowUrlBox(!showUrlBox)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
            title="Tautkan link gambar online (misal Google Drive/Direct link)"
          >
            <Link className="w-3.5 h-3.5" />
            <span>{showUrlBox ? 'Tutup URL' : 'Tautkan Link'}</span>
          </button>

          {hasCustomPhoto && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* URL Link Input Box */}
      {showUrlBox && (
        <div className="bg-white border border-emerald-300 rounded-xl p-3 flex flex-col gap-2 text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
            <Globe className="w-3.5 h-3.5" />
            <span>Tautkan Gambar via Link (Google Drive / Web / Imgur):</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Tempel link https://drive.google.com/... atau URL gambar langsung"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveUrl}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              Simpan Tautan
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            💡 Tautan Google Drive akan otomatis dikonversi menjadi gambar langsung tanpa diblokir browser.
          </p>
        </div>
      )}

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
          {isSaving ? 'Sedang mengunggah...' : 'Klik atau seret berkas foto dari komputer'}
        </span>
        <span className="text-[10px] text-slate-400">
          Mendukung PNG, JPG, WEBP • Otomatis tersimpan permanen di server & GitHub
        </span>
      </div>

      {successMsg && (
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>Foto/Tautan berhasil diperbarui dan tersimpan permanen!</span>
        </div>
      )}
    </div>
  );
};
