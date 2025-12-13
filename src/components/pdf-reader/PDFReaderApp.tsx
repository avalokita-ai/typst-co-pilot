import { useState, useCallback } from 'react';
import { PDFProvider } from '@/contexts/PDFContext';
import { PDFReaderHeader } from './PDFReaderHeader';
import { ChatPanel } from './ChatPanel';
import { PDFViewer } from './PDFViewer';
import { OutlinePanel } from './OutlinePanel';
import ResizeHandle from '@/components/layout/ResizeHandle';
import { cn } from '@/lib/utils';

function PDFReaderLayout() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const handleLeftResize = useCallback((deltaX: number) => {
    setLeftPanelWidth((prev) => {
      const newWidth = prev + deltaX;
      if (newWidth < 200) {
        setIsLeftCollapsed(true);
        return 0;
      }
      setIsLeftCollapsed(false);
      return Math.min(Math.max(newWidth, 250), 500);
    });
  }, []);

  const handleRightResize = useCallback((deltaX: number) => {
    setRightPanelWidth((prev) => {
      const newWidth = prev - deltaX;
      if (newWidth < 150) {
        setIsRightCollapsed(true);
        return 0;
      }
      setIsRightCollapsed(false);
      return Math.min(Math.max(newWidth, 200), 400);
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <PDFReaderHeader />
      
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Chat */}
        <div
          className={cn(
            'shrink-0 transition-all duration-200',
            isLeftCollapsed ? 'w-0 overflow-hidden' : ''
          )}
          style={{ width: isLeftCollapsed ? 0 : leftPanelWidth }}
        >
          <ChatPanel />
        </div>

        <ResizeHandle onResize={handleLeftResize} />

        {/* Center Panel - PDF Viewer */}
        <div className="flex-1 min-w-0">
          <PDFViewer />
        </div>

        <ResizeHandle onResize={handleRightResize} />

        {/* Right Panel - Outline */}
        <div
          className={cn(
            'shrink-0 transition-all duration-200',
            isRightCollapsed ? 'w-0 overflow-hidden' : ''
          )}
          style={{ width: isRightCollapsed ? 0 : rightPanelWidth }}
        >
          <OutlinePanel />
        </div>
      </div>
    </div>
  );
}

export function PDFReaderApp() {
  return (
    <PDFProvider>
      <PDFReaderLayout />
    </PDFProvider>
  );
}
