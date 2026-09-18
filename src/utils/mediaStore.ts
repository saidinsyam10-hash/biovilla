// Media Store with Permanent Server File Persistence, IndexedDB, and Local Storage sync
import { processAndCompressImage, processVideoFile } from './mediaProcessor';

const DB_NAME = 'biovillage_media_db';
const STORE_NAME = 'media_blobs';

// Cache for permanent server URLs loaded from /api/media/all
const serverMediaCache: Record<string, string> = {};
// In-memory session object URLs for immediate preview and offline protection
const sessionBlobUrls: Record<string, string> = {};
let isInitialized = false;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const listeners = new Set<() => void>();

export function onMediaUpdated(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function notifyMediaUpdated(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

// Convert Blob to Base64 data URL
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Upload single media / video file directly using FormData (Supports up to 500MB, zero Base64 memory overhead)
export async function uploadMediaFileServer(
  key: string,
  file: File | Blob,
  customFilename?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    const formData = new FormData();
    const originalName = customFilename || (file as File).name || `${cleanKey}.mp4`;

    formData.append('file', file, originalName);
    formData.append('key', key);
    formData.append('filename', originalName);

    const res = await fetch('/api/media/upload-file', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Gagal mengunggah berkas ke server';
      try {
        const json = JSON.parse(errText);
        if (json.error) errMsg = json.error;
      } catch {}
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    if (data.url) {
      serverMediaCache[key] = data.url;
      serverMediaCache[cleanKey] = data.url;
      const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
      if (baseKey && baseKey !== cleanKey && !baseKey.includes('slide') && !baseKey.includes('hotspot')) {
        serverMediaCache[baseKey] = data.url;
      }

      // Synchronously record permanent mapping in browser localStorage
      saveCustomMediaUrl(key, data.url);
      saveCustomMediaUrl(cleanKey, data.url);
      if (baseKey && baseKey !== cleanKey) {
        saveCustomMediaUrl(baseKey, data.url);
      }

      // Cache binary into IndexedDB across all key variants for offline browser persistence
      try {
        const db = await openDB();
        await new Promise<void>((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(file, key);
          tx.objectStore(STORE_NAME).put(file, cleanKey);
          if (baseKey && baseKey !== cleanKey) {
            tx.objectStore(STORE_NAME).put(file, baseKey);
          }
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      } catch {}

      notifyMediaUpdated();
      return { success: true, url: data.url };
    }
    return { success: false, error: 'Respons server tidak memuat tautan media' };
  } catch (err: any) {
    console.error('Error in uploadMediaFileServer:', err);
    return { success: false, error: err?.message || 'Gagal mengirim berkas ke server' };
  }
}

// Persist single media item to server disk (public/assets/) with auto-compression & resizing
async function persistToServer(key: string, fileOrDataUrl: Blob | string, filename?: string): Promise<string | null> {
  try {
    let dataUrl: string;
    let mimeType: string | undefined;
    let finalFilename = filename;

    if (typeof fileOrDataUrl === 'string') {
      dataUrl = fileOrDataUrl;
    } else {
      const inputBlob = fileOrDataUrl;
      mimeType = inputBlob.type;
      const cleanKey = key.replace(/^__MEDIA__/, '').trim();
      const originalName = filename || cleanKey;

      if (inputBlob.type.startsWith('image/')) {
        try {
          const processed = await processAndCompressImage(inputBlob, originalName);
          dataUrl = processed.dataUrl;
          mimeType = processed.mimeType;
          finalFilename = processed.filename;
        } catch (procErr) {
          console.warn('[MediaStore] Image compression fallback to raw:', procErr);
          dataUrl = await blobToDataUrl(inputBlob);
        }
      } else if (inputBlob.type.startsWith('video/')) {
        // Direct binary upload for video
        const result = await uploadMediaFileServer(key, inputBlob, originalName);
        if (result.success && result.url) return result.url;
        return null;
      } else {
        dataUrl = await blobToDataUrl(inputBlob);
      }
    }

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, dataUrl, filename: finalFilename, mimeType })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        serverMediaCache[key] = data.url;
        const cleanKey = key.replace(/^__MEDIA__/, '').trim();
        serverMediaCache[cleanKey] = data.url;
        const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
        if (baseKey && baseKey !== cleanKey && !baseKey.includes('slide') && !baseKey.includes('hotspot')) {
          serverMediaCache[baseKey] = data.url;
        }

        // Save to browser localStorage mapping for instant persistence
        saveCustomMediaUrl(key, data.url);
        saveCustomMediaUrl(cleanKey, data.url);
        if (baseKey && baseKey !== cleanKey) {
          saveCustomMediaUrl(baseKey, data.url);
        }

        return data.url;
      }
    }
  } catch (err) {
    console.warn('[MediaStore] Server persistence note:', err);
  }
  return null;
}

