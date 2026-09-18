import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import * as _multer from 'multer';
import * as _archiver from 'archiver';

const multer: any = (_multer as any)?.default || _multer;
const archiver: any = (_archiver as any)?.default || _archiver;

import {
  getSheetConfig,
  updateSheetConfig,
  appendRowToGoogleSheet,
  testSheetConnection,
  getRecentLogs,
  SyncRowData
} from './googleSheets';
import {
  getGeminiConfig,
  updateGeminiConfig,
  testGeminiConnection,
  evaluateStudentEssay,
  chatWithAiTutor,
  maskApiKey
} from './geminiService';

export interface ManifestItem {
  key: string;
  filename: string;
  url: string;
  updatedAt: string;
  size?: number;
  mimeType?: string;
}

export interface Manifest {
  updatedAt: string;
  items: Record<string, ManifestItem>;
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
const MANIFEST_FILE = path.join(PUBLIC_DIR, 'media_manifest.json');

// Helper to verify directory writability (read-only in serverless like Vercel Lambda)
function isDirectoryWritable(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const testFile = path.join(dirPath, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
}

// Ensure base directories exist if writable
try { if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true }); } catch {}
try { if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true }); } catch {}
try { if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch {}

// Fallback upload staging dir for serverless Lambda
let UPLOAD_STAGING_DIR = UPLOADS_DIR;
try {
  if (!isDirectoryWritable(UPLOADS_DIR)) {
    const tmpUploads = path.join(os.tmpdir(), 'biovillage_uploads');
    if (!fs.existsSync(tmpUploads)) {
      fs.mkdirSync(tmpUploads, { recursive: true });
    }
    UPLOAD_STAGING_DIR = tmpUploads;
  }
} catch {
  UPLOAD_STAGING_DIR = os.tmpdir();
}

let inMemoryManifest: Manifest | null = null;

function loadManifest(): Manifest {
  try {
    if (fs.existsSync(MANIFEST_FILE)) {
      const content = fs.readFileSync(MANIFEST_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Note: Error reading media manifest from disk (using defaults):', (err as any)?.message);
  }
  return { updatedAt: new Date().toISOString(), items: {} };
}

function getManifest(): Manifest {
  if (!inMemoryManifest) {
    inMemoryManifest = loadManifest();
  }
  return inMemoryManifest;
}

function saveManifest(manifest: Manifest) {
  inMemoryManifest = manifest;
  try {
    manifest.updatedAt = new Date().toISOString();
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  } catch (err) {
    // Expected on read-only serverless filesystems; inMemoryManifest remains updated for session
    console.warn('[Manifest] Disk write skipped (read-only serverless environment):', (err as any)?.message);
  }
}

function getSafeFilename(key: string, dataUrl: string = '', requestedFilename?: string, mimeType?: string): string {
  const cleanKey = key.replace(/^__MEDIA__/, '').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  
  if (/\.[a-zA-Z0-9]+$/.test(cleanKey)) {
    return cleanKey;
  }

  let ext = '';
  if (requestedFilename && /\.[a-zA-Z0-9]+$/.test(requestedFilename)) {
    const m = requestedFilename.match(/\.[a-zA-Z0-9]+$/);
    if (m) ext = m[0].toLowerCase();
  }

  if (!ext && mimeType) {
    if (mimeType.includes('mp4')) ext = '.mp4';
    else if (mimeType.includes('webm')) ext = '.webm';
    else if (mimeType.includes('quicktime') || mimeType.includes('mov')) ext = '.mov';
    else if (mimeType.includes('matroska') || mimeType.includes('mkv')) ext = '.mkv';
    else if (mimeType.includes('svg')) ext = '.svg';
    else if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.startsWith('video/')) ext = '.mp4';
    else if (mimeType.startsWith('image/')) ext = '.png';
  }

  if (!ext) {
    if (dataUrl.startsWith('data:video/mp4')) ext = '.mp4';
    else if (dataUrl.startsWith('data:video/webm')) ext = '.webm';
    else if (dataUrl.startsWith('data:image/svg')) ext = '.svg';
    else if (dataUrl.startsWith('data:image/png')) ext = '.png';
    else if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) ext = '.jpg';
    else if (cleanKey.toLowerCase().includes('video') || cleanKey === 'asset_001' || cleanKey === 'asset_035' || cleanKey === 'asset_043' || cleanKey === 'asset_047' || cleanKey === 'asset_049' || cleanKey === 'asset_061') ext = '.mp4';
    else ext = '.webp';
  }

  return `${cleanKey}${ext}`;
}

// Background optimization using ImageMagick / ffmpeg if available
function optimizeMediaFileInBackground(filePath: string, mimeType?: string) {
  try {
    if (!fs.existsSync(filePath)) return;
    const isImage = mimeType?.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(filePath);
    const isVideo = mimeType?.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(filePath);
    const filename = path.basename(filePath);

    if (isImage && !filePath.endsWith('.svg')) {
      exec(`convert "${filePath}" -resize "1280x720>" -strip -quality 82 "${filePath}"`, (err) => {
        if (!err && fs.existsSync(filePath)) {
          const syncDirs = [
            UPLOADS_DIR,
            path.join(process.cwd(), 'dist', 'assets'),
            path.join(process.cwd(), 'dist', 'uploads')
          ];
          for (const sd of syncDirs) {
            if (fs.existsSync(sd)) {
              try { fs.copyFileSync(filePath, path.join(sd, filename)); } catch {}
            }
          }
        }
      });
    } else if (isVideo) {
      const tempOut = filePath + '.opt.mp4';
      exec(`ffmpeg -y -i "${filePath}" -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset fast -c:a aac -b:a 128k "${tempOut}"`, (err) => {
        if (!err && fs.existsSync(tempOut)) {
          try {
            fs.renameSync(tempOut, filePath);
            const syncDirs = [
              UPLOADS_DIR,
              path.join(process.cwd(), 'dist', 'assets'),
              path.join(process.cwd(), 'dist', 'uploads')
            ];
            for (const sd of syncDirs) {
              if (fs.existsSync(sd)) {
                try { fs.copyFileSync(filePath, path.join(sd, filename)); } catch {}
              }
            }
          } catch {}
        } else if (fs.existsSync(tempOut)) {
          try { fs.unlinkSync(tempOut); } catch {}
        }
      });
    }
  } catch {
    // Non-blocking
  }
}

// Protected core assets
const PROTECTED_CORE_ASSETS = new Set<string>([
  'asset_001.mp4', 'asset_002.png', 'asset_002.webp', 'asset_002.jpg',
  'asset_015.jpeg', 'asset_015.webp', 'asset_015.jpg', 'petunjuk_image.webp', 'Gemini_Generated_Image_m2ivxjm2ivxjm2iv.jpg',
  'asset_027.jpeg', 'asset_027.webp', 'asset_028.jpeg', 'asset_029.png', 'asset_029.svg',
  'asset_035.mp4', 'asset_036.png', 'asset_043.mp4', 'asset_047.mp4', 'asset_049.mp4',
  'asset_061.mp4', 'asset_063.jpg', 'asset_063.png', 'intro_welcome.mp4',
  'slide_lvl3-s1_image.webp', 'slide_lvl4-s0_video.mp4', 'slide_lvl5-s0_video.mp4',
  'slide_lvl6-s0_video.mp4', 'slide_lvl7-s0_video.mp4', 'slide_lvl8-s0_image.webp',
  'level2_town_bg.jpg', 'level2_town_bg.webp', 'level6_chain_bg.jpg', 'level6_explorer_boy.jpg'
]);

function deleteOldMediaFilesForSlot(key: string, keepFilename?: string) {
  try {
    const cleanKey = key.replace(/^__MEDIA__/, '').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
    const baseSlot = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '').toLowerCase();

    const slotAliases = new Set<string>([baseSlot, cleanKey.toLowerCase()]);
    if (baseSlot === 'landing_page_video' || cleanKey.toLowerCase() === 'landing_page_video') {
      slotAliases.add('landing_page_video');
    } else if (baseSlot === 'asset_001' || baseSlot === 'intro_welcome') {
      slotAliases.add('asset_001');
      slotAliases.add('intro_welcome');
    }
    if (baseSlot === 'asset_002' || baseSlot === 'level2_town_bg') {
      slotAliases.add('asset_002');
      slotAliases.add('level2_town_bg');
    }

    const manifest = getManifest();
    const filesToDelete = new Set<string>();

    for (const [mKey, mItem] of Object.entries(manifest.items)) {
      const mClean = mKey.replace(/^__MEDIA__/, '').trim().toLowerCase();
      const mBase = mClean.replace(/\.[a-zA-Z0-9]+$/, '');
      if (slotAliases.has(mBase) || slotAliases.has(mClean)) {
        if (mItem?.filename && mItem.filename !== keepFilename) {
          filesToDelete.add(mItem.filename);
        }
      }
    }

    const checkDirs = [ASSETS_DIR, UPLOADS_DIR];
    const distAssets = path.join(process.cwd(), 'dist', 'assets');
    const distUploads = path.join(process.cwd(), 'dist', 'uploads');
    if (fs.existsSync(distAssets)) checkDirs.push(distAssets);
    if (fs.existsSync(distUploads)) checkDirs.push(distUploads);

    for (const dir of checkDirs) {
      if (fs.existsSync(dir)) {
        try {
          const fileNames = fs.readdirSync(dir);
          for (const f of fileNames) {
            if (keepFilename && f.toLowerCase() === keepFilename.toLowerCase()) continue;
            const fBase = f.replace(/\.[a-zA-Z0-9]+$/, '').toLowerCase();
            if (slotAliases.has(fBase)) {
              filesToDelete.add(f);
            }
          }
        } catch {}
      }
    }

    // PENYIMPANAN PERMANEN: Berkas fisik di disk TIDAK PERNAH dihapus (no unlink)
    // Semua aset yang diunggah akan tetap tersimpan permanen di folder public/assets dan public/uploads
    // sehingga selalu aman dan tidak akan hilang saat di-push atau dihubungkan ke GitHub.
    // (Logika penghapusan fisik sengaja dinonaktifkan untuk menjamin keamanan aset)

    saveManifest(manifest);
  } catch (err) {
    console.warn('[Clean Old Media] Safe error handling:', err);
  }
}

