import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Map, 
  ArrowRight, 
  Sparkles, 
  Film, 
  ShieldCheck, 
  LogOut, 
  Compass, 
  CheckCircle2, 
  Volume2,
  Upload
} from 'lucide-react';
import { UserAccount } from '../types';
import { sfx } from '../utils/audio';
import { getWelcomeVideoUrl } from '../utils/welcomeVideoStore';
import { onMediaUpdated } from '../utils/mediaStore';
import { IntroVideoManagerModal } from './IntroVideoManagerModal';

interface WelcomeScreenProps {
  currentUser: UserAccount;
  onStart: () => void;
  onLogout?: () => void;
  onGoToTeacherDashboard?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentUser,
  onStart,
  onLogout,
  onGoToTeacherDashboard
}) => {
  const [videoUrl, setVideoUrl] = useState<string>('/assets/landing_page_video.mp4');
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [showVideoManager, setShowVideoManager] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isTeacher = currentUser.role === 'guru' || currentUser.role === 'admin';

  // Muat URL video intro yang aktif
  const loadVideo = async () => {
    try {
      setIsVideoLoading(true);
      const url = await getWelcomeVideoUrl();
      setVideoUrl(url);
    } catch (err) {
      console.warn('[WelcomeScreen] Menggunakan video default fallback:', err);
      setVideoUrl('/assets/landing_page_video.mp4');
    } finally {
      setIsVideoLoading(false);
    }
  };

  useEffect(() => {
    loadVideo();
    const unsubscribe = onMediaUpdated(() => {
      loadVideo();
    });
    return unsubscribe;
  }, []);

  // Saat video URL berubah, coba jalankan pemutaran otomatis
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay dicegah oleh kebijakan browser jika unmuted, kontrol tetap tersedia
        });
      }
    }
  }, [videoUrl]);

  const handleStartClick = () => {
    sfx.playClick();
    onStart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col justify-between p-3 sm:p-6 md:p-8 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 sm:py-3 border-b border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 border border-emerald-300/40">
            <Compass className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block">
              BioVillage Simulator
            </span>
            <span className="text-sm sm:text-base font-bold text-amber-200 font-fredoka">
              Misi Petualangan Desa Sel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tombol khusus Guru/Admin untuk mengelola video intro */}
          {isTeacher && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setShowVideoManager(true);
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              title="Kelola & Ganti Video Intro Misi (Firebase Storage)"
            >
              <Sparkles className="w-4 h-4 text-emerald-900" />
              <span>Kelola Video Welcome</span>
            </button>
          )}

          {/* Jika Guru, tombol opsi langsung menuju Teacher Dashboard */}
          {isTeacher && onGoToTeacherDashboard && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onGoToTeacherDashboard();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Dashboard Guru</span>
            </button>
          )}

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <span className="text-slate-300">Login:</span>
            <span className="font-bold text-amber-300">{currentUser.fullName || currentUser.nama || currentUser.username}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
              {currentUser.role}
            </span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-4xl w-full mx-auto my-6 flex-1 flex flex-col items-center">
        {/* 1. Video Player di Bagian Atas-Tengah */}
        <section className="w-full flex flex-col items-center mb-6">
          <div className="relative w-full max-w-[460px] aspect-[420/260] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-950/60 border-2 sm:border-4 border-emerald-500/40 bg-black/80 group">
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              onError={() => {
                if (videoUrl !== '/assets/landing_page_video.mp4') {
                  setVideoUrl('/assets/landing_page_video.mp4');
                } else if (videoUrl !== '/assets/asset_001.mp4') {
                  setVideoUrl('/assets/asset_001.mp4');
                }
              }}
            />

            {/* Overlay tag indikator */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400/30 flex items-center gap-1.5 text-[11px] font-bold text-amber-300 shadow">
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>Intro Misi Petualangan</span>
            </div>

            {/* Tombol cepat ganti video pada overlay sudut kanan atas video player */}
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setShowVideoManager(true);
              }}
              className="absolute top-2.5 right-2.5 bg-slate-950/85 hover:bg-amber-400 hover:text-slate-950 text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/40 flex items-center gap-1.5 text-[11px] font-bold shadow-lg transition-all cursor-pointer active:scale-95"
              title="Unggah berkas video baru khusus untuk Landing Page"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ganti Video</span>
            </button>
          </div>

          {/* Tombol Unggah Video Khusus Landing Page */}
          <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setShowVideoManager(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-amber-300/40"
              title="Unggah berkas video MP4/WebM atau tautan video khusus untuk landing page"
            >
              <Upload className="w-4 h-4 text-emerald-950" />
              <span>Unggah / Ganti Video Landing Page</span>
            </button>
            <span className="text-[11px] text-emerald-300/80 flex items-center gap-1">
              <span>🛡️</span>
              <span>Terisolasi &bull; Tidak mempengaruhi level game</span>
            </span>
          </div>
        </section>

        {/* 2. Di Bawah Video: Teks Konten & Analogi */}
        <section className="w-full bg-slate-900/90 border border-emerald-600/30 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 text-slate-200 backdrop-blur-sm">
          {/* Judul (bold) */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-fredoka text-amber-300 text-center tracking-wide">
            Selamat datang di Misi Petualangan Desa Sel!
          </h1>

          {/* Paragraf 1: Penjelasan analogi */}
          <p className="text-sm sm:text-base leading-relaxed text-slate-200 text-justify sm:text-left">
            Tahukah kamu bahwa setiap sel hidup bekerja persis seperti sebuah komunitas desa yang harmonis dan teratur? 
            Di dalam Desa Sel, setiap komponen organel memiliki peran krusial yang saling bekerja sama—seperti <strong className="text-emerald-300 font-semibold">Balai Desa (Inti Sel)</strong> sebagai pusat instruksi, <strong className="text-emerald-300 font-semibold">Pelabuhan dan Pasar (RE &amp; Badan Golgi)</strong> sebagai pusat logistik pengemasan, hingga <strong className="text-emerald-300 font-semibold">Pusat Pengolahan Sampah (Lisosom)</strong> yang memastikan kebersihan dan keberlanjutan hidup warga.
          </p>

          {/* Paragraf 2: Penjelasan peran user */}
          <p className="text-sm sm:text-base leading-relaxed text-slate-200 text-justify sm:text-left">
            Dalam petualangan ini, kamu akan berperan sebagai <strong className="text-amber-300 font-semibold">Pengelola Desa Sel</strong>! Kamu akan menjelajahi setiap fasilitas desa, berinteraksi dengan warga organel, mengurai lalu lintas transportasi zat, dan memecahkan tantangan seru untuk menjaga keseimbangan ekosistem sel.
          </p>

          {/* Sub-judul (bold) */}
          <div className="pt-2">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-amber-200 font-fredoka flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Selesaikan misi dalam petualangan ini, dan kamu akan mampu:</span>
            </h2>

            {/* Daftar bullet point dengan emoji ikon tujuan pembelajaran */}
            <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-colors">
                <span className="text-base leading-none">🛡️</span>
                <span>
                  <strong className="text-emerald-300 font-semibold">Peran Membran Sel:</strong> Menguasai fungsi gerbang pos pengatur lalu lintas zat yang menjaga keamanan desa sel.
                </span>
              </li>

              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-colors">
                <span className="text-base leading-none">🏛️</span>
                <span>
                  <strong className="text-emerald-300 font-semibold">Fungsi Inti Sel (Nukleus):</strong> Memahami balai desa sebagai pusat penyimpanan cetak biru DNA dan pengendali instruksi kehidupan.
                </span>
              </li>

              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-colors">
                <span className="text-base leading-none">🚢</span>
                <span>
                  <strong className="text-emerald-300 font-semibold">Sistem Transportasi RE dan Golgi:</strong> Menganalisis alur modifikasi, pengemasan, dan distribusi protein antarfungsi.
                </span>
              </li>

              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-colors">
                <span className="text-base leading-none">⚡</span>
                <span>
                  <strong className="text-emerald-300 font-semibold">Proses Energi Mitokondria &amp; Kloroplas:</strong> Menjelaskan mekanisme pembangkit tenaga listrik ATP dan pusat fotosintesis sel.
                </span>
              </li>

              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-colors">
                <span className="text-base leading-none">♻️</span>
                <span>
                  <strong className="text-emerald-300 font-semibold">Pengelolaan Limbah Lisosom &amp; Peroksisom:</strong> Memahami daur ulang makromolekul serta detoksifikasi racun seluler.
                </span>
              </li>

              <li className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-colors">
                <span className="text-base leading-none">🧩</span>
                <span>
                  <strong className="text-emerald-300 font-semibold">Pemahaman Analogi Desa-Sel Secara Utuh:</strong> Menghubungkan keharmonisan seluruh organel sebagai satu sistem kehidupan yang saling bergantung.
                </span>
              </li>
            </ul>
          </div>

          {/* Kalimat penutup */}
          <div className="pt-2 text-center">
            <p className="text-base sm:text-lg font-bold font-fredoka text-amber-300 tracking-wide">
              Selamat belajar dan selamat berpetualang!
            </p>
          </div>
        </section>

        {/* 3. Tombol Besar Berwarna Biru "Start" di Bagian Bawah */}
        <div className="w-full flex justify-center pt-6 pb-4">
          <button
            type="button"
            onClick={handleStartClick}
            className="w-full sm:w-auto min-w-[240px] px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-lg sm:text-xl rounded-2xl shadow-xl shadow-blue-900/50 hover:shadow-blue-500/40 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border border-blue-400/40 group"
          >
            <BookOpen className="w-6 h-6 text-blue-100 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Start</span>
            <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-4xl w-full mx-auto text-center py-2 text-xs text-slate-500">
        BioVillage Simulator &copy; 2026 &bull; Media Edukasi Biologi Sel Interaktif
      </footer>

      {/* Modal Kelola Video Welcome (Untuk Guru/Admin) */}
      {showVideoManager && (
        <IntroVideoManagerModal
          isOpen={showVideoManager}
          onClose={() => setShowVideoManager(false)}
          onVideoUpdated={(newUrl) => {
            setVideoUrl(newUrl);
          }}
        />
      )}
    </div>
  );
};