export async function saveMediaBlob(key: string, file: Blob, customFilename?: string): Promise<void> {
  const cleanKey = key.replace(/^__MEDIA__/, '').trim();
  const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
  const filename = customFilename || (file as File).name || '';
  const isVideo = file.type.startsWith('video/') ||
    /\.(mp4|webm|mov|mkv|avi)$/i.test(filename) ||
    cleanKey.toLowerCase().includes('video') ||
    ['asset_001', 'asset_035', 'asset_043', 'asset_047', 'asset_049', 'asset_061'].includes(cleanKey);

  // Store in-memory session object URL immediately for instant rendering without lag
  try {
    const sessionUrl = URL.createObjectURL(file);
    sessionBlobUrls[key] = sessionUrl;
    sessionBlobUrls[cleanKey] = sessionUrl;
    if (baseKey !== cleanKey) sessionBlobUrls[baseKey] = sessionUrl;
  } catch {}

  // Cache into IndexedDB for offline / local persistence across reloads
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(file, key);
      tx.objectStore(STORE_NAME).put(file, cleanKey);
      if (baseKey !== cleanKey) tx.objectStore(STORE_NAME).put(file, baseKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve(); // Ignore quota errors
    });
  } catch {}

  // For video files, always use high-capacity multipart FormData upload to bypass Base64 memory limits
  if (isVideo) {
    try {
      const uploadResult = await uploadMediaFileServer(key, file, customFilename || (file as File).name);
      if (uploadResult.success && uploadResult.url) {
        serverMediaCache[key] = uploadResult.url;
        serverMediaCache[cleanKey] = uploadResult.url;
        if (baseKey !== cleanKey) serverMediaCache[baseKey] = uploadResult.url;
        saveCustomMediaUrl(key, uploadResult.url);
        saveCustomMediaUrl(cleanKey, uploadResult.url);
        if (baseKey !== cleanKey) saveCustomMediaUrl(baseKey, uploadResult.url);
      }
    } catch (err) {
      console.warn('[MediaStore] Video upload server note:', err);
    }
    notifyMediaUpdated();
    return;
  }

  try {
    let blobToSave = file;
    // Compress image before saving to local IndexedDB as well to preserve local quota
    if (file.type.startsWith('image/')) {
      try {
        const processed = await processAndCompressImage(file, cleanKey);
        blobToSave = processed.blob;
      } catch {
        // use original
      }
    }

    try {
      const db = await openDB();
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(blobToSave, key);
        tx.objectStore(STORE_NAME).put(blobToSave, cleanKey);
        if (baseKey !== cleanKey) tx.objectStore(STORE_NAME).put(blobToSave, baseKey);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve(); // Ignore quota errors
      });
    } catch {}

    // Synchronously ensure permanent persistence to project server disk (/public/assets/)
    try {
      const serverUrl = await persistToServer(key, blobToSave, cleanKey);
      if (serverUrl) {
        serverMediaCache[key] = serverUrl;
        serverMediaCache[cleanKey] = serverUrl;
        if (baseKey !== cleanKey) serverMediaCache[baseKey] = serverUrl;
        saveCustomMediaUrl(key, serverUrl);
        saveCustomMediaUrl(cleanKey, serverUrl);
        if (baseKey !== cleanKey) saveCustomMediaUrl(baseKey, serverUrl);
      }
    } catch (persistErr) {
      console.warn('[MediaStore] Server persistence note:', persistErr);
    }

    notifyMediaUpdated();
  } catch (err) {
    console.warn('Failed to save to IndexedDB', err);
    throw err;
  }
}

