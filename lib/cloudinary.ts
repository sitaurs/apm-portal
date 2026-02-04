/**
 * Cloudinary Configuration
 * 
 * Cloud storage for uploaded files (images, documents)
 */

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

/**
 * Upload file to Cloudinary
 * @param buffer File buffer
 * @param folder Upload folder (lomba, expo, prestasi, etc)
 * @param resourceType 'image' | 'raw' (for PDFs/docs)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `apm/${folder}`,
        resource_type: resourceType,
        // Auto optimize images
        transformation: resourceType === 'image' 
          ? [{ quality: 'auto', fetch_format: 'auto' }]
          : undefined,
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          })
        }
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}
