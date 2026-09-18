import React, { useState } from 'react';
import { Leaf, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, UserCheck, ShieldCheck, GraduationCap, School } from 'lucide-react';
import { loginUser, registerUser } from '../utils/authStore';
import { UserAccount, UserRole } from '../types';
import { sfx } from '../utils/audio';

interface LoginGateProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('siswa');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = loginUser(username, password, rememberMe);
    setIsLoading(false);

    if (result.success && result.user) {
      sfx.playCorrect();
      setSuccessMessage(`Berhasil masuk sebagai ${result.user.nama || result.user.fullName}!`);
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 350);
    } else {
      sfx.playIncorrect();
      setErrorMessage(result.error || 'Terjadi kesalahan saat masuk.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = registerUser(regUsername, regPassword, regRole, regFullName);
    setIsLoading(false);

    if (result.success && result.user) {
      sfx.playCorrect();
      setSuccessMessage('Akun berhasil dibuat! Mengalihkan ke aplikasi...');
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 400);
    } else {
      sfx.playIncorrect();
      setErrorMessage(result.error || 'Pendaftaran gagal.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    sfx.playClick();
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative nature backdrop elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* App Title & Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-900/40 mb-3 border border-emerald-400/30 animate-bounce duration-1000">
            <Leaf className="w-8 h-8 text-amber-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-tight font-fredoka drop-shadow-sm">
            BioVillage <span className="text-emerald-400">Simulator</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 font-medium mt-1">
            Media Pembelajaran Biologi Sel Berbasis Petualangan Desa
          </p>
        </div>

        {/* Gerbang Login Card */}
        <div className="bg-amber-50/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-2xl shadow-emerald-950/80 relative">
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-200 mb-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Gerbang Masuk Wajib</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-fredoka mt-0.5">
                {activeTab === 'login' ? 'Silakan Masuk Terlebih Dahulu' : 'Pendaftaran Akun Baru'}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-200/80 text-amber-900 border border-amber-300">
              🔒 Autentikasi
            </span>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-amber-200/60 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-950 hover:bg-amber-200/80'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk Akun</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-950 hover:bg-amber-200/80'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Daftar Baru</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: FORM LOGIN */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Input 1: Username (NISN/Nama Pengguna untuk Siswa, NIP/Kode untuk Guru) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="gate-username">
                  Username
                  <span className="text-[11px] font-normal text-slate-500 ml-1">
                    (Siswa: NISN/Nama • Guru: NIP/Kode Guru)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="gate-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Contoh: siswa atau guru"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border-2 border-amber-200/80 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Input 2: Password (dengan toggle show/hide) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="gate-password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="gate-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan Password akun"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border-2 border-amber-200/80 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox "Ingat saya" */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              {/* Tombol "Masuk" full-width, warna hijau tema */}
              <button
                type="submit"
                id="btn-gate-login-submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 border-b-4 border-emerald-800"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Memeriksa Kredensial...' : 'Masuk ke BioVillage'}</span>
              </button>
            </form>
          ) : (
            /* TAB 2: FORM REGISTER */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-fullname">
                  Nama Lengkap
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-amber-200/80 bg-white text-slate-900 text-sm font-medium outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peran / Role Pengguna
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('siswa')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      regRole === 'siswa'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🎒</span>
                    <span>Siswa (Belajar)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('guru')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      regRole === 'guru'
                        ? 'bg-amber-100 border-amber-500 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>👩‍🏫</span>
                    <span>Guru (Pantau)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-username">
                  Username (Untuk Login)
                </label>
                <input
                  id="reg-username"
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="Contoh: budi123"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-amber-200/80 bg-white text-slate-900 text-sm font-medium outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl border-2 border-amber-200/80 bg-white text-slate-900 text-sm font-medium outline-none focus:border-emerald-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer border-b-4 border-emerald-800"
              >
                <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar & Masuk Sekarang'}</span>
              </button>
            </form>
          )}

          {/* Demo 1-Click Access for Instant Testing */}
          <div className="mt-5 pt-4 border-t border-amber-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Pilihan Akun Uji Coba Cepat (1-Klik):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('guru', 'guru123')}
                className="p-2 rounded-xl bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <span>👩‍🏫</span>
                  <span>Akun Guru</span>
                </div>
                <div className="text-[10px] text-amber-800 font-medium truncate">
                  guru • guru123 (Dashboard)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('siswa', 'siswa123')}
                className="p-2 rounded-xl bg-emerald-100/90 hover:bg-emerald-200/90 border border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <span>👦</span>
                  <span>Siswa (Budi)</span>
                </div>
                <div className="text-[10px] text-emerald-800 font-medium truncate">
                  siswa • siswa123 (Level 3)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('ani', 'ani123')}
                className="p-2 rounded-xl bg-purple-100/90 hover:bg-purple-200/90 border border-purple-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                  <span>👧</span>
                  <span>Siswa (Ani)</span>
                </div>
                <div className="text-[10px] text-purple-800 font-medium truncate">
                  ani • ani123 (8 Level Tuntas)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('fauzan', 'fauzan123')}
                className="p-2 rounded-xl bg-sky-100/90 hover:bg-sky-200/90 border border-sky-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                  <span>🧑</span>
                  <span>Siswa (Fauzan)</span>
                </div>
                <div className="text-[10px] text-sky-800 font-medium truncate">
                  fauzan • fauzan123 (Level 5)
                </div>
              </button>
            </div>
          </div>

          {/* Security & Data note */}
          <div className="mt-4 pt-3 border-t border-amber-200/60 text-center">
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              🔒 <strong>Wajib Login:</strong> Level dan soal misi terkunci hingga Anda masuk. Progres tersimpan per-username.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
