import fs from 'fs';
import path from 'path';
import { JWT } from 'google-auth-library';

export interface SheetConfig {
  sheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
  sheetName: string;
  webhookUrl?: string;
}

export interface SyncRowData {
  namaSiswa: string;
  idSiswa: string;
  tanggalWaktuSelesai: string;
  level1Skor: number | string;
  level1Persen: number | string;
  level2Skor: number | string;
  level2Persen: number | string;
  level3Skor: number | string;
  level3Persen: number | string;
  level4Skor: number | string;
  level4Persen: number | string;
  level5Skor: number | string;
  level5Persen: number | string;
  level6Skor: number | string;
  level6Persen: number | string;
  level7Skor: number | string;
  level7Jalur: string;
  level8Status: string;
  totalPoinAkhir: number | string;
  persentaseNilaiAkhir: number | string;
  predikatAkhir: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  status: 'success' | 'failed';
  message: string;
  spreadsheetId?: string;
  predikat?: string;
  persen?: number | string;
}

const CONFIG_FILE = path.join(process.cwd(), 'public', 'sheets_config.json');
const LOGS_FILE = path.join(process.cwd(), 'public', 'sheets_logs.json');

export const GOOGLE_SHEET_HEADERS = [
  'Nama Siswa',
  'ID Siswa',
  'Tanggal & Waktu Selesai',
  'Level 1 (Skor)',
  'Level 1 (%)',
  'Level 2 (Skor)',
  'Level 2 (%)',
  'Level 3 (Skor)',
  'Level 3 (%)',
  'Level 4 (Skor)',
  'Level 4 (%)',
  'Level 5 (Skor)',
  'Level 5 (%)',
  'Level 6 (Skor)',
  'Level 6 (%)',
  'Level 7 (Skor)',
  'Level 7 (Jalur Keputusan)',
  'Level 8 (Status)',
  'Total Poin Akhir',
  'Persentase Nilai Akhir',
  'Predikat Akhir'
];

let cachedConfig: SheetConfig | null = null;
let syncLogs: SyncLogEntry[] = [];

// Load logs on startup
try {
  if (fs.existsSync(LOGS_FILE)) {
    const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
    syncLogs = JSON.parse(raw);
  }
} catch {
  syncLogs = [];
}

function saveLogs() {
  try {
    // Keep last 100 logs
    const trimmed = syncLogs.slice(-100);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save sheets logs:', err);
  }
}

/**
 * Ekstrak Spreadsheet ID dari link URL penuh jika pengguna menempelkan link browser
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export function getSheetConfig(): SheetConfig {
  if (cachedConfig) return cachedConfig;

  let fileConfig: Partial<SheetConfig> = {};
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch {
    fileConfig = {};
  }

  const rawSheetId = process.env.GOOGLE_SHEET_ID || fileConfig.sheetId || '';
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || fileConfig.serviceAccountEmail || '';
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || fileConfig.privateKey || '';
  const sheetName = fileConfig.sheetName || 'Sheet1';
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || fileConfig.webhookUrl || '';

  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  cachedConfig = {
    sheetId: extractSpreadsheetId(rawSheetId),
    serviceAccountEmail: serviceAccountEmail.trim(),
    privateKey: privateKey.trim(),
    sheetName: sheetName.trim() || 'Sheet1',
    webhookUrl: webhookUrl.trim()
  };

  return cachedConfig;
}

export function updateSheetConfig(newConfig: Partial<SheetConfig>): SheetConfig {
  const current = getSheetConfig();
  const merged: SheetConfig = {
    ...current,
    ...newConfig
  };

  if (merged.sheetId) {
    merged.sheetId = extractSpreadsheetId(merged.sheetId);
  }

  if (merged.privateKey && merged.privateKey.includes('\\n')) {
    merged.privateKey = merged.privateKey.replace(/\\n/g, '\n');
  }

  cachedConfig = merged;

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write sheets_config.json:', err);
  }

  return merged;
}

export function getAuthClient(config: SheetConfig): JWT | null {
  if (!config.serviceAccountEmail || !config.privateKey) {
    return null;
  }

  // Validasi format Private Key agar tidak crash dengan OpenSSL decoder
  if (!config.privateKey.includes('PRIVATE KEY')) {
    console.warn('[Google Sheets] Private Key tidak valid (bukan format PEM RSA).');
    return null;
  }

  try {
    const jwt = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return jwt;
  } catch (err: any) {
    console.error('[Google Sheets Auth Init Error]', err?.message || err);
    return null;
  }
}

/**
 * Memastikan baris header ada di Google Sheet jika sheet masih kosong
 */
