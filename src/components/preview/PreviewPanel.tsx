import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PreviewPanel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 3;

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Preview Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-background">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Live Preview
        </h2>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div 
          className="panel-preview rounded-lg shadow-lg overflow-hidden"
          style={{ 
            width: `${(595 * zoom) / 100}px`,
            minHeight: `${(842 * zoom) / 100}px`,
            transform: `scale(${Math.min(zoom / 100, 1)})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Mock Document Preview */}
          <div className="p-12 text-foreground" style={{ color: '#0a0a0a' }}>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold mb-2">Document Title</h1>
              <p className="text-sm text-gray-500">Author Name • December 2024</p>
            </div>

            <h2 className="text-xl font-bold mb-4 font-display">1. Introduction</h2>
            <p className="mb-4 text-sm leading-relaxed font-chat">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua.
            </p>

            <h3 className="text-lg font-bold mb-3 font-display">1.1 Background</h3>
            <p className="mb-4 text-sm leading-relaxed font-chat">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>

            <div className="my-6 bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-400 italic text-sm">Figure placeholder</p>
            </div>
            <p className="text-center text-xs text-gray-500 mb-6">Figure 1: A sample figure</p>

            <h3 className="text-lg font-bold mb-3 font-display">1.2 Methodology</h3>
            <p className="mb-4 text-sm leading-relaxed font-chat">
              Duis aute irure dolor in reprehenderit in voluptate velit esse.
            </p>

            <div className="my-4 text-center font-mono text-lg">
              E = mc²
            </div>

            <table className="w-full border-collapse text-sm mt-6">
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
            onClick={() => setZoom(Math.max(50, zoom - 25))}
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
            onClick={() => setZoom(Math.min(200, zoom + 25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
