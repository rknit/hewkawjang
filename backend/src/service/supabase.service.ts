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
    .filter(name => name !== '.emptyFolderPlaceholder') // Exclude the placeholder
    .map(name => `${userId}/${name}`); // Add the user folder prefix to each file name

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


    // Upload the new file with a unique name (UUID)
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
}