export async function ensureSheetHeader(config: SheetConfig, auth: JWT): Promise<void> {
  const targetSheet = config.sheetName || 'Sheet1';
  try {
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.sheetId)}/values/${encodeURIComponent(targetSheet)}!A1:U1`;
    const res: any = await auth.request({ url: getUrl, method: 'GET' });
    if (!res.data.values || res.data.values.length === 0) {
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.sheetId)}/values/${encodeURIComponent(targetSheet)}!A1?valueInputOption=USER_ENTERED`;
      await auth.request({
        url: updateUrl,
        method: 'PUT',
        data: {
          values: [GOOGLE_SHEET_HEADERS]
        }
      });
      console.log(`[Google Sheets] Header row written to ${config.sheetId} (${targetSheet})`);
    }
  } catch (err: any) {
    console.warn('[Google Sheets] Warning when verifying header row:', err?.message || err);
  }
}

/**
 * Format baris data dari objek SyncRowData
 */
export function formatRowValues(data: SyncRowData): any[] {
  return [
    data.namaSiswa || 'Siswa',
    data.idSiswa || '-',
    data.tanggalWaktuSelesai || new Date().toISOString(),
    data.level1Skor ?? 0,
    data.level1Persen !== undefined ? `${data.level1Persen}%` : '0%',
    data.level2Skor ?? 0,
    data.level2Persen !== undefined ? `${data.level2Persen}%` : '0%',
    data.level3Skor ?? 0,
    data.level3Persen !== undefined ? `${data.level3Persen}%` : '0%',
    data.level4Skor ?? 0,
    data.level4Persen !== undefined ? `${data.level4Persen}%` : '0%',
    data.level5Skor ?? 0,
    data.level5Persen !== undefined ? `${data.level5Persen}%` : '0%',
    data.level6Skor ?? 0,
    data.level6Persen !== undefined ? `${data.level6Persen}%` : '0%',
    data.level7Skor ?? 0,
    data.level7Jalur || 'Standar',
    data.level8Status || 'Selesai',
    data.totalPoinAkhir ?? 0,
    data.persentaseNilaiAkhir !== undefined ? `${data.persentaseNilaiAkhir}%` : '0%',
    data.predikatAkhir || 'Warga Peduli Desa Sel'
  ];
}

/**
 * Menambahkan 1 baris nilai akhir siswa ke Google Sheets
 */
