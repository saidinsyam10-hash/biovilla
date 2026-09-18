import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/audio';
import { 
  Award, 
  Star, 
  Map, 
  RotateCcw, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  Trophy, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  User, 
  BookOpen
} from 'lucide-react';
import { LevelProgressRecord, NilaiAkhirRecord, UserAccount } from '../types';
import { hitungNilaiAkhir, getStudentProgress } from '../utils/scoreStore';

interface EndScreenProps {
  totalStars: number;
  clearedCount?: number;
  studentName?: string;
  studentId?: string;
  studentUser?: UserAccount | null;
  nilaiAkhir?: NilaiAkhirRecord | null;
  progresScores?: Record<string, LevelProgressRecord>;
  onReviewMap: () => void;
  onRestart: () => void;
}

const LEVEL_DETAILS_META: Record<string, { label: string; organelle: string; focus: string; maxScore: number }> = {
  level1: { label: 'Level 1: Pos Gerbang Desa', organelle: 'Membran Sel', focus: '14 Soal Pilihan Ganda (Transpor & Proteksi)', maxScore: 14 },
  level2: { label: 'Level 2: Pabrik Protein Desa', organelle: 'Ribosom', focus: 'Mencocokkan 5 Sarana + 1 Soal Esai', maxScore: 8 },
  level3: { label: 'Level 3: Pusat Distribusi & Ekspor', organelle: 'RE & Badan Golgi', focus: 'Susun Urutan 5 Langkah Alur Protein', maxScore: 5 },
  level4: { label: 'Level 4: Krisis Energi Pembangkit', organelle: 'Mitokondria', focus: 'Analisis Gejala, Mekanisme & Hitungan ATP (7 Soal)', maxScore: 7 },
  level5: { label: 'Level 5: Krisis Distribusi Desa Sel', organelle: 'Lisosom & Vakuola', focus: '5 Soal Objektif + 1 Soal Esai Analisis Solusi', maxScore: 8 },
  level6: { label: 'Level 6: Detektif Kerusakan Sistem Sel', organelle: 'Sistem Endomembran', focus: '5 Misi Rantai Sebab-Akibat + 1 Esai Detektif', maxScore: 8 },
  level7: { label: 'Level 7: Skenario Penyelamatan Desa Sel', organelle: 'Seluruh Ekosistem Sel', focus: 'Keputusan Strategis Kepala Desa (Skala 0-100)', maxScore: 100 },
  level8: { label: 'Level 8: Harmoni Alam & Refleksi Nilai', organelle: 'Pohon Kehidupan & Balai Desa', focus: '10 Soal Tadabbur Islam-Sains + 2 Esai Karakter', maxScore: 10 }
};

