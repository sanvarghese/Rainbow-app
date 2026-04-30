// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure only if environment variables exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadToCloudinary(buffer: Buffer, folder: string) {
  // Fallback for development/test environment
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary not configured. Using mock upload.');
    return {
      secure_url: `data:image/jpeg;base64,${buffer.toString('base64')}`,
      public_id: `mock_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary not configured. Mock delete.');
    return { result: 'ok' };
  }
  
  return cloudinary.uploader.destroy(publicId);
}