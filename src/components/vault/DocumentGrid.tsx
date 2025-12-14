import { useMemo } from 'react';
import { 
  FileText, Image, File, Table2, Folder,
  Star, MoreVertical, Eye, Download, Share2, Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useVault, VaultDocument } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

interface DocumentGridProps {
  onPreview: (doc: VaultDocument) => void;
  onShare: (doc: VaultDocument) => void;
  onDetails: (doc: VaultDocument) => void;
}

const fileTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  image: Image,
  document: File,
  spreadsheet: Table2,
  folder: Folder,
};

const fileTypeColors: Record<string, string> = {
  pdf: 'bg-red-500/20 text-red-400',
  image: 'bg-green-500/20 text-green-400',
  document: 'bg-blue-500/20 text-blue-400',
  spreadsheet: 'bg-emerald-500/20 text-emerald-400',
  folder: 'bg-amber-500/20 text-amber-400',
};

export function DocumentGrid({ onPreview, onShare, onDetails }: DocumentGridProps) {
  const { 
    documents, 
    currentFolderId, 
    selectedItems, 
    toggleSelection, 
    toggleStar,
    deleteDocuments,
    searchQuery,
    sortBy,
    sortOrder
  } = useVault();

  const filteredAndSorted = useMemo(() => {
    let filtered = documents.filter(doc => {
      // Filter by current folder
      if (currentFolderId && doc.folderId !== currentFolderId) return false;
      if (!currentFolderId && doc.folderId) return false;
      
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return doc.name.toLowerCase().includes(query) ||
               doc.tags.some(t => t.toLowerCase().includes(query));
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'modifiedAt':
          comparison = new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
          break;
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'size':
          comparison = b.size - a.size;
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [documents, currentFolderId, searchQuery, sortBy, sortOrder]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getExpiryStatus = (doc: VaultDocument) => {
    if (!doc.expiryDate) return null;
    const daysUntil = differenceInDays(new Date(doc.expiryDate), new Date());
    if (daysUntil < 0) return { status: 'expired', label: 'Expired', color: 'bg-destructive text-destructive-foreground' };
    if (daysUntil <= 7) return { status: 'critical', label: `${daysUntil}d left`, color: 'bg-destructive text-destructive-foreground' };
    if (daysUntil <= 30) return { status: 'warning', label: `${daysUntil}d left`, color: 'bg-warning text-warning-foreground' };
    return null;
  };

  if (filteredAndSorted.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Upload your first document to get started. Drag and drop files here or click the upload button.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6">
      {filteredAndSorted.map(doc => {
        const Icon = fileTypeIcons[doc.type] || File;
        const colorClass = fileTypeColors[doc.type] || 'bg-muted text-muted-foreground';
        const isSelected = selectedItems.includes(doc.id);
        const expiry = getExpiryStatus(doc);

        return (
          <div
            key={doc.id}
            className={cn(
              "group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer",
              isSelected && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => onPreview(doc)}
          >
            {/* Selection Checkbox */}
            <div 
              className={cn(
                "absolute top-2 left-2 z-10 transition-opacity",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSelection(doc.id)}
                className="bg-background/80 backdrop-blur"
              />
            </div>

            {/* Star Button */}
            <button
              className={cn(
                "absolute top-2 right-2 z-10 p-1 rounded transition-all",
                doc.starred 
                  ? "text-amber-400 opacity-100" 
                  : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-400"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(doc.id);
              }}
            >
              <Star className={cn("w-4 h-4", doc.starred && "fill-current")} />
            </button>

            {/* Thumbnail */}
            <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative">
              <div className={cn("p-4 rounded-lg", colorClass)}>
                <Icon className="w-10 h-10" />
              </div>
              
              {/* Expiry Badge */}
              {expiry && (
                <Badge 
                  className={cn("absolute bottom-2 left-2 gap-1 text-[10px]", expiry.color)}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {expiry.label}
                </Badge>
              )}

              {/* Shared indicator */}
              {doc.shared && (
                <Badge variant="secondary" className="absolute bottom-2 right-2 text-[10px]">
                  Shared
                </Badge>
              )}

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(doc);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(doc);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDetails(doc)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => deleteDocuments([doc.id])}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  {doc.name}
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(doc.modifiedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
