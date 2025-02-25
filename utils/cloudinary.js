import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from 'fs';
dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadMedia = async (file, type = "auto") => {
  try {
    console.log('Uploading file to Cloudinary:', { file, type });
    
    // Check if file exists
    if (!fs.existsSync(file)) {
      throw new Error(`File does not exist: ${file}`);
    }

    // Check file size
    const stats = fs.statSync(file);
    const fileSizeInMB = stats.size / (1024 * 1024);
    if (fileSizeInMB > 100) { // 100MB limit
      throw new Error('File size exceeds 100MB limit');
    }

    // Generate a unique public_id
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const publicId = `${type}_${timestamp}_${randomString}`;

    // Set upload options based on content type
    let uploadOptions = {
      public_id: publicId,
      resource_type: type === 'video' ? 'video' : 'auto',
      folder: type === 'video' ? 'lms_videos' : 'lms_documents',
      overwrite: true,
      use_filename: true,
      unique_filename: true,
      timeout: 120000, // 2 minutes timeout
    };

    if (type === 'video') {
      // Video specific options
      uploadOptions = {
        ...uploadOptions,
        chunk_size: 6000000, // 6MB chunks for videos
        eager: [
          { 
            format: 'mp4',
            video_codec: 'auto',
            audio_codec: 'aac',
            bit_rate: '1m', // 1 megabit per second
            height: 720,
            width: 1280,
            crop: 'scale'
          }
        ],
        eager_async: true,
        eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL // Optional: for async notifications
      };
    } else if (type === 'pdf') {
      // PDF specific options
      uploadOptions = {
        ...uploadOptions,
        resource_type: 'raw',
        format: 'pdf',
        use_filename: true,
        chunk_size: 2000000, // 2MB chunks for PDFs
        pages: true // Enable PDF page extraction if needed
      };
    }

    console.log('Uploading with options:', uploadOptions);

    // Use promises for better error handling
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result);
            resolve(result);
          }
        }
      );

      // Create read stream and pipe to upload stream
      const readStream = fs.createReadStream(file);
      readStream.pipe(uploadStream);

      // Handle read stream errors
      readStream.on('error', (error) => {
        console.error('Read stream error:', error);
        reject(error);
      });
    });

    // Add retry logic for network issues
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await uploadPromise;
        
        // Clean up the temporary file
        try {
          fs.unlinkSync(file);
        } catch (err) {
          console.error('Error deleting temp file:', err);
          // Don't throw here as upload was successful
        }

        return result;
      } catch (error) {
        attempts++;
        console.error(`Upload attempt ${attempts} failed:`, error);

        if (attempts === maxAttempts) {
          throw error;
        }

        // If error is network related, wait before retrying
        if (error.message.includes('ECONNRESET') || error.message.includes('ETIMEDOUT')) {
          const waitTime = Math.pow(2, attempts) * 1000; // Exponential backoff
          console.log(`Waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
        } else {
          throw error; // Don't retry for non-network errors
        }
      }
    }
  } catch (error) {
    console.error('Final upload error:', error);

    // Ensure temp file is deleted even if upload fails
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (err) {
      console.error('Error deleting temp file after failed upload:', err);
    }

    throw error;
  }
};

export const deleteMediaFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    console.log('Deleting media from Cloudinary:', { publicId, resourceType });
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType,
      invalidate: true 
    });
    console.log('Delete result:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// For backward compatibility
export const deleteVideoFromCloudinary = async (publicId) => {
  return deleteMediaFromCloudinary(publicId, 'video');
};
