import React from 'react';
import { Leaf, LogIn, UserPlus, LogOut, LayoutDashboard, User } from 'lucide-react';
import { UserAccount } from '../types';
import { sfx } from '../utils/audio';

interface NavbarProps {
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onOpenTeacherDashboard?: () => void;
  isInTeacherDashboard?: boolean;
  onBackToSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onOpenTeacherDashboard,
  isInTeacherDashboard = false,
  onBackToSimulator
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Kiri: Logo Teks "BioVillage Simulator" + Ikon Kecil Daun/Sel */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-emerald-900 truncate">
              BioVillage <span className="text-emerald-600 font-bold">Simulator</span>
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium hidden xs:inline truncate">
              Media Pembelajaran Biologi Sel
            </span>
          </div>
        </div>

        {/* Kanan: Tombol Aksi (Tetap tampil di layar kecil/mobile tanpa hamburger) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {currentUser ? (
            /* Tampilan jika sudah login */
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Badge User */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                <span className="text-sm">{currentUser.avatar || '👤'}</span>
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentUser.role === 'guru'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-200/80 text-emerald-800'
                  }`}
                >
                  {currentUser.role === 'guru' ? 'Guru' : 'Siswa'}
                </span>
              </div>

              {/* Tombol khusus Guru */}
              {currentUser.role === 'guru' && (
                <>
                  {isInTeacherDashboard ? (
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        if (onBackToSimulator) onBackToSimulator();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Leaf className="w-3.5 h-3.5 text-amber-300" />
                      <span className="hidden sm:inline">Peta Petualangan</span>
                      <span className="sm:hidden">Peta</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        if (onOpenTeacherDashboard) onOpenTeacherDashboard();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-900" />
                      <span className="hidden sm:inline">Dashboard Guru</span>
                      <span className="sm:hidden">Dashboard</span>
                    </button>
                  )}
                </>
              )}

              {/* Tombol Keluar / Logout */}
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onLogout();
                }}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 hover:border-red-300 text-slate-700 hover:text-red-600 hover:bg-red-50 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                title="Keluar dari akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            /* Tampilan jika belum login: Tombol Masuk (outline hijau) & Daftar (solid kuning) */
            <>
              <button
                type="button"
                id="btn-nav-login"
                onClick={() => {
                  sfx.playClick();
                  onOpenLogin();
                }}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:scale-95 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Masuk</span>
              </button>

              <button
                type="button"
                id="btn-nav-register"
                onClick={() => {
                  sfx.playClick();
                  onOpenRegister();
                }}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 active:scale-95 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-900" />
                <span>Daftar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
