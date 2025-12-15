import { useState } from 'react';
import { Upload, Share2, Printer, Settings, Moon, Sun, FileText, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePDFContext } from '@/contexts/PDFContext';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useRef } from 'react';
import { SignDocumentModal } from './SignDocumentModal';

export function PDFReaderHeader() {
  const { documentMetadata, documentUrl } = usePDFContext();
  const { uploadDocument } = useDocumentUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signModalOpen, setSignModalOpen] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument(file);
    }
  };

  const handlePrint = () => {
    if (documentUrl) {
      const printWindow = window.open(documentUrl);
      printWindow?.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share && documentMetadata) {
      try {
        await navigator.share({
          title: documentMetadata.filename,
          text: `Check out this document: ${documentMetadata.filename}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const handleDownload = () => {
    if (documentUrl && documentMetadata) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentMetadata.filename;
      link.click();
    }
  };

  return (
    <>
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Left - Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground truncate max-w-[200px] md:max-w-[400px]">
              {documentMetadata?.filename || 'PDF Reader'}
            </h1>
            {documentMetadata && (
              <p className="text-xs text-muted-foreground">
                {documentMetadata.pageCount} pages
              </p>
            )}
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            className="hidden sm:flex"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleUploadClick}
            className="sm:hidden"
          >
            <Upload className="w-4 h-4" />
          </Button>

          {documentUrl && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => setSignModalOpen(true)}
                className="hidden sm:flex"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Sign
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={() => setSignModalOpen(true)}
                className="sm:hidden"
              >
                <PenTool className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownload} disabled={!documentUrl}>
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Sun className="w-4 h-4 mr-2" />
                Light Mode
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Moon className="w-4 h-4 mr-2" />
                Dark Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <SignDocumentModal open={signModalOpen} onOpenChange={setSignModalOpen} />
    </>
  );
}
