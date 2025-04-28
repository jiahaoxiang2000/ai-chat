import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

// Get storage directory from environment variables or use default
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './local-storage';

// Ensure the storage directory exists
async function ensureStorageDir() {
  if (!(await existsAsync(LOCAL_STORAGE_PATH))) {
    await mkdirAsync(LOCAL_STORAGE_PATH, { recursive: true });
  }
}

// Create URL for public access
function getPublicUrl(filename: string): string {
  return `/api/files/get/${encodeURIComponent(filename)}`;
}

// Store a file in local storage
export async function put(
  filename: string, 
  data: Buffer | ArrayBuffer, 
  options?: { access: 'public' | 'private' }
) {
  await ensureStorageDir();
  
  // Generate unique name if none provided
  const actualFilename = filename || `${crypto.randomUUID()}-${Date.now()}`;
  
  // Convert ArrayBuffer to Buffer if needed
  const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : data;
  
  // Save the file
  const filePath = path.join(LOCAL_STORAGE_PATH, actualFilename);
  await writeFileAsync(filePath, buffer);

  return {
    url: getPublicUrl(actualFilename),
    pathname: actualFilename,
    contentType: '', // This would be set by the calling code as needed
    contentDisposition: '', // This would be set by the calling code as needed
  };
}

// Retrieve a file from local storage
export async function get(filename: string): Promise<Buffer | null> {
  const filePath = path.join(LOCAL_STORAGE_PATH, filename);
  
  if (!(await existsAsync(filePath))) {
    return null;
  }
  
  return fs.promises.readFile(filePath);
}

// Delete a file from local storage
export async function del(filename: string): Promise<boolean> {
  const filePath = path.join(LOCAL_STORAGE_PATH, filename);
  
  if (!(await existsAsync(filePath))) {
    return false;
  }
  
  await fs.promises.unlink(filePath);
  return true;
}