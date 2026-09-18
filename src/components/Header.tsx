import { Calendar, CheckSquare, FileText, Wallet, Sparkles, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tugas' | 'catatan' | 'keuangan';
  onTabChange: (tab: 'tugas' | 'catatan' | 'keuangan') => void;
  onOpenIdeas: () => void;
  onQuickAdd: () => void;
}

export function Header({ activeTab, onTabChange, onOpenIdeas, onQuickAdd }: HeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
                  Ruang Kerja Produktif
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  Aktif
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {todayFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-app-ideas"
              onClick={onOpenIdeas}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
              title="Lihat inspirasi tipe aplikasi lain"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Inspirasi Aplikasi</span>
            </button>
            <button
              id="btn-quick-add"
              onClick={onQuickAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baru</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-stone-100">
          <button
            id="tab-tugas"
            onClick={() => onTabChange('tugas')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'tugas'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tugas Harian</span>
          </button>

          <button
            id="tab-catatan"
            onClick={() => onTabChange('catatan')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'catatan'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Catatan & Memo</span>
          </button>

          <button
            id="tab-keuangan"
            onClick={() => onTabChange('keuangan')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'keuangan'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Pencatatan Keuangan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
