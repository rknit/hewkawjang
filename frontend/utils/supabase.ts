import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_PROJ_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
);

export const uploadImage = async (uri: string, path: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  console.log('Uploading image to path:', path,blob);
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: blob.type,
    });
    console.log('Upload response:', { data, error });
  }
