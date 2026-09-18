import { 
  saveMediaBlob, 
  getMediaObjectURL, 
  getCustomMediaUrl, 
  saveCustomMediaUrl, 
  deleteCustomMediaUrl, 
  deleteMediaBlob, 
  notifyMediaUpdated 
} from './mediaStore';

export const LANDING_PAGE_VIDEO_KEY = 'landing_page_video';
export const INTRO_WELCOME_ASSET_KEY = 'landing_page_video';
const DEFAULT_WELCOME_VIDEO = '/assets/landing_page_video.mp4';
const FALLBACK_WELCOME_VIDEO = '/assets/asset_001.mp4';

/**
 * Mendapatkan URL video welcome/landing page yang sedang aktif:
 * 1. URL kustom yang disimpan (misal link YouTube / link eksternal / server kustom)
 * 2. Blob IndexedDB lokal (jika ada)
 * 3. Berkas permanen server: /assets/landing_page_video.mp4 (atau fallback /assets/asset_001.mp4)
 * JAMINAN: Fungsi ini sepenuhnya terisolasi dan tidak mempengaruhi berkas level apa pun.
 */
export async function getWelcomeVideoUrl(): Promise<string> {
  // 1. Cek custom media URL (khusus landing page)
  const customUrl = 
    getCustomMediaUrl(LANDING_PAGE_VIDEO_KEY) || 
    getCustomMediaUrl('landing_page_video.mp4') || 
    getCustomMediaUrl('intro_welcome');
  if (customUrl) return customUrl;

  // 2. Cek IndexedDB Blob lokal
  try {
    const blobUrl = 
      await getMediaObjectURL(LANDING_PAGE_VIDEO_KEY) || 
      await getMediaObjectURL('landing_page_video.mp4');
    if (blobUrl) return blobUrl;
  } catch {}

  // 3. Cek ketersediaan berkas landing_page_video.mp4 di server
  try {
    const headRes = await fetch(DEFAULT_WELCOME_VIDEO, { method: 'HEAD' });
    if (headRes.ok) return DEFAULT_WELCOME_VIDEO;
  } catch {}

  // 4. Gunakan video default bawaan
  return DEFAULT_WELCOME_VIDEO;
}

/**
 * Unggah video landing page LANGSUNG ke SERVER disk (/api/media/upload-file).
 * Disimpan dengan slot key terisolasi 'landing_page_video'.
 * JAMINAN ISOLASI: Tidak menyentuh atau menghapus berkas level manapun (asset_035, asset_043, dst.).
 */
export async function uploadWelcomeVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
    return { success: false, error: 'Format berkas harus berupa video (MP4, WebM, MOV, atau MKV).' };
  }

  return new Promise((resolve) => {
    try {
      const formData = new FormData();
      const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
      const ext = extMatch ? extMatch[0].toLowerCase() : '.mp4';
      const targetFilename = `landing_page_video${ext}`;

      formData.append('file', file, targetFilename);
      formData.append('key', LANDING_PAGE_VIDEO_KEY);
      formData.append('filename', targetFilename);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media/upload-file', true);

      // Pantau progress unggahan langsung ke server
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            const serverUrl = res.url || `/assets/${targetFilename}`;

            // Simpan juga ke IndexedDB lokal untuk pemutaran instan tanpa buffer
            try {
              await saveMediaBlob(LANDING_PAGE_VIDEO_KEY, file, targetFilename);
              await saveMediaBlob('landing_page_video.mp4', file, targetFilename);
            } catch {}

            // Simpan cache URL lokal
            saveCustomMediaUrl(LANDING_PAGE_VIDEO_KEY, serverUrl);
            saveCustomMediaUrl('landing_page_video.mp4', serverUrl);

            notifyMediaUpdated();

            resolve({
              success: true,
              url: serverUrl
            });
          } catch (jsonErr: any) {
            resolve({
              success: false,
              error: 'Respons server tidak valid: ' + jsonErr.message
            });
          }
        } else {
          let errorMsg = 'Gagal mengunggah video ke server';
          try {
            const json = JSON.parse(xhr.responseText);
            if (json.error) errorMsg = json.error;
          } catch {}
          resolve({
            success: false,
            error: `${errorMsg} (HTTP ${xhr.status})`
          });
        }
      };

      xhr.onerror = () => {
        resolve({
          success: false,
          error: 'Terjadi kegagalan jaringan saat mengunggah video ke server.'
        });
      };

      xhr.send(formData);
    } catch (err: any) {
      resolve({
        success: false,
        error: err?.message || 'Gagal memulai unggahan video ke server.'
      });
    }
  });
}

/**
 * Reset video landing page kembali ke video default bawaan.
 * Hanya membersihkan slot 'landing_page_video'.
 * Berkas-berkas di setiap level game dijamin 100% aman dan tidak terpengaruh.
 */
export async function resetWelcomeVideo(): Promise<void> {
  // Hapus berkas kustom landing page di server
  try {
    await fetch(`/api/media/${LANDING_PAGE_VIDEO_KEY}`, { method: 'DELETE' });
  } catch {}

  deleteCustomMediaUrl(LANDING_PAGE_VIDEO_KEY);
  deleteCustomMediaUrl('landing_page_video.mp4');
  deleteCustomMediaUrl('intro_welcome');

  try {
    await deleteMediaBlob(LANDING_PAGE_VIDEO_KEY);
    await deleteMediaBlob('landing_page_video.mp4');
    await deleteMediaBlob('intro_welcome');
  } catch {}

  notifyMediaUpdated();
}

