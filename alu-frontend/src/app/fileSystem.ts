// This helper provides functions to interact with the Origin Private File System (OPFS).

/**
 * Saves a file from a URL to the OPFS.
 * @param {string} url - The URL of the file to download.
 * @param {string} suggestedName - The desired name for the file (e.g., 'post-123.mp4').
 * @returns {Promise<FileSystemFileHandle>} The handle to the saved file.
 */
export async function saveFileFromUrl(url: string, suggestedName: string): Promise<FileSystemFileHandle> {
  try {
    const root = await navigator.storage.getDirectory();
    const response = await fetch(url);
    const blob = await response.blob();

    // Create a writable stream to the new file in OPFS.
    const fileHandle = await root.getFileHandle(suggestedName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();

    console.log(`File '${suggestedName}' saved to OPFS.`);
    return fileHandle;
  } catch (error) {
    console.error('Failed to save file to OPFS:', error);
    throw error;
  }
}

/**
 * Saves a Blob/File directly to OPFS (no network download needed).
 * Used for user uploads where we already have the file in memory.
 * Returns null if OPFS is not supported (graceful fallback).
 */
export async function saveFileFromBlob(blob: Blob, suggestedName: string): Promise<FileSystemFileHandle | null> {
  try {
    // Check if File System Access API is available
    if (!('storage' in navigator) || typeof navigator.storage.getDirectory !== 'function') {
      console.warn('File System Access API not supported, skipping OPFS save');
      return null; // Graceful fallback - just don't save locally
    }

    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(suggestedName, { create: true });

    // Check if createWritable is available
    if (typeof fileHandle.createWritable !== 'function') {
      console.warn('createWritable not supported, skipping OPFS save');
      return null;
    }

    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    console.log(`File '${suggestedName}' saved to OPFS from blob.`);
    return fileHandle;
  } catch (error) {
    console.error('Failed to save blob to OPFS:', error);
    // Don't throw - just return null and continue without local save
    return null;
  }
}

/**
 * Gets a URL for a file stored in OPFS so it can be used in <img> or <video> tags.
 * @param {string} fileName - The name of the file to retrieve.
 * @returns {Promise<string>} A blob URL that can be used as a src.
 */
export async function getFileUrl(fileName: string): Promise<string> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  } catch (error) {
    console.error(`Failed to get URL for file '${fileName}':`, error);
    throw error;
  }
}
