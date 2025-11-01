import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import crypto from 'crypto';
const supabaseUrl = process.env.SUPABASE_PROJ_URL; // your custom name
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error('supabaseUrl is required.');
if (!supabaseKey) throw new Error('supabaseKey is required.');

export const supabase = createClient(supabaseUrl, supabaseKey);

import { v4 as uuidv4 } from 'uuid';

export default class SupabaseService {
  static async uploadUserProfileImage(
    userId: string,
    file: Express.Multer.File,
  ) {
    console.log('Uploading new profile image for user:', userId);

    // Generate a unique name using UUID for the file to avoid conflicts
    const fileUuid = uuidv4();
    const fileExt = file.originalname.split('.').pop(); // Get file extension
    const fileName = `${userId}/${fileUuid}.${fileExt}`; // Folder per user, unique file name

    const bucketName = 'profile-images'; // Your Supabase Storage bucket name

    // List files in the user's folder
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucketName)
      .list(userId, {});

    if (listError) {
      console.error('Error listing files in user folder:', listError);
      throw listError;
    }

    // Delete all files in the folder, including any .emptyFolderPlaceholder
    if (fileList && fileList.length > 0) {
      // Get all file names from the folder
      const fileNames = fileList.map((file) => file.name);

      // Remove .emptyFolderPlaceholder and any other files that are not images
      const filesToDelete = fileNames
        .filter((name) => name !== '.emptyFolderPlaceholder') // Exclude the placeholder
        .map((name) => `${userId}/${name}`); // Add the user folder prefix to each file name

      // If there are files to delete, proceed with deletion
      if (filesToDelete.length > 0) {
        console.log('Deleting existing files in the folder:', filesToDelete);

        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove(filesToDelete); // Remove the files in the list

        if (deleteError) {
          console.error('Error deleting old profile images:', deleteError);
          throw deleteError;
        }
      }
    }

    // Upload the new file with a unique name (UUID)//
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error('Error uploading the new profile image:', uploadError);
      throw uploadError;
    }

    // Get the public URL of the newly uploaded file
    const { data: publicUrlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  static async uploadImage(
    id: string,
    file: Express.Multer.File,
    bucketName: string = 'profile-images',
  ): Promise<string> {
    try {
      const mimeType = file.mimetype; // Get the MIME type from the file object

      if (!mimeType.startsWith('image/')) {
        throw new Error('Uploaded file is not an image');
      }

      const fileExtension = mimeType.split('/')[1]; // Get the extension from MIME type, e.g., 'jpeg', 'png'
      const fileName = `${id}/${uuidv4()}.${fileExtension}`;

      // Proceed with file upload to Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });


      if (error) {
        throw new Error(`Error uploading image: ${error.message}`);
      }

      // Construct URL to access the image
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
      return imageUrl; // Return the image URL
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Image upload failed: ${error.message}`);
      } else {
        // If error is not an instance of Error, throw a generic message
        throw new Error('Image upload failed: Unknown error');
      }
    }
  }

  // Delete Image from Supabase Storage
  static async deleteImage(imageUrl: string): Promise<any> {
    // Extract bucket name and file path from the provided image URL
    const { bucketName, filePath } =
      SupabaseService.extractBucketAndFilePath(imageUrl);

    // If bucket name or file path is not available, throw an error
    if (!bucketName || !filePath) {
      throw new Error('Invalid URL format or missing bucket/file path.');
    }
    console.log("deleteing",bucketName, filePath)
    // Perform the deletion on Supabase storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName) // Dynamically use the extracted bucket name
      .remove([filePath]); // Use the extracted file path

    if (deleteError) {
      console.error('Error deleting image:', deleteError);
      throw deleteError;
    }

    console.log(`Image deleted successfully: ${filePath}`);
    return { message: 'Image deleted successfully' };
  }

  // Utility function to extract bucket name and file path from the URL
  private static extractBucketAndFilePath(url: string) {
    // Regex to capture the bucket name and file path
    const regex = /supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.*)/;
    const match = url.match(regex);

    if (match) {
      const bucketName = match[1]; // Extracted bucket name (e.g., 'review-images')
      const filePath = match[2]; // Extracted file path (e.g., '1/f8783fb3-1871-4d5c-b2b9-cc1b2af7b18c.f5bcdf8e-94e8-4148-af6b-9a52f80f0add')
      return { bucketName, filePath };
    } else {
      throw new Error('Invalid URL format');
    }
  }
}
