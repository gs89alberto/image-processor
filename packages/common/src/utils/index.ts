import crypto from 'crypto';
import fs from 'fs';
import axios from 'axios';
import path from 'path';

/**
 * Generate a random price between min and max.
 */
export function generateRandomPrice(min = 5, max = 50): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/**
 * Returns an MD5 hash of a given buffer.
 */
export function md5Hash(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Download an image from a remote URL and save it to destPath.
 * Returns the full path to the downloaded file.
 */
export async function downloadImage(url: string, destPath: string): Promise<string> {
  const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, Buffer.from(response.data));
  return destPath;
}
