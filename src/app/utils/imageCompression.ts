/**
 * Image compression utility
 * Compress images before converting to base64 to reduce payload size
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const defaultOptions: Required<CompressionOptions> = {
  maxWidth: 400,  // EXTREME compression for 5KB/s networks! (was 600)
  maxHeight: 400, // EXTREME compression for 5KB/s networks! (was 600)
  quality: 0.3,   // 30% quality - very aggressive but still usable (was 0.5)
};

/**
 * Compress image file and convert to base64
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxWidth, maxHeight, quality } = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Create canvas and compress
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

          // Log compression stats
          const originalSize = (file.size / 1024).toFixed(2);
          const compressedSize = (compressedBase64.length * 0.75 / 1024).toFixed(2);
          console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB`);

          resolve(compressedBase64);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: (File | Blob)[],
  options: CompressionOptions = {}
): Promise<string[]> {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File | Blob): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get file size in KB
 */
export function getFileSizeKB(file: File | Blob): number {
  return file.size / 1024;
}