import React, { useState, useEffect, useRef } from 'react';
import { Stage, UserAccount } from '../types';
import { mapConfig } from '../data/gameData';
import { sfx } from '../utils/audio';
import { getMediaObjectURL, getMediaResolvedURL, saveMediaBlob, getAssetCandidates, onMediaUpdated, uploadMediaFileServer } from '../utils/mediaStore';
import { processAndCompressImage } from '../utils/mediaProcessor';
import { getOrganelleThumbnail } from './OrganelleThumbnails';
import { 
  Star, 
  MapPin, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Upload, 
  Image as ImageIcon, 
  Info, 
  LogOut,
  Backpack,
  BookOpen,
  Loader2,
  CheckCircle2,
  Trophy
} from 'lucide-react';

interface GameMapProps {
  stages: Stage[];
  clearedStageIds: Set<string>;
  onSelectStage: (stage: Stage) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onOpenHelp: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenLogin?: () => void;
  onOpenWelcomeScreen?: () => void;
  onOpenFinalReport?: () => void;
}

interface PathSegment {
  id: string;
  fromStageIndex: number;
  toStageIndex: number;
  d: string;
}

export const GameMap: React.FC<GameMapProps> = ({
  stages,
  clearedStageIds,
  onSelectStage,
  soundEnabled,
  onToggleSound,
  onResetProgress,
  onOpenHelp,
  currentUser = null,
  onLogout,
  onOpenLogin,
  onOpenWelcomeScreen,
  onOpenFinalReport
}) => {
  const [lockedAlert, setLockedAlert] = useState<string | null>(null);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [bgImageError, setBgImageError] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [bgUploadSuccess, setBgUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fallbackCandidates = React.useMemo(() => {
    return [
      '/assets/asset_002.png?v=1789711201758',
      '/assets/asset_002.jpg?v=1789711201758',
      '/assets/asset_002.png',
      '/assets/asset_002.webp',
      ...getAssetCandidates(mapConfig.backgroundImage, 'png'),
      '/assets/level2_town_bg.webp',
      '/assets/level2_town_bg.jpg'
    ];
  }, [mapConfig.backgroundImage]);

  // Load custom stored map from IndexedDB or server cache and subscribe to updates
  const loadMapBg = () => {
    Promise.all([
      getMediaObjectURL('asset_002'),
      getMediaObjectURL('asset_002.png'),
      getMediaObjectURL('asset_002.webp'),
      getMediaResolvedURL('asset_002'),
      getMediaResolvedURL('asset_002.png')
    ]).then(urls => {
      const found = urls.find(u => !!u);
      if (found) {
        setCustomBgUrl(found);
        setBgImageError(false);
      }
    });
  };

  useEffect(() => {
    loadMapBg();
    const unsubscribe = onMediaUpdated(() => {
      loadMapBg();
    });
    return unsubscribe;
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsUploadingBg(true);
      const objUrl = URL.createObjectURL(file);
      setCustomBgUrl(objUrl);
      setBgImageError(false);
      sfx.playCorrect();

      // 1. Simpan langsung ke IndexedDB lokal untuk akses instan
      await saveMediaBlob('asset_002', file, 'asset_002.png');
      await saveMediaBlob('asset_002.png', file, 'asset_002.png');

      // 2. Unggah langsung ke Server Disk (/public/assets/) - server menyimpan permanen
      try {
        await uploadMediaFileServer('asset_002', file, 'asset_002.png');
      } catch (uploadErr) {
        console.warn('[Map Upload] Server storage note:', uploadErr);
      }

      setBgUploadSuccess('Foto Peta Desa Sel berhasil disimpan secara permanen!');
      setTimeout(() => setBgUploadSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to update map background:', err);
      sfx.playWrong();
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = '';
  };

  const handleImageError = () => {
    // If custom URL fails (e.g. stale link), seamlessly fall back to local candidates
    if (customBgUrl) {
      setCustomBgUrl(null);
      setCandidateIdx(0);
      return;
    }
    if (candidateIdx < fallbackCandidates.length - 1) {
      setCandidateIdx(prev => prev + 1);
    } else {
      setBgImageError(true);
    }
  };

  const activeBgSource = customBgUrl || fallbackCandidates[candidateIdx] || '/assets/level2_town_bg.webp';

  // Determine which stages are unlocked
  const isStageUnlocked = (stage: Stage): boolean => {
    // 1. GERBANG LOGIN: Jika belum login, semua tombol level otomatis terkunci
    if (!currentUser) {
      return false;
    }

    // Peran guru: dapat memantau seluruh level desa dalam mode observasi guru
    if (currentUser.role === 'guru') {
      return true;
    }

    if (clearedStageIds.has(stage.id)) {
      return true;
    }
    if (stage.stageIndex === 0 || stage.stageIndex === 1 || stage.canBeStartStage) {
      return true;
    }
    // Any neighbor that has been cleared
    const hasNeighborCleared = stage.neighbors.some(neighborIdx => {
      const neighborStage = stages.find(s => s.stageIndex === neighborIdx);
      return neighborStage && clearedStageIds.has(neighborStage.id);
    });
    if (hasNeighborCleared) return true;

    // Sequential progression: if the previous stage was cleared, unlock this stage
    const prevStage = stages.find(s => s.stageIndex === stage.stageIndex - 1);
    if (prevStage && clearedStageIds.has(prevStage.id)) {
      return true;
    }

    return false;
  };

  const handleStageClick = (stage: Stage) => {
    // 1. GERBANG LOGIN: Jika belum login, pengguna TIDAK BISA mengklik level manapun
    if (!currentUser) {
      sfx.playWrong();
      setLockedAlert('🔒 Login Wajib: Tombol level terkunci! Silakan masuk dengan akun Siswa atau Guru untuk membuka petualangan.');
      setTimeout(() => setLockedAlert(null), 3500);
      if (onOpenLogin) {
        onOpenLogin();
      }
      return;
    }

    const unlocked = isStageUnlocked(stage);
    if (!unlocked) {
      sfx.playWrong();
      setLockedAlert(`Misi "${stage.label}" masih terkunci! Selesaikan level sebelumnya terlebih dahulu.`);
      setTimeout(() => setLockedAlert(null), 3000);
      return;
    }
    sfx.playClick();
    onSelectStage(stage);
  };

  const totalCleared = stages.filter(s => clearedStageIds.has(s.id)).length;
  const progressPercent = Math.round((totalCleared / stages.length) * 100);

  // Road path segments following the winding village trails on the map:
  // Sequence: Petunjuk -> Peta -> Level 1 -> Level 2 -> Level 3 -> Level 4 -> Level 5 -> Level 6 -> Level 7 -> Level 8
  const trailSegments: PathSegment[] = [
    // 0. Petunjuk (Jarum Kompas) -> Peta Desa Sel
    {
      id: 'petunjuk-to-peta',
      fromStageIndex: 0,
      toStageIndex: 1,
      d: 'M 4.4 65.4 C 4.4 80.0 10.0 91.2 16.6 91.2'
    },
    // 1. Peta -> Level 1 (along the main dirt road curving up to Level 1)
    {
      id: 'peta-to-l1',
      fromStageIndex: 1,
      toStageIndex: 2,
      d: 'M 16.6 91.2 C 12.0 75.0 10.0 58.0 14.6 44.2'
    },
    // 2. Level 1 -> Level 2 (across wooden bridge over river to rice paddies)
    {
      id: 'l1-to-l2',
      fromStageIndex: 2,
      toStageIndex: 3,
      d: 'M 14.6 44.2 C 20.0 52.0 27.5 52.0 32.5 48.0 C 34.0 46.0 35.0 44.5 35.9 43.3'
    },
    // 3. Level 2 -> Level 3 (winding north uphill through terraces to windmill)
    {
      id: 'l2-to-l3',
      fromStageIndex: 3,
      toStageIndex: 4,
      d: 'M 35.9 43.3 C 39.5 35.0 44.0 28.0 52.2 25.3'
    },
    // 4. Level 3 -> Level 4 (downhill forest trail)
    {
      id: 'l3-to-l4',
      fromStageIndex: 4,
      toStageIndex: 5,
      d: 'M 52.2 25.3 C 56.0 31.0 58.5 36.0 60.8 41.5'
    },
    // 5. Level 4 -> Level 5 (trail leading south through forest)
    {
      id: 'l4-to-l5',
      fromStageIndex: 5,
      toStageIndex: 6,
      d: 'M 60.8 41.5 C 57.0 48.0 52.0 54.0 47.1 60.9'
    },
    // 6. Level 5 -> Level 6 (southern road past village houses)
    {
      id: 'l5-to-l6',
      fromStageIndex: 6,
      toStageIndex: 7,
      d: 'M 47.1 60.9 C 53.5 66.0 61.5 70.0 68.8 74.5'
    },
    // 7. Level 6 -> Level 7 (up the wooden cliff stairs)
    {
      id: 'l6-to-l7',
      fromStageIndex: 7,
      toStageIndex: 8,
      d: 'M 68.8 74.5 C 73.5 65.0 77.0 55.0 80.1 44.7'
    },
    // 8. Level 7 -> Level 8 (clifftop road to glowing tree summit)
    {
      id: 'l7-to-l8',
      fromStageIndex: 8,
      toStageIndex: 9,
      d: 'M 80.1 44.7 C 83.0 36.0 85.5 29.0 87.6 23.5'
    }
  ];

  const isLevel8Done = stages.some(s => (s.stageIndex === 9 || s.label.includes('Level 8')) && clearedStageIds.has(s.id));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center select-none">
      {/* Hidden file input for asset_002 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Top Floating Control Bar - Responsive for all screen sizes */}
      <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/60 px-2.5 sm:px-4 py-2 sticky top-0 z-40 flex items-center justify-between shadow-xl gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-bold font-fredoka text-amber-200 leading-tight truncate max-w-[150px] xs:max-w-[190px] sm:max-w-none">
              Peta Petualangan Desa Sel
            </h1>
            <p className="text-[10px] sm:text-[11px] text-emerald-300 font-medium hidden md:block">
              BioVillage Simulator — Misi Analogi Biologi Sel
            </p>
          </div>
        </div>

        {/* Student Progress & Essential Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Logged-in Student Account Tag */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-950/85 border border-emerald-500/60 rounded-xl px-2 sm:px-2.5 py-1 text-xs shadow-inner">
              <span className="text-sm sm:text-base leading-none">{currentUser.avatar || '👦'}</span>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="font-bold text-amber-200 text-[11px] max-w-[80px] md:max-w-[110px] truncate">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[9px] text-emerald-300">
                  {currentUser.className || (currentUser.role === 'guru' ? 'Guru' : 'Siswa')}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    onLogout();
                  }}
                  className="p-1 rounded-lg text-emerald-400 hover:text-red-300 hover:bg-red-950/60 transition-colors cursor-pointer"
                  title="Keluar / Ganti Akun Siswa"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenLogin && (
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onOpenLogin();
                }}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 transition-all cursor-pointer shadow active:scale-95"
                title="Masuk dengan Akun Siswa"
              >
                <Backpack className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login Siswa</span>
              </button>
            )
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-700">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-300">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
              <span>{totalCleared * 10} <span className="hidden sm:inline">Poin</span></span>
            </div>
            <div className="w-10 md:w-16 h-2 bg-slate-700 rounded-full overflow-hidden hidden md:block">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">{totalCleared}/{stages.length}</span>
          </div>

          {/* Tombol Buka Rapor Nilai Akhir jika Level 8 tuntas */}
          {isLevel8Done && onOpenFinalReport && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onOpenFinalReport();
              }}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border border-amber-300 transition-all cursor-pointer shadow-lg shadow-amber-500/30 animate-pulse active:scale-95"
              title="Buka dan Cetak Rapor Nilai Akhir BioVillage"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-950" />
              <span>Rapor Nilai Akhir</span>
            </button>
          )}

          {/* Welcome Screen / Intro Misi Button */}
          {onOpenWelcomeScreen && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onOpenWelcomeScreen();
              }}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/80 transition-all cursor-pointer shadow active:scale-95"
              title="Buka kembali halaman Welcome Screen & Intro Misi Petualangan Desa Sel"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden xs:inline sm:inline">Intro Misi</span>
            </button>
          )}

          {/* Tombol Ganti Peta Desa (Khusus Akun Guru, Tersembunyi untuk Siswa) */}
          {currentUser?.role === 'guru' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingBg}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/80 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50"
              title="Ganti foto latar belakang Peta Desa Sel (Khusus Guru)"
            >
              {isUploadingBg ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-200" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span className="hidden xs:inline sm:inline">Ganti Peta</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title={soundEnabled ? "Matikan Efek Suara" : "Nyalakan Efek Suara"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />}
          </button>

          {/* Bantuan & Petunjuk Awal */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title="Bantuan & Petunjuk Awal"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Reset Kemajuan */}
          <button
            type="button"
            onClick={onResetProgress}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 cursor-pointer transition-colors"
            title="Reset Seluruh Kemajuan"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* Background Upload Success Toast */}
      {bgUploadSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-900/95 text-emerald-100 border-2 border-emerald-400/80 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 text-xs sm:text-sm font-semibold max-w-md text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <span>{bgUploadSuccess}</span>
        </div>
      )}

      {/* Locked Alert Toast */}
      {lockedAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-red-950/95 text-red-200 border-2 border-red-500/60 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs sm:text-sm font-semibold max-w-md text-center">
          <span className="text-base">🔒</span>
          <span>{lockedAlert}</span>
        </div>
      )}

      {/* Map Interactive Canvas Viewport */}
      <main className="w-full max-w-[1704px] p-1 sm:p-3 md:p-4 flex-1 flex flex-col justify-center">
        <div 
          className="relative w-full aspect-[1024/554] rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-amber-900/60 bg-emerald-950/40"
          onDragOver={(e) => {
            if (currentUser?.role !== 'guru') return;
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            if (currentUser?.role !== 'guru') return;
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragging(false);
            if (currentUser?.role !== 'guru') return;
            const file = e.dataTransfer.files?.[0];
            if (file) {
              await processFile(file);
            }
          }}
        >
          {/* Drag & Drop Visual Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-emerald-950/85 backdrop-blur-sm border-4 border-dashed border-emerald-400 rounded-3xl flex flex-col items-center justify-center text-white pointer-events-none p-6 text-center animate-in fade-in">
              <Upload className="w-16 h-16 text-emerald-300 animate-bounce mb-3" />
              <h3 className="text-xl font-black text-emerald-200">Lepaskan Berkas Foto Peta di Sini</h3>
              <p className="text-sm text-emerald-100/90 mt-1">Peta Desa Sel akan langsung diperbarui & tersimpan otomatis</p>
            </div>
          )}
          {/* Layer 1: Village Map Background Image */}
          {!bgImageError ? (
            <img
              key={activeBgSource}
              src={activeBgSource}
              alt="Peta Desa Sel"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-emerald-200 to-amber-100 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-slate-900/85 text-white p-6 rounded-2xl border-2 border-amber-300 max-w-md shadow-2xl">
                <ImageIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h4 className="font-bold text-base sm:text-lg text-amber-200 mb-1">Peta Desa Sel (asset_002)</h4>
                <p className="text-xs text-slate-300 mb-4">
                  Letakkan file <code>asset_002.png</code> di <code>/public/assets/</code> atau pilih langsung menggunakan tombol di bawah ini.
                </p>
                {currentUser?.role === 'guru' && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih Berkas asset_002.png</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Layer 2: Dotted Pathway connecting Start -> Petunjuk -> Level 1 -> ... -> Level 8 */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            {trailSegments.map(segment => {
              const destStage = stages.find(s => s.stageIndex === segment.toStageIndex);
              const isCleared = destStage && clearedStageIds.has(destStage.id);

              return (
                <g key={segment.id}>
                  {/* Subtle ground shadow */}
                  <path
                    d={segment.d}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.45)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  {/* Dotted pathway line following road */}
                  <path
                    d={segment.d}
                    fill="none"
                    stroke={isCleared ? "rgba(34, 197, 94, 0.95)" : "rgba(254, 240, 138, 0.95)"}
                    strokeWidth="0.6"
                    strokeDasharray="1.2 1.4"
                    strokeLinecap="round"
                    className={isCleared ? "" : "animate-pulse"}
                  />
                </g>
              );
            })}
          </svg>

          {/* Layer 3: Interactive Stage Touchpoints */}
          {stages.map((stage) => {
            const isCleared = clearedStageIds.has(stage.id);
            const isUnlocked = isStageUnlocked(stage);
            const isPetunjuk = stage.stageIndex === 0;
            const isPeta = stage.stageIndex === 1;

            return (
              <div
                key={stage.id}
                style={{
                  left: `${stage.telemetry.x}%`,
                  top: `${stage.telemetry.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute z-20 flex flex-col items-center justify-center pointer-events-auto group"
              >
                {/* Interactive Touchpoint Button */}
                <button
                  type="button"
                  id={`stage-pin-${stage.stageIndex}`}
                  onClick={() => handleStageClick(stage)}
                  className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
                    isPetunjuk 
                      ? 'w-10 h-10 sm:w-14 sm:h-14 rounded-full'
                      : isPeta
                      ? 'w-24 sm:w-36 md:w-44 h-8 sm:h-10 md:h-12 rounded-xl'
                      : 'w-16 sm:w-20 md:w-24 h-11 sm:h-14 md:h-16 rounded-2xl'
                  } ${
                    isUnlocked 
                      ? 'hover:scale-110 active:scale-95' 
                      : 'hover:scale-105 opacity-90'
                  }`}
                  title={`${stage.label} — ${isCleared ? 'Selesai' : isUnlocked ? 'Tersedia' : 'Terkunci'}`}
                >
                  {/* CASE A: Stage 0 - Petunjuk (Compass Rose) */}
                  {isPetunjuk ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping group-hover:bg-amber-300/60" />
                      <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 sm:border-3 border-amber-300/90 shadow-lg shadow-amber-400/50 bg-amber-400/20 backdrop-blur-[1px] flex items-center justify-center group-hover:border-white transition-colors">
                        <span className="text-xs sm:text-base">🧭</span>
                      </div>
                    </div>
                  ) : isPeta ? (
                    /* CASE B: Stage 1 - Peta Desa Sel (Wooden Plaque) */
                    <div className="relative w-full h-full flex items-center justify-center rounded-xl border-2 border-transparent group-hover:border-amber-300/90 group-hover:bg-amber-400/20 group-hover:shadow-lg group-hover:shadow-amber-400/40 transition-all">
                      <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  ) : (
                    /* CASE C: Levels 1–8 */
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Active & Unlocked Glow Effect around the sign */}
                      {isUnlocked && !isCleared && (
                        <div className="absolute inset-0 rounded-2xl ring-2 sm:ring-3 ring-amber-400/90 shadow-lg shadow-amber-400/50 animate-pulse group-hover:ring-white transition-all pointer-events-none" />
                      )}

                      {/* CLEARED STATE -> Shining Emerald Star Badge over the icon area */}
                      {isCleared ? (
                        <div className="absolute -top-2 sm:-top-3 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 border-2 border-white shadow-xl flex items-center justify-center animate-bounce z-30">
                          <Star className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 fill-white text-white drop-shadow-sm" />
                        </div>
                      ) : isUnlocked ? (
                        /* UNLOCKED STATE */
                        stage.stageIndex === 2 ? (
                          /* Level 1: Sparkling yellow star glow over already-drawn star */
                          <div className="absolute -top-2.5 sm:-top-3 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center z-30">
                            <span className="absolute inset-0 rounded-full bg-amber-300/60 animate-ping" />
                            <div className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-lg flex items-center justify-center text-[10px] sm:text-xs">
                              ⭐
                            </div>
                          </div>
                        ) : (
                          /* Levels 2-8: Dynamic UNLOCKED Padlock badge (replaces static padlock on image!) */
                          <div className="absolute -top-2.5 sm:-top-3 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center z-30">
                            <span className="absolute inset-0 rounded-full bg-amber-400/50 animate-ping" />
                            <div className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-lg flex items-center justify-center shadow-amber-400/60 text-[10px] sm:text-xs font-bold text-slate-950">
                              🔓
                            </div>
                          </div>
                        )
                      ) : (
                        /* LOCKED STATE: Clean transparent overlay, lock is already illustrated */
                        <div className="absolute inset-0 rounded-2xl group-hover:bg-slate-950/20 transition-colors" />
                      )}
                    </div>
                  )}
                </button>

                {/* Interactive Hover Card with Organelle Illustration & Sublabel */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none absolute z-40 w-48 sm:w-56 -bottom-3 translate-y-full left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-amber-300/80 shadow-2xl p-3 flex flex-col gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 p-1 flex-shrink-0 flex items-center justify-center border border-slate-700 overflow-hidden shadow-inner">
                      {getOrganelleThumbnail(stage.stageIndex)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-fredoka font-bold text-xs sm:text-sm text-amber-300 truncate">
                        {stage.label}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                        {stage.subLabel || "Misi Desa Sel"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800">
                    <span className={isCleared ? "text-emerald-400 font-bold" : isUnlocked ? "text-amber-400 font-bold" : "text-slate-400 font-medium"}>
                      {isCleared ? '⭐ Selesai (10 Poin)' : isUnlocked ? '🔓 Siap Dimainkan' : '🔒 Misi Terkunci'}
                    </span>
                    <span className="text-slate-400 font-medium">Ketuk untuk buka</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="w-full bg-slate-900/90 border-t border-emerald-950 px-4 py-2 text-center text-xs text-emerald-400/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>🌿 Jalur Desa Sel: Petunjuk → Peta → Level 1 s.d. Level 8 • Sentuh titik untuk membuka misi!</span>
        <span className="text-slate-400">BioVillage Simulator • Kurikulum Merdeka Biologi Sel</span>
      </footer>
    </div>
  );
};
