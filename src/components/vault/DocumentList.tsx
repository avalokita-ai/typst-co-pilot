import { useMemo } from 'react';
import { 
  FileText, Image, File, Table2, Folder,
  Star, MoreVertical, Eye, Download, Share2, Trash2,
  ChevronUp, ChevronDown, AlertTriangle, Users
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
import { useVault, VaultDocument } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

interface DocumentListProps {
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
  pdf: 'text-red-400',
  image: 'text-green-400',
  document: 'text-blue-400',
  spreadsheet: 'text-emerald-400',
  folder: 'text-amber-400',
};

export function DocumentList({ onPreview, onShare, onDetails }: DocumentListProps) {
  const { 
    documents, 
    folders,
    currentFolderId, 
    selectedItems, 
    toggleSelection,
    selectAll,
    clearSelection,
    toggleStar,
    deleteDocuments,
    searchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useVault();

  const filteredAndSorted = useMemo(() => {
    let filtered = documents.filter(doc => {
      if (currentFolderId && doc.folderId !== currentFolderId) return false;
      if (!currentFolderId && doc.folderId) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return doc.name.toLowerCase().includes(query) ||
               doc.tags.some(t => t.toLowerCase().includes(query));
      }
      return true;
    });

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
    if (daysUntil < 0) return { status: 'expired', label: 'Expired', color: 'text-destructive' };
    if (daysUntil <= 7) return { status: 'critical', label: `${daysUntil}d`, color: 'text-destructive' };
    if (daysUntil <= 30) return { status: 'warning', label: `${daysUntil}d`, color: 'text-warning' };
    return null;
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const allSelected = filteredAndSorted.length > 0 && 
    filteredAndSorted.every(doc => selectedItems.includes(doc.id));

  if (filteredAndSorted.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Upload your first document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-background border-b border-border">
          <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
            <th className="w-10 px-4 py-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => allSelected ? clearSelection() : selectAll()}
              />
            </th>
            <th className="w-10 px-2 py-3"></th>
            <th 
              className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Name
                <SortIcon column="name" />
              </div>
            </th>
            <th className="px-4 py-3 w-32">Category</th>
            <th 
              className="px-4 py-3 w-36 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => handleSort('modifiedAt')}
            >
              <div className="flex items-center gap-1">
                Modified
                <SortIcon column="modifiedAt" />
              </div>
            </th>
            <th 
              className="px-4 py-3 w-24 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => handleSort('size')}
            >
              <div className="flex items-center gap-1">
                Size
                <SortIcon column="size" />
              </div>
            </th>
            <th className="px-4 py-3 w-20">Shared</th>
            <th className="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSorted.map(doc => {
            const Icon = fileTypeIcons[doc.type] || File;
            const colorClass = fileTypeColors[doc.type] || 'text-muted-foreground';
            const isSelected = selectedItems.includes(doc.id);
            const expiry = getExpiryStatus(doc);
            const category = folders.find(f => f.id === doc.category);

            return (
              <tr
                key={doc.id}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors",
                  isSelected && "bg-primary/5"
                )}
                onClick={() => onPreview(doc)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(doc.id)}
                  />
                </td>
                <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleStar(doc.id)}
                    className={cn(
                      "p-1 rounded transition-colors",
                      doc.starred ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"
                    )}
                  >
                    <Star className={cn("w-4 h-4", doc.starred && "fill-current")} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5 shrink-0", colorClass)} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      {expiry && (
                        <div className={cn("flex items-center gap-1 text-xs mt-0.5", expiry.color)}>
                          <AlertTriangle className="w-3 h-3" />
                          {expiry.label}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {category && (
                    <Badge variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {format(new Date(doc.modifiedAt), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatBytes(doc.size)}
                </td>
                <td className="px-4 py-3">
                  {doc.shared && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">{doc.sharedWith.length}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDetails(doc)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare(doc)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
