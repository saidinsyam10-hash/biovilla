import { getStudentProgress, getAllStudentsWithFullProgress } from './scoreStore';

export interface SyncRowPayload {
  namaSiswa: string;
  idSiswa: string;
  tanggalWaktuSelesai: string;
  level1Skor: string | number;
  level1Persen: number;
  level2Skor: string | number;
  level2Persen: number;
  level3Skor: string | number;
  level3Persen: number;
  level4Skor: string | number;
  level4Persen: number;
  level5Skor: string | number;
  level5Persen: number;
  level6Skor: string | number;
  level6Persen: number;
  level7Skor: string | number;
  level7Jalur: string;
  level8Status: string;
  totalPoinAkhir: string | number;
  persentaseNilaiAkhir: number;
  predikatAkhir: 'Ahli Penyelamat Desa Sel' | 'Penyelamat Desa Sel' | 'Warga Peduli Desa Sel';
}

export interface SheetsConfigStatus {
  configured: boolean;
  sheetId?: string;
  serviceAccountEmail?: string;
  hasPrivateKey?: boolean;
  sheetName?: string;
  webhookUrl?: string;
}

export interface SheetsSyncResult {
  success: boolean;
  message: string;
  spreadsheetId?: string;
  updatedRange?: string;
}

/**
 * Menghitung predikat akhir Desa Sel sesuai standar evaluasi:
 * - >= 85%: Ahli Penyelamat Desa Sel
 * - >= 70%: Penyelamat Desa Sel
 * - < 70%: Warga Peduli Desa Sel
 */
export function hitungPredikatDesaSel(persen: number): 'Ahli Penyelamat Desa Sel' | 'Penyelamat Desa Sel' | 'Warga Peduli Desa Sel' {
  if (persen >= 85) return 'Ahli Penyelamat Desa Sel';
  if (persen >= 70) return 'Penyelamat Desa Sel';
  return 'Warga Peduli Desa Sel';
}

/**
 * Menyiapkan format data 1 baris untuk Google Sheets berdasarkan progres Firestore siswa
 */
export async function buildStudentSheetRow(studentId: string, studentName?: string): Promise<SyncRowPayload> {
  const { progres, nilaiAkhir } = await getStudentProgress(studentId);

  const l1 = progres.level1;
  const l2 = progres.level2;
  const l3 = progres.level3;
  const l4 = progres.level4;
  const l5 = progres.level5;
  const l6 = progres.level6;
  const l7 = progres.level7;
  const l8 = progres.level8;

  const totalSkor = nilaiAkhir?.total_skor ?? 0;
  const totalMax = nilaiAkhir?.total_skor_maksimal ?? 44;
  const persenAkhir = nilaiAkhir?.persentase_akhir ?? 0;
  const predikat = hitungPredikatDesaSel(persenAkhir);

  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  return {
    namaSiswa: studentName || studentId,
    idSiswa: studentId,
    tanggalWaktuSelesai: timeFormatted,
    level1Skor: `${l1?.skor ?? 0} / ${l1?.skor_maksimal ?? 14}`,
    level1Persen: l1?.persentase ?? 0,
    level2Skor: `${l2?.skor ?? 0} / ${l2?.skor_maksimal ?? 8}`,
    level2Persen: l2?.persentase ?? 0,
    level3Skor: `${l3?.skor ?? 0} / ${l3?.skor_maksimal ?? 5}`,
    level3Persen: l3?.persentase ?? 0,
    level4Skor: `${l4?.skor ?? 0} / ${l4?.skor_maksimal ?? 7}`,
    level4Persen: l4?.persentase ?? 0,
    level5Skor: `${l5?.skor ?? 0} / ${l5?.skor_maksimal ?? 5}`,
    level5Persen: l5?.persentase ?? 0,
    level6Skor: `${l6?.skor ?? 0} / ${l6?.skor_maksimal ?? 5}`,
    level6Persen: l6?.persentase ?? 0,
    level7Skor: `${l7?.skor ?? 0} / 100`,
    level7Jalur: l7?.jalur_diambil ? l7.jalur_diambil.replace(/_/g, ' ') : 'Penyelamatan Berhasil',
    level8Status: l8?.status === 'selesai' ? 'Selesai (Refleksi Harmoni)' : 'Selesai',
    totalPoinAkhir: `${totalSkor} / ${totalMax}`,
    persentaseNilaiAkhir: persenAkhir,
    predikatAkhir: predikat
  };
}

