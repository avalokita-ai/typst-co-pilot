import { useCallback } from 'react';
import { usePDFContext, DocumentMetadata } from '@/contexts/PDFContext';

export function useDocumentMetadata() {
  const { documentMetadata, setDocumentMetadata } = usePDFContext();

  const fetchMetadata = useCallback(async (documentId: string) => {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/documents/${documentId}`);
    // const data = await response.json();
    // setDocumentMetadata(data);

    console.log('Fetching metadata for document:', documentId);
  }, []);

  const updatePageCount = useCallback((pageCount: number) => {
    if (documentMetadata) {
      setDocumentMetadata({ ...documentMetadata, pageCount });
    }
  }, [documentMetadata, setDocumentMetadata]);

  return {
    metadata: documentMetadata,
    fetchMetadata,
    updatePageCount,
  };
}