export async function appendRowToGoogleSheet(data: SyncRowData): Promise<{
  success: boolean;
  message: string;
  spreadsheetId?: string;
  updatedRange?: string;
}> {
  const config = getSheetConfig();
  const rowValues = formatRowValues(data);
  const logId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Check if Service Account is configured
  const auth = getAuthClient(config);

  if (auth && config.sheetId) {
    try {
      await ensureSheetHeader(config, auth);

      const targetSheet = config.sheetName || 'Sheet1';
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.sheetId)}/values/${encodeURIComponent(targetSheet)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

      const response: any = await auth.request({
        url: appendUrl,
        method: 'POST',
        data: {
          values: [rowValues]
        }
      });

      const updatedRange = response.data?.updates?.updatedRange || 'A:U';
      const successMsg = `Berhasil dicatat ke Google Sheets (${updatedRange})`;

      const entry: SyncLogEntry = {
        id: logId,
        timestamp: new Date().toISOString(),
        studentId: data.idSiswa,
        studentName: data.namaSiswa,
        status: 'success',
        message: successMsg,
        spreadsheetId: config.sheetId,
        predikat: data.predikatAkhir,
        persen: data.persentaseNilaiAkhir
      };
      syncLogs.unshift(entry);
      saveLogs();

      console.log(`[Google Sheets API] ${data.namaSiswa} (${data.idSiswa}) -> Synced to ${config.sheetId}`);

      return {
        success: true,
        message: successMsg,
        spreadsheetId: config.sheetId,
        updatedRange
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Gagal mengirim data ke Google Sheets API';
      console.error('[Google Sheets API Error]', errMsg);

      // Try fallback to Webhook if available
      if (config.webhookUrl) {
        try {
          const webhookRes = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'appendRow',
              sheetName: config.sheetName,
              row: rowValues,
              data
            })
          });
          if (webhookRes.ok) {
            const entry: SyncLogEntry = {
              id: logId,
              timestamp: new Date().toISOString(),
              studentId: data.idSiswa,
              studentName: data.namaSiswa,
              status: 'success',
              message: 'Berhasil dikirim via Webhook Google Sheets',
              spreadsheetId: config.sheetId,
              predikat: data.predikatAkhir,
              persen: data.persentaseNilaiAkhir
            };
            syncLogs.unshift(entry);
            saveLogs();
            return {
              success: true,
              message: 'Berhasil dikirim via Webhook Google Sheets',
              spreadsheetId: config.sheetId
            };
          }
        } catch (wbErr) {
          console.error('[Webhook Fallback Error]', wbErr);
        }
      }

      const entry: SyncLogEntry = {
        id: logId,
        timestamp: new Date().toISOString(),
        studentId: data.idSiswa,
        studentName: data.namaSiswa,
        status: 'failed',
        message: errMsg,
        spreadsheetId: config.sheetId,
        predikat: data.predikatAkhir,
        persen: data.persentaseNilaiAkhir
      };
      syncLogs.unshift(entry);
      saveLogs();

      return {
        success: false,
        message: `Error Google Sheets API: ${errMsg}`,
        spreadsheetId: config.sheetId
      };
    }
  }

  // 2. Check if Webhook is configured
  if (config.webhookUrl) {
    try {
      const webhookRes = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'appendRow',
          sheetName: config.sheetName,
          row: rowValues,
          data
        })
      });

      if (webhookRes.ok) {
        const entry: SyncLogEntry = {
          id: logId,
          timestamp: new Date().toISOString(),
          studentId: data.idSiswa,
          studentName: data.namaSiswa,
          status: 'success',
          message: 'Berhasil dicatat ke Google Sheets via Webhook',
          predikat: data.predikatAkhir,
          persen: data.persentaseNilaiAkhir
        };
        syncLogs.unshift(entry);
        saveLogs();
        return {
          success: true,
          message: 'Berhasil dicatat ke Google Sheets via Webhook'
        };
      }
    } catch (wbErr: any) {
      console.error('[Webhook Error]', wbErr);
    }
  }

  // 3. Neither Service Account nor Webhook configured
  const notConfiguredMsg = 'Google Sheets belum dikonfigurasi (Spreadsheet ID & Service Account Email/Private Key diperlukan). Data tetap tersimpan aman di Firestore.';
  const entry: SyncLogEntry = {
    id: logId,
    timestamp: new Date().toISOString(),
    studentId: data.idSiswa,
    studentName: data.namaSiswa,
    status: 'failed',
    message: notConfiguredMsg,
    predikat: data.predikatAkhir,
    persen: data.persentaseNilaiAkhir
  };
  syncLogs.unshift(entry);
  saveLogs();

  return {
    success: false,
    message: notConfiguredMsg
  };
}

/**
 * Uji koneksi ke Google Spreadsheet
 */