// Convert video URL (like YouTube / Google Drive / direct link) to embed format if necessary
export function formatVideoEmbed(url: string | null | undefined): { isEmbed: boolean; embedUrl: string } {
  if (!url) return { isEmbed: false, embedUrl: '' };
  const trimmed = url.trim();

  // YouTube detection (Standard, Short, or Embed)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`
    };
  }

  // Google Drive video preview link
  const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`
    };
  }

  return { isEmbed: false, embedUrl: trimmed };
}

/**
 * Konversi otomatis URL gambar eksternal (Google Drive, Dropbox, dll.) menjadi direct image link
 * agar tidak diblokir browser karena CORS / Hotlinking dan langsung tampil dengan jernih.
 */
export function formatImageDirectUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. Google Drive direct link conversion
  const gdriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?id=([a-zA-Z0-9_-]+))/i);
  const fileId = gdriveMatch ? (gdriveMatch[1] || gdriveMatch[2] || gdriveMatch[3]) : null;
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Dropbox conversion to direct download
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
  }

  return trimmed;
}

export async function deleteMediaBlob(key: string): Promise<void> {
  try {
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

    delete sessionBlobUrls[key];
    delete sessionBlobUrls[cleanKey];
    delete sessionBlobUrls[baseKey];

    delete serverMediaCache[key];
    delete serverMediaCache[cleanKey];
    delete serverMediaCache[baseKey];

    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.objectStore(STORE_NAME).delete(cleanKey);
      if (baseKey !== cleanKey) tx.objectStore(STORE_NAME).delete(baseKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    fetch(`/api/media/${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => {});

    notifyMediaUpdated();
  } catch (err) {
    console.warn('Failed to delete from IndexedDB', err);
  }
}

export async function getMediaBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getMediaObjectURL(key: string): Promise<string | null> {
  const cleanKey = key.replace(/^__MEDIA__/, '').trim();
  const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

  // 1. In-memory session URL (immediate user action in this session)
  if (sessionBlobUrls[cleanKey]) return sessionBlobUrls[cleanKey];
  if (sessionBlobUrls[key]) return sessionBlobUrls[key];
  if (sessionBlobUrls[baseKey]) return sessionBlobUrls[baseKey];

  // 2. Custom URL saved by user (YouTube / Google Drive / External URL)
  const customUrl = getCustomMediaUrl(cleanKey) || getCustomMediaUrl(baseKey) || getCustomMediaUrl(key);
  if (customUrl) return customUrl;

  // 3. Local browser IndexedDB persistence
  const blob = await getMediaBlob(cleanKey) || (cleanKey !== key ? await getMediaBlob(key) : null) || (baseKey !== cleanKey ? await getMediaBlob(baseKey) : null);
  if (blob) {
    const url = URL.createObjectURL(blob);
    sessionBlobUrls[cleanKey] = url;
    return url;
  }

  // 4. In-memory permanent server cache (verified on disk)
  if (serverMediaCache[cleanKey]) return serverMediaCache[cleanKey];
  if (serverMediaCache[baseKey]) return serverMediaCache[baseKey];
  if (serverMediaCache[key]) return serverMediaCache[key];

  return null;
}

export function getCustomMediaUrl(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

    const data = localStorage.getItem('biovillage_custom_media_urls');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed[cleanKey] || parsed[baseKey] || parsed[key] || null;
  } catch {
    return null;
  }
}

