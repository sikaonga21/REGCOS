import { supabase } from '@/lib/supabase';

export async function uploadFileToMediaBucket(file: File, folder = 'blog') {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const timestamp = Date.now();
  const filePath = `${folder}/${timestamp}-${safeFileName}`;

  const { error } = await supabase.storage.from('media').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || `image/${extension}`,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from('media').getPublicUrl(filePath);

  return data.publicUrl;
}
