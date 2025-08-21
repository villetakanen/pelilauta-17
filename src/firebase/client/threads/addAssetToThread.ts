import { logError } from '@utils/logHelpers';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app } from '..';

/**
 * Adds an asset to the given Thread in Firebase Storage.
 *
 * @param site [Thread] The site to add the asset to.
 * @param file [File] The asset file to upload.
 * @returns {Promise<{ downloadURL: string, storagePath: string }>} A promise that resolves
 * with the download URL and storage path of the uploaded asset.
 */
export async function addAssetToThread(
  threadKey: string,
  file: File,
): Promise<{ downloadURL: string; storagePath: string }> {
  if (!threadKey || !file || !file.name) {
    throw new Error('Invalid thread or file provided, aborting asset upload');
  }

  // Allow only images at this point!
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type, only images are allowed for threads');
  }

  const { getStorage } = await import('firebase/storage');
  const storage = getStorage(app);

  const uniqueFilename = `${uuidv4()}-${file.name}`; // Generate a unique filename
  const storagePath = `Threads/${threadKey}/${uniqueFilename}`; // The path to store the file in Firebase Storage
  const threadAssetRef = ref(storage, storagePath);

  try {
    // Upload the file
    await uploadBytes(threadAssetRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(threadAssetRef);

    // Return the download URL
    return { downloadURL, storagePath };
  } catch (error) {
    logError('Error uploading asset to storage', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
