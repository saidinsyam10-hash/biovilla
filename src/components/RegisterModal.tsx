import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, User, UserCheck, Sparkles, AlertCircle, GraduationCap, Backpack } from 'lucide-react';
import { registerUser } from '../utils/authStore';
import { UserAccount, UserRole } from '../types';
import { sfx } from '../utils/audio';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('siswa');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = registerUser(username, password, role, fullName);
    setIsLoading(false);

    if (result.success && result.user) {
      sfx.playCorrect();
      onSuccess(result.user);
      onClose();
    } else {
      sfx.playIncorrect();
      setErrorMessage(result.error || 'Pendaftaran gagal. Silakan coba lagi.');
    }
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
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-200 max-w-[400px] w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Tombol X di pojok kanan atas */}
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
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mb-2 shadow-inner">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Daftar Akun Baru
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bergabung ke BioVillage Simulator (Tanpa Email)
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Pendaftaran */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Input Username (TANPA email) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Contoh: budi_pratama"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Input Nama Lengkap (opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-fullname">
              Nama Lengkap (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <input
                id="reg-fullname"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Contoh: Budi Pratama"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Pilihan Peran (Role: Siswa / Guru) */}
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Peran Akun
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  role === 'siswa'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="siswa"
                  checked={role === 'siswa'}
                  onChange={() => setRole('siswa')}
                  className="sr-only"
                />
                <Backpack className={`w-4 h-4 ${role === 'siswa' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="text-xs font-bold">Siswa</div>
                  <div className="text-[10px] text-slate-500 font-normal">Petualang Sel</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  role === 'guru'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="guru"
                  checked={role === 'guru'}
                  onChange={() => setRole('guru')}
                  className="sr-only"
                />
                <GraduationCap className={`w-4 h-4 ${role === 'guru' ? 'text-amber-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="text-xs font-bold">Guru</div>
                  <div className="text-[10px] text-slate-500 font-normal">Kelola &amp; Nilai</div>
                </div>
              </label>
            </div>
          </div>

          {/* Tombol Submit "Daftar & Masuk" */}
          <button
            type="submit"
            id="btn-submit-register"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-base shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar & Masuk'}
          </button>
        </form>

        {/* Teks bawah: Sudah punya akun? Masuk di sini */}
        <div className="mt-4 text-center text-xs text-slate-600">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onSwitchToLogin();
            }}
            className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
          >
            Masuk di sini
          </button>
        </div>
      </div>
    </div>
  );
};
