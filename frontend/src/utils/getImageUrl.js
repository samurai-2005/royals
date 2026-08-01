/**
 * Safely resolves any product image URL (Cloudinary HTTPS, local uploads, arrays, or strings)
 */
export const getImageUrl = (imageInput) => {
  if (!imageInput) return '/placeholder.png';

  // Extract first image if an array was passed
  const imagePath = Array.isArray(imageInput) ? imageInput[0] : imageInput;

  if (!imagePath || typeof imagePath !== 'string') return '/placeholder.png';

  // 1. If it's already a full Cloudinary / external HTTPS URL, return directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // 2. If it's a relative path from old local uploads, prepend Backend URL
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};