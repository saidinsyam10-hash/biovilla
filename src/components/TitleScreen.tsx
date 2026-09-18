import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Sparkles, 
  MapPin, 
  Compass, 
  BookOpen, 
  AlertCircle, 
  Upload, 
  CheckCircle2,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Star,
  Award,
  Backpack,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { titleScreenData } from '../data/gameData';
import { sfx } from '../utils/audio';
import { getMediaObjectURL, saveMediaBlob, getAssetCandidates, onMediaUpdated } from '../utils/mediaStore';
import { loginUser, registerUser, addStudentRecord } from '../utils/authStore';
import { UserAccount } from '../types';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import { MediaPlaceholder } from './MediaPlaceholder';

interface TitleScreenProps {
  onStart: () => void;
  currentUser?: UserAccount | null;
  onLoginSuccess?: (user: UserAccount) => void;
  onLogout?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ 
  onStart,
  currentUser = null,
  onLoginSuccess,
  onLogout
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('/assets/asset_002.png');
  const [videoError, setVideoError] = useState(false);
  const [isCustomLoaded, setIsCustomLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active right column tab: 'login' or 'story'
  const [activeTab, setActiveTab] = useState<'login' | 'story'>(() => {
    return currentUser ? 'story' : 'login';
  });

  // Front login form state
  const [formMode, setFormMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('Kelas XI IPA 1');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  // Load custom stored video or poster from IndexedDB or server cache and listen to updates
  const loadMedia = () => {
    Promise.all([
      getMediaObjectURL('asset_001'),
      getMediaObjectURL('asset_001.mp4'),
      getMediaObjectURL('intro_welcome.mp4'),
      getMediaObjectURL('intro_welcome')
    ]).then(urls => {
      const found = urls.find(u => !!u);
      if (found) {
        setVideoUrl(found);
        setIsCustomLoaded(true);
      }
    });

    Promise.all([
      getMediaObjectURL('asset_002'),
      getMediaObjectURL('asset_002.png'),
      getMediaObjectURL('asset_002.webp')
    ]).then(urls => {
      const found = urls.find(u => !!u);
      if (found) {
        setPosterUrl(found);
      }
    });
  };

  useEffect(() => {
    loadMedia();
    const unsubscribe = onMediaUpdated(() => {
      loadMedia();
    });
    return unsubscribe;
  }, []);

  const videoCandidates = getAssetCandidates(titleScreenData.video, 'mp4');

  const handleStart = () => {
    sfx.playClick();
    onStart();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsVideoUploading(true);
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      setVideoError(false);
      setIsCustomLoaded(true);
      sfx.playClick();

      // Persist directly via multipart FormData to server
      await saveMediaBlob('asset_001', file);
      sfx.playCorrect();
    } catch (err: any) {
      console.error('Failed to upload video in TitleScreen:', err);
      alert(err?.message || 'Gagal mengunggah video. Pastikan format video valid.');
      sfx.playWrong();
    } finally {
      setIsVideoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Submit Front Student Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = loginUser(username, password, rememberMe);
    setIsLoading(false);

    if (result.success && result.user) {
      sfx.playCorrect();
      setSuccessMessage(`Selamat datang, ${result.user.fullName || result.user.username}!`);
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } else {
      sfx.playIncorrect();
      setErrorMessage(result.error || 'Username atau password salah.');
    }
  };

  // Submit Front Student Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = registerUser(username, password, 'siswa', fullName);
    setIsLoading(false);

    if (result.success && result.user) {
      sfx.playCorrect();
      // Record new student for teacher dashboard tracking
      addStudentRecord({
        id: `std-${Date.now()}`,
        username: result.user.username,
        fullName: result.user.fullName,
        role: 'siswa',
        className: className || 'Kelas XI IPA 1',
        clearedStagesCount: 0,
        totalStages: 8,
        totalStars: 0,
        lastLevel: 'Belum Mulai',
        lastActive: 'Baru saja',
        status: 'Belum Mulai'
      });

      setSuccessMessage(`Akun siswa ${result.user.fullName} berhasil didaftarkan!`);
      if (onLoginSuccess) {
        onLoginSuccess({
          ...result.user,
          className: className || 'Kelas XI IPA 1'
        });
      }
    } else {
      sfx.playIncorrect();
      setErrorMessage(result.error || 'Pendaftaran akun gagal. Silakan coba lagi.');
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemo = (demoUser: string, demoPass: string) => {
    sfx.playClick();
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMessage(null);

    const result = loginUser(demoUser, demoPass, true);
    if (result.success && result.user) {
      sfx.playCorrect();
      setSuccessMessage(`Berhasil masuk sebagai ${result.user.fullName}!`);
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-emerald-50 to-emerald-100 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
      {/* Hidden file input for uploading/selecting asset 001 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Decorative top card */}
      <div className="max-w-5xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-200/80 overflow-hidden">
        {/* Banner Header with Top Right Student Login Pill */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-5 sm:p-7 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-6 top-0 w-32 h-32 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

          {/* Top Bar inside Banner: App Tag + Student Profile status */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-emerald-500/40 pb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
              BioVillage Simulator
            </div>

            {/* Front User Account Status */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-emerald-950/60 backdrop-blur-xs border border-emerald-400/40 rounded-2xl px-3 py-1.5 shadow-sm">
                  <span className="text-base">{currentUser.avatar || '👦'}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-amber-200 line-clamp-1">
                      {currentUser.fullName || currentUser.username}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-medium">
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
                      className="ml-1 p-1 rounded-lg hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                      title="Keluar / Ganti Akun"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setActiveTab('login');
                      setFormMode('login');
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Backpack className="w-3.5 h-3.5 text-amber-950" />
                    <span>Login Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setActiveTab('login');
                      setFormMode('register');
                    }}
                    className="px-3 py-1 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/40 font-semibold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Banner Main Title */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-fredoka text-amber-100 drop-shadow-md">
              {titleScreenData.title}
            </h1>
            <p className="text-emerald-100 mt-1.5 text-xs sm:text-base max-w-xl font-medium">
              Eksplorasi Analogi Fasilitas Desa &amp; Organel Sel dalam Game Peta Interaktif
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7 md:p-9 flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          {/* Left Column: Video Introduction & Map Features */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-200 bg-slate-900 aspect-video flex items-center justify-center group">
              {isVideoUploading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-amber-300">
                  <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-2" />
                  <span className="text-sm font-bold text-white">Sedang mengunggah video ke server...</span>
                  <span className="text-xs text-amber-200">Mohon tunggu beberapa detik</span>
                </div>
              )}
              {!videoError ? (
                <video
                  key={videoUrl || 'default-candidates'}
                  controls
                  className="w-full h-full object-cover"
                  poster={posterUrl}
                  onError={() => {
                    if (!videoUrl) setVideoError(true);
                  }}
                >
                  {videoUrl ? (
                    <source src={videoUrl} type="video/mp4" />
                  ) : (
                    videoCandidates.map((src, idx) => (
                      <source key={idx} src={src} type="video/mp4" />
                    ))
                  )}
                  Browser Anda tidak mendukung tag video.
                </video>
              ) : (
                <div className="w-full h-full p-2">
                  <MediaPlaceholder
                    slotKey="asset_001"
                    type="video"
                    title="Video Sambutan Pengelola Desa (asset 001)"
                    description="Video intro belum tersedia. Upload berkas MP4/WebM di sini agar tersimpan permanen di proyek."
                    onUploaded={(newUrl) => {
                      setVideoUrl(newUrl);
                      setVideoError(false);
                      setIsCustomLoaded(true);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Video File Status & Quick Selector */}
            <div className="flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                {isCustomLoaded ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Berkas video aktif: asset 001
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Video: <code>asset 001.mp4</code>
                  </span>
                )}
              </div>
              {currentUser?.role === 'guru' && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center gap-1 cursor-pointer"
                  title="Pilih berkas video dari komputer (Khusus Guru)"
                >
                  <Upload className="w-3 h-3" />
                  <span>Ganti/Pilih Video</span>
                </button>
              )}
              {/* Hidden file input for uploading video */}
              <input
                type="file"
                ref={fileInputRef}
                accept="video/*,.mp4,.webm,.mov,.mkv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Quick guide highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Peta Interaktif</span>
                  10 Titik Lokasi Desa Sel
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Jalur Bertahap</span>
                  Buka Level dengan Menyelesaikan Misi
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Front Interface (Login Siswa & Cerita Pengantar) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-[420px]">
            {/* Tab Buttons */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setActiveTab('login');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Backpack className="w-4 h-4" />
                <span>Fitur Login Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setActiveTab('story');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'story'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Cerita Pengantar</span>
              </button>
            </div>

            {/* TAB CONTENT 1: FITUR LOGIN SISWA */}
            {activeTab === 'login' && (
              <div className="flex flex-col flex-1">
                {currentUser ? (
                  /* User Already Logged In View */
                  <div className="flex flex-col justify-between flex-1 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 rounded-2xl p-5 border-2 border-emerald-200 shadow-inner">
                    <div>
                      {/* Top greeting badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white">
                          {currentUser.avatar || '👦'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                              Akun Siswa Aktif
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                            {currentUser.fullName || currentUser.username}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">
                            {currentUser.className || 'Kelas XI IPA 1'} • @{currentUser.username}
                          </p>
                        </div>
                      </div>

                      {/* Progress summary stats */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-white/90 rounded-xl p-3 border border-emerald-200 shadow-xs flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block font-medium">Bintang Misi</span>
                            <span className="text-base font-extrabold text-slate-800">
                              {currentUser.totalStars || 0} ⭐
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/90 rounded-xl p-3 border border-emerald-200 shadow-xs flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Award className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block font-medium">Misi Selesai</span>
                            <span className="text-base font-extrabold text-slate-800">
                              {currentUser.clearedStagesCount || 0} / 8 Misi
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs text-slate-600 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Kemajuan dan koleksi bintangmu akan otomatis tersimpan di profil siswa ini.</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                      <button
                        type="button"
                        onClick={handleStart}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-current text-amber-300" />
                        <span>Lanjut Petualangan sebagai {currentUser.fullName || currentUser.username}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-200" />
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <button
                          type="button"
                          onClick={() => {
                            sfx.playClick();
                            if (onLogout) onLogout();
                          }}
                          className="text-slate-500 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Ganti Akun / Keluar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sfx.playClick();
                            setActiveTab('story');
                          }}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                        >
                          Baca Cerita Desa Sel ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Login & Daftar Siswa */
                  <div className="flex flex-col justify-between flex-1 bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200">
                    <div>
                      {/* Form Mode Toggle: Masuk vs Daftar */}
                      <div className="flex items-center justify-between gap-2 mb-4 bg-slate-200/70 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            sfx.playClick();
                            setFormMode('login');
                            setErrorMessage(null);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            formMode === 'login'
                              ? 'bg-white text-emerald-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Masuk Siswa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sfx.playClick();
                            setFormMode('register');
                            setErrorMessage(null);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            formMode === 'register'
                              ? 'bg-white text-emerald-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Daftar Akun Baru
                        </button>
                      </div>

                      {/* Feedback Alerts */}
                      {errorMessage && (
                        <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {successMessage && (
                        <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{successMessage}</span>
                        </div>
                      )}

                      {formMode === 'login' ? (
                        /* Login Form */
                        <form onSubmit={handleLoginSubmit} className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Username Siswa
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Contoh: siswa / budi"
                                required
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 text-slate-900 text-xs sm:text-sm font-medium outline-none transition-all bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Kata Sandi / Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                required
                                className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 text-slate-900 text-xs sm:text-sm font-medium outline-none transition-all bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>Ingat Saya</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                sfx.playClick();
                                setErrorMessage('Silakan gunakan salah satu akun demo di bawah atau daftarkan akun baru.');
                              }}
                              className="text-emerald-700 hover:underline font-semibold"
                            >
                              Lupa Password?
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Backpack className="w-4 h-4 text-amber-300" />
                            <span>{isLoading ? 'Memeriksa...' : 'Masuk Sebagai Siswa'}</span>
                          </button>
                        </form>
                      ) : (
                        /* Register Form */
                        <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Username Baru (Tanpa Spasi)
                            </label>
                            <input
                              type="text"
                              value={username}
                              onChange={e => setUsername(e.target.value)}
                              placeholder="Contoh: siswa_cerdas"
                              required
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 text-slate-900 text-xs sm:text-sm font-medium outline-none transition-all bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Nama Lengkap Siswa
                            </label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={e => setFullName(e.target.value)}
                              placeholder="Contoh: Budi Pratama"
                              required
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 text-slate-900 text-xs sm:text-sm font-medium outline-none transition-all bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Kelas
                            </label>
                            <input
                              type="text"
                              value={className}
                              onChange={e => setClassName(e.target.value)}
                              placeholder="Contoh: Kelas XI IPA 1"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 text-slate-900 text-xs sm:text-sm font-medium outline-none transition-all bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Password (Min. 4 Karakter)
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Kata sandi akun"
                              required
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 text-slate-900 text-xs sm:text-sm font-medium outline-none transition-all bg-white"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow active:scale-[0.98] transition-all cursor-pointer mt-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>{isLoading ? 'Mendaftarkan...' : 'Daftar & Masuk Sekarang'}</span>
                          </button>
                        </form>
                      )}

                      {/* Quick 1-Click Demo Accounts for Fast Testing */}
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="block text-[11px] font-bold text-slate-500 mb-1.5">
                          ⚡ Uji Coba Cepat (Akun Demo Siswa):
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickDemo('siswa', 'siswa123')}
                            className="text-left px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>👦 Budi (siswa)</span>
                            <span className="text-[10px] text-emerald-700 font-bold">Masuk ➔</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDemo('ani', 'ani123')}
                            className="text-left px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>👧 Ani (ani)</span>
                            <span className="text-[10px] text-emerald-700 font-bold">Masuk ➔</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDemo('fauzan', 'fauzan123')}
                            className="text-left px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>🧑 Fauzan (fauzan)</span>
                            <span className="text-[10px] text-emerald-700 font-bold">Masuk ➔</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDemo('citra', 'citra123')}
                            className="text-left px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>👩 Citra (citra)</span>
                            <span className="text-[10px] text-emerald-700 font-bold">Masuk ➔</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom guest fallback */}
                    <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={handleStart}
                        className="text-slate-500 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mulai Langsung Tanpa Login (Tamu)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sfx.playClick();
                          setActiveTab('story');
                        }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Baca Cerita ➔
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: CERITA PENGANTAR DESA */}
            {activeTab === 'story' && (
              <div className="flex flex-col justify-between flex-1">
                <div 
                  className="prose prose-sm prose-emerald max-w-none text-slate-700 leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100"
                  dangerouslySetInnerHTML={{ __html: titleScreenData.introduction }}
                />

                <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col gap-2.5">
                  <button
                    type="button"
                    id="btn-start-mission"
                    onClick={handleStart}
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer group"
                  >
                    <Play className="w-5 h-5 fill-current text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>Mulai Petualangan Desa Sel</span>
                  </button>

                  <div className="flex items-center justify-between text-xs px-1 text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        setActiveTab('login');
                      }}
                      className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Backpack className="w-3.5 h-3.5" />
                      <span>{currentUser ? `Profil Siswa: ${currentUser.fullName || currentUser.username}` : 'Masuk dengan Akun Siswa'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400">10 Lokasi Fasilitas Desa</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auxiliary Login & Register Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={user => {
          if (onLoginSuccess) onLoginSuccess(user);
          setIsLoginModalOpen(false);
        }}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={user => {
          if (onLoginSuccess) onLoginSuccess(user);
          setIsRegisterModalOpen(false);
        }}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
};
