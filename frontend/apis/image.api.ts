import ApiService from '@/services/api.service';
import { normalizeError } from '@/utils/api-error';

export async function uploadImage(file: File | Blob, id: string, bucketName: string = 'profile-images'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', id); // Pass the generic id as part of the request
    formData.append('bucketName', bucketName);

    // Use the POST method to send the file to the backend
    const res = await ApiService.post(`/img/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data.imageUrl; 
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Image upload failed');
  }
}

export async function deleteImage(imageUrl: string, bucketName: string = 'profile-images'): Promise<boolean> {
  try {
    const res = await ApiService.post('/img/delete', {
      imageUrl,
      bucketName,
    });

    return res.data.success; // Assuming the response contains success status
  } catch (error) {
    normalizeError(error);
    return false; // Returning false to indicate deletion failure
  }
}
