import { useState, useCallback } from 'react';
import { usePDFContext, DocumentMetadata } from '@/contexts/PDFContext';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useDocumentUpload() {
  const { setDocumentUrl, setDocumentMetadata, setIsLoading, addRecentDocument } = usePDFContext();
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Only PDF files are supported');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError(null);
    setIsLoading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgress({
          loaded: (file.size * i) / 100,
          total: file.size,
          percentage: i,
        });
      }

      // Create object URL for local viewing
      const url = URL.createObjectURL(file);
      
      const metadata: DocumentMetadata = {
        id: crypto.randomUUID(),
        filename: file.name,
        pageCount: 0, // Will be updated by viewer
        fileSize: file.size,
        uploadedAt: new Date(),
      };

      setDocumentUrl(url);
      setDocumentMetadata(metadata);
      addRecentDocument(metadata);

      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/documents/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  }, [setDocumentUrl, setDocumentMetadata, setIsLoading, addRecentDocument]);

  return {
    uploadDocument,
    progress,
    error,
    clearError: () => setError(null),
  };
}
