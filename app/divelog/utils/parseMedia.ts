import { list } from '@vercel/blob';
import { MediaFile } from './mediaTypes';

// Parse timestamp from DJI filename formats:
// - dji_export_YYYYMMDD_HHMMSS_...
// - dji_mimo_YYYYMMDD_HHMMSS_...
function parseTimestampFromFilename(filename: string): Date | null {
  // Match patterns like: dji_export_20251223_085443 or dji_mimo_20251225_064012
  const match = filename.match(/(?:dji_export|dji_mimo)_(\d{8})_(\d{6})/);
  if (!match) return null;
  
  const dateStr = match[1]; // YYYYMMDD
  const timeStr = match[2]; // HHMMSS
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(timeStr.substring(0, 2));
  const minute = parseInt(timeStr.substring(2, 4));
  const second = parseInt(timeStr.substring(4, 6));
  
  // Use UTC to ensure consistent timestamps across server and client (prevents timezone issues)
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

// Extract original filename from blob pathname
// Blob pathname format: {original-filename}-{random-suffix}.{extension}
// Example: dji_mimo_20251226_145248_0_1767007947505_photo-p89QdUbLEGDra66DEbrDNkzr1yK75p.webp
// Original: dji_mimo_20251226_145248_0_1767007947505_photo.jpg
function extractOriginalFilename(pathname: string): string {
  // Remove the random suffix (everything after the last dash before the extension)
  // The random suffix appears to be a base64-like string (typically 20-40 chars)
  const lastDotIndex = pathname.lastIndexOf('.');
  if (lastDotIndex === -1) return pathname;
  
  const extension = pathname.substring(lastDotIndex);
  const nameWithoutExt = pathname.substring(0, lastDotIndex);
  
  // Find the last dash before what looks like a random suffix
  // Random suffixes are typically alphanumeric and around 20-40 chars
  // Pattern: original-filename-randomSuffix
  // We'll look for a dash followed by a long alphanumeric string at the end
  const dashMatch = nameWithoutExt.match(/^(.+)-([A-Za-z0-9]{15,})$/);
  if (dashMatch) {
    const originalName = dashMatch[1];
    const randomSuffix = dashMatch[2];
    
    // Verify it's likely a random suffix (not part of the original filename)
    // Original DJI filenames don't typically have such long alphanumeric suffixes
    // If the "suffix" is actually part of the original (like a timestamp), keep it
    // But if it's a random-looking string, remove it
    
    // Try to infer original extension
    // If it's webp, it was likely converted from jpg/jpeg/png
    if (extension === '.webp') {
      if (originalName.includes('photo')) {
        return originalName + '.jpg';
      } else if (originalName.includes('video')) {
        return originalName + '.mp4';
      }
      // Default to jpg for webp images
      return originalName + '.jpg';
    }
    
    // For other extensions, keep the extension but remove the random suffix
    return originalName + extension;
  }
  
  // If no dash pattern found, return as-is (might be original filename)
  return pathname;
}

// Extract matching key from filename: date + time + unix timestamp
// Format: dji_mimo_20251226_145248_0_1767007947505_photo-randomSuffix.webp
// Or: dji_export_20251223_085654_1766455014690_editor.webm (no number between time and timestamp)
// Returns: dji_mimo_20251226_145248_0_1767007947505_photo or dji_export_20251223_085654_1766455014690_editor
function getMatchingKey(pathname: string): string | null {
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
  // Remove thumbnail- prefix if present
  const baseFilename = filename.startsWith('thumbnail-') 
    ? filename.substring('thumbnail-'.length) 
    : filename;
  
  // Match: dji_export|dji_mimo + _YYYYMMDD + _HHMMSS + (_number)? + _unixTimestamp + _suffix
  // The number between time and timestamp is optional (some files have it, some don't)
  // Match everything up to and including the suffix word, stopping before dash or dot
  const match = baseFilename.match(/^(dji_export|dji_mimo)_\d{8}_\d{6}(?:_\d+)?_\d{13}_[a-zA-Z]+/);
  if (!match) return null;
  
  // Return the matched portion (everything up to the suffix word)
  return match[0];
}

export async function parseMediaFiles(): Promise<MediaFile[]> {
  try {
    // List all blobs from Vercel Blob Storage
    const { blobs } = await list();
    
    // Group blobs by matching key (date + time + unix timestamp)
    const blobMap = new Map<string, { fullsize?: typeof blobs[0]; thumbnail?: typeof blobs[0] }>();
    
    for (const blob of blobs) {
      const matchingKey = getMatchingKey(blob.pathname);
      if (!matchingKey) continue; // Skip if we can't extract matching key
      
      const filename = blob.pathname.substring(blob.pathname.lastIndexOf('/') + 1);
      const isThumbnail = filename.startsWith('thumbnail-');
      
      if (!blobMap.has(matchingKey)) {
        blobMap.set(matchingKey, {});
      }
      
      const entry = blobMap.get(matchingKey)!;
      if (isThumbnail) {
        entry.thumbnail = blob;
      } else {
        entry.fullsize = blob;
      }
    }
    
    const mediaFiles: MediaFile[] = [];
    
    // Process all fullsize images (thumbnail is optional)
    for (const [matchingKey, { fullsize, thumbnail }] of Array.from(blobMap.entries())) {
      // Skip if we don't have fullsize (required)
      if (!fullsize) continue;
      
      // Extract original filename from fullsize blob pathname
      const originalFilename = extractOriginalFilename(fullsize.pathname);
      
      // Parse timestamp from original filename
      const timestamp = parseTimestampFromFilename(originalFilename);
      if (!timestamp) continue; // Skip if we can't parse timestamp
      
      // Determine file type from file extension only (no keyword matching)
      const isVideo = /\.(mp4|mov|avi|webm)$/i.test(originalFilename) ||
                     /\.(mp4|mov|avi|webm)$/i.test(fullsize.pathname);
      const isImage = originalFilename.match(/\.(jpg|jpeg|png|webp)$/i) !== null || 
                     fullsize.pathname.match(/\.(jpg|jpeg|png|webp)$/i) !== null ||
                     (originalFilename.includes('photo') && !originalFilename.endsWith('.webm')) ||
                     (fullsize.pathname.includes('photo') && !fullsize.pathname.endsWith('.webm'));
      
      // Include both images and videos
      if (!isImage && !isVideo) continue;
      
      mediaFiles.push({
        filename: originalFilename,
        blobUrl: fullsize.url,
        thumbnailUrl: thumbnail?.url || fullsize.url,
        timestamp,
        isVideo,
        isImage,
      });
    }
    
    return mediaFiles.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  } catch (error) {
    console.error('Error listing blobs from Vercel:', error);
    // Return empty array on error
    return [];
  }
}
