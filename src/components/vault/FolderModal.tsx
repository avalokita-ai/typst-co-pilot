import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVault } from '@/contexts/VaultContext';
import { useCreateFolder } from '@/hooks/useVaultApi';
import { cn } from '@/lib/utils';

interface FolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorOptions = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ef4444', label: 'Red' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#64748b', label: 'Gray' },
];

export function FolderModal({ open, onOpenChange }: FolderModalProps) {
  const { folders, currentFolderId, addFolder } = useVault();
  const { createFolder, creating } = useCreateFolder();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>(currentFolderId || '');
  const [color, setColor] = useState('#3b82f6');

  const parentFolders = folders.filter(f => !f.isCategory);

  const handleCreate = async () => {
    if (!name.trim()) return;

    const folder = await createFolder(name, parentId || null, color);
    if (folder) {
      addFolder(folder);
      onOpenChange(false);
      setName('');
      setColor('#3b82f6');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            Create Folder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Folder Name</Label>
            <Input
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
              autoFocus
            />
          </div>

          <div>
            <Label>Parent Folder (optional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Root folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Root folder</SelectItem>
                {parentFolders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Folder Color</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {colorOptions.map(opt => (
                <button
                  key={opt.value}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all",
                    color === opt.value && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                  )}
                  style={{ backgroundColor: opt.value }}
                  onClick={() => setColor(opt.value)}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create Folder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
