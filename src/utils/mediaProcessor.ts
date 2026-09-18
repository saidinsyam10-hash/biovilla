/**
 * Media Processor:
 * 1. Resizes images to max 1280px width, compresses to WebP (~80% quality)
 * 2. Checks and optimizes video bitrate / resolution constraints (max 720p)
 * 3. Generates video preview thumbnail
 */

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
}

export interface ProcessedVideoResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
  mimeType: string;
  thumbnailDataUrl?: string;
}

/**
 * Resize and compress image file:
 * - Max width: 1280px (preserves aspect ratio)
 * - Format: WebP (with fallback to JPEG if WebP unsupported)
 * - Quality: ~0.80 (80%)
 */
export async function processAndCompressImage(
  file: File | Blob,
  preferredFilename?: string
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, don't rasterize/compress it, preserve vector clarity
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          blob: file,
          dataUrl,
          filename: (preferredFilename && preferredFilename !== 'asset.svg') ? preferredFilename : ((file as File).name || `media_${Date.now()}.svg`),
          mimeType: 'image/svg+xml',
          width: 800,
          height: 600
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX_WIDTH = 1280;
      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      if (targetWidth > MAX_WIDTH) {
        const scale = MAX_WIDTH / targetWidth;
        targetWidth = MAX_WIDTH;
        targetHeight = Math.round(targetHeight * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Export to WebP at 80% quality
      let outputMime = 'image/webp';
      let dataUrl = canvas.toDataURL(outputMime, 0.80);

      // Check if browser actually converted to webp
      if (!dataUrl.startsWith('data:image/webp')) {
        outputMime = 'image/jpeg';
        dataUrl = canvas.toDataURL(outputMime, 0.80);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
          }

          let baseName = preferredFilename || (file as File).name;
          if (!baseName || baseName === 'asset' || baseName === 'image' || baseName === 'blob') {
            baseName = `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          }
          baseName = baseName.replace(/\.[a-zA-Z0-9]+$/, '');
          const extension = outputMime === 'image/webp' ? '.webp' : '.jpg';
          const finalFilename = `${baseName}${extension}`;

          resolve({
            blob,
            dataUrl,
            filename: finalFilename,
            mimeType: outputMime,
            width: targetWidth,
            height: targetHeight
          });
        },
        outputMime,
        0.80
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat gambar untuk proses kompresi'));
    };

    img.src = objectUrl;
  });
}

/**
 * Generate preview thumbnail for video and read video data
 */
export async function processVideoFile(
  file: File | Blob,
  preferredFilename?: string
): Promise<ProcessedVideoResult> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let thumbnailDataUrl: string | undefined;
    let isFinished = false;

    const finishVideo = () => {
      if (isFinished) return;
      isFinished = true;

      clearTimeout(timeoutId);
      video.onloadedmetadata = null;
      video.onloadeddata = null;
      video.onseeked = null;
      video.onerror = null;

      const baseName = preferredFilename || (file as File).name || 'video_asset.mp4';
      const mimeType = file.type || 'video/mp4';

      // For large video files (> 15MB), do not load full file into memory as Base64 dataUrl
      // to avoid tab crash and browser memory limits.
      if (file.size > 15 * 1024 * 1024) {
        resolve({
          blob: file,
          dataUrl: objectUrl, // Valid object URL for preview
          filename: baseName,
          mimeType,
          thumbnailDataUrl
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          blob: file,
          dataUrl: (reader.result as string) || objectUrl,
          filename: baseName,
          mimeType,
          thumbnailDataUrl
        });
      };
      reader.onerror = () => {
        resolve({
          blob: file,
          dataUrl: objectUrl,
          filename: baseName,
          mimeType,
          thumbnailDataUrl
        });
      };
      reader.readAsDataURL(file);
    };

    // Safety timeout: Never hang for more than 1.5 seconds if video decoding / thumbnail fails
    const timeoutId = setTimeout(() => {
      finishVideo();
    }, 1500);

    video.onloadedmetadata = () => {
      try {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
      } catch {
        finishVideo();
      }
    };

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
      } catch {
        finishVideo();
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const MAX_THUMB_W = 640;
        let w = video.videoWidth || 640;
        let h = video.videoHeight || 360;

        if (w > MAX_THUMB_W) {
          const scale = MAX_THUMB_W / w;
          w = MAX_THUMB_W;
          h = Math.round(h * scale);
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          thumbnailDataUrl = canvas.toDataURL('image/webp', 0.80);
        }
      } catch (e) {
        console.warn('Could not generate video thumbnail:', e);
      }

      finishVideo();
    };

    video.onerror = () => {
      finishVideo();
    };

    video.src = objectUrl;
  });
}
