import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize, Minimize, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface PreviewPanelProps {
  code?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const PreviewPanel = ({ code, isFullscreen, onToggleFullscreen }: PreviewPanelProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 3;

  const handleDownload = () => {
    // Create a blob with the Typst content
    const content = code || getDefaultContent();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    // Create download link
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

  const getDefaultContent = () => `#set page(paper: "a4")
#set text(size: 11pt)

= Document Title

Content here...`;

  // Calculate scale based on zoom and available space
  const baseWidth = 595; // A4 width at 72dpi
  const scale = zoom / 100;

  return (
    <div className={`flex flex-col h-full bg-muted/30 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Preview Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Live Preview
        </h2>
        {isFullscreen && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div 
          className="panel-preview rounded-lg shadow-lg overflow-hidden transition-transform duration-200"
          style={{ 
            width: `${baseWidth * scale}px`,
            minHeight: `${842 * scale}px`,
          }}
        >
          {/* Mock Document Preview */}
          <div className="p-12 text-foreground" style={{ color: '#0a0a0a', fontSize: `${11 * scale}pt` }}>
            <div className="text-center mb-8">
              <h1 className="font-display font-bold mb-2" style={{ fontSize: `${24 * scale}pt` }}>Document Title</h1>
              <p className="text-gray-500" style={{ fontSize: `${12 * scale}pt` }}>Author Name • December 2024</p>
            </div>

            <h2 className="font-bold mb-4 font-display" style={{ fontSize: `${18 * scale}pt` }}>1. Introduction</h2>
            <p className="mb-4 leading-relaxed font-chat" style={{ fontSize: `${11 * scale}pt` }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua.
            </p>

            <h3 className="font-bold mb-3 font-display" style={{ fontSize: `${14 * scale}pt` }}>1.1 Background</h3>
            <p className="mb-4 leading-relaxed font-chat" style={{ fontSize: `${11 * scale}pt` }}>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>

            <div className="my-6 bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-400 italic" style={{ fontSize: `${10 * scale}pt` }}>Figure placeholder</p>
            </div>
            <p className="text-center text-gray-500 mb-6" style={{ fontSize: `${9 * scale}pt` }}>Figure 1: A sample figure</p>

            <h3 className="font-bold mb-3 font-display" style={{ fontSize: `${14 * scale}pt` }}>1.2 Methodology</h3>
            <p className="mb-4 leading-relaxed font-chat" style={{ fontSize: `${11 * scale}pt` }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse.
            </p>

            <div className="my-4 text-center font-mono" style={{ fontSize: `${14 * scale}pt` }}>
              E = mc²
            </div>

            <table className="w-full border-collapse mt-6" style={{ fontSize: `${10 * scale}pt` }}>
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 font-bold">Item</th>
                  <th className="text-left py-2 font-bold">Value</th>
                  <th className="text-left py-2 font-bold">Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Alpha</td>
                  <td className="py-2">1.234</td>
                  <td className="py-2">m/s</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Beta</td>
                  <td className="py-2">5.678</td>
                  <td className="py-2">kg</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Gamma</td>
                  <td className="py-2">9.012</td>
                  <td className="py-2">J</td>
                </tr>
              </tbody>
            </table>
          </div>
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
