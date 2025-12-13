import { useEffect, useCallback } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { usePDFContext } from '@/contexts/PDFContext';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { DocumentUpload } from './DocumentUpload';

export function PDFViewer() {
  const { documentUrl, setCurrentPage, setTotalPages, zoomLevel } = usePDFContext();
  const { updatePageCount } = useDocumentMetadata();

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => defaultTabs,
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: (zoom) => {
          zoom(SpecialZoomLevel.PageFit);
        },
        onExitFullScreen: (zoom) => {
          zoom(SpecialZoomLevel.PageFit);
        },
      },
    },
  });

  const handleDocumentLoad = useCallback((e: { doc: { numPages: number } }) => {
    setTotalPages(e.doc.numPages);
    updatePageCount(e.doc.numPages);
  }, [setTotalPages, updatePageCount]);

  const handlePageChange = useCallback((e: { currentPage: number }) => {
    setCurrentPage(e.currentPage + 1);
  }, [setCurrentPage]);

  if (!documentUrl) {
    return <DocumentUpload />;
  }

  return (
    <div className="h-full w-full bg-muted/30">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="h-full [&_.rpv-core__viewer]:h-full [&_.rpv-default-layout__container]:h-full">
          <Viewer
            fileUrl={documentUrl}
            plugins={[defaultLayoutPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
            onPageChange={handlePageChange}
            defaultScale={zoomLevel / 100}
            theme={{
              theme: 'dark',
            }}
          />
        </div>
      </Worker>
    </div>
  );
}
