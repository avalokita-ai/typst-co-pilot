import { useState } from 'react';
import { FileText, List, Bookmark, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePDFContext } from '@/contexts/PDFContext';
import { cn } from '@/lib/utils';

interface OutlineItem {
  id: string;
  title: string;
  page: number;
  children?: OutlineItem[];
}

// Mock outline data - in a real app, this would come from the PDF
const mockOutline: OutlineItem[] = [
  {
    id: '1',
    title: 'Introduction',
    page: 1,
    children: [
      { id: '1.1', title: 'Background', page: 1 },
      { id: '1.2', title: 'Purpose', page: 2 },
    ],
  },
  {
    id: '2',
    title: 'Main Content',
    page: 3,
    children: [
      { id: '2.1', title: 'Section A', page: 3 },
      { id: '2.2', title: 'Section B', page: 5 },
      { id: '2.3', title: 'Section C', page: 7 },
    ],
  },
  { id: '3', title: 'Conclusion', page: 9 },
  { id: '4', title: 'References', page: 10 },
];

const mockBookmarks = [
  { id: 'b1', title: 'Important section', page: 3 },
  { id: 'b2', title: 'Key findings', page: 5 },
];

function OutlineItem({ item, level = 0 }: { item: OutlineItem; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { currentPage, setCurrentPage } = usePDFContext();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentPage === item.page;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          setCurrentPage(item.page);
        }}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren && (
          <span className="shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        )}
        <span className="flex-1 truncate">{item.title}</span>
        <span className="text-xs text-muted-foreground">{item.page}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <OutlineItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OutlinePanel() {
  const { documentUrl, totalPages, currentPage, setCurrentPage } = usePDFContext();

  if (!documentUrl) {
    return (
      <div className="h-full bg-background border-l border-border flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          Upload a document to view outline
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-background border-l border-border flex flex-col">
      <Tabs defaultValue="thumbnails" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-2">
          <TabsTrigger value="thumbnails" className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="outline" className="text-xs">
            <List className="w-3.5 h-3.5 mr-1.5" />
            Outline
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="text-xs">
            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
            Marks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thumbnails" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 grid grid-cols-2 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'aspect-[3/4] rounded-md border-2 flex items-center justify-center text-sm font-medium transition-all',
                    currentPage === page
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="outline" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="py-2">
              {mockOutline.map((item) => (
                <OutlineItem key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="bookmarks" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1">
              {mockBookmarks.length > 0 ? (
                mockBookmarks.map((bookmark) => (
                  <button
                    key={bookmark.id}
                    onClick={() => setCurrentPage(bookmark.page)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md transition-colors',
                      currentPage === bookmark.page
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Bookmark className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{bookmark.title}</span>
                    <span className="text-xs text-muted-foreground">{bookmark.page}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No bookmarks yet
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