// Multer disk storage setup with fallback staging directory
const uploadStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, UPLOAD_STAGING_DIR);
  },
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `tmp_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const multipartUpload = multer({
  storage: uploadStorage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB max for video/image
});

export function createExpressApp() {
  const app = express();

  // CORS and Headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Support large base64 uploads (up to 250MB for media/videos/images fallback)
  app.use(express.json({ limit: '250mb' }));
  app.use(express.urlencoded({ extended: true, limit: '250mb' }));

  const apiRouter = express.Router();

  // 1. Health check
  apiRouter.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'BioVillage Simulator Backend',
      timestamp: new Date().toISOString(),
      isServerless: !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
    });
  });

  // --- GOOGLE SHEETS SYNC ENDPOINTS ---
  apiRouter.get('/sheets/config', (_req, res) => {
    try {
      const config = getSheetConfig();
      res.json({
        success: true,
        sheetId: config.sheetId,
        serviceAccountEmail: config.serviceAccountEmail,
        hasPrivateKey: !!config.privateKey,
        sheetName: config.sheetName,
        webhookUrl: config.webhookUrl || '',
        configured: !!(config.webhookUrl || (config.sheetId && config.serviceAccountEmail && config.privateKey))
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  apiRouter.post('/sheets/config', (req, res) => {
    try {
      const { sheetId, serviceAccountEmail, privateKey, sheetName, webhookUrl } = req.body;
      const updated = updateSheetConfig({
        sheetId,
        serviceAccountEmail,
        privateKey,
        sheetName,
        webhookUrl
      });
      res.json({
        success: true,
        message: 'Konfigurasi Google Sheets berhasil diperbarui',
        sheetId: updated.sheetId,
        serviceAccountEmail: updated.serviceAccountEmail,
        hasPrivateKey: !!updated.privateKey,
        sheetName: updated.sheetName,
        configured: !!(updated.sheetId && (updated.serviceAccountEmail || updated.webhookUrl))
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  apiRouter.post('/sheets/test-connection', async (req, res) => {
    try {
      const result = await testSheetConnection(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Gagal menguji koneksi' });
    }
  });

  apiRouter.post('/sheets/sync-row', async (req, res) => {
    try {
      const data: SyncRowData = req.body;
      if (!data || !data.idSiswa) {
        return res.status(400).json({ success: false, message: 'Data siswa tidak valid' });
      }
      const result = await appendRowToGoogleSheet(data);
      res.json(result);
    } catch (err: any) {
      console.error('Error syncing row to Google Sheets:', err);
      res.status(500).json({ success: false, message: err?.message || 'Server error saat sinkronisasi' });
    }
  });

  apiRouter.post('/sheets/sync-batch', async (req, res) => {
    try {
      const { rows } = req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Daftar data siswa kosong' });
      }
      let successCount = 0;
      const results = [];
      for (const row of rows) {
        const resSingle = await appendRowToGoogleSheet(row);
        results.push(resSingle);
        if (resSingle.success) successCount++;
      }
      res.json({
        success: successCount > 0,
        total: rows.length,
        successCount,
        results
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Server error saat batch sync' });
    }
  });

  apiRouter.get('/sheets/logs', (_req, res) => {
    try {
      const logs = getRecentLogs();
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // --- GEMINI AI INTEGRATION ENDPOINTS ---
  apiRouter.get('/ai/config', (_req, res) => {
    try {
      const config = getGeminiConfig();
      res.json({
        success: true,
        hasKey: !!config.apiKey,
        maskedKey: maskApiKey(config.apiKey),
        model: config.model || 'gemini-2.5-flash',
        enabled: config.enabled !== undefined ? config.enabled : true,
        updatedAt: config.updatedAt
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  apiRouter.post('/ai/config', (req, res) => {
    try {
      const { apiKey, model, enabled } = req.body;
      const updated = updateGeminiConfig({ apiKey, model, enabled });
      res.json({
        success: true,
        message: 'Konfigurasi Gemini AI berhasil disimpan',
        hasKey: !!updated.apiKey,
        maskedKey: maskApiKey(updated.apiKey),
        model: updated.model,
        enabled: updated.enabled
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  apiRouter.post('/ai/test-connection', async (req, res) => {
    try {
      const { apiKey } = req.body || {};
      const result = await testGeminiConnection(apiKey);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Gagal menguji koneksi AI' });
    }
  });

  apiRouter.post('/ai/evaluate-essay', async (req, res) => {
    try {
      const result = await evaluateStudentEssay(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Error evaluating essay with AI:', err);
      res.status(500).json({ success: false, error: err?.message || 'Evaluasi AI gagal diproses' });
    }
  });

  apiRouter.post('/ai/chat-tutor', async (req, res) => {
    try {
      const result = await chatWithAiTutor(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Error in AI Tutor chat:', err);
      res.status(500).json({ success: false, error: err?.message || 'Chat AI Tutor gagal diproses' });
    }
  });

  // --- MEDIA ENDPOINTS ---
  apiRouter.get('/media/all', (_req, res) => {
    const manifest = getManifest();
    const verifiedItems: Record<string, ManifestItem> = {};
    for (const [k, item] of Object.entries(manifest.items)) {
      if (item && item.filename) {
        const p1 = path.join(ASSETS_DIR, item.filename);
        const p2 = path.join(UPLOADS_DIR, item.filename);
        if (fs.existsSync(p1) || fs.existsSync(p2) || item.url) {
          verifiedItems[k] = item;
        }
      }
    }
    res.json({
      success: true,
      updatedAt: manifest.updatedAt,
      items: verifiedItems,
      count: Object.keys(verifiedItems).length
    });
  });

  apiRouter.post('/media/upload', (req, res) => {
    try {
      const { key, dataUrl, filename, mimeType } = req.body;
      if (!key || !dataUrl) {
        return res.status(400).json({ success: false, error: 'Key and dataUrl are required' });
      }

      const safeFilename = getSafeFilename(key, dataUrl, filename);
      const manifest = getManifest();

      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(dataUrl);
      }

      const assetDest = path.join(ASSETS_DIR, safeFilename);
      const uploadDest = path.join(UPLOADS_DIR, safeFilename);

      deleteOldMediaFilesForSlot(key, safeFilename);

      try { fs.writeFileSync(assetDest, buffer); } catch {}
      try { fs.writeFileSync(uploadDest, buffer); } catch {}
      try { fs.writeFileSync(path.join(process.cwd(), 'dist', 'assets', safeFilename), buffer); } catch {}
      try { fs.writeFileSync(path.join(process.cwd(), 'dist', 'uploads', safeFilename), buffer); } catch {}

      optimizeMediaFileInBackground(assetDest, mimeType || (matches ? matches[1] : undefined));

      const mediaUrl = `/assets/${safeFilename}`;
      const item: ManifestItem = {
        key,
        filename: safeFilename,
        url: mediaUrl,
        updatedAt: new Date().toISOString(),
        size: buffer.length,
        mimeType: mimeType || (matches ? matches[1] : undefined)
      };

      manifest.items[key] = item;
      const cleanKey = key.replace(/^__MEDIA__/, '').trim();
      manifest.items[cleanKey] = item;
      const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
      if (baseKey) manifest.items[baseKey] = item;

      if (baseKey === 'landing_page_video') {
        manifest.items['landing_page_video'] = item;
        manifest.items['landing_page_video.mp4'] = item;
      }
      if (baseKey === 'asset_001' || baseKey === 'intro_welcome') {
        manifest.items['asset_001'] = item;
        manifest.items['asset_001.mp4'] = item;
        manifest.items['intro_welcome'] = item;
      }
      if (baseKey === 'asset_002' || baseKey === 'level2_town_bg') {
        manifest.items['asset_002'] = item;
        manifest.items['asset_002.png'] = item;
        manifest.items['asset_002.webp'] = item;
        manifest.items['asset_002.jpg'] = item;
        manifest.items['level2_town_bg.webp'] = item;
        manifest.items['level2_town_bg.jpg'] = item;
      }

      saveManifest(manifest);

      res.json({
        success: true,
        item,
        url: mediaUrl
      });
    } catch (err: any) {
      console.error('Failed to persist media:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server write error' });
    }
  });

  // Simpan tautan URL eksternal (misal Google Drive, YouTube, CDN) ke manifest server secara permanen
  apiRouter.post('/media/custom-url', (req, res) => {
    try {
      const { key, url } = req.body;
      if (!key || !url) {
        return res.status(400).json({ success: false, error: 'Key dan url wajib disertakan' });
      }
      const manifest = getManifest();
      const cleanKey = key.replace(/^__MEDIA__/, '').trim();
      const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
      const item: ManifestItem = {
        key: cleanKey,
        filename: '',
        url: url.trim(),
        updatedAt: new Date().toISOString()
      };
      manifest.items[key] = item;
      manifest.items[cleanKey] = item;
      if (baseKey) manifest.items[baseKey] = item;
      saveManifest(manifest);
      res.json({ success: true, item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal menyimpan URL ke server' });
    }
  });

  apiRouter.post('/media/upload-file', multipartUpload.single('file'), (req: any, res) => {
    try {
      const file = req.file;
      const key = (req.body.key || '').trim();
      const requestedFilename = req.body.filename || (file ? file.originalname : '');

      if (!file || !key) {
        if (file?.path && fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch {}
        }
        return res.status(400).json({ success: false, error: 'Berkas dan slot key wajib disertakan' });
      }

      const safeFilename = getSafeFilename(key, '', requestedFilename, file.mimetype);
      const assetDest = path.join(ASSETS_DIR, safeFilename);
      const uploadDest = path.join(UPLOADS_DIR, safeFilename);

      deleteOldMediaFilesForSlot(key, safeFilename);

      try { fs.copyFileSync(file.path, assetDest); } catch {}
      try { fs.copyFileSync(file.path, uploadDest); } catch {}
      try { fs.copyFileSync(file.path, path.join(process.cwd(), 'dist', 'assets', safeFilename)); } catch {}
      try { fs.copyFileSync(file.path, path.join(process.cwd(), 'dist', 'uploads', safeFilename)); } catch {}
      try { fs.unlinkSync(file.path); } catch {}

      const mediaUrl = `/assets/${safeFilename}`;
      const manifest = getManifest();

      optimizeMediaFileInBackground(assetDest, file.mimetype);

      const item: ManifestItem = {
        key,
        filename: safeFilename,
        url: mediaUrl,
        updatedAt: new Date().toISOString(),
        size: file.size,
        mimeType: file.mimetype
      };

      manifest.items[key] = item;
      const cleanKey = key.replace(/^__MEDIA__/, '').trim();
      manifest.items[cleanKey] = item;
      const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
      if (baseKey) manifest.items[baseKey] = item;

      if (baseKey === 'landing_page_video') {
        manifest.items['landing_page_video'] = item;
        manifest.items['landing_page_video.mp4'] = item;
      }
      if (baseKey === 'asset_001' || baseKey === 'intro_welcome') {
        manifest.items['asset_001'] = item;
        manifest.items['asset_001.mp4'] = item;
        manifest.items['intro_welcome'] = item;
      }
      if (baseKey === 'asset_002' || baseKey === 'level2_town_bg') {
        manifest.items['asset_002'] = item;
        manifest.items['asset_002.png'] = item;
        manifest.items['asset_002.webp'] = item;
        manifest.items['asset_002.jpg'] = item;
        manifest.items['level2_town_bg.webp'] = item;
        manifest.items['level2_town_bg.jpg'] = item;
      }

      saveManifest(manifest);

      res.json({
        success: true,
        item,
        url: mediaUrl
      });
    } catch (err: any) {
      console.error('Failed to upload media file:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server upload error' });
    }
  });

  apiRouter.post('/media/sync-batch', (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Expected array of items' });
      }

      const manifest = getManifest();
      let savedCount = 0;

      for (const entry of items) {
        const { key, dataUrl, filename } = entry;
        if (!key || !dataUrl) continue;

        try {
          const safeFilename = getSafeFilename(key, dataUrl, filename);
          const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) continue;

          const buffer = Buffer.from(matches[2], 'base64');
          const assetDest = path.join(ASSETS_DIR, safeFilename);
          const uploadDest = path.join(UPLOADS_DIR, safeFilename);

          try { fs.writeFileSync(assetDest, buffer); } catch {}
          try { fs.writeFileSync(uploadDest, buffer); } catch {}

          const mediaUrl = `/assets/${safeFilename}`;
          const item: ManifestItem = {
            key,
            filename: safeFilename,
            url: mediaUrl,
            updatedAt: new Date().toISOString(),
            size: buffer.length,
            mimeType: matches[1]
          };

          manifest.items[key] = item;
          const cleanKey = key.replace(/^__MEDIA__/, '').trim();
          if (cleanKey !== key) {
            manifest.items[cleanKey] = item;
          }
          savedCount++;
        } catch (e) {
          console.error(`Failed to batch write key: ${key}`, e);
        }
      }

      saveManifest(manifest);
      res.json({ success: true, savedCount, total: Object.keys(manifest.items).length });
    } catch (err: any) {
      console.error('Failed batch sync:', err);
      res.status(500).json({ success: false, error: err?.message || 'Batch sync error' });
    }
  });

  apiRouter.get('/media/export-backup', (_req, res) => {
    try {
      const manifest = getManifest();
      const backupData: Record<string, { filename: string; dataUrl: string; mimeType?: string }> = {};

      for (const [key, item] of Object.entries(manifest.items)) {
        const filePath = path.join(ASSETS_DIR, item.filename);
        if (fs.existsSync(filePath)) {
          const buf = fs.readFileSync(filePath);
          const mime = item.mimeType || 'image/png';
          backupData[key] = {
            filename: item.filename,
            mimeType: mime,
            dataUrl: `data:${mime};base64,${buf.toString('base64')}`
          };
        }
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="biovillage_media_backup.json"');
      res.json({
        exportDate: new Date().toISOString(),
        version: '1.0',
        items: backupData
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  apiRouter.get('/media/download-zip', (_req, res) => {
    try {
      const archive = typeof archiver === 'function' 
        ? archiver('zip', { zlib: { level: 9 } }) 
        : new archiver.ZipArchive({ zlib: { level: 9 } });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="biovillage_project_media.zip"');

      archive.on('error', (err: any) => {
        console.error('[Archive Error]', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: err?.message });
        }
      });

      archive.pipe(res);

      if (fs.existsSync(ASSETS_DIR)) {
        archive.directory(ASSETS_DIR, 'assets');
      }

      if (fs.existsSync(MANIFEST_FILE)) {
        archive.file(MANIFEST_FILE, { name: 'media_manifest.json' });
      }

      archive.finalize();
    } catch (err: any) {
      console.error('[Zip Route Error]', err);
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  apiRouter.delete('/media/:key', (req, res) => {
    try {
      const { key } = req.params;
      deleteOldMediaFilesForSlot(key);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Mount router under both '/api' and '/' to ensure 100% routing match in serverless rewrites
  app.use('/api', apiRouter);
  app.use(apiRouter);

  // Serve static assets directory if they exist
  try {
    if (fs.existsSync(ASSETS_DIR)) app.use('/assets', express.static(ASSETS_DIR));
    if (fs.existsSync(UPLOADS_DIR)) app.use('/uploads', express.static(UPLOADS_DIR));
    if (fs.existsSync(PUBLIC_DIR)) app.use(express.static(PUBLIC_DIR));
  } catch {}

  return app;
}

const app = createExpressApp();
export default app;