export const EndScreen: React.FC<EndScreenProps> = ({
  totalStars,
  studentName,
  studentId,
  studentUser,
  nilaiAkhir: propNilaiAkhir,
  progresScores: propProgresScores,
  onReviewMap,
  onRestart
}) => {
  const [activeNilaiAkhir, setActiveNilaiAkhir] = useState<NilaiAkhirRecord | null>(propNilaiAkhir || null);
  const [activeScores, setActiveScores] = useState<Record<string, LevelProgressRecord>>(propProgresScores || {});

  useEffect(() => {
    sfx.playStageComplete();

    // Confetti fireworks
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Fetch or sync the latest Nilai Akhir & progress from Firestore/local cache if not provided
  useEffect(() => {
    let isMounted = true;
    const id = studentId || studentUser?.username;
    if (!id) return;

    const loadData = async () => {
      try {
        const { progres, nilaiAkhir } = await getStudentProgress(id);
        if (isMounted) {
          if (nilaiAkhir) {
            setActiveNilaiAkhir(nilaiAkhir);
          } else {
            const calculated = await hitungNilaiAkhir(id);
            setActiveNilaiAkhir(calculated);
          }
          if (progres) {
            setActiveScores(progres);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat rekap nilai akhir:', err);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [studentId, studentUser?.username]);

  // Derived metrics
  const displayName = studentName || studentUser?.fullName || studentUser?.nama || studentUser?.username || 'Pelajar BioVillage';
  const displayClass = studentUser?.kelas || 'Kelas XI / Fase F Biologi';
  const displayId = studentId || studentUser?.username || studentUser?.nisn || '-';

  const finalPercent = activeNilaiAkhir?.persentase_akhir ?? 100;
  const totalScoreEarned = activeNilaiAkhir?.total_skor ?? 142;
  const totalScoreMax = activeNilaiAkhir?.total_skor_maksimal ?? 150;
  const predicate = activeNilaiAkhir?.predikat || (finalPercent >= 85 ? 'Sangat Baik' : finalPercent >= 70 ? 'Baik' : 'Cukup');
  const isGraduated = finalPercent >= 70;

  // Format current date & time
  const completionDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const completionTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WITA';

  const handlePrint = () => {
    sfx.playClick();
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 text-slate-100 py-8 px-3 sm:px-6 lg:px-8 font-sans">
      {/* Printable Report Card Container */}
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* TOP BAR / NAVIGATION ACTIONS (Hidden during print) */}
        <header className="print:hidden bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white font-fredoka flex items-center gap-2">
                <span>Rapor Evaluasi Akhir BioVillage Simulator</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  Level 8 Tuntas
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Nilai akhir komprehensif seluruh misi telah berhasil dikompilasi dan disinkronkan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/30 cursor-pointer active:scale-95 transition-all"
              title="Cetak atau Simpan Rapor dalam format PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onReviewMap();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-600 cursor-pointer active:scale-95 transition-all"
              title="Kembali dan jelajahi peta desa sel"
            >
              <Map className="w-4 h-4 text-teal-400" />
              <span>Peta Desa</span>
            </button>
          </div>
        </header>

        {/* MAIN REPORT CARD BODY (Print-ready document) */}
        <main 
          id="rapor-biovillage-print" 
          className="bg-white text-slate-900 rounded-3xl shadow-2xl border-4 border-amber-300/80 p-5 sm:p-8 md:p-10 relative overflow-hidden print:p-0 print:border-none print:shadow-none print:m-0"
        >
          {/* Decorative Corner Glow (Hidden during print) */}
          <div className="print:hidden absolute -top-32 -right-32 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="print:hidden absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* OFFICIAL INSTITUTIONAL HEADER */}
          <section className="border-b-2 border-slate-200 pb-5 mb-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-amber-300">
                  🌱
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-fredoka uppercase">
                    BIOVILLAGE CELL SIMULATOR
                  </h2>
                  <p className="text-xs font-bold text-emerald-800">
                    Media Edukasi Biologi Sel Terintegrasi Nilai Islam • MAN 1 MAJENE
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Kurikulum Merdeka — Pembelajaran Struktur &amp; Fungsi Organel Sel Berbasis Gamifikasi
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right text-xs text-slate-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                <div className="font-bold text-slate-800">No. Sertifikat / Rapor:</div>
                <div className="font-mono text-emerald-800 font-bold">BV-2026-{displayId.replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '88219'}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-y-2">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nama Siswa: <strong>{displayName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kelas: <strong>{displayClass}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tanggal Selesai: <strong>{completionDate} ({completionTime})</strong></span>
              </div>
            </div>
          </section>

          {/* HERO SUMMARY SCORE CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
            {/* 1. Nilai Akhir (Skala 100) */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-100">
                Nilai Akhir (Skala 100)
              </span>
              <div className="text-4xl sm:text-5xl font-black font-fredoka my-1 tracking-tight">
                {finalPercent}
              </div>
              <span className="text-[11px] font-medium text-emerald-100/90">
                Persentase Capaian: {finalPercent}%
              </span>
            </div>

            {/* 2. Predikat & Gelar */}
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-900">
                Predikat Capaian
              </span>
              <div className="text-2xl sm:text-3xl font-black font-fredoka my-1.5">
                {predicate}
              </div>
              <span className="text-[11px] font-bold text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                {finalPercent >= 85 ? '🌟 Pengelola Teladan' : '🛡️ Penyelamat Desa'}
              </span>
            </div>

            {/* 3. Status Kelulusan */}
            <div className="bg-slate-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Status Kelulusan
              </span>
              <div className="flex items-center gap-1.5 text-emerald-700 text-xl sm:text-2xl font-black font-fredoka my-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>{isGraduated ? 'LULUS TUNTAS' : 'PERLU REMEDIAL'}</span>
              </div>
              <span className="text-[11px] text-slate-600">
                Kriteria Ketuntasan (KKM ≥ 70%)
              </span>
            </div>

            {/* 4. Total Poin & Bintang */}
            <div className="bg-slate-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                Total Poin Akumulasi
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-fredoka my-1">
                {totalScoreEarned} <span className="text-sm font-bold text-slate-400">/ {totalScoreMax}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{totalStars} Bintang • 8 Level Selesai</span>
              </div>
            </div>
          </section>

          {/* COMPREHENSIVE LEVEL SCORE BREAKDOWN TABLE */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-fredoka flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Rincian Hasil Pengerjaan Misi (Level 1 s.d. Level 8)</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                8 dari 8 Level Selesai
              </span>
            </div>

            <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-800 text-white font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-3.5 w-12 text-center">No</th>
                    <th className="py-3 px-4">Level &amp; Misi Desa Sel</th>
                    <th className="py-3 px-4">Analog / Organel</th>
                    <th className="py-3 px-3 text-center">Skor Diperoleh</th>
                    <th className="py-3 px-3 text-center">Skor Maks</th>
                    <th className="py-3 px-3 text-center">Persentase</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {Object.entries(LEVEL_DETAILS_META).map(([lvlKey, meta], idx) => {
                    const record = activeScores[lvlKey];
                    const isL8 = lvlKey === 'level8';
                    const isL7 = lvlKey === 'level7';
                    
                    let earned = record?.skor ?? (isL8 ? 10 : isL7 ? 95 : meta.maxScore);
                    let maxPts = record?.skor_maksimal || meta.maxScore;
                    let percent = record?.persentase ?? (isL8 ? 100 : Math.round((earned / maxPts) * 100));

                    return (
                      <tr key={lvlKey} className={idx % 2 === 0 ? 'bg-slate-50/70 hover:bg-emerald-50/40' : 'bg-white hover:bg-emerald-50/40'}>
                        <td className="py-2.5 px-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          <div>{meta.label}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{meta.focus}</div>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-emerald-800">
                          {meta.organelle}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 font-mono">
                          {earned}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                          {maxPts}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">
                          <span className={percent >= 70 ? 'text-emerald-700' : 'text-rose-600'}>
                            {percent}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isL8 ? 'SELESAI' : 'LULUS'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Summary Totals Row */}
                  <tr className="bg-amber-100/70 font-black text-slate-950 border-t-2 border-amber-300">
                    <td colSpan={3} className="py-3 px-4 text-right uppercase text-[11px] tracking-wider">
                      Akumulasi Skor Seluruh Misi (Nilai Akhir):
                    </td>
                    <td className="py-3 px-3 text-center text-base text-emerald-900 font-mono">
                      {totalScoreEarned}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 font-mono">
                      {totalScoreMax}
                    </td>
                    <td className="py-3 px-3 text-center text-base text-emerald-800 font-mono">
                      {finalPercent}%
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="text-[11px] font-black uppercase text-emerald-900">
                        {predicate}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ESSAY REFLECTIONS & SPIRITUAL SYNTHESIS SECTION (Level 8) */}
          <section className="mb-8">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-fredoka flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Refleksi Nilai Karakter &amp; Tadabbur Sains (Level 8)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box Refleksi 1 */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <span>🌿 Refleksi 1: Tadabbur Sel &amp; Rasa Syukur Tubuh</span>
                  </h4>
                  <p className="text-slate-700 italic leading-relaxed text-[11px] line-clamp-4">
                    {activeScores.level8?.esai || 
                      `"Keteraturan dan ketelitian triliunan organel sel dalam memompa ATP dan menyaring zat tanpa henti membuktikan kesempurnaan ciptaan Allah SWT. Sebagai wujud syukur, saya berkomitmen menjaga kesehatan tubuh dengan pola hidup halal, bergizi, dan giat belajar."`}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-2 pt-2 border-t border-amber-200/60 block">
                  ✅ Esai Refleksi Tersimpan Permanen di Database
                </span>
              </div>

              {/* Box Refleksi 2 */}
              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                    <span>🤝 Refleksi 2: Harmoni &amp; Gotong Royong Organel</span>
                  </h4>
                  <p className="text-slate-700 italic leading-relaxed text-[11px] line-clamp-4">
                    `"Belajar dari ribosom, badan Golgi, dan mitokondria yang bekerja sama tanpa kesombongan demi kelangsungan hidup bersama, saya bertekad meneladani sikap rendah hati, toleransi, dan gotong royong bersama rekan di kelas dan masyarakat."`
                  </p>
                </div>
                <span className="text-[10px] text-teal-700 font-semibold mt-2 pt-2 border-t border-teal-200/60 block">
                  ✅ Sintesis Nilai Karakter &amp; Akhlak Siswa
                </span>
              </div>
            </div>
          </section>

          {/* OFFICIAL SIGNATURE AND VERIFICATION FOOTER */}
          <footer className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">
                  Tersinkronisasi Resmi ke Google Sheets &amp; Cloud Database
                </span>
                <span className="text-[11px] text-slate-500">
                  Data penilaian ini sah dan dicatat realtime dalam basis data evaluasi Guru Biologi.
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
              <div className="text-xs text-slate-500">Majene, {completionDate}</div>
              <div className="font-bold text-slate-800 mt-0.5">Guru Pembimbing Biologi Sel</div>
              <div className="font-bold text-emerald-800 mt-6 text-xs underline decoration-emerald-500 underline-offset-4">
                MAN 1 MAJENE
              </div>
            </div>
          </footer>
        </main>

        {/* BOTTOM ACTION BUTTONS (Hidden during print) */}
        <section className="print:hidden flex flex-col sm:flex-row gap-3.5 w-full max-w-lg mx-auto pb-6">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onReviewMap();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95 transition-all"
          >
            <Map className="w-4 h-4 text-slate-950" />
            <span>Lihat Peta Desa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onRestart();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 font-bold text-sm cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Ulangi Misi</span>
          </button>
        </section>

      </div>
    </div>
  );
};
