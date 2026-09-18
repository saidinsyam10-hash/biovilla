import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { LevelProgressRecord, NilaiAkhirRecord, StudentProgressWithScores, StudentProgressRecord } from '../types';
import { getStudentsList } from './authStore';

export interface LevelRule {
  id: string;
  title: string;
  stageIndex: number;
  skorMaksimal: number;
  passPercent: number;
  minPassPoints: number;
  description: string;
}

export const LEVEL_RULES: Record<string, LevelRule> = {
  level1: {
    id: 'level1',
    title: 'Level 1: Mengenal Warga Desa Sel',
    stageIndex: 2,
    skorMaksimal: 14,
    passPercent: 70,
    minPassPoints: 10,
    description: 'Kuis 14 soal, skor maksimal 14 poin, syarat lulus minimal 70% (10/14 benar)'
  },
  level2: {
    id: 'level2',
    title: 'Level 2: Cocokkan Organel & Perannya',
    stageIndex: 3,
    skorMaksimal: 8,
    passPercent: 70,
    minPassPoints: 6,
    description: 'Drag & Drop 8 pasang, skor maksimal 8 poin, syarat lulus minimal 70% (6/8 benar)'
  },
  level3: {
    id: 'level3',
    title: 'Level 3: Alur Produksi & Ekspor Protein',
    stageIndex: 4,
    skorMaksimal: 5,
    passPercent: 70,
    minPassPoints: 4,
    description: 'Susun urutan 5 langkah, skor maksimal 5 poin, syarat lulus minimal 70%'
  },
  level4: {
    id: 'level4',
    title: 'Level 4: Krisis Energi Desa Sel',
    stageIndex: 5,
    skorMaksimal: 7,
    passPercent: 70,
    minPassPoints: 5,
    description: 'Kuis analisis 7 soal (3 babak: observasi gejala, telusuri mekanisme, prediksi dampak), skor maksimal 7 poin, syarat lulus minimal 70% (5/7 benar)'
  },
  level5: {
    id: 'level5',
    title: 'Level 5: Krisis Distribusi Desa Sel',
    stageIndex: 6,
    skorMaksimal: 5,
    passPercent: 70,
    minPassPoints: 4,
    description: 'Kuis + esai 5 soal, skor maksimal 5 poin untuk bagian objektif, jawaban esai disimpan sebagai teks, syarat lulus 70% pada bagian objektif'
  },
  level6: {
    id: 'level6',
    title: 'Level 6: Detektif Kerusakan Sistem Sel',
    stageIndex: 7,
    skorMaksimal: 5,
    passPercent: 70,
    minPassPoints: 4,
    description: 'Rantai sebab-akibat + esai, 5 tantangan, skor maksimal 5 poin, jawaban esai disimpan sebagai teks, syarat lulus 70%'
  },
  level7: {
    id: 'level7',
    title: 'Level 7: Skenario Penyelamatan Desa Sel',
    stageIndex: 8,
    skorMaksimal: 100,
    passPercent: 70,
    minPassPoints: 70,
    description: 'Branching scenario, skor berbasis jalur keputusan (skala 0-100), syarat lulus jika mencapai jalur sukses (penyelamatan_berhasil atau skor >= 70)'
  },
  level8: {
    id: 'level8',
    title: 'Level 8: Harmoni Alam & Refleksi Nilai',
    stageIndex: 9,
    skorMaksimal: 0,
    passPercent: 0,
    minPassPoints: 0,
    description: 'Refleksi akhir, tanpa skor (skor: 0, skor_maksimal: 0), status otomatis selesai jika submit'
  }
};

const LOCAL_SCORES_PREFIX = 'biovillage_scores_';
const LOCAL_NILAI_PREFIX = 'biovillage_nilai_akhir_';

// Normalize level identifier (e.g. "Level 1" or "1" -> "level1")
export function normalizeLevelId(raw: string | number): string {
  const str = String(raw).toLowerCase().trim();
  if (str.startsWith('level')) {
    return str.replace(/\s+/g, '');
  }
  const match = str.match(/\d+/);
  if (match) {
    return `level${match[0]}`;
  }
  return str;
}

// Calculate predicate based on final percentage
export function hitungPredikat(persen: number): 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan' {
  if (persen >= 85) return 'Sangat Baik';
  if (persen >= 70) return 'Baik';
  if (persen >= 55) return 'Cukup';
  return 'Perlu Bimbingan';
}