export function saveCustomMediaUrl(key: string, url: string): void {
  try {
    if (typeof window === 'undefined') return;
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
    const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || /\.(mp4|webm|mov)$/i.test(url);
    const finalUrl = isVideo ? url.trim() : formatImageDirectUrl(url);
    const data = localStorage.getItem('biovillage_custom_media_urls');
    const parsed = data ? JSON.parse(data) : {};
    parsed[key] = finalUrl;
    parsed[cleanKey] = finalUrl;
    if (baseKey !== cleanKey) parsed[baseKey] = finalUrl;
    localStorage.setItem('biovillage_custom_media_urls', JSON.stringify(parsed));

    // Update in-memory server cache synchronously
    serverMediaCache[key] = finalUrl;
    serverMediaCache[cleanKey] = finalUrl;
    if (baseKey !== cleanKey) serverMediaCache[baseKey] = finalUrl;

    // Sinkronkan ke server manifest secara permanen
    try {
      fetch('/api/media/custom-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cleanKey, url: finalUrl })
      }).catch(err => console.warn('[MediaStore] Server custom-url sync note:', err));
    } catch {}

    // If it's a data URL, persist permanently to server disk
    if (url.startsWith('data:')) {
      persistToServer(key, url).then(() => {
        notifyMediaUpdated();
      });
    }

    notifyMediaUpdated();
  } catch (e) {
    console.error(e);
  }
}

export function deleteCustomMediaUrl(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    const cleanKey = key.replace(/^__MEDIA__/, '').trim();
    const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');
    const data = localStorage.getItem('biovillage_custom_media_urls');
    if (!data) return;
    const parsed = JSON.parse(data);
    delete parsed[key];
    delete parsed[cleanKey];
    if (baseKey !== cleanKey) delete parsed[baseKey];
    localStorage.setItem('biovillage_custom_media_urls', JSON.stringify(parsed));
    notifyMediaUpdated();
  } catch (e) {
    console.error(e);
  }
}

export async function getMediaResolvedURL(key: string): Promise<string | null> {
  const cleanKey = key.replace(/^__MEDIA__/, '').trim();
  const baseKey = cleanKey.replace(/\.[a-zA-Z0-9]+$/, '');

  // 1. In-memory session URL
  if (sessionBlobUrls[cleanKey]) return sessionBlobUrls[cleanKey];
  if (sessionBlobUrls[key]) return sessionBlobUrls[key];
  if (sessionBlobUrls[baseKey]) return sessionBlobUrls[baseKey];

  // 2. Custom URL saved by user (YouTube / Google Drive / External URL)
  const rawCustomUrl = getCustomMediaUrl(cleanKey) || getCustomMediaUrl(baseKey) || getCustomMediaUrl(key);
  if (rawCustomUrl) {
    return formatImageDirectUrl(rawCustomUrl);
  }

  // 3. Local browser IndexedDB persistence
  const blob = await getMediaBlob(cleanKey) || (baseKey !== cleanKey ? await getMediaBlob(baseKey) : null) || await getMediaBlob(key);
  if (blob) {
    const url = URL.createObjectURL(blob);
    sessionBlobUrls[cleanKey] = url;
    return url;
  }

  // 4. Permanent server cache (verified on disk / manifest)
  if (serverMediaCache[cleanKey]) return formatImageDirectUrl(serverMediaCache[cleanKey]);
  if (serverMediaCache[baseKey]) return formatImageDirectUrl(serverMediaCache[baseKey]);
  if (serverMediaCache[key]) return formatImageDirectUrl(serverMediaCache[key]);

  return null;
}

/**
 * Returns candidate URLs for the given asset identifier.
 * Supports variations like "asset 001", "asset_001.mp4", "asset_002", etc.
 */
