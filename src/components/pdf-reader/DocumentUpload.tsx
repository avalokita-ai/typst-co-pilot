import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePDFContext } from '@/contexts/PDFContext';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { cn } from '@/lib/utils';

export function DocumentUpload() {
  const { recentDocuments, setDocumentUrl, setDocumentMetadata } = usePDFContext();
  const { uploadDocument, progress, error, clearError } = useDocumentUpload();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadDocument(file);
    }
  }, [uploadDocument]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument(file);
    }
  }, [uploadDocument]);

  const handleRecentDocument = useCallback((doc: typeof recentDocuments[0]) => {
    // In a real app, this would fetch the document from storage
    // For now, we just show that it was selected
    console.log('Selected recent document:', doc);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-background">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'w-full max-w-xl border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload" className="cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Drop PDF here or click to browse
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            Maximum file size: 50MB
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            PDF files only
          </div>
        </label>
      </div>

      {/* Progress */}
      {progress && (
        <div className="w-full max-w-xl mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Uploading...</span>
            <span className="text-sm text-muted-foreground">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="w-full max-w-xl mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-destructive">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Recent Documents */}
      {recentDocuments.length > 0 && (
        <div className="w-full max-w-xl mt-8">
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Documents</h4>
          <div className="space-y-2">
            {recentDocuments.slice(0, 5).map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleRecentDocument(doc)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
