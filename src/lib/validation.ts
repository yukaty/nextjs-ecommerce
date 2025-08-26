// Common validation utilities

// Email validation pattern
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// File validation
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function validateEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: 'Unsupported file format.' };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Unsupported file format. Please select a JPEG, PNG, or WebP file.' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'Image file size must be less than 2MB.' };
  }

  return { isValid: true };
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  return { isValid: true };
}

export function validateRequired(value: string | undefined, fieldName: string): { isValid: boolean; error?: string } {
  if (!value?.trim()) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true };
}