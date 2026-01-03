export interface MediaFile {
  filename: string; // Original filename extracted from blob pathname
  blobUrl: string; // Full Vercel Blob URL (fullsize)
  thumbnailUrl: string; // Thumbnail URL if exists, otherwise same as blobUrl
  timestamp: Date;
  isVideo: boolean;
  isImage: boolean;
}

// Get media file path for display - returns the thumbnail blob URL
// Falls back to original URL if thumbnail doesn't exist
export function getMediaFilePath(blobUrl: string): string {
  try {
    const url = new URL(blobUrl);
    const pathname = url.pathname;
    
    // Extract the filename from the pathname (everything after the last slash)
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    
    // If it's already a thumbnail, return as-is
    if (filename.startsWith('thumbnail-')) {
      return blobUrl;
    }
    
    // Prepend 'thumbnail-' to the filename
    const thumbnailFilename = `thumbnail-${filename}`;
    
    // Reconstruct the URL with the thumbnail filename
    // Pathname might start with / or not, handle both cases
    const basePath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    const thumbnailUrl = `${url.origin}${basePath}${thumbnailFilename}`;
    
    return thumbnailUrl;
  } catch (error) {
    // If URL parsing fails, return original URL
    return blobUrl;
  }
}

// Get full resolution media file path - removes thumbnail prefix if present
export function getFullMediaFilePath(blobUrl: string): string {
  try {
    const url = new URL(blobUrl);
    const pathname = url.pathname;
    
    // Extract the filename from the pathname (everything after the last slash)
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    
    // If it's a thumbnail, remove the 'thumbnail-' prefix
    if (filename.startsWith('thumbnail-')) {
      const fullFilename = filename.substring('thumbnail-'.length);
      const basePath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
      return `${url.origin}${basePath}${fullFilename}`;
    }
    
    // If it's already full resolution, return as-is
    return blobUrl;
  } catch (error) {
    // If URL parsing fails, return original URL
    return blobUrl;
  }
}
