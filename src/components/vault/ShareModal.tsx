import { useState } from 'react';
import { X, Copy, Check, Link, Lock, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { VaultDocument } from '@/contexts/VaultContext';
import { useShareDocument } from '@/hooks/useVaultApi';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: VaultDocument | null;
}

interface ShareRecipient {
  email: string;
  permission: 'view' | 'download' | 'edit';
}

export function ShareModal({ open, onOpenChange, document }: ShareModalProps) {
  const { shareDocument, sharing } = useShareDocument();
  const [emailInput, setEmailInput] = useState('');
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState<string>('');
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const addRecipient = () => {
    if (!emailInput.trim()) return;
    if (recipients.find(r => r.email === emailInput)) {
      toast.error('This email is already added');
      return;
    }
    setRecipients(prev => [...prev, { email: emailInput, permission: 'view' }]);
    setEmailInput('');
  };

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r.email !== email));
  };

  const updatePermission = (email: string, permission: ShareRecipient['permission']) => {
    setRecipients(prev => prev.map(r => 
      r.email === email ? { ...r, permission } : r
    ));
  };

  const handleShare = async () => {
    const link = await shareDocument({
      documentId: document.id,
      emails: recipients.map(r => r.email),
      permission: 'view',
      linkEnabled,
      linkExpiry: linkExpiry ? new Date(linkExpiry) : undefined,
      passwordProtected,
      password: passwordProtected ? password : undefined,
    });

    if (link) {
      setShareLink(link);
      toast.success('Document shared successfully');
    }
  };

  const copyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share "{document.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add People */}
          <div>
            <Label>Add people</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Enter email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                type="email"
              />
              <Button onClick={addRecipient}>Add</Button>
            </div>
          </div>

          {/* Recipients List */}
          {recipients.length > 0 && (
            <div className="space-y-2">
              {recipients.map(recipient => (
                <div
                  key={recipient.email}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {recipient.email[0].toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm truncate">{recipient.email}</span>
                  <Select
                    value={recipient.permission}
                    onValueChange={(v) => updatePermission(recipient.email, v as ShareRecipient['permission'])}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View only</SelectItem>
                      <SelectItem value="download">Can download</SelectItem>
                      <SelectItem value="edit">Can edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeRecipient(recipient.email)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Link Sharing */}
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Share via link</span>
              </div>
              <Switch checked={linkEnabled} onCheckedChange={setLinkEnabled} />
            </div>

            {linkEnabled && (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareLink || 'Link will be generated...'}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    disabled={!shareLink}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3" />
                      Expiry date
                    </Label>
                    <Input
                      type="date"
                      value={linkExpiry}
                      onChange={(e) => setLinkExpiry(e.target.value)}
                      className="mt-1.5 text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3" />
                        Password
                      </Label>
                      <Switch
                        checked={passwordProtected}
                        onCheckedChange={setPasswordProtected}
                      />
                    </div>
                    {passwordProtected && (
                      <Input
                        type="password"
                        placeholder="Set password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Current Shares */}
          {document.sharedWith.length > 0 && (
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Currently shared with
              </Label>
              <div className="flex flex-wrap gap-2">
                {document.sharedWith.map(email => (
                  <Badge key={email} variant="secondary">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={sharing}>
            {sharing ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
