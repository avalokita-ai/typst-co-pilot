import { X, FolderInput, Tag, Share2, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVault } from '@/contexts/VaultContext';
import { toast } from 'sonner';

interface BulkActionsBarProps {
  onShare: () => void;
}

export function BulkActionsBar({ onShare }: BulkActionsBarProps) {
  const { 
    selectedItems, 
    clearSelection, 
    deleteDocuments, 
    moveDocuments,
    folders 
  } = useVault();

  if (selectedItems.length === 0) return null;

  const categories = folders.filter(f => f.isCategory);

  const handleDelete = () => {
    deleteDocuments(selectedItems);
    toast.success(`${selectedItems.length} item(s) deleted`);
  };

  const handleMove = (folderId: string | null) => {
    moveDocuments(selectedItems, folderId);
    toast.success(`${selectedItems.length} item(s) moved`);
  };

  const handleDownload = () => {
    toast.success(`Downloading ${selectedItems.length} item(s) as ZIP...`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border shadow-lg">
        <span className="text-sm font-medium mr-2">
          {selectedItems.length} selected
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <FolderInput className="w-4 h-4" />
              Move
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleMove(null)}>
              Root folder
            </DropdownMenuItem>
            {categories.map(cat => (
              <DropdownMenuItem 
                key={cat.id}
                onClick={() => handleMove(cat.id)}
              >
                {cat.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="gap-2" onClick={onShare}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        <Button variant="ghost" size="sm" className="gap-2" onClick={handleDownload}>
          <Download className="w-4 h-4" />
          Download
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearSelection}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
