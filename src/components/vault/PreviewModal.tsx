import { useState } from 'react';
import { X, Download, Share2, Trash2, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VaultDocument, useVault } from '@/contexts/VaultContext';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: VaultDocument | null;
  onShare: (doc: VaultDocument) => void;
}

const fileTypeColors: Record<string, string> = {
  pdf: 'bg-red-500/20 text-red-400',
  image: 'bg-green-500/20 text-green-400',
  document: 'bg-blue-500/20 text-blue-400',
  spreadsheet: 'bg-emerald-500/20 text-emerald-400',
};

// Mock activity data
const mockActivity = [
  { type: 'view', user: 'You', date: new Date() },
  { type: 'upload', user: 'You', date: new Date(Date.now() - 86400000 * 3) },
];

export function PreviewModal({ open, onOpenChange, document, onShare }: PreviewModalProps) {
  const { folders, deleteDocuments } = useVault();
  const [activeTab, setActiveTab] = useState('preview');

  if (!document) return null;

  const category = folders.find(f => f.id === document.category);
  const colorClass = fileTypeColors[document.type] || 'bg-muted text-muted-foreground';

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDelete = () => {
    deleteDocuments([document.id]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("p-2 rounded-lg", colorClass)}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold truncate">{document.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {category && (
                  <Badge variant="secondary" className="text-xs">
                    {category.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatBytes(document.size)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => onShare(document)}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 bg-muted/30 flex items-center justify-center">
            <div className="text-center">
              <div className={cn("w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4", colorClass)}>
                <FileText className="w-12 h-12" />
              </div>
              <p className="text-muted-foreground mb-4">Preview not available</p>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open in viewer
              </Button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-80 border-l border-border flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border h-12 p-0 bg-transparent">
                <TabsTrigger 
                  value="preview" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="versions" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Versions
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Activity
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="preview" className="p-4 m-0 space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Name</label>
                    <p className="mt-1 font-medium">{document.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Type</label>
                    <p className="mt-1 capitalize">{document.type}</p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Size</label>
                    <p className="mt-1">{formatBytes(document.size)}</p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Created</label>
                    <p className="mt-1">{format(new Date(document.createdAt), 'PPp')}</p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Modified</label>
                    <p className="mt-1">{format(new Date(document.modifiedAt), 'PPp')}</p>
                  </div>

                  {document.expiryDate && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Expires</label>
                      <p className="mt-1">{format(new Date(document.expiryDate), 'PPp')}</p>
                    </div>
                  )}

                  {document.tags.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Tags</label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {document.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {document.shared && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Shared with</label>
                      <div className="space-y-1.5 mt-2">
                        {document.sharedWith.map(email => (
                          <p key={email} className="text-sm">{email}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="versions" className="p-4 m-0">
                  {document.versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No previous versions
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {document.versions.map(version => (
                        <div key={version.id} className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm font-medium">
                            {format(new Date(version.createdAt), 'PPp')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatBytes(version.size)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="p-4 m-0">
                  <div className="space-y-3">
                    {mockActivity.map((activity, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>
                            {activity.type === 'view' ? ' viewed this document' : ' uploaded this document'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(activity.date, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
