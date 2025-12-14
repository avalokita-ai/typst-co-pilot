import { useState, useCallback } from 'react';
import { Upload, X, FileText, Check, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { useUploadDocument } from '@/hooks/useVaultApi';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QueuedFile {
  file: File;
  category: string;
  tags: string[];
  expiryDate?: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { folders, addDocument } = useVault();
  const { uploadDocument } = useUploadDocument();
  const [dragActive, setDragActive] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>('');
  const [tagInput, setTagInput] = useState('');

  const categories = folders.filter(f => f.isCategory);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFilesToQueue(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFilesToQueue(files);
    }
  };

  const addFilesToQueue = (files: File[]) => {
    const newFiles: QueuedFile[] = files.map(file => ({
      file,
      category: defaultCategory,
      tags: [],
      status: 'pending',
      progress: 0,
    }));
    setQueuedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFromQueue = (index: number) => {
    setQueuedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateQueuedFile = (index: number, updates: Partial<QueuedFile>) => {
    setQueuedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, ...updates } : f
    ));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    for (let i = 0; i < queuedFiles.length; i++) {
      const queued = queuedFiles[i];
      if (queued.status !== 'pending') continue;

      updateQueuedFile(i, { status: 'uploading' });

      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 100));
        updateQueuedFile(i, { progress: p });
      }

      const doc = await uploadDocument(queued.file, {
        category: queued.category,
        tags: queued.tags,
        expiryDate: queued.expiryDate ? new Date(queued.expiryDate) : undefined,
      });

      if (doc) {
        addDocument(doc);
        updateQueuedFile(i, { status: 'complete', progress: 100 });
      } else {
        updateQueuedFile(i, { status: 'error' });
      }
    }
  };

  const pendingCount = queuedFiles.filter(f => f.status === 'pending').length;
  const completedCount = queuedFiles.filter(f => f.status === 'complete').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-1">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground mb-4">
              PDF, Images, Documents up to 50MB
            </p>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">PDF</Badge>
              <Badge variant="secondary">Images</Badge>
              <Badge variant="secondary">Documents</Badge>
            </div>
          </div>

          {/* Default Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Save to Category</Label>
              <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (optional)</Label>
              <Input
                placeholder="Enter tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Queued Files */}
          {queuedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Files to upload ({queuedFiles.length})
                </h4>
                {completedCount > 0 && (
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    {completedCount} completed
                  </Badge>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {queuedFiles.map((queued, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{queued.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(queued.file.size)}
                        </span>
                        {queued.status === 'uploading' && (
                          <Progress value={queued.progress} className="flex-1 h-1.5" />
                        )}
                        {queued.status === 'complete' && (
                          <Check className="w-4 h-4 text-success" />
                        )}
                        {queued.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    {queued.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFromQueue(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={pendingCount === 0}
          >
            Upload {pendingCount > 0 && `(${pendingCount})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