/**
 * SINKRONISASI OTOMATIS NILAI AKHIR SISWA KE GOOGLE SHEETS
 * Dipanggil secara otomatis ketika siswa menyelesaikan Level 8 dan nilai akhirnya terhitung.
 */
export async function syncFinalScoreToGoogleSheets(
  studentId: string,
  studentName?: string
): Promise<SheetsSyncResult> {
  try {
    const rowPayload = await buildStudentSheetRow(studentId, studentName);

    const res = await fetch('/api/sheets/sync-row', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowPayload)
    });

    const data = await res.json();

    // Cache sync timestamp locally
    try {
      localStorage.setItem(`biovillage_sheets_sync_${studentId}`, JSON.stringify({
        timestamp: new Date().toISOString(),
        success: data.success,
        message: data.message,
        predikat: rowPayload.predikatAkhir,
        persen: rowPayload.persentaseNilaiAkhir
      }));
      window.dispatchEvent(new CustomEvent('biovillage_sheets_synced', { detail: { studentId, result: data } }));
    } catch {
      // ignore
    }

    return {
      success: !!data.success,
      message: data.message || 'Sinkronisasi selesai',
      spreadsheetId: data.spreadsheetId,
      updatedRange: data.updatedRange
    };
  } catch (err: any) {
    console.error('Gagal sinkronisasi Google Sheets:', err);
    return {
      success: false,
      message: err?.message || 'Gagal menghubungi server untuk sinkronisasi Google Sheets'
    };
  }
}

/**
 * Sinkronkan semua siswa yang ada di sistem ke Google Sheet sekaligus (digunakan oleh Guru)
 */
export async function syncAllStudentsToGoogleSheets(): Promise<{
  success: boolean;
  total: number;
  successCount: number;
  message: string;
}> {
  try {
    const allStudents = await getAllStudentsWithFullProgress();
    const rows: SyncRowPayload[] = [];

    for (const student of allStudents) {
      const studentId = student.id || student.username;
      const row = await buildStudentSheetRow(studentId, student.fullName || student.nama || student.username);
      rows.push(row);
    }

    if (rows.length === 0) {
      return { success: false, total: 0, successCount: 0, message: 'Tidak ada data siswa untuk disinkronkan' };
    }

    const res = await fetch('/api/sheets/sync-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows })
    });

    const data = await res.json();
    return {
      success: !!data.success,
      total: data.total || rows.length,
      successCount: data.successCount || 0,
      message: data.success
        ? `Berhasil menyinkronkan ${data.successCount} dari ${data.total} data siswa ke Google Sheets.`
        : (data.message || 'Gagal menyinkronkan batch ke Google Sheets')
    };
  } catch (err: any) {
    return {
      success: false,
      total: 0,
      successCount: 0,
      message: err?.message || 'Error saat sinkronisasi batch'
    };
  }
}

/**
 * Ambil status konfigurasi Google Sheets dari server
 */
export async function fetchSheetsConfig(): Promise<SheetsConfigStatus> {
  try {
    const res = await fetch('/api/sheets/config');
    const data = await res.json();
    return data;
  } catch {
    return { configured: false };
  }
}

/**
 * Perbarui konfigurasi Google Sheets di server
 */
export async function saveSheetsConfig(config: {
  sheetId: string;
  serviceAccountEmail?: string;
  privateKey?: string;
  sheetName?: string;
  webhookUrl?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menyimpan konfigurasi' };
  }
}

/**
 * Uji koneksi ke Spreadsheet Google
 */
export async function testSheetsConnection(config?: {
  sheetId?: string;
  serviceAccountEmail?: string;
  privateKey?: string;
  sheetName?: string;
  webhookUrl?: string;
}): Promise<{
  success: boolean;
  message: string;
  spreadsheetTitle?: string;
  sheets?: string[];
}> {
  try {
    const res = await fetch('/api/sheets/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config || {})
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Tidak dapat menghubungi server'
    };
  }
}

/**
 * Ambil riwayat log sinkronisasi
 */
export async function fetchSheetsLogs(): Promise<any[]> {
  try {
    const res = await fetch('/api/sheets/logs');
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}