export function getAssetCandidates(assetName: string, defaultExt: string = 'png'): string[] {
  const clean = assetName.replace(/^__MEDIA__/, '').trim();
  const baseWithoutExt = clean.replace(/\.[a-zA-Z0-9]+$/, '');
  const baseUnderscore = baseWithoutExt.replace(/\s+/g, '_');
  const baseSpace = baseWithoutExt.replace(/_+/g, ' ');

  const extensions = defaultExt === 'mp4' 
    ? ['.mp4', '.webm', ''] 
    : ['.png', '.jpeg', '.jpg', '.webp', ''];

  const results: string[] = [];

  // Check if server media cache has a direct URL
  if (serverMediaCache[clean]) results.push(serverMediaCache[clean]);
  if (serverMediaCache[baseUnderscore]) results.push(serverMediaCache[baseUnderscore]);

  // Exact first
  results.push(`/assets/${clean}`);
  results.push(`/assets/${encodeURIComponent(clean)}`);
  results.push(`/${clean}`);
  results.push(`/${encodeURIComponent(clean)}`);

  // Stage 0 Petunjuk aliases
  if (clean.includes('015') || clean.toLowerCase().includes('petunjuk')) {
    results.push('/assets/asset_015.jpeg');
    results.push('/assets/asset_015.jpg');
    results.push('/assets/asset_015.webp');
    results.push('/assets/petunjuk_image.webp');
    results.push('/assets/Gemini_Generated_Image_m2ivxjm2ivxjm2iv.jpg');
    results.push('/Gemini_Generated_Image_m2ivxjm2ivxjm2iv.jpg');
    results.push('Gemini_Generated_Image_m2ivxjm2ivxjm2iv.jpg');
  }

  // Fallback for dropzone-specific assets to base asset if not yet uploaded
  if (clean.includes('_dz.')) {
    const originalAsset = clean.replace('_dz.', '.');
    results.push(`/assets/${originalAsset}`);
  }

  // Variations with underscore and space
  extensions.forEach(ext => {
    const withExtUnderscore = `${baseUnderscore}${ext}`;
    const withExtSpace = `${baseSpace}${ext}`;
    
    if (!results.includes(`/assets/${withExtUnderscore}`)) {
      results.push(`/assets/${withExtUnderscore}`);
    }
    if (!results.includes(`/assets/${encodeURIComponent(withExtSpace)}`)) {
      results.push(`/assets/${encodeURIComponent(withExtSpace)}`);
      results.push(`/assets/${withExtSpace}`);
    }
  });

  return Array.from(new Set(results));
}

/**
 * Initialize Media Store:
 * 1. Pulls all permanently persisted media from server manifest (/api/media/all)
 * 2. Sweeps any IndexedDB or localStorage items and syncs them to server disk
 */
