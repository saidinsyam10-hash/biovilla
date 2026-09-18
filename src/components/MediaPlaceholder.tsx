import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Video, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { saveMediaBlob } from '../utils/mediaStore';
import { sfx } from '../utils/audio';

interface MediaPlaceholderProps {
  slotKey: string;
  type?: 'image' | 'video';
  title?: string;
  description?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto' | 'banner';
  onUploaded?: (url: string) => void;
  compact?: boolean;
}

export const MediaPlaceholder: React.FC<MediaPlaceholderProps> = ({
  slotKey,
  type = 'image',
  title,
  description,
  className = '',
  aspectRatio = 'auto',
  onUploaded,
  compact = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cleanKey = slotKey.replace(/^__MEDIA__/, '').trim();
  const displayTitle = title || `Upload ${type === 'video' ? 'video' : 'gambar'} di sini`;
  const acceptTypes = type === 'video' 
    ? 'video/*,.mp4,.webm,.mov,.mkv' 
    : 'image/*,.png,.jpg,.jpeg,.webp';

  const aspectClass = 
    aspectRatio === 'video' ? 'aspect-video' :
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'banner' ? 'h-40 sm:h-52 w-full' :
    'min-h-[140px] w-full';

  const handleFile = async (file: File) => {
    try {
      setIsUploading(true);
      setErrorMessage(null);
      sfx.playClick();

      await saveMediaBlob(cleanKey, file);
      if (cleanKey !== slotKey) {
        await saveMediaBlob(slotKey, file);
      }

      setUploadSuccess(true);
      sfx.playCorrect();
      setTimeout(() => setUploadSuccess(false), 3000);
      if (onUploaded) onUploaded(cleanKey);
    } catch (err: any) {
      console.error('[MediaPlaceholder] Upload failed:', err);
      setErrorMessage(err?.message || 'Gagal menyimpan media');
      sfx.playWrong();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (compact) {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed border-slate-400/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all ${
          isHovered ? 'border-amber-500 ring-2 ring-amber-300' : ''
        } ${className}`}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          accept={acceptTypes} 
          className="hidden" 
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        />
        <div className="w-9 h-9 rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          ) : uploadSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : type === 'video' ? (
            <Video className="w-4 h-4 text-amber-500" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-500" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            {uploadSuccess ? 'Berhasil disimpan!' : displayTitle}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
            Slot: {cleanKey}
          </div>
        </div>
        <button
          type="button"
          className="px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-bold shadow-xs hover:bg-slate-800 flex items-center gap-1 flex-shrink-0"
        >
          <Upload className="w-3 h-3" />
          <span>Upload</span>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none overflow-hidden group ${
        isHovered
          ? 'border-amber-500 bg-amber-50/80 dark:bg-slate-800/90 ring-4 ring-amber-300/50'
          : 'border-slate-400/90 bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-900/90 dark:hover:bg-slate-900'
      } ${aspectClass} ${className}`}
    >
      <input 
        ref={fileInputRef} 
        type="file" 
        accept={acceptTypes} 
        className="hidden" 
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      {/* Center Icon */}
      <div className="w-14 h-14 rounded-2xl bg-slate-300/80 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 shadow-xs group-hover:scale-110 group-hover:bg-amber-100 group-hover:text-amber-700 transition-all">
        {isUploading ? (
          <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
        ) : uploadSuccess ? (
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        ) : type === 'video' ? (
          <Video className="w-7 h-7 text-amber-600" />
        ) : (
          <ImageIcon className="w-7 h-7 text-slate-600 dark:text-slate-300" />
        )}
      </div>

      {/* Titles */}
      <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mb-1 font-fredoka flex items-center gap-1.5">
        <span>{uploadSuccess ? '✅ Berkas Berhasil Disimpan Permanen!' : displayTitle}</span>
      </h4>

      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-3 leading-relaxed">
        {description || (
          type === 'video'
            ? 'Klik atau seret file video (.mp4/.webm) ke sini. Video akan otomatis dikompres ke 720p & disimpan ke project.'
            : 'Klik atau seret file gambar ke sini. Gambar akan otomatis di-resize max 1280px, WebP 80% & disimpan ke project.'
        )}
      </p>

      {/* Target Slot Badge & Action */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-300 dark:border-slate-700">
          Slot: {cleanKey}
        </span>
        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span>Pilih Berkas</span>
        </span>
      </div>

      {errorMessage && (
        <div className="mt-3 text-[11px] text-rose-600 font-bold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
