import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, User, Sparkles, AlertCircle, Info } from 'lucide-react';
import { loginUser } from '../utils/authStore';
import { UserAccount } from '../types';
import { sfx } from '../utils/audio';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsLoading(true);

    const result = loginUser(username, password, rememberMe);
    setIsLoading(false);

    if (result.success && result.user) {
      sfx.playCorrect();
      onSuccess(result.user);
      onClose();
    } else {
      sfx.playIncorrect();
      setErrorMessage(result.error || 'Terjadi kesalahan saat masuk.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    sfx.playClick();
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleForgotPassword = () => {
    sfx.playClick();
    setInfoMessage(
      'Untuk reset password, silakan hubungi Guru/Admin atau gunakan akun demo cepat di bawah.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
      onClick={e => {
        if (e.target === e.currentTarget) {
          sfx.playClick();
          onClose();
        }
      }}
    >
      {/* Card putih rounded ±380–400px di tengah layar */}
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-100 max-w-[400px] w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Tombol X di pojok kanan atas modal untuk menutup */}
        <button
          type="button"
          onClick={() => {
            sfx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke BioVillage Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan username dan password akun Anda
          </p>
        </div>

        {/* Error / Info alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input 1: Username (TANPA email) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="login-username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan Username"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Input 2: Password (dengan ikon mata show/hide) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
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

          {/* Checkbox "Ingat saya" + link "Lupa password?" sejajar di kanan */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
              />
              <span className="font-medium">Ingat saya</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
            >
              Lupa password?
            </button>
          </div>

          {/* Tombol "Masuk" full-width, warna hijau tema (senada tombol "Mulai Petualangan") */}
          <button
            type="submit"
            id="btn-submit-login"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Memeriksa Akun...' : 'Masuk'}
          </button>
        </form>

        {/* Demo Account Quick-Fill Helper */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 text-center uppercase tracking-wider">
            Akses Cepat Akun Uji Coba:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('guru', 'guru123')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span>👩‍🏫</span>
              <span>Guru (guru)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('siswa', 'siswa123')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span>🎒</span>
              <span>Siswa (siswa)</span>
            </button>
          </div>
        </div>

        {/* Teks bawah: "Belum punya akun? Daftar di sini" (link ke form Daftar) */}
        <div className="mt-4 text-center text-xs text-slate-600">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onSwitchToRegister();
            }}
            className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
          >
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
};