export async function initMediaStore(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  try {
    // 1. Fetch server manifest
    const res = await fetch('/api/media/all');
    if (res.ok) {
      const data = await res.json();
      if (data.items) {
        Object.entries(data.items).forEach(([k, item]: [string, any]) => {
          if (item?.url) {
            serverMediaCache[k] = item.url;
            const clean = k.replace(/^__MEDIA__/, '').trim();
            serverMediaCache[clean] = item.url;
            const baseKey = clean.replace(/\.[a-zA-Z0-9]+$/, '');
            if (baseKey && baseKey !== clean) {
              serverMediaCache[baseKey] = item.url;
            }
            saveCustomMediaUrl(k, item.url);
            saveCustomMediaUrl(clean, item.url);
            if (baseKey && baseKey !== clean) {
              saveCustomMediaUrl(baseKey, item.url);
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('[MediaStore] Server fetch failed, running local mode:', err);
  }

  // 2. Sync local IndexedDB items to server disk if needed
  try {
    const db = await openDB();
    const itemsToSync: Array<{ key: string; dataUrl: string; filename?: string }> = [];
    const rawEntries: Array<{ key: string; blob: Blob }> = [];

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          rawEntries.push({ key: String(cursor.key), blob: cursor.value as Blob });
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => resolve();
    });

    // Process blobs to data URLs outside the transaction
    for (const entry of rawEntries) {
      if (!serverMediaCache[entry.key] && entry.blob) {
        try {
          const dataUrl = await blobToDataUrl(entry.blob);
          itemsToSync.push({ key: entry.key, dataUrl, filename: (entry.blob as File).name });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Also check localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('biovillage_custom_media_urls');
        if (raw) {
          const parsed = JSON.parse(raw);
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === 'string' && v.startsWith('data:') && !serverMediaCache[k]) {
              itemsToSync.push({ key: k, dataUrl: v });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (itemsToSync.length > 0) {
      console.log(`[MediaStore] Syncing ${itemsToSync.length} browser media items permanently to project disk...`);
      const syncRes = await fetch('/api/media/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSync })
      });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        console.log(`[MediaStore] Synchronized ${syncData.savedCount} items to project disk!`);
      }
    }

    notifyMediaUpdated();
  } catch (err) {
    console.warn('[MediaStore] Local sync error:', err);
  }
}

/**
 * Manually trigger full synchronization of all browser media to server disk
 */
export async function syncAllMediaToProject(): Promise<{ synced: number; total: number }> {
  try {
    const db = await openDB();
    const itemsToSync: Array<{ key: string; dataUrl: string; filename?: string }> = [];

    const rawEntries: Array<{ key: string; blob: Blob }> = [];

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          rawEntries.push({ key: String(cursor.key), blob: cursor.value as Blob });
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => resolve();
    });

    for (const entry of rawEntries) {
      if (entry.blob) {
        try {
          const dataUrl = await blobToDataUrl(entry.blob);
          itemsToSync.push({ key: entry.key, dataUrl, filename: (entry.blob as File).name });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Also localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('biovillage_custom_media_urls');
        if (raw) {
          const parsed = JSON.parse(raw);
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === 'string' && v.startsWith('data:')) {
              itemsToSync.push({ key: k, dataUrl: v });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    const res = await fetch('/api/media/sync-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToSync })
    });

    if (res.ok) {
      const data = await res.json();
      // Re-fetch manifest
      const ref = await fetch('/api/media/all');
      if (ref.ok) {
        const allData = await ref.json();
        if (allData.items) {
          Object.entries(allData.items).forEach(([k, item]: [string, any]) => {
            if (item?.url) {
              serverMediaCache[k] = item.url;
              serverMediaCache[k.replace(/^__MEDIA__/, '').trim()] = item.url;
            }
          });
        }
      }
      notifyMediaUpdated();
      return { synced: data.savedCount || 0, total: data.total || 0 };
    }
  } catch (err) {
    console.error('Failed to sync all media:', err);
  }
  return { synced: 0, total: 0 };
}

/**
 * Trigger download of full project media backup JSON
 */
export function downloadMediaBackup(): void {
  window.open('/api/media/export-backup', '_blank');
}

/**
 * Trigger download of all project media as a ZIP file
 */
export function downloadMediaZip(): void {
  window.open('/api/media/download-zip', '_blank');
}

/**
 * Restore media backup from JSON file
 */
export async function restoreMediaBackup(jsonFile: File): Promise<boolean> {
  try {
    const text = await jsonFile.text();
    const parsed = JSON.parse(text);
    if (!parsed.items || typeof parsed.items !== 'object') {
      throw new Error('Format cadangan tidak valid');
    }

    const itemsToSync: Array<{ key: string; dataUrl: string; filename?: string }> = [];
    for (const [key, item] of Object.entries(parsed.items) as [string, any][]) {
      if (item.dataUrl) {
        itemsToSync.push({ key, dataUrl: item.dataUrl, filename: item.filename });
        // Also write to IndexedDB
        try {
          const res = await fetch(item.dataUrl);
          const blob = await res.blob();
          const db = await openDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(blob, key);
        } catch (e) {
          console.warn('IndexedDB restore failed for key', key, e);
        }
      }
    }

    const res = await fetch('/api/media/sync-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToSync })
    });

    if (res.ok) {
      // Refresh server cache
      const ref = await fetch('/api/media/all');
      if (ref.ok) {
        const allData = await ref.json();
        if (allData.items) {
          Object.entries(allData.items).forEach(([k, item]: [string, any]) => {
            if (item?.url) {
              serverMediaCache[k] = item.url;
              serverMediaCache[k.replace(/^__MEDIA__/, '').trim()] = item.url;
            }
          });
        }
      }
      notifyMediaUpdated();
      return true;
    }
  } catch (err) {
    console.error('Restore error:', err);
  }
  return false;
}
