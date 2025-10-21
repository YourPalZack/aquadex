import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UploadProgress {
  progress: number;
  snapshot: UploadTaskSnapshot;
}

// Upload file with progress tracking
export const uploadFileWithProgress = (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          snapshot
        });
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Simple file upload without progress tracking
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Delete file from storage
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// Upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  basePath: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${Date.now()}_${index}_${file.name}`;
    const filePath = `${basePath}/${fileName}`;
    
    return uploadFileWithProgress(
      file,
      filePath,
      onProgress ? (progress) => onProgress(index, progress) : undefined
    );
  });

  return Promise.all(uploadPromises);
};

// Predefined upload paths
export const getProfileImagePath = (userId: string, fileName: string) => 
  `users/${userId}/profile/${fileName}`;

export const getAquariumImagePath = (userId: string, aquariumId: string, fileName: string) => 
  `users/${userId}/aquariums/${aquariumId}/${fileName}`;

export const getTestStripImagePath = (userId: string, aquariumId: string, fileName: string) => 
  `users/${userId}/aquariums/${aquariumId}/test-strips/${fileName}`;

export const getMarketplaceImagePath = (userId: string, listingId: string, fileName: string) => 
  `marketplace/${userId}/${listingId}/${fileName}`;

export const getQuestionImagePath = (userId: string, questionId: string, fileName: string) => 
  `qa/questions/${userId}/${questionId}/${fileName}`;

// Utility functions
export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { valid: true };
};

// Image compression utility (optional)
export const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxWidth / height);
      const newWidth = width * ratio;
      const newHeight = height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};