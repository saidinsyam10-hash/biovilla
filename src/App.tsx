import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TitleScreen } from './components/TitleScreen';
import { GameMap } from './components/GameMap';
import { StageModal } from './components/StageModal';
import { EndScreen } from './components/EndScreen';
import { LoginGate } from './components/LoginGate';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ProjectMediaManagerModal } from './components/ProjectMediaManagerModal';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { ScoreResultModal } from './components/ScoreResultModal';
import { AiTutorChatWidget } from './components/AiTutorChatWidget';
import { stagesData } from './data/gameData';
import { Stage, UserAccount, LevelProgressRecord, NilaiAkhirRecord } from './types';
import { sfx } from './utils/audio';
import { initMediaStore } from './utils/mediaStore';
import { getCurrentUser, logoutUser, syncCurrentStudentProgress } from './utils/authStore';
import { saveLevelScore, hitungNilaiAkhir } from './utils/scoreStore';
import { syncFinalScoreToGoogleSheets } from './utils/googleSheetsSync';
import { ScoreDataPayload } from './components/StageModal';
import { ArrowLeft, ShieldCheck, Video } from 'lucide-react';

const STORAGE_KEY_CLEARED = 'biovillage_cleared_stages';
const STORAGE_KEY_SOUND = 'biovillage_sound_enabled';
const STORAGE_KEY_STARTED = 'biovillage_has_started';
const SESSION_KEY_STARTED = 'biovillage_session_started';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getCurrentUser();
  });

  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY_STARTED) === 'true';
  });

  const [teacherPreviewMap, setTeacherPreviewMap] = useState<boolean>(false);
  const [showTeacherWelcome, setShowTeacherWelcome] = useState<boolean>(false);
  const [isProjectMediaManagerOpen, setIsProjectMediaManagerOpen] = useState<boolean>(false);

  const [clearedStageIds, setClearedStageIds] = useState<Set<string>>(() => {
    try {
      // If user logged in, check user specific progress first
      const initialUser = getCurrentUser();
      if (initialUser) {
        const userSaved = localStorage.getItem(`biovillage_cleared_${initialUser.username}`);
        if (userSaved) {
          return new Set(JSON.parse(userSaved));
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY_CLEARED);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return new Set<string>();
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [showEndScreen, setShowEndScreen] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [completedResult, setCompletedResult] = useState<{
    stage: Stage;
    record: LevelProgressRecord;
    levelId: string;
  } | null>(null);
  const [latestNilaiAkhir, setLatestNilaiAkhir] = useState<NilaiAkhirRecord | null>(null);
  const [studentScoresMap, setStudentScoresMap] = useState<Record<string, LevelProgressRecord>>({});

  function getLevelIdFromStage(stage: Stage): string | null {
    if (stage.stageIndex === 2 || stage.label.includes('Level 1')) return 'level1';
    if (stage.stageIndex === 3 || stage.label.includes('Level 2')) return 'level2';
    if (stage.stageIndex === 4 || stage.label.includes('Level 3')) return 'level3';
    if (stage.stageIndex === 5 || stage.label.includes('Level 4') || stage.id === '2a93031d-a62d-4f6a-b497-68c3d35dcd57') return 'level4';
    if (stage.stageIndex === 6 || stage.label.includes('Level 5')) return 'level5';
    if (stage.stageIndex === 7 || stage.label.includes('Level 6')) return 'level6';
    if (stage.stageIndex === 8 || stage.label.includes('Level 7')) return 'level7';
    if (stage.stageIndex === 9 || stage.label.includes('Level 8')) return 'level8';
    return null;
  }

  // Sync sound settings to synthesizer
  useEffect(() => {
    sfx.setEnabled(soundEnabled);
    localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
  }, [soundEnabled]);

  // Initialize and synchronize permanent project media on startup
  useEffect(() => {
    initMediaStore();
  }, []);

  // Listen for session expiry / require login events
  useEffect(() => {
    const handleRequireLogin = () => {
      const active = getCurrentUser();
      if (!active) {
        setCurrentUser(null);
        setIsLoginModalOpen(true);
      }
    };
    window.addEventListener('biovillage:require_login', handleRequireLogin);
    return () => window.removeEventListener('biovillage:require_login', handleRequireLogin);
  }, []);

  // Persist cleared stages per user
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLEARED, JSON.stringify(Array.from(clearedStageIds)));
    if (currentUser) {
      localStorage.setItem(`biovillage_cleared_${currentUser.username}`, JSON.stringify(Array.from(clearedStageIds)));
    }
  }, [clearedStageIds, currentUser]);

  // Persist session started state
  useEffect(() => {
    if (hasStarted) {
      sessionStorage.setItem(SESSION_KEY_STARTED, 'true');
      localStorage.setItem(STORAGE_KEY_STARTED, 'true');
    } else {
      sessionStorage.removeItem(SESSION_KEY_STARTED);
      localStorage.removeItem(STORAGE_KEY_STARTED);
    }
  }, [hasStarted]);

  const handleStartGame = () => {
    setHasStarted(true);
    sessionStorage.setItem(SESSION_KEY_STARTED, 'true');
    localStorage.setItem(STORAGE_KEY_STARTED, 'true');
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    // Setelah login, selalu arahkan ke halaman landing page terlebih dahulu sebelum peta
    setHasStarted(false);
    sessionStorage.removeItem(SESSION_KEY_STARTED);
    localStorage.removeItem(STORAGE_KEY_STARTED);

    if (user.role === 'guru') {
      setTeacherPreviewMap(false);
      setShowTeacherWelcome(false);
      return;
    }

    // Load student specific progress if available
    try {
      const userKey = `biovillage_cleared_${user.username}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setClearedStageIds(new Set(JSON.parse(saved)));
      } else if (user.clearedStagesCount && user.clearedStagesCount > 0) {
        const initialSet = new Set<string>();
        stagesData.slice(0, user.clearedStagesCount + 1).forEach(s => initialSet.add(s.id));
        setClearedStageIds(initialSet);
      } else if (user.progres) {
        const initialSet = new Set<string>();
        // Map level keys to stagesData IDs
        Object.entries(user.progres).forEach(([lvlKey, isDone]) => {
          if (isDone) {
            const num = parseInt(lvlKey.replace('level', ''), 10);
            const foundStage = stagesData.find(s => s.stageIndex === num + 1);
            if (foundStage) initialSet.add(foundStage.id);
          }
        });
        setClearedStageIds(initialSet);
      }
    } catch (e) {
      console.warn('Could not restore user progress:', e);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setTeacherPreviewMap(false);
    setShowTeacherWelcome(false);
    setHasStarted(false);
    sessionStorage.removeItem(SESSION_KEY_STARTED);
    localStorage.removeItem(STORAGE_KEY_STARTED);
    sfx.playClick();
  };

  const handleOpenStage = (stage: Stage) => {
    const active = getCurrentUser();
    if (!active) {
      setCurrentUser(null);
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentStage(stage);
  };

  const handleCloseStage = () => {
    setCurrentStage(null);
  };

  const handleStageComplete = async (stageId: string, scoreData?: ScoreDataPayload) => {
    const stage = stagesData.find(s => s.id === stageId) || currentStage;
    const levelId = stage ? getLevelIdFromStage(stage) : null;

    const nextSet = new Set(clearedStageIds);
    nextSet.add(stageId);
    setClearedStageIds(nextSet);
    setCurrentStage(null);

    // Sync student progress and save score to Firestore
    if (currentUser && currentUser.role === 'siswa') {
      const totalStars = nextSet.size * 3;
      syncCurrentStudentProgress(currentUser.username, nextSet.size, totalStars);
      setCurrentUser(prev => prev ? {
        ...prev,
        clearedStagesCount: nextSet.size,
        totalStars: totalStars,
        poin: (nextSet.size * 30),
        lastActive: 'Baru saja'
      } : null);

      if (levelId) {
        try {
          const effectiveScoreData = scoreData || {
            skor: levelId === 'level1' ? 14 : levelId === 'level2' ? 8 : levelId === 'level3' ? 5 : levelId === 'level4' ? 7 : levelId === 'level5' ? 8 : levelId === 'level6' ? 8 : levelId === 'level7' ? 100 : 10,
            skor_maksimal: levelId === 'level1' ? 14 : levelId === 'level2' ? 8 : levelId === 'level3' ? 5 : levelId === 'level4' ? 7 : levelId === 'level5' ? 8 : levelId === 'level6' ? 8 : levelId === 'level7' ? 100 : 10
          };

          const record = await saveLevelScore(currentUser.username, levelId, effectiveScoreData);

          // Update local student score mapping
          setStudentScoresMap(prev => ({ ...prev, [levelId]: record }));

          if (levelId !== 'level8') {
            // Untuk Level 1 s.d. Level 7: tampilkan modal capaian level ini
            if (stage) {
              setCompletedResult({
                stage,
                record,
                levelId
              });
            }
          } else {
            // Khusus Level 8: Puncak petualangan selesai!
            // Hitung nilai akhir komprehensif, sinkronisasi Google Sheets, dan munculkan Rapor Nilai Akhir
            try {
              const finalReport = await hitungNilaiAkhir(currentUser.username);
              setLatestNilaiAkhir(finalReport);
            } catch (calcErr) {
              console.warn('Gagal menghitung nilai akhir Level 8:', calcErr);
            }

            syncFinalScoreToGoogleSheets(
              currentUser.username,
              currentUser.fullName || currentUser.nama || currentUser.username
            ).catch(err => {
              console.warn('[Google Sheets Sync] Gagal sinkronisasi otomatis Level 8:', err);
            });

            // Tampilkan Rapor Nilai Akhir (EndScreen) secara langsung
            setTimeout(() => {
              setShowEndScreen(true);
            }, 300);
          }
        } catch (err) {
          console.error('Failed to save score to Firestore:', err);
        }
      }
    }

    // If all levels (Level 1 to Level 8) or all stages are completed, show the victory End Screen
    const allLevelsCompleted = stagesData
      .filter(s => s.stageIndex >= 2)
      .every(s => nextSet.has(s.id));

    if (levelId === 'level8' || allLevelsCompleted || nextSet.size >= stagesData.length) {
      setTimeout(() => {
        setShowEndScreen(true);
      }, levelId === 'level8' ? 300 : 600);
    }
  };

  const handleResetProgress = () => {
    setConfirmReset(true);
  };

  const executeReset = () => {
    setClearedStageIds(new Set());
    setHasStarted(false);
    setShowEndScreen(false);
    setCurrentStage(null);
    setConfirmReset(false);
    localStorage.removeItem(STORAGE_KEY_CLEARED);
    localStorage.removeItem(STORAGE_KEY_STARTED);
    if (currentUser) {
      localStorage.removeItem(`biovillage_cleared_${currentUser.username}`);
      syncCurrentStudentProgress(currentUser.username, 0, 0);
    }
    sfx.playClick();
  };

  const totalStars = clearedStageIds.size * 3;

  // 1. GERBANG LOGIN (LOGIN GATE)
  // Saat aplikasi pertama dibuka (sebelum landing page atau peta level muncul), tampilkan halaman/modal login terlebih dahulu
  if (!currentUser) {
    return (
      <LoginGate onLoginSuccess={handleLoginSuccess} />
    );
  }

  // 2. LOGIKA ROLE SETELAH LOGIN: GURU
  // Diarahkan ke Dashboard Guru, atau preview Welcome Screen / Landing Page jika dibuka
  if (currentUser.role === 'guru' && showTeacherWelcome) {
    return (
      <WelcomeScreen
        currentUser={currentUser}
        onStart={() => {
          setShowTeacherWelcome(false);
          setTeacherPreviewMap(true);
        }}
        onLogout={handleLogout}
        onGoToTeacherDashboard={() => {
          setShowTeacherWelcome(false);
          setTeacherPreviewMap(false);
        }}
      />
    );
  }

  if (currentUser.role === 'guru' && !teacherPreviewMap) {
    return (
      <>
        <TeacherDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onPreviewMap={() => setTeacherPreviewMap(true)}
          onOpenWelcomeScreen={() => setShowTeacherWelcome(true)}
          onOpenMediaManager={() => setIsProjectMediaManagerOpen(true)}
        />
        <ProjectMediaManagerModal
          isOpen={isProjectMediaManagerOpen}
          onClose={() => setIsProjectMediaManagerOpen(false)}
        />
      </>
    );
  }

  // If guru is previewing the map in observation mode
  const isTeacherObservationMode = currentUser.role === 'guru' && teacherPreviewMap;

  // 3. HALAMAN LANDING PAGE (WELCOME SCREEN) SEBELUM PETA
  // Tampil setelah siswa login sebelum masuk ke peta level
  if (!hasStarted && !isTeacherObservationMode) {
    return (
      <WelcomeScreen 
        currentUser={currentUser}
        onStart={handleStartGame} 
        onLogout={handleLogout}
        onGoToTeacherDashboard={currentUser.role === 'guru' ? () => setTeacherPreviewMap(false) : undefined}
      />
    );
  }

  if (showEndScreen && !isTeacherObservationMode) {
    return (
      <EndScreen
        totalStars={totalStars}
        clearedCount={clearedStageIds.size}
        studentName={currentUser?.fullName || currentUser?.nama || currentUser?.username}
        studentId={currentUser?.username}
        studentUser={currentUser}
        nilaiAkhir={latestNilaiAkhir}
        progresScores={studentScoresMap}
        onReviewMap={() => setShowEndScreen(false)}
        onRestart={executeReset}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-900 font-sans">
      {/* Teacher Observation Header Bar (When teacher previews the map) */}
      {isTeacherObservationMode && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md z-50 sticky top-0 border-b-2 border-amber-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-950" />
            <span>Mode Observasi Guru: Meninjau Peta Desa Sel (Guru tidak mengerjakan soal siswa)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setShowTeacherWelcome(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-600 flex items-center gap-1 cursor-pointer"
            >
              <span>Intro Misi</span>
            </button>
            <button
              type="button"
              onClick={() => setIsProjectMediaManagerOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Kelola Media</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setTeacherPreviewMap(false);
              }}
              className="px-3 py-1 rounded-lg bg-slate-950 text-amber-200 text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Guru</span>
            </button>
          </div>
        </div>
      )}

      <GameMap
        stages={stagesData}
        clearedStageIds={clearedStageIds}
        onSelectStage={handleOpenStage}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onResetProgress={handleResetProgress}
        onOpenHelp={() => setHasStarted(false)}
        onOpenWelcomeScreen={() => {
          if (currentUser.role === 'guru') {
            setShowTeacherWelcome(true);
          } else {
            setHasStarted(false);
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenFinalReport={() => setShowEndScreen(true)}
      />

      {/* Active Stage Modal Dialog */}
      {currentStage && (
        <StageModal
          stage={currentStage}
          onClose={handleCloseStage}
          onStageComplete={handleStageComplete}
          isAlreadyCleared={clearedStageIds.has(currentStage.id)}
          currentUser={currentUser}
          onRequireLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Score & Progression Result Feedback Modal */}
      {completedResult && (
        <ScoreResultModal
          isOpen={true}
          levelId={completedResult.levelId}
          record={completedResult.record}
          onRetry={() => {
            const stageToRetry = completedResult.stage;
            setCompletedResult(null);
            setCurrentStage(stageToRetry);
          }}
          onContinue={() => {
            setCompletedResult(null);
          }}
        />
      )}

      {/* Project Media Manager Modal */}
      <ProjectMediaManagerModal
        isOpen={isProjectMediaManagerOpen}
        onClose={() => setIsProjectMediaManagerOpen(false)}
      />

      {/* Auxiliary Login Modal from Map */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={user => {
          handleLoginSuccess(user);
          setIsLoginModalOpen(false);
        }}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Auxiliary Register Modal from Map */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={user => {
          handleLoginSuccess(user);
          setIsRegisterModalOpen(false);
        }}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Reset Confirmation Dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-red-200 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Kemajuan Petualangan?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Seluruh misi yang telah terselesaikan dan bintang yang diperoleh akan dikembalikan ke kondisi awal.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs cursor-pointer hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow cursor-pointer"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tutor Biologi Sel ("Kepala Desa Sel") */}
      <AiTutorChatWidget
        currentStage={currentStage}
        currentUser={currentUser}
      />
    </div>
  );
}