// Helper: Read local cached scores
function getLocalScores(studentId: string): Record<string, LevelProgressRecord> {
  try {
    const raw = localStorage.getItem(`${LOCAL_SCORES_PREFIX}${studentId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper: Save local cached scores
function saveLocalScores(studentId: string, scores: Record<string, LevelProgressRecord>) {
  try {
    localStorage.setItem(`${LOCAL_SCORES_PREFIX}${studentId}`, JSON.stringify(scores));
  } catch {
    // ignore
  }
}

// Helper: Read local cached Nilai Akhir
function getLocalNilaiAkhir(studentId: string): NilaiAkhirRecord | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_NILAI_PREFIX}${studentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Helper: Save local cached Nilai Akhir
function saveLocalNilaiAkhir(studentId: string, nilai: NilaiAkhirRecord) {
  try {
    localStorage.setItem(`${LOCAL_NILAI_PREFIX}${studentId}`, JSON.stringify(nilai));
  } catch {
    // ignore
  }
}

/**
 * 1. saveLevelScore
 * Menyimpan progres dan skor tiap level siswa ke Firestore subkoleksi `students/{studentId}/progres/{levelId}`
 */
export async function saveLevelScore(
  studentId: string,
  rawLevelId: string | number,
  data: {
    skor: number;
    skor_maksimal?: number;
    esai?: string;
    jalur_diambil?: string;
  }
): Promise<LevelProgressRecord> {
  const levelId = normalizeLevelId(rawLevelId);
  const rule = LEVEL_RULES[levelId] || {
    id: levelId,
    title: levelId,
    stageIndex: 0,
    skorMaksimal: data.skor_maksimal ?? 10,
    passPercent: 70,
    minPassPoints: 7,
    description: ''
  };

  const skor_maksimal = data.skor_maksimal !== undefined ? data.skor_maksimal : rule.skorMaksimal;
  const skor = Math.max(0, data.skor);
  
  // Calculate percentage & status
  let persentase = 100;
  let status: 'lulus' | 'belum_lulus' | 'selesai' = 'lulus';

  if (levelId === 'level8') {
    status = 'selesai';
    persentase = 100;
  } else {
    persentase = skor_maksimal > 0 ? Math.round((skor / skor_maksimal) * 100) : 100;
    if (levelId === 'level7' && data.jalur_diambil === 'penyelamatan_berhasil') {
      status = 'lulus';
    } else if (persentase >= 70) {
      status = 'lulus';
    } else {
      status = 'belum_lulus';
    }
  }

  const record: LevelProgressRecord = {
    skor,
    skor_maksimal,
    persentase,
    status,
    waktu_selesai: new Date().toISOString(),
  };

  if (data.esai && data.esai.trim().length > 0) {
    record.esai = data.esai.trim();
  }
  if (data.jalur_diambil && data.jalur_diambil.trim().length > 0) {
    record.jalur_diambil = data.jalur_diambil.trim();
  }

  // 1. Immediately cache locally for offline reliability
  const localCache = getLocalScores(studentId);
  localCache[levelId] = record;
  saveLocalScores(studentId, localCache);

  // 2. Persist to Firestore: students/{studentId}/progres/{levelId}
  const progressDocPath = `students/${studentId}/progres/${levelId}`;
  try {
    const docRef = doc(db, 'students', studentId, 'progres', levelId);
    await setDoc(docRef, record, { merge: true });

    // Also update parent student document summary
    const studentDocRef = doc(db, 'students', studentId);
    await setDoc(
      studentDocRef,
      {
        id: studentId,
        lastActive: new Date().toISOString(),
        lastLevel: rule.title,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`[Firestore Error] Gagal menyimpan progres ${progressDocPath} ke cloud, tersimpan di lokal:`, err);
    // Even if Firestore has transient error, localCache retains state
  }

  // 3. Recalculate and update Nilai Akhir automatically
  try {
    await hitungNilaiAkhir(studentId);
  } catch (e) {
    console.warn('Gagal menghitung nilai akhir:', e);
  }

  return record;
}

/**
 * 2. hitungNilaiAkhir
 * Mengakumulasi total skor Level 1-7, menghitung persentase akhir dan predikat,
 * lalu menyimpannya ke `students/{studentId}/nilai_akhir/ringkasan`
 */
export async function hitungNilaiAkhir(studentId: string): Promise<NilaiAkhirRecord> {
  // Try reading all level progress docs from Firestore
  let progressMap: Record<string, LevelProgressRecord> = {};
  const progressColPath = `students/${studentId}/progres`;

  try {
    const querySnapshot = await getDocs(collection(db, 'students', studentId, 'progres'));
    querySnapshot.forEach(d => {
      progressMap[d.id] = d.data() as LevelProgressRecord;
    });
  } catch (err) {
    console.warn(`[Firestore Error] Membaca ${progressColPath} gagal, menggunakan cache lokal:`, err);
  }

  // Merge with local cached scores in case any write hasn't finished syncing
  const localCache = getLocalScores(studentId);
  progressMap = { ...localCache, ...progressMap };

  // Calculate total scores for Level 1 to Level 7 (Level 8 is reflection without score)
  let total_skor = 0;
  let total_skor_maksimal = 0;

  for (let i = 1; i <= 7; i++) {
    const lvlKey = `level${i}`;
    const rule = LEVEL_RULES[lvlKey];
    const userProg = progressMap[lvlKey];

    const maxPts = rule ? rule.skorMaksimal : 10;
    total_skor_maksimal += maxPts;

    if (userProg) {
      total_skor += Number(userProg.skor) || 0;
    }
  }

  const persentase_akhir = total_skor_maksimal > 0 ? Math.round((total_skor / total_skor_maksimal) * 100) : 0;
  const predikat = hitungPredikat(persentase_akhir);

  const nilaiAkhir: NilaiAkhirRecord = {
    total_skor,
    total_skor_maksimal,
    persentase_akhir,
    predikat,
    waktu_penilaian: new Date().toISOString()
  };

  // Cache locally
  saveLocalNilaiAkhir(studentId, nilaiAkhir);

  // Write to Firestore: students/{studentId}/nilai_akhir/ringkasan
  const docPath = `students/${studentId}/nilai_akhir/ringkasan`;
  try {
    const docRef = doc(db, 'students', studentId, 'nilai_akhir', 'ringkasan');
    await setDoc(docRef, nilaiAkhir, { merge: true });

    // Update parent student doc
    const studentDocRef = doc(db, 'students', studentId);
    await setDoc(
      studentDocRef,
      {
        totalSkor: total_skor,
        totalSkorMaksimal: total_skor_maksimal,
        persentaseAkhir: persentase_akhir,
        predikat: predikat,
        lastActive: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`[Firestore Error] Menyimpan ${docPath} gagal, tersimpan di lokal:`, err);
  }

  return nilaiAkhir;
}

/**
 * 3. getStudentProgress
 * Mengambil progres seluruh level dan nilai akhir siswa dari Firestore
 */
export async function getStudentProgress(studentId: string): Promise<{
  progres: Record<string, LevelProgressRecord>;
  nilaiAkhir: NilaiAkhirRecord | null;
}> {
  let progres: Record<string, LevelProgressRecord> = {};
  let nilaiAkhir: NilaiAkhirRecord | null = null;

  // 1. Try reading from Firestore
  try {
    const colRef = collection(db, 'students', studentId, 'progres');
    const snap = await getDocs(colRef);
    snap.forEach(docSnap => {
      progres[docSnap.id] = docSnap.data() as LevelProgressRecord;
    });

    const nilaiRef = doc(db, 'students', studentId, 'nilai_akhir', 'ringkasan');
    const nilaiSnap = await getDoc(nilaiRef);
    if (nilaiSnap.exists()) {
      nilaiAkhir = nilaiSnap.data() as NilaiAkhirRecord;
    }
  } catch (err) {
    console.warn(`[Firestore Error] Membaca progres siswa ${studentId} gagal, fallback ke lokal:`, err);
  }

  // 2. Merge with local cache
  const localScores = getLocalScores(studentId);
  progres = { ...localScores, ...progres };

  if (!nilaiAkhir) {
    nilaiAkhir = getLocalNilaiAkhir(studentId);
  }

  return { progres, nilaiAkhir };
}

/**
 * Ambil seluruh daftar siswa lengkap dengan progres Firestore dan Nilai Akhir
 * Digunakan untuk tabel ringkasan di Dashboard Guru
 */
export async function getAllStudentsWithFullProgress(): Promise<StudentProgressWithScores[]> {
  const baseStudents: StudentProgressRecord[] = getStudentsList();
  
  // Parallel fetch progress for all students
  const results: StudentProgressWithScores[] = await Promise.all(
    baseStudents.map(async (student) => {
      const studentId = student.id || student.username;
      const { progres, nilaiAkhir } = await getStudentProgress(studentId);

      // Count cleared / passed stages
      const passedLevels = Object.entries(progres).filter(
        ([, p]) => p.status === 'lulus' || p.status === 'selesai'
      ).length;

      return {
        ...student,
        clearedStagesCount: Math.max(student.clearedStagesCount, passedLevels),
        status: passedLevels >= 8 ? 'Tuntas' : passedLevels > 0 ? 'Sedang Berjalan' : 'Belum Mulai',
        progresScores: progres,
        nilaiAkhir
      };
    })
  );

  return results;
}
