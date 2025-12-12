import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize, Minimize, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useTypstCompiler } from "@/hooks/useTypstCompiler";

interface PreviewPanelProps {
  code?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const PreviewPanel = ({ code = "", isFullscreen, onToggleFullscreen }: PreviewPanelProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 1;
  
  const { compiled, error, isCompiling } = useTypstCompiler(code);

  const handleDownload = () => {
    const content = code || "";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.typ";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document Downloaded",
      description: "Your Typst source file has been downloaded.",
    });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 25));

  const baseWidth = 595;
  const scale = zoom / 100;

  return (
    <div className={`flex flex-col h-full bg-muted/30 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Preview Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Live Preview
          </h2>
          {isCompiling && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
        {isFullscreen && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div 
          className="panel-preview rounded-lg shadow-lg overflow-hidden transition-transform duration-200"
          style={{ 
            width: `${baseWidth * scale}px`,
            minHeight: `${842 * scale}px`,
          }}
        >
          {compiled ? (
            <div 
              dangerouslySetInnerHTML={{ __html: compiled }} 
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${100 / scale}%` }}
            />
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>Start typing to see your document preview...</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Footer Controls */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono min-w-[40px] text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
