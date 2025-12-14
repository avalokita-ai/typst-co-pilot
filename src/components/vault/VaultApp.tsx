import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText } from 'lucide-react';
import { VaultProvider, useVault, VaultDocument } from '@/contexts/VaultContext';
import { VaultSidebar } from './VaultSidebar';
import { VaultHeader } from './VaultHeader';
import { DocumentGrid } from './DocumentGrid';
import { DocumentList } from './DocumentList';
import { UploadModal } from './UploadModal';
import { ShareModal } from './ShareModal';
import { PreviewModal } from './PreviewModal';
import { FolderModal } from './FolderModal';
import { BulkActionsBar } from './BulkActionsBar';
import { cn } from '@/lib/utils';

function VaultAppContent() {
  const { viewMode, documents, addDocument } = useVault();
  const [activeView, setActiveView] = useState('home');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [globalDrag, setGlobalDrag] = useState(false);

  // Global drag and drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setGlobalDrag(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setGlobalDrag(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setGlobalDrag(false);
      if (e.dataTransfer?.files.length) {
        setUploadOpen(true);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handlePreview = useCallback((doc: VaultDocument) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  }, []);

  const handleShare = useCallback((doc: VaultDocument) => {
    setSelectedDoc(doc);
    setShareOpen(true);
  }, []);

  const handleDetails = useCallback((doc: VaultDocument) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  }, []);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Global Drop Overlay */}
      {globalDrag && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Drop files to upload</h2>
            <p className="text-muted-foreground">Release to add files to your vault</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <VaultSidebar
        onNewFolder={() => setFolderOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <VaultHeader
          onUpload={() => setUploadOpen(true)}
          onNewFolder={() => setFolderOpen(true)}
          onFilterToggle={() => setFilterOpen(!filterOpen)}
        />

        {/* Document Area */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'grid' ? (
            <DocumentGrid
              onPreview={handlePreview}
              onShare={handleShare}
              onDetails={handleDetails}
            />
          ) : (
            <DocumentList
              onPreview={handlePreview}
              onShare={handleShare}
              onDetails={handleDetails}
            />
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActionsBar onShare={() => setShareOpen(true)} />

      {/* Modals */}
      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} document={selectedDoc} />
      <PreviewModal 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        document={selectedDoc}
        onShare={handleShare}
      />
      <FolderModal open={folderOpen} onOpenChange={setFolderOpen} />
    </div>
  );
}

export function VaultApp() {
  return (
    <VaultProvider>
      <VaultAppContent />
    </VaultProvider>
  );
}
