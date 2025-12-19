/**
 * Cloudflare R2 Client
 * 
 * S3-compatible client for uploading and managing images in Cloudflare R2.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

/**
 * Upload image to R2
 */
export async function uploadImage(
  file: Buffer,
  key: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  if (!BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return public URL
  const url = PUBLIC_URL.endsWith("/")
    ? `${PUBLIC_URL}${key}`
    : `${PUBLIC_URL}/${key}`;

  return { url, key };
}

/**
 * Delete image from R2
 */
export async function deleteImage(key: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate image key for inventory item
 */
export function generateImageKey(itemId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `inventory/${itemId}/${timestamp}-${sanitizedFilename}`;
}

