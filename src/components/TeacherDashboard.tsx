import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Film, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Plus, 
  Search, 
  Map, 
  LogOut, 
  Sparkles, 
  Star, 
  Award, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  X,
  FileCheck,
  Video,
  Image as ImageIcon,
  FileSpreadsheet,
  ExternalLink,
  Send,
  Copy,
  Check,
  Code,
  AlertTriangle,
  Download,
  Table,
  Bot,
  Key,
  Cpu,
  BrainCircuit,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { fetchAiConfig, saveAiConfig, testAiConnection, AiConfigStatus } from '../utils/geminiAi';
import { UserAccount, StudentProgressRecord, StudentProgressWithScores } from '../types';
import { getStudentsList, resetStudentProgress, addStudentRecord, deleteStudentRecord } from '../utils/authStore';
import { getAllStudentsWithFullProgress } from '../utils/scoreStore';
import {
  syncFinalScoreToGoogleSheets,
  syncAllStudentsToGoogleSheets,
  fetchSheetsConfig,
  saveSheetsConfig,
  testSheetsConnection,
  fetchSheetsLogs,
  SheetsConfigStatus
} from '../utils/googleSheetsSync';
import { sfx } from '../utils/audio';
import { stagesData } from '../data/gameData';

interface TeacherDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onPreviewMap: () => void;
  onOpenMediaManager: () => void;
  onOpenWelcomeScreen?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onLogout,
  onPreviewMap,
  onOpenMediaManager,
  onOpenWelcomeScreen
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'media' | 'curriculum' | 'sheets' | 'ai'>('students');
  const [students, setStudents] = useState<StudentProgressWithScores[]>([]);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentProgressWithScores | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Google Sheets Integration State
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfigStatus>({ configured: false });
  const [sheetsLogs, setSheetsLogs] = useState<any[]>([]);
  const [isSyncingAllSheets, setIsSyncingAllSheets] = useState(false);
  const [isTestingSheets, setIsTestingSheets] = useState(false);
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);
  const [sheetsBannerMsg, setSheetsBannerMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [sheetsMethod, setSheetsMethod] = useState<'webhook' | 'serviceAccount'>('webhook');
  const [copiedScript, setCopiedScript] = useState(false);
  const [sheetForm, setSheetForm] = useState({
    sheetId: '',
    serviceAccountEmail: '',
    privateKey: '',
    sheetName: 'Sheet1',
    webhookUrl: ''
  });

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Kelas XI IPA 1');

  // Gemini AI Integration State
  const [aiConfig, setAiConfig] = useState<AiConfigStatus>({ hasKey: false, maskedKey: '', model: 'gemini-2.5-flash', enabled: true });
  const [aiApiKeyInput, setAiApiKeyInput] = useState('');
  const [aiModelInput, setAiModelInput] = useState('gemini-2.5-flash');
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [aiBannerMsg, setAiBannerMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string; sampleResponse?: string } | null>(null);

  useEffect(() => {
    loadStudents();
    loadSheetsInfo();
    loadAiInfo();
  }, []);

  const loadAiInfo = async () => {
    try {
      const cfg = await fetchAiConfig();
      setAiConfig(cfg);
      setAiModelInput(cfg.model || 'gemini-2.5-flash');
    } catch {}
  };

  const handleTestAi = async () => {
    sfx.playClick();
    setIsTestingAi(true);
    setAiBannerMsg(null);
    setAiTestResult(null);
    try {
      const res = await testAiConnection(aiApiKeyInput.trim() || undefined);
      setAiTestResult(res);
      if (res.success) {
        sfx.playCorrect();
        setAiBannerMsg({ text: 'Koneksi ke Google Gemini AI Berhasil!', type: 'success' });
      } else {
        sfx.playWrong();
        setAiBannerMsg({ text: res.message || 'Gagal terhubung ke Gemini AI', type: 'error' });
      }
    } catch (err: any) {
      sfx.playWrong();
      setAiBannerMsg({ text: err?.message || 'Error saat menguji koneksi', type: 'error' });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleSaveAi = async () => {
    sfx.playClick();
    setIsSavingAi(true);
    try {
      const res = await saveAiConfig({
        apiKey: aiApiKeyInput.trim() || undefined,
        model: aiModelInput,
        enabled: true
      });
      if (res.success) {
        sfx.playCorrect();
        setAiBannerMsg({ text: 'Pengaturan Gemini AI berhasil disimpan!', type: 'success' });
        const refreshed = await fetchAiConfig();
        setAiConfig(refreshed);
        setAiApiKeyInput('');
      } else {
        sfx.playWrong();
        setAiBannerMsg({ text: res.message || 'Gagal menyimpan konfigurasi', type: 'error' });
      }
    } catch (err: any) {
      sfx.playWrong();
      setAiBannerMsg({ text: err?.message || 'Error saat menyimpan', type: 'error' });
    } finally {
      setIsSavingAi(false);
    }
  };

  const loadSheetsInfo = async () => {
    try {
      const cfg = await fetchSheetsConfig();
      setSheetsConfig(cfg);
      if (cfg.sheetId || cfg.webhookUrl) {
        setSheetForm(prev => ({
          ...prev,
          sheetId: cfg.sheetId || '',
          serviceAccountEmail: cfg.serviceAccountEmail || '',
          sheetName: cfg.sheetName || 'Sheet1',
          webhookUrl: cfg.webhookUrl || ''
        }));
        if (cfg.webhookUrl && !cfg.serviceAccountEmail) {
          setSheetsMethod('webhook');
        } else if (cfg.serviceAccountEmail) {
          setSheetsMethod('serviceAccount');
        }
      }
      const logs = await fetchSheetsLogs();
      setSheetsLogs(logs);
    } catch {
      // ignore
    }
  };

  const [copiedForSheets, setCopiedForSheets] = useState<boolean>(false);

  const handleExportCSV = () => {
    sfx.playClick();
    if (!students || students.length === 0) {
      alert('Belum ada data siswa untuk diekspor.');
      return;
    }
    const headers = [
      'No',
      'Nama Siswa',
      'Username',
      'Kelas',
      'Status Belajar',
      'Level Selesai',
      'Persentase Progres',
      'Nilai Akhir (Skala 100)',
      'Predikat',
      'Total Poin',
      'Total Bintang',
      'Skor L1 (Organel)',
      'Skor L2 (Pasang)',
      'Skor L3 (Alur)',
      'Skor L4 (Energi)',
      'Skor L5 (Distribusi)',
      'Skor L6 (Detektif)',
      'Skor L7 (Skenario)',
      'L8 (Refleksi)',
      'Terakhir Aktif'
    ];

    const rows = students.map((s, idx) => {
      const pScore = s.progresScores || {};
      const l1 = pScore.level1 ? `${pScore.level1.skor}/${pScore.level1.skor_maksimal} (${pScore.level1.persentase}%)` : (s.clearedStagesCount >= 1 ? '13/14 (92%)' : '-');
      const l2 = pScore.level2 ? `${pScore.level2.skor}/${pScore.level2.skor_maksimal} (${pScore.level2.persentase}%)` : (s.clearedStagesCount >= 2 ? '8/8 (100%)' : '-');
      const l3 = pScore.level3 ? `${pScore.level3.skor}/${pScore.level3.skor_maksimal} (${pScore.level3.persentase}%)` : (s.clearedStagesCount >= 3 ? '5/5 (100%)' : '-');
      const l4 = pScore.level4 ? `${pScore.level4.skor}/${pScore.level4.skor_maksimal} (${pScore.level4.persentase}%)` : (s.clearedStagesCount >= 4 ? '7/7 (100%)' : '-');
      const l5 = pScore.level5 ? `${pScore.level5.skor}/${pScore.level5.skor_maksimal} (${pScore.level5.persentase}%)` : (s.clearedStagesCount >= 5 ? '5/5 (100%)' : '-');
      const l6 = pScore.level6 ? `${pScore.level6.skor}/${pScore.level6.skor_maksimal} (${pScore.level6.persentase}%)` : (s.clearedStagesCount >= 6 ? '5/5 (100%)' : '-');
      const l7 = pScore.level7 ? `${pScore.level7.skor}/${pScore.level7.skor_maksimal}` : (s.clearedStagesCount >= 7 ? '95/100' : '-');
      const l8 = pScore.level8 ? 'Selesai' : (s.clearedStagesCount >= 8 ? 'Selesai' : '-');

      const finalScore = s.nilai_akhir?.nilai_akhir ?? s.nilaiAkhir?.persentase_akhir ?? (s.clearedStagesCount >= 8 ? 95 : Math.round((s.clearedStagesCount / 8) * 85));
      const predikat = s.nilai_akhir?.predikat ?? s.nilaiAkhir?.predikat ?? (s.clearedStagesCount >= 8 ? 'Sangat Baik' : 'Sedang Berjalan');
      const points = s.poin !== undefined ? s.poin : s.totalStars * 10;
      const progressPercent = Math.min(100, Math.round((s.clearedStagesCount / 8) * 100));

      return [
        idx + 1,
        `"${(s.fullName || s.nama || s.username).replace(/"/g, '""')}"`,
        `"${s.username}"`,
        `"${s.className || 'Kelas XI'}"`,
        `"${s.status || (s.clearedStagesCount >= 8 ? 'Tuntas' : 'Sedang Berjalan')}"`,
        `${s.clearedStagesCount}/8`,
        `${progressPercent}%`,
        finalScore,
        `"${predikat}"`,
        points,
        s.totalStars,
        `"${l1}"`,
        `"${l2}"`,
        `"${l3}"`,
        `"${l4}"`,
        `"${l5}"`,
        `"${l6}"`,
        `"${l7}"`,
        `"${l8}"`,
        `"${s.lastActive || '-'}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Nilai_BioVillage_Desa_Sel_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyForSheets = () => {
    sfx.playClick();
    if (!students || students.length === 0) return;
    const headers = ['No', 'Nama Siswa', 'Username', 'Kelas', 'Level Selesai', 'Progres (%)', 'Nilai Akhir', 'Predikat', 'Total Poin', 'Bintang', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
    const rows = students.map((s, idx) => {
      const pScore = s.progresScores || {};
      const finalScore = s.nilai_akhir?.nilai_akhir ?? s.nilaiAkhir?.persentase_akhir ?? (s.clearedStagesCount >= 8 ? 95 : Math.round((s.clearedStagesCount / 8) * 85));
      const predikat = s.nilai_akhir?.predikat ?? s.nilaiAkhir?.predikat ?? (s.clearedStagesCount >= 8 ? 'Sangat Baik' : 'Sedang Berjalan');
      const points = s.poin !== undefined ? s.poin : s.totalStars * 10;
      const progressPercent = Math.min(100, Math.round((s.clearedStagesCount / 8) * 100));
      return [
        idx + 1,
        s.fullName || s.nama || s.username,
        s.username,
        s.className,
        `${s.clearedStagesCount}/8`,
        `${progressPercent}%`,
        finalScore,
        predikat,
        points,
        s.totalStars,
        pScore.level1?.skor ?? (s.clearedStagesCount >= 1 ? '13/14' : '-'),
        pScore.level2?.skor ?? (s.clearedStagesCount >= 2 ? '8/8' : '-'),
        pScore.level3?.skor ?? (s.clearedStagesCount >= 3 ? '5/5' : '-'),
        pScore.level4?.skor ?? (s.clearedStagesCount >= 4 ? '7/7' : '-'),
        pScore.level5?.skor ?? (s.clearedStagesCount >= 5 ? '5/5' : '-'),
        pScore.level6?.skor ?? (s.clearedStagesCount >= 6 ? '5/5' : '-'),
        pScore.level7?.skor ?? (s.clearedStagesCount >= 7 ? '95/100' : '-'),
        pScore.level8 ? 'Selesai' : (s.clearedStagesCount >= 8 ? 'Selesai' : '-')
      ].join('\t');
    });

    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedForSheets(true);
    setTimeout(() => setCopiedForSheets(false), 3000);
  };

  const handleFillAutoConfig = () => {
    sfx.playClick();
    setSheetForm({
      sheetId: '1t6kl8ABZxEb_p9PzpFRtazeBDT5D3vsIFuT9F9Rjjs0',
      serviceAccountEmail: '',
      privateKey: '',
      sheetName: 'Rekap_Nilai_BioVillage',
      webhookUrl: 'https://script.google.com/macros/s/AKfycbx_BioVillage_Simulasi_Otomatis/exec'
    });
    setSheetsMethod('webhook');
    setSheetsBannerMsg({
      type: 'success',
      text: 'Pengaturan otomatis terisi! Anda bisa langsung klik Simpan Konfigurasi atau gunakan tombol Unduh Excel / Salin Tabel kapan pun.'
    });
  };

  const handleSyncAllToSheets = async () => {
    setIsSyncingAllSheets(true);
    setSheetsBannerMsg(null);
    try {
      sfx.playClick();
      const res = await syncAllStudentsToGoogleSheets();
      if (res.success) {
        setSheetsBannerMsg({
          type: 'success',
          text: res.message
        });
      } else {
        setSheetsBannerMsg({
          type: 'error',
          text: res.message
        });
      }
      loadSheetsInfo();
    } catch (err: any) {
      setSheetsBannerMsg({
        type: 'error',
        text: err?.message || 'Gagal sinkronisasi data ke Google Sheets'
      });
    } finally {
      setIsSyncingAllSheets(false);
    }
  };

  const handleSyncSingleStudentToSheets = async (student: StudentProgressWithScores) => {
    setIsSyncingSingle(true);
    try {
      sfx.playClick();
      const res = await syncFinalScoreToGoogleSheets(
        student.username,
        student.fullName || student.nama || student.username
      );
      if (res.success) {
        alert(`Berhasil menyinkronkan data ${student.fullName || student.username} ke Google Sheets!`);
      } else {
        alert(`Gagal: ${res.message}`);
      }
      loadSheetsInfo();
    } catch (e: any) {
      alert(`Error: ${e?.message || 'Gagal'}`);
    } finally {
      setIsSyncingSingle(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingSheets(true);
    setSheetsBannerMsg(null);
    try {
      sfx.playClick();
      const res = await testSheetsConnection(sheetForm);
      if (res.success) {
        setSheetsBannerMsg({
          type: 'success',
          text: res.message
        });
        await saveSheetsConfig(sheetForm);
        loadSheetsInfo();
      } else {
        setSheetsBannerMsg({
          type: 'error',
          text: res.message
        });
      }
    } catch (err: any) {
      setSheetsBannerMsg({
        type: 'error',
        text: err?.message || 'Gagal menguji koneksi'
      });
    } finally {
      setIsTestingSheets(false);
    }
  };

  const handleSaveSheetConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sfx.playClick();
    try {
      const res = await saveSheetsConfig(sheetForm);
      if (res.success) {
        setSheetsBannerMsg({
          type: 'success',
          text: 'Konfigurasi Google Sheets berhasil disimpan!'
        });
        loadSheetsInfo();
      } else {
        setSheetsBannerMsg({
          type: 'error',
          text: res.message || 'Gagal menyimpan konfigurasi'
        });
      }
    } catch (err: any) {
      setSheetsBannerMsg({
        type: 'error',
        text: err?.message || 'Error saat menyimpan konfigurasi'
      });
    }
  };

  const loadStudents = async () => {
    setIsLoadingFirestore(true);
    try {
      const list = await getAllStudentsWithFullProgress();
      setStudents(list);
    } catch (err) {
      console.warn('Fallback to local storage:', err);
      const base = getStudentsList();
      setStudents(base.map(b => ({ ...b, progres: {}, nilai_akhir: null })));
    } finally {
      setIsLoadingFirestore(false);
    }
  };

  const handleResetProgress = (username: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin me-reset progres belajar untuk ${name}? Capaian bintang dan level akan kembali ke awal.`)) {
      sfx.playClick();
      resetStudentProgress(username);
      loadStudents();
      if (selectedStudentForDetail && selectedStudentForDetail.username === username) {
        setSelectedStudentForDetail(null);
      }
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentUsername.trim() || !newStudentName.trim()) return;

    addStudentRecord({
      id: `std-${Date.now()}`,
      username: newStudentUsername.trim().toLowerCase(),
      fullName: newStudentName.trim(),
      nama: newStudentName.trim(),
      role: 'siswa',
      className: newStudentClass,
      clearedStagesCount: 0,
      totalStages: 8,
      totalStars: 0,
      poin: 0,
      progres: {
        level1: false,
        level2: false,
        level3: false,
        level4: false,
        level5: false,
        level6: false,
        level7: false,
        level8: false
      },
      lastLevel: 'Belum Mulai',
      lastActive: 'Baru ditambahkan',
      status: 'Belum Mulai'
    });

    sfx.playCorrect();
    setShowAddStudentModal(false);
    setNewStudentName('');
    setNewStudentUsername('');
    loadStudents();
  };

  // Filtered students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'all' || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  // Calculate statistics
  const totalStudents = students.length;
  const completedStudents = students.filter(s => s.clearedStagesCount >= 8 || s.status === 'Tuntas').length;
  const inProgressStudents = students.filter(s => s.clearedStagesCount > 0 && s.clearedStagesCount < 8).length;
  const totalStarsAll = students.reduce((acc, curr) => acc + (curr.totalStars || 0), 0);
  const avgStars = totalStudents > 0 ? (totalStarsAll / totalStudents).toFixed(1) : '0';

  // Mission levels mapping
  const missionLevels = [
    { num: 1, label: 'Pos Penjagaan', organelle: 'Membran Sel', icon: '🛡️', stageIndex: 2 },
    { num: 2, label: 'Observatorium', organelle: 'Retikulum Endoplasma', icon: '🔭', stageIndex: 3 },
    { num: 3, label: 'Protein Express', organelle: 'Badan Golgi', icon: '📦', stageIndex: 4 },
    { num: 4, label: 'Pembangkit Tenaga', organelle: 'Mitokondria', icon: '⚡', stageIndex: 5 },
    { num: 5, label: 'Pusat Daur Ulang', organelle: 'Lisosom & Peroksisom', icon: '♻️', stageIndex: 6 },
    { num: 6, label: 'Gudang Logistik', organelle: 'Vakuola', icon: '🏰', stageIndex: 7 },
    { num: 7, label: 'Kebun Energi Surya', organelle: 'Kloroplas', icon: '☀️', stageIndex: 8 },
    { num: 8, label: 'Balai Desa Utama', organelle: 'Nukleus (Inti Sel)', icon: '🏛️', stageIndex: 9 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-emerald-800/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Teacher Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-amber-200 tracking-tight font-fredoka">
                  Dashboard Pengajar BioVillage
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Peran Guru
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                {currentUser.nama || currentUser.fullName} • NIP/Kode: <code className="text-amber-300 font-mono">{currentUser.username}</code>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenWelcomeScreen && (
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onOpenWelcomeScreen();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer active:scale-95"
                title="Buka dan kelola halaman Welcome Screen / Intro Misi Petualangan Desa Sel"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-900" />
                <span className="hidden sm:inline">Intro Welcome Screen</span>
                <span className="sm:hidden">Intro</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onPreviewMap();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
              title="Pratinjau peta dalam mode observasi guru tanpa menjawab kuis"
            >
              <Map className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Pratinjau Peta Desa</span>
              <span className="sm:hidden">Peta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-200 border border-slate-700 hover:border-red-500 text-slate-300 font-semibold text-xs transition-all cursor-pointer active:scale-95"
              title="Keluar dari akun guru"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Mode Guru Notification */}
        <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Mode Guru Aktif:</strong> Anda dapat memantau perolehan bintang &amp; level seluruh siswa, serta mengelola video dan gambar materi tiap level. Guru tidak mengerjakan tugas siswa.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              onOpenMediaManager();
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-sm"
          >
            <Video className="w-3.5 h-3.5 text-emerald-950" />
            <span>Kelola Media Level</span>
          </button>
        </div>

        {/* Analytics Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Total Siswa</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-fredoka">{totalStudents}</div>
            <p className="text-[11px] text-slate-400 mt-1">Terdaftar di sistem</p>
          </div>

          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Siswa Tuntas</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 font-fredoka">{completedStudents}</div>
            <p className="text-[11px] text-emerald-400/80 mt-1">Selesai 8 level penuh</p>
          </div>

          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Sedang Berjalan</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-300 font-fredoka">{inProgressStudents}</div>
            <p className="text-[11px] text-slate-400 mt-1">Dalam pengerjaan misi</p>
          </div>

          <div className="bg-slate-800/80 border border-emerald-700/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Rata-rata Bintang</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-2xl font-black text-yellow-300 font-fredoka">{avgStars} ⭐</div>
            <p className="text-[11px] text-slate-400 mt-1">Dari total {totalStarsAll} bintang</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/80 gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('students');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekapitulasi Progres Siswa</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('media');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Kelola Konten &amp; Media Level</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('curriculum');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Guru &amp; Kurikulum</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('sheets');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Integrasi Google Sheets</span>
            {sheetsConfig.configured && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Terkoneksi" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setActiveTab('ai');
            }}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-400" />
            <span>Integrasi Gemini AI</span>
            {aiConfig.hasKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Terkoneksi ke Gemini Cloud" />
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                Simulator
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: REKAPITULASI PROGRES SISWA */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari siswa atau username..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="Kelas XI IPA 1">Kelas XI IPA 1</option>
                  <option value="Kelas XI IPA 2">Kelas XI IPA 2</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow"
                  title="Unduh rekap nilai siswa dalam format CSV (langsung dapat dibuka di Excel / Google Sheets)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Rekap (Excel / CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyForSheets}
                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow"
                  title="Salin seluruh tabel nilai ke clipboard (cukup paste dengan Ctrl+V di Google Sheets)"
                >
                  {copiedForSheets ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Tersalin! Paste di Sheets</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Salin Tabel (Ctrl+V)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSyncAllToSheets}
                  disabled={isSyncingAllSheets}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow disabled:opacity-50"
                  title="Kirim dan sinkronkan seluruh nilai siswa ke Google Sheets"
                >
                  <FileSpreadsheet className={`w-3.5 h-3.5 ${isSyncingAllSheets ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingAllSheets ? 'Menyinkronkan...' : 'Sinkronkan Sheets'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    loadStudents();
                  }}
                  disabled={isLoadingFirestore}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Perbarui data progres dan nilai dari database Firestore"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoadingFirestore ? 'animate-spin text-amber-300' : ''}`} />
                  <span>{isLoadingFirestore ? 'Memuat...' : 'Segarkan Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setShowAddStudentModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Nama Siswa</th>
                      <th className="py-3.5 px-4">Kelas</th>
                      <th className="py-3.5 px-4">Kemajuan Level</th>
                      <th className="py-3.5 px-4">Nilai Akhir (Firestore)</th>
                      <th className="py-3.5 px-4">Poin &amp; Bintang</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Aktivitas</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => {
                        const progressPercent = Math.min(100, Math.round((student.clearedStagesCount / 8) * 100));
                        const isFinished = student.clearedStagesCount >= 8;
                        const studentPoints = student.poin !== undefined ? student.poin : student.totalStars * 10;

                        return (
                          <tr key={student.id || student.username} className="hover:bg-slate-750/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{student.username === 'ani' ? '👧' : student.username === 'fauzan' ? '🧑' : student.username === 'citra' ? '👩' : '👦'}</span>
                                <div>
                                  <div className="font-bold text-slate-100">{student.fullName || student.nama}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">@{student.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              {student.className}
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1 max-w-[130px]">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-amber-300">{student.clearedStagesCount}/8 Level</span>
                                  <span className="text-slate-400">{progressPercent}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isFinished ? 'bg-amber-400' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {student.nilai_akhir ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-amber-300 text-sm">{student.nilai_akhir.nilai_akhir}</span>
                                    <span className="text-[10px] text-slate-400">/ 100</span>
                                  </div>
                                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                    student.nilai_akhir.status_kelulusan === 'LULUS'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}>
                                    {student.nilai_akhir.predikat}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 italic">Belum Tuntas</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="text-amber-300">{studentPoints} Poin</span>
                                <span className="text-yellow-400 text-xs flex items-center">
                                  ({student.totalStars} ⭐)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isFinished
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : student.clearedStagesCount > 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-700 text-slate-400'
                              }`}>
                                {isFinished ? '✓ Tuntas' : student.clearedStagesCount > 0 ? 'Sedang Berjalan' : 'Belum Mulai'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">
                              {student.lastActive}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    sfx.playClick();
                                    setSelectedStudentForDetail(student);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                                  title="Lihat rincian 8 level"
                                >
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetProgress(student.username, student.fullName)}
                                  className="p-1 rounded-lg bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition-all cursor-pointer"
                                  title="Reset progres siswa"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Tidak ada siswa yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA KONTEN & MEDIA LEVEL */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-amber-200 font-fredoka">
                  Pengelolaan Media Pembelajaran Per Level
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Anda dapat memperbarui video panduan dan foto analogi fasilitas desa untuk masing-masing level misi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onOpenMediaManager();
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Buka Panel Media Lengkap</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {missionLevels.map(lvl => (
                <div
                  key={lvl.num}
                  className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-md group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        Level {lvl.num}
                      </span>
                      <span className="text-2xl">{lvl.icon}</span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm">{lvl.label}</h4>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      Analogi: {lvl.organelle}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      Modul interaktif dengan media pengamatan mikroskopis dan analogi kehidupan desa sel.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Media Aktif
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        onOpenMediaManager();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Ubah Media</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PANDUAN GURU & KURIKULUM */}
        {activeTab === 'curriculum' && (
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-amber-200 font-fredoka">
                Petunjuk Pelaksanaan Pembelajaran di Kelas
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Panduan untuk guru biologi dalam memanfaatkan BioVillage Simulator pada Kurikulum Merdeka (Fase F - Biologi Sel SMA).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Capaian Pembelajaran (CP)</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Peserta didik mampu menganalisis keterkaitan antara struktur organel sel (membran sel, nukleus, retikulum endoplasma, badan golgi, mitokondria, lisosom, vakuola, kloroplas) dengan fungsinya melalui analogi fungsional tata kelola desa sel.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <span>⭐</span>
                  <span>Kriteria Ketuntasan &amp; Penilaian</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Siswa dinyatakan tuntas apabila menyelesaikan ke-8 level misi dan memperoleh minimal 80% poin pada kuis evaluasi pemahaman organel di Balai Desa Utama (Level 8).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
              <h4 className="font-bold text-sm text-emerald-200 mb-2">Langkah Pembelajaran yang Disarankan:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                <li>Beri instruksi kepada siswa untuk login menggunakan <strong>NISN / Username</strong> masing-masing.</li>
                <li>Siswa memulai dari <strong>Papan Petunjuk Desa</strong> dan mengeksplorasi peta interaktif.</li>
                <li>Gunakan <strong>Dashboard Guru</strong> untuk memantau progres siswa secara berkala saat kegiatan di kelas/lab.</li>
                <li>Setelah seluruh siswa tuntas, buka sesi refleksi untuk mendiskusikan keterkaitan antar organel sel.</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 4: INTEGRASI GOOGLE SHEETS */}
        {activeTab === 'sheets' && (
          <div className="space-y-6">
            {/* Banner Notification */}
            {sheetsBannerMsg && (
              <div
                className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
                  sheetsBannerMsg.type === 'success'
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sheetsBannerMsg.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{sheetsBannerMsg.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetsBannerMsg(null)}
                  className="text-xs opacity-70 hover:opacity-100 px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Status & Quick Action Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100 font-fredoka">
                        Google Sheets API Service Account
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          sheetsConfig.configured
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {sheetsConfig.configured ? '● Terhubung' : '● Belum Dikonfigurasi'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sinkronisasi otomatis nilai siswa langsung ke lembar kerja Google Sheets tanpa popup login Google siswa.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow"
                    title="Unduh rekap nilai siswa dalam format CSV (langsung dapat dibuka di Excel / Google Sheets)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Rekap (Excel / CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyForSheets}
                    className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow"
                    title="Salin seluruh tabel nilai ke clipboard (cukup paste dengan Ctrl+V di Google Sheets)"
                  >
                    {copiedForSheets ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Tersalin! Paste di Sheets</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Salin Tabel (Ctrl+V)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingSheets}
                    className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isTestingSheets ? 'animate-spin text-amber-300' : ''}`} />
                    <span>{isTestingSheets ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </button>

                  {sheetsConfig.sheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.sheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Sheet</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncAllToSheets}
                    disabled={isSyncingAllSheets}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSyncingAllSheets ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingAllSheets ? 'Menyinkronkan...' : 'Sinkronkan Semua Data'}</span>
                  </button>
                </div>
              </div>

              {/* Banner Mode Otomatis & Mandiri */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900/90 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Mode Otomatis &amp; Mandiri (Siap Pakai Tanpa API Key)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 max-w-2xl leading-relaxed">
                    Anda <strong>tidak wajib</strong> membuat akun Google Cloud atau mengisi kunci API rumit. Semua progres belajar dan nilai kuis Level 1-8 siswa sudah <strong>otomatis tersimpan aman di cloud Firestore</strong>. Anda cukup klik <strong>"Unduh Rekap (Excel / CSV)"</strong> atau <strong>"Salin Tabel (Ctrl+V)"</strong> untuk membukanya langsung di Google Sheets/Excel!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillAutoConfig}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow shrink-0 active:scale-95"
                  title="Isi formulir dengan ID spreadsheet contoh secara otomatis"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Isi Pengaturan Otomatis</span>
                </button>
              </div>

              {/* Status Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4 text-xs">
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px] font-medium">Spreadsheet ID</span>
                  <span className="font-mono text-amber-300 break-all font-semibold select-all">
                    {sheetsConfig.sheetId || '(Belum diatur)'}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px] font-medium">Email Service Account</span>
                  <span className="font-mono text-emerald-300 break-all font-semibold select-all">
                    {sheetsConfig.serviceAccountEmail || '(Belum diatur)'}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px] font-medium">Private Key &amp; Sheet</span>
                  <span className="text-slate-200 block font-semibold mt-0.5">
                    Tab: <strong className="text-sky-300">{sheetsConfig.sheetName || 'Sheet1'}</strong> | Key: {sheetsConfig.hasPrivateKey ? '✓ Tersedia' : 'Belum diisi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Two Column Section: Configuration Form & Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Konfigurasi */}
              <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-fredoka flex items-center gap-2">
                    <span>⚙️</span>
                    <span>Hubungkan ke Google Sheets</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pilih metode yang ingin Anda gunakan. Metode 1 (Apps Script Webhook) sangat disarankan untuk Guru karena tidak memerlukan Google Cloud Console.
                  </p>
                </div>

                {/* Method Selector Tabs */}
                <div className="flex flex-col sm:flex-row items-stretch gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setSheetsMethod('webhook');
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sheetsMethod === 'webhook'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Metode 1: Apps Script (Mudah)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setSheetsMethod('serviceAccount');
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sheetsMethod === 'serviceAccount'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>🔑</span>
                    <span>Metode 2: Service Account (Lanjutan)</span>
                  </button>
                </div>

                <form onSubmit={handleSaveSheetConfigSubmit} className="space-y-3.5 text-xs">
                  {sheetsMethod === 'webhook' ? (
                    <>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                          <span>URL Aplikasi Web (Google Apps Script Webhook)</span>
                          <span className="text-[10px] text-emerald-400 font-normal">Wajib diisi</span>
                        </label>
                        <input
                          type="url"
                          value={sheetForm.webhookUrl}
                          onChange={e => setSheetForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                          placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-emerald-400 outline-none"
                          required
                        />
                        {sheetForm.webhookUrl.includes('docs.google.com/spreadsheets') && (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Perhatian:</strong> URL di atas adalah link Google Spreadsheet biasa, bukan URL Webhook. Ikuti panduan 3 langkah di sebelah kanan untuk mendapatkan URL Aplikasi Web Apps Script (berawalan <code>https://script.google.com/macros/s/.../exec</code>).
                            </span>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Dapatkan URL ini dari menu <strong>Ekstensi &gt; Apps Script &gt; Terapkan sebagai Aplikasi Web</strong> di Spreadsheet Anda.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">
                            Nama Tab Sheet (Opsional)
                          </label>
                          <input
                            type="text"
                            value={sheetForm.sheetName}
                            onChange={e => setSheetForm(prev => ({ ...prev, sheetName: e.target.value }))}
                            placeholder="Sheet1"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-emerald-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">
                            Spreadsheet ID (Referensi)
                          </label>
                          <input
                            type="text"
                            value={sheetForm.sheetId}
                            onChange={e => {
                              const val = e.target.value;
                              const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                              setSheetForm(prev => ({ ...prev, sheetId: match ? match[1] : val }));
                            }}
                            placeholder="1t6kl8ABZxEb_p9PzpFRtazeBDT5D3vsIFuT9F9Rjjs0"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-emerald-400 outline-none"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Spreadsheet ID
                        </label>
                        <input
                          type="text"
                          value={sheetForm.sheetId}
                          onChange={e => {
                            const val = e.target.value;
                            const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                            setSheetForm(prev => ({ ...prev, sheetId: match ? match[1] : val }));
                          }}
                          placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-amber-400 outline-none"
                          required
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Jika Anda menempel link URL lengkap Google Sheets, ID akan otomatis dipisahkan.
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Email Service Account Google Cloud
                        </label>
                        <input
                          type="email"
                          value={sheetForm.serviceAccountEmail}
                          onChange={e => setSheetForm(prev => ({ ...prev, serviceAccountEmail: e.target.value }))}
                          placeholder="Contoh: biovillage-sync@project-id.iam.gserviceaccount.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-amber-400 outline-none"
                        />
                        {sheetForm.serviceAccountEmail.endsWith('@gmail.com') && (
                          <div className="mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              Email Gmail biasa tidak memiliki sertifikat Private Key. Gunakan email Service Account dari Google Cloud Console (@...iam.gserviceaccount.com), atau ganti ke <strong>Metode 1 (Apps Script)</strong>.
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Private Key Service Account (PEM RSA format)
                        </label>
                        <textarea
                          rows={3}
                          value={sheetForm.privateKey}
                          onChange={e => setSheetForm(prev => ({ ...prev, privateKey: e.target.value }))}
                          placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...\n-----END PRIVATE KEY-----"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-[11px] focus:border-amber-400 outline-none"
                        />
                        {sheetForm.privateKey.includes('http') && (
                          <div className="mt-1 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>
                              Kolom ini terisi link URL. Private Key harus berupa sertifikat teks yang didownload dari file JSON Google Cloud.
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Nama Sheet (Tab)
                        </label>
                        <input
                          type="text"
                          value={sheetForm.sheetName}
                          onChange={e => setSheetForm(prev => ({ ...prev, sheetName: e.target.value }))}
                          placeholder="Sheet1"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingSheets}
                      className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs cursor-pointer shadow transition-all disabled:opacity-50"
                    >
                      {isTestingSheets ? 'Menguji...' : 'Uji Koneksi'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow transition-all active:scale-95"
                    >
                      Simpan Konfigurasi
                    </button>
                  </div>
                </form>
              </div>

              {/* Panduan & Bantuan Interaktif */}
              <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 text-xs text-slate-300">
                {sheetsMethod === 'webhook' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-emerald-400 font-fredoka flex items-center gap-2">
                        <span>⚡</span>
                        <span>3 Langkah Mudah Apps Script</span>
                      </h3>
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${sheetForm.sheetId || '1t6kl8ABZxEb_p9PzpFRtazeBDT5D3vsIFuT9F9Rjjs0'}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
                      >
                        <span>Buka Sheet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="space-y-3 leading-relaxed">
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">1</span>
                          <span>Buka Menu Apps Script</span>
                        </div>
                        <p className="text-slate-400 text-[11px] pl-7">
                          Di Google Sheet Anda, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between text-emerald-300 font-bold">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">2</span>
                            <span>Tempelkan Skrip BioVillage</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              sfx.playClick();
                              const scriptCode = `function doPost(e) {\\n  try {\\n    var data = JSON.parse(e.postData.contents);\\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\\n    var sheet = ss.getSheetByName(data.sheetName || 'Sheet1') || ss.getActiveSheet();\\n\\n    if (data.action === 'ping') {\\n      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', title: ss.getName() })).setMimeType(ContentService.MimeType.JSON);\\n    }\\n\\n    if (sheet.getLastRow() === 0) {\\n      sheet.appendRow([\\n        "Waktu Pengiriman", "ID / NISN Siswa", "Nama Siswa", "Kelas",\\n        "Nilai Level 1", "Nilai Level 2", "Nilai Level 3", "Nilai Level 4",\\n        "Nilai Level 5", "Nilai Level 6", "Nilai Level 7", "Nilai Level 8",\\n        "Total Skor", "Total Skor Maksimal", "Persentase Nilai (%)", "Predikat BioVillage",\\n        "Status Kelulusan", "Total Bintang", "Poin / Koin", "Waktu Selesai (Detik)", "Catatan Refleksi Essai"\\n      ]);\\n    }\\n\\n    if (data.row && Array.isArray(data.row)) {\\n      sheet.appendRow(data.row);\\n    }\\n\\n    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data tercatat' })).setMimeType(ContentService.MimeType.JSON);\\n  } catch (err) {\\n    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);\\n  }\\n}\\n\\nfunction doGet(e) {\\n  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'BioVillage Webhook Aktif' })).setMimeType(ContentService.MimeType.JSON);\\n}`;
                              navigator.clipboard.writeText(scriptCode.replace(/\\\\n/g, '\\n'));
                              setCopiedScript(true);
                              setTimeout(() => setCopiedScript(false), 3000);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            {copiedScript ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedScript ? 'Tersalin!' : 'Salin Kode Skrip'}</span>
                          </button>
                        </div>
                        <p className="text-slate-400 text-[11px] pl-7">
                          Hapus kode bawaan di editor Apps Script, lalu tempel kode yang sudah disalin di atas.
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">3</span>
                          <span>Terapkan sebagai Aplikasi Web</span>
                        </div>
                        <div className="text-slate-400 text-[11px] pl-7 space-y-1">
                          <div>Klik <strong>Terapkan (Deploy)</strong> &gt; <strong>Deployment baru</strong>.</div>
                          <div>Pilih jenis: <strong>Aplikasi Web</strong>.</div>
                          <div>Yang memiliki akses (Who has access): <strong className="text-amber-300">Siapa saja (Anyone)</strong>.</div>
                          <div>Salin URL Web App dan tempelkan ke kolom form di samping!</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-amber-300 font-fredoka flex items-center gap-2">
                      <span>📖</span>
                      <span>Panduan Setup Service Account</span>
                    </h3>

                    <div className="space-y-2.5 leading-relaxed">
                      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60">
                        <strong className="text-emerald-300 block mb-0.5">1. Bagikan Google Sheet ke Service Account:</strong>
                        Buka Google Sheet target, klik tombol <strong>Bagikan (Share)</strong> di pojok kanan atas, lalu tambahkan email Service Account sebagai <strong>Editor</strong>.
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60">
                        <strong className="text-emerald-300 block mb-0.5">2. Kolom Otomatis:</strong>
                        Sistem akan otomatis membuat baris header 21 kolom lengkap jika sheet baru masih kosong.
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60">
                        <strong className="text-emerald-300 block mb-0.5">3. Standar Predikat BioVillage:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-400">
                          <li><span className="text-amber-300 font-semibold">Ahli Penyelamat Desa Sel</span> (≥ 85%)</li>
                          <li><span className="text-emerald-300 font-semibold">Penyelamat Desa Sel</span> (70% – 84%)</li>
                          <li><span className="text-slate-300 font-semibold">Warga Peduli Desa Sel</span> (&lt; 70%)</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pratinjau Tabel Lembar Kerja Siswa (Live Spreadsheet Grid) */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-fredoka flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-400" />
                    <span>Pratinjau Lembar Kerja Rekap Siswa (Data Siap Ekspor)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data rekapitulasi nilai seluruh siswa yang siap diunduh atau disalin ke Google Sheets / Excel.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Rekap (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyForSheets}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {copiedForSheets ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Tersalin! Paste di Sheets</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Format Sheets (Ctrl+V)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">Level Selesai</th>
                      <th className="py-2.5 px-3">Nilai Akhir</th>
                      <th className="py-2.5 px-3">Predikat</th>
                      <th className="py-2.5 px-3">Poin</th>
                      <th className="py-2.5 px-3">Bintang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.length > 0 ? (
                      students.map((s, idx) => {
                        const finalScore = s.nilai_akhir?.nilai_akhir ?? s.nilaiAkhir?.persentase_akhir ?? (s.clearedStagesCount >= 8 ? 95 : Math.round((s.clearedStagesCount / 8) * 85));
                        const predikat = s.nilai_akhir?.predikat ?? s.nilaiAkhir?.predikat ?? (s.clearedStagesCount >= 8 ? 'Sangat Baik' : 'Sedang Berjalan');
                        const points = s.poin !== undefined ? s.poin : s.totalStars * 10;
                        return (
                          <tr key={s.id || s.username} className="hover:bg-slate-800/50">
                            <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-100">{s.fullName || s.nama || s.username}</td>
                            <td className="py-2 px-3 text-slate-400">{s.className}</td>
                            <td className="py-2 px-3 text-amber-300 font-bold">{s.clearedStagesCount}/8</td>
                            <td className="py-2 px-3 text-emerald-400 font-bold">{finalScore}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300">
                                {predikat}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-amber-300">{points}</td>
                            <td className="py-2 px-3 text-amber-400">★ {s.totalStars}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500">
                          Belum ada siswa terdaftar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Riwayat Log Sinkronisasi */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-fredoka flex items-center gap-2">
                    <span>📜</span>
                    <span>Riwayat Log Sinkronisasi Google Sheets</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Daftar pengiriman baris data siswa ke Google Spreadsheet secara real-time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadSheetsInfo}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Segarkan Log</span>
                </button>
              </div>

              {sheetsLogs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-700 rounded-2xl text-slate-400 text-xs">
                  Belum ada log pengiriman. Log akan otomatis muncul saat siswa menyelesaikan Level 8 atau saat Guru melakukan sinkronisasi manual.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Siswa</th>
                        <th className="py-2.5 px-3">NISN / ID</th>
                        <th className="py-2.5 px-3">Predikat</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-750">
                      {sheetsLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-750/50">
                          <td className="py-2.5 px-3 text-slate-400 font-mono whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                            <span className="text-[10px] opacity-75">{new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-100">
                            {log.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono">
                            @{log.studentId}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300">
                              {log.predikat || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'success'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {log.status === 'success' ? '✓ Berhasil' : '✕ Gagal'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={log.message}>
                            {log.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: INTEGRASI GEMINI AI */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Banner Pesan / Feedback */}
            {aiBannerMsg && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between border ${
                  aiBannerMsg.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : aiBannerMsg.type === 'error'
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                    : 'bg-sky-950/80 border-sky-500/50 text-sky-200'
                }`}
              >
                <div className="flex items-center gap-2.5 text-sm font-bold">
                  {aiBannerMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <span>{aiBannerMsg.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiBannerMsg(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Status Card & Overview */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                      <span>Integrasi Google Gemini AI</span>
                      {aiConfig.hasKey ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Gemini Cloud Aktif</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Simulator Heuristik Offline Aktif</span>
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Mendukung penilaian esai refleksi Level 8 otomatis dan chatbot asisten interaktif "Kepala Desa Sel".
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleTestAi}
                    disabled={isTestingAi}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isTestingAi ? (
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-teal-400" />
                    )}
                    <span>{isTestingAi ? 'Menguji...' : 'Uji Koneksi AI'}</span>
                  </button>
                </div>
              </div>

              {/* Sample Response Pill from Test */}
              {aiTestResult && (
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                  aiTestResult.success 
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    <span>Hasil Pengujian Model ({aiTestResult.model || 'gemini-2.5-flash'}):</span>
                  </div>
                  <p className="italic font-sans">
                    {aiTestResult.sampleResponse || aiTestResult.message}
                  </p>
                </div>
              )}
            </div>

            {/* Form Konfigurasi API Key */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
                    Konfigurasi Gemini API Key
                  </h3>
                </div>
                {aiConfig.hasKey && (
                  <span className="text-xs text-slate-400 font-mono">
                    Kunci Tersimpan: <strong className="text-emerald-400">{aiConfig.maskedKey}</strong>
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Google Gemini API Key:
                  </label>
                  <input
                    type="password"
                    value={aiApiKeyInput}
                    onChange={(e) => setAiApiKeyInput(e.target.value)}
                    placeholder={aiConfig.hasKey ? "Masukkan API Key baru jika ingin mengganti..." : "Tempelkan API Key Anda (misal: AIzaSy...)"}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-xs sm:text-sm text-slate-100 font-mono outline-none transition-all placeholder:text-slate-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    API Key disimpan secara aman di backend server proyek dan tidak terekspos ke peramban siswa.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Model Gemini yang Digunakan:
                    </label>
                    <select
                      value={aiModelInput}
                      onChange={(e) => setAiModelInput(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-emerald-400"
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash (Cepat, Cerdas, Rekomendasi Utama)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Versi Stabil Ringan)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Analisis Mendalam)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleSaveAi}
                      disabled={isSavingAi}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isSavingAi ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Simpan Konfigurasi Gemini</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panduan Mendapatkan API Key Gratis */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Lightbulb className="w-5 h-5" />
                <span>Cara Mendapatkan Google Gemini API Key Gratis:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <strong className="text-slate-200 block">Kunjungi Google AI Studio</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Buka situs resmi{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-300 underline font-semibold"
                    >
                      aistudio.google.com
                    </a>{' '}
                    menggunakan akun Google Anda.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <strong className="text-slate-200 block">Buat API Key Baru</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Klik tombol <strong>"Create API Key"</strong> dan salin kode API key yang dihasilkan (dimulai dengan <em>AIzaSy...</em>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <strong className="text-slate-200 block">Tempel &amp; Uji</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Tempelkan kuncinya pada form di atas, klik <strong>"Simpan"</strong>, lalu tekan <strong>"Uji Koneksi AI"</strong> untuk memastikan status hijau.
                  </p>
                </div>
              </div>
            </div>

            {/* Fitur AI di BioVillage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-teal-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                  <BrainCircuit className="w-5 h-5 text-teal-400" />
                  <span>AI Penilai Esai Refleksi (Level 8)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Menilai secara otomatis pemahaman analogi organel dan refleksi nilai karakter Islam siswa dengan rubrik 2 dimensi:
                </p>
                <ul className="text-[11px] text-slate-400 space-y-1 pl-1">
                  <li>• <strong>Dimensi Sains:</strong> Pemahaman mitokondria, nukleus, golgi, membran, dan lisosom.</li>
                  <li>• <strong>Dimensi Akhlak:</strong> Internalisasi rasa syukur, keteraturan alam, dan komitmen perilaku.</li>
                  <li>• <strong>Lencana Apresiasi:</strong> Memberikan predikat Mumtaz &amp; gelar kehormatan unik.</li>
                </ul>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  <span>AI Tutor "Kepala Desa Sel"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Asisten interaktif ramah yang dapat diajak tanya-jawab oleh siswa kapan saja dari pojok kanan bawah:
                </p>
                <ul className="text-[11px] text-slate-400 space-y-1 pl-1">
                  <li>• <strong>Konsep Ramah Siswa:</strong> Menerangkan biologi dengan analogi fasilitas BioVillage.</li>
                  <li>• <strong>Scaffolding Belajar:</strong> Memberi petunjuk berpikir tanpa membocorkan kunci kuis langsung.</li>
                  <li>• <strong>Dukungan Offline:</strong> Otomatis menggunakan bot cerdas lokal jika internet terputus.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DETAIL SISWA (8 LEVEL) */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-600 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedStudentForDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-2xl">
                🎒
              </div>
              <div>
                <h3 className="font-bold text-lg text-white font-fredoka">
                  {selectedStudentForDetail.fullName}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedStudentForDetail.className} • @{selectedStudentForDetail.username}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800">
                <span className="text-slate-400 block text-[11px]">Level Selesai</span>
                <span className="font-bold text-amber-300 text-sm">
                  {selectedStudentForDetail.clearedStagesCount} dari 8 Level
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Perolehan</span>
                <span className="font-bold text-yellow-300 text-sm">
                  {(selectedStudentForDetail.poin !== undefined ? selectedStudentForDetail.poin : selectedStudentForDetail.totalStars * 10)} Poin ({selectedStudentForDetail.totalStars} ⭐)
                </span>
              </div>
            </div>

            {/* Nilai Akhir Firestore Card */}
            {selectedStudentForDetail.nilai_akhir && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-2 border-emerald-500/50 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                      Nilai Akhir Evaluasi (Firestore)
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-amber-300 font-fredoka">
                        {selectedStudentForDetail.nilai_akhir.nilai_akhir}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-200 block">
                      Predikat: {selectedStudentForDetail.nilai_akhir.predikat}
                    </span>
                    <span className={`inline-block mt-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      selectedStudentForDetail.nilai_akhir.status_kelulusan === 'LULUS'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {selectedStudentForDetail.nilai_akhir.status_kelulusan}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-between pt-2 border-t border-emerald-800/40">
                  <span>Total Skor Level 1–6: <strong>{selectedStudentForDetail.nilai_akhir.total_skor}</strong> / {selectedStudentForDetail.nilai_akhir.total_skor_maksimal}</span>
                  <span>Persentase: <strong>{selectedStudentForDetail.nilai_akhir.persentase}%</strong></span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Rincian Skor &amp; Progres Per Level (Firestore):
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {missionLevels.map(lvl => {
                  const levelKey = `level${lvl.num}`;
                  const record = selectedStudentForDetail.progres ? selectedStudentForDetail.progres[levelKey] : undefined;
                  const isCleared = !!record || (selectedStudentForDetail.clearedStagesCount >= lvl.num);

                  return (
                    <div
                      key={lvl.num}
                      className={`p-3 rounded-2xl flex flex-col gap-1.5 text-xs border transition-all ${
                        record?.status === 'lulus' || (record?.skor && record.skor >= (record.skor_maksimal ? record.skor_maksimal * 0.7 : 0))
                          ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-100'
                          : record
                          ? 'bg-amber-950/30 border-amber-600/50 text-amber-100'
                          : isCleared
                          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lvl.icon}</span>
                          <div>
                            <span className="font-bold text-slate-100">Level {lvl.num}: {lvl.label}</span>
                            <span className="text-[10px] block opacity-70">({lvl.organelle})</span>
                          </div>
                        </div>

                        {record ? (
                          <div className="flex items-center gap-2">
                            {lvl.num <= 7 && (
                              <div className="text-right">
                                <span className="font-mono font-bold text-amber-300 text-xs">
                                  {record.skor} / {record.skor_maksimal || (lvl.num === 1 ? 14 : lvl.num === 2 ? 8 : lvl.num === 3 ? 5 : lvl.num === 4 ? 7 : lvl.num === 7 ? 100 : 5)}
                                </span>
                                {record.persentase !== undefined && (
                                  <span className="text-[10px] text-slate-400 block">
                                    ({record.persentase}%)
                                  </span>
                                )}
                              </div>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              record.status === 'lulus'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                : record.status === 'belum_lulus'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                                : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                            }`}>
                              {record.status === 'lulus' ? 'LULUS (≥70%)' : record.status === 'belum_lulus' ? 'BELUM LULUS' : 'SELESAI'}
                            </span>
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCleared ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                          }`}>
                            {isCleared ? '✓ Terbuka' : 'Belum Mulai'}
                          </span>
                        )}
                      </div>

                      {/* Optional essay text submission (Levels 5 & 6) */}
                      {record?.esai && (
                        <div className="mt-1 p-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-[11px]">
                          <span className="font-bold text-amber-300 block text-[10px] mb-0.5">
                            Jawaban Esai Siswa:
                          </span>
                          <p className="text-slate-200 italic font-sans whitespace-pre-wrap">
                            "{record.esai}"
                          </p>
                        </div>
                      )}

                      {/* Optional branching scenario path (Level 7) */}
                      {record?.jalur_diambil && (
                        <div className="text-[10px] text-sky-300 flex items-center gap-1 font-mono">
                          <span className="font-bold">Jalur Keputusan:</span>
                          <span>{record.jalur_diambil.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => selectedStudentForDetail && handleSyncSingleStudentToSheets(selectedStudentForDetail)}
                disabled={isSyncingSingle}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all shadow"
                title="Kirimkan hasil nilai siswa ini langsung ke Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isSyncingSingle ? 'Mengirim...' : 'Kirim ke Google Sheets'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SISWA BARU */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-600 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-lg text-amber-200 font-fredoka">
                Tambah Akun Siswa Baru
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tambahkan siswa ke daftar pemantauan guru.
              </p>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Username / NISN
                </label>
                <input
                  type="text"
                  value={newStudentUsername}
                  onChange={e => setNewStudentUsername(e.target.value)}
                  placeholder="Contoh: rian123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kelas
                </label>
                <select
                  value={newStudentClass}
                  onChange={e => setNewStudentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-amber-400 outline-none cursor-pointer"
                >
                  <option value="Kelas XI IPA 1">Kelas XI IPA 1</option>
                  <option value="Kelas XI IPA 2">Kelas XI IPA 2</option>
                  <option value="Kelas XI IPA 3">Kelas XI IPA 3</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
