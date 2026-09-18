import { ShoppingBag, DollarSign, Package, CalendarCheck, FileCheck, Layers, X, Sparkles } from 'lucide-react';

interface AppIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (ideaText: string) => void;
}

export function AppIdeaModal({ isOpen, onClose, onSelectSuggestion }: AppIdeaModalProps) {
  if (!isOpen) return null;

  const IDEAS = [
    {
      icon: ShoppingBag,
      title: 'Aplikasi Kasir & Toko (POS)',
      desc: 'Katalog produk, keranjang belanja, cetak struk nota, dan perhitungan total otomatis.',
      prompt: 'Ubah menjadi aplikasi kasir toko lengkap dengan daftar produk, keranjang belanja, dan cetak struk transaksi',
    },
    {
      icon: DollarSign,
      title: 'Aplikasi Pengelola Keuangan Pribadi',
      desc: 'Pencatatan pos anggaran, grafik pengeluaran bulanan, dan target tabungan.',
      prompt: 'Buatkan aplikasi manajemen keuangan pribadi dengan kategori anggaran dan grafik pengeluaran',
    },
    {
      icon: Package,
      title: 'Sistem Inventaris Barang & Gudang',
      desc: 'Pantau stok masuk dan keluar, peringatan stok menipis, dan kode SKU barang.',
      prompt: 'Buatkan sistem manajemen inventaris gudang dengan pemantauan stok minimum dan riwayat stok',
    },
    {
      icon: CalendarCheck,
      title: 'Aplikasi Reservasi & Booking Janji Temu',
      desc: 'Jadwal ketersediaan waktu, form reservasi klien, dan status konfirmasi.',
      prompt: 'Buatkan sistem booking jadwal reservasi janji temu online untuk klinik atau salon',
    },
    {
      icon: FileCheck,
      title: 'Pelacak Kebiasaan Harian (Habit Tracker)',
      desc: 'Pencatat rutinitas harian dengan grafik streak dan persentase konsistensi.',
      prompt: 'Buatkan habit tracker harian dengan streak counter dan rekap mingguan',
    },
    {
      icon: Layers,
      title: 'Papan Proyek Kanban (Project Board)',
      desc: 'Kolom To Do, In Progress, Review, dan Done dengan kartu tugas drag & drop.',
      prompt: 'Buatkan papan Kanban interaktif untuk manajemen proyek tim dan alur kerja',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">Inspirasi & Ide Aplikasi</h2>
              <p className="text-xs text-stone-500">
                Pilih jenis aplikasi yang ingin Anda kembangkan berikutnya
              </p>
            </div>
          </div>
          <button
            id="btn-close-idea-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {IDEAS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectSuggestion(item.prompt)}
                  className="p-4 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50/70 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mb-2.5 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-medium text-stone-700 group-hover:text-stone-950">
                    <span>Gunakan template ide ini</span>
                    <span className="text-stone-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
            <p className="font-semibold text-stone-800 mb-1">💡 Butuh aplikasi khusus lainnya?</p>
            <p>
              Anda bisa langsung mengetikkan permintaan Anda di kolom chat kapan saja, seperti:{' '}
              <span className="italic font-medium text-stone-700">
                &quot;Tambahkan fitur ekspor PDF&quot;
              </span>{' '}
              atau{' '}
              <span className="italic font-medium text-stone-700">
                &quot;Ubah menjadi aplikasi sistem absensi karyawan&quot;
              </span>.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