export async function testSheetConnection(customConfig?: Partial<SheetConfig>): Promise<{
  success: boolean;
  message: string;
  spreadsheetTitle?: string;
  sheets?: string[];
}> {
  const saved = getSheetConfig();
  const config = { ...saved, ...customConfig };

  // Cek apakah ada konfigurasi Webhook yang diisi
  if (config.webhookUrl) {
    if (config.webhookUrl.includes('docs.google.com/spreadsheets')) {
      return {
        success: false,
        message: 'Webhook URL tidak valid: Anda memasukkan link Google Spreadsheet. Webhook harus berupa link Google Apps Script (berawalan https://script.google.com/macros/s/.../exec).'
      };
    }

    try {
      // Test ping ke webhook
      const testRes = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ping',
          sheetName: config.sheetName
        }),
        redirect: 'follow'
      });

      if (testRes.ok) {
        return {
          success: true,
          message: 'Koneksi Webhook Google Apps Script BERHASIL! Spreadsheet siap menerima data nilai siswa otomatis.'
        };
      } else if (testRes.status === 401) {
        return {
          success: false,
          message: 'Akses Ditolak (HTTP 401): Google Apps Script Anda saat ini masih membatasi akses. Di Apps Script, klik Deploy > Kelola deployment (Manage deployments) > Edit (ikon pensil), ubah "Yang memiliki akses" (Who has access) menjadi "Siapa saja" (Anyone), lalu klik Deploy.'
        };
      } else if (testRes.status === 404) {
        return {
          success: false,
          message: 'URL Tidak Ditemukan (HTTP 404): Deployment Apps Script tidak ditemukan. Silakan buat Deployment Baru di Google Apps Script dan salin URL Web App yang baru.'
        };
      } else {
        return {
          success: false,
          message: `Koneksi Webhook gagal (HTTP ${testRes.status}). Pastikan jenis deployment adalah "Aplikasi Web" dan akses disetel ke "Siapa saja (Anyone)".`
        };
      }
    } catch (whErr: any) {
      return {
        success: false,
        message: `Koneksi Webhook gagal: ${whErr?.message || 'Tidak dapat menghubungi URL Webhook'}`
      };
    }
  }

  // Jika menggunakan Service Account:
  if (!config.sheetId) {
    return { 
      success: false, 
      message: 'Spreadsheet ID atau Webhook URL belum diisi. Silakan masukkan salah satunya.' 
    };
  }

  // Cek jika private key diisi dengan link spreadsheet
  if (config.privateKey && config.privateKey.includes('docs.google.com')) {
    return {
      success: false,
      message: 'Kolom Private Key terisi link Google Sheets. Private Key harus berupa sertifikat PEM (berawalan -----BEGIN PRIVATE KEY-----). Atau gunakan metode Webhook yang jauh lebih mudah!'
    };
  }

  // Cek jika serviceAccountEmail adalah email pribadi gmail
  if (config.serviceAccountEmail && config.serviceAccountEmail.endsWith('@gmail.com')) {
    return {
      success: false,
      message: 'Email yang dimasukkan adalah email Gmail pribadi (' + config.serviceAccountEmail + '). Service Account harus berupa email dari Google Cloud Console (@...iam.gserviceaccount.com). Atau gunakan metode Webhook yang tidak memerlukan Service Account!'
    };
  }

  const auth = getAuthClient(config);
  if (!auth) {
    return {
      success: false,
      message: 'Kredensial Service Account belum lengkap atau tidak valid. Pastikan Email Service Account dan Private Key terisi dengan benar, atau gunakan metode Webhook Google Apps Script.'
    };
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.sheetId)}?fields=properties.title,sheets.properties.title`;
    const res: any = await auth.request({ url, method: 'GET' });
    const title = res.data?.properties?.title || 'Spreadsheet Tanpa Judul';
    const sheets = (res.data?.sheets || []).map((s: any) => s.properties?.title);

    return {
      success: true,
      message: `Koneksi berhasil! Terhubung ke Spreadsheet: "${title}".`,
      spreadsheetTitle: title,
      sheets
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Koneksi gagal: ${err?.message || 'Pastikan Spreadsheet ID benar dan Service Account sudah diberi akses Editor.'}`
    };
  }
}

export function getRecentLogs(): SyncLogEntry[] {
  return syncLogs.slice(0, 50);
}
