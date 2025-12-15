import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, Users, ArrowRight, FileSignature } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePDFContext } from '@/contexts/PDFContext';

interface SignDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignDocumentModal({ open, onOpenChange }: SignDocumentModalProps) {
  const navigate = useNavigate();
  const { documentMetadata, documentUrl } = usePDFContext();
  const [selectedOption, setSelectedOption] = useState<'sign' | 'create' | null>(null);

  const handleSignNow = () => {
    // Navigate to signing view with the current document
    // In a real app, this would check if there's an existing signing request for this doc
    navigate('/signing/sign/current-doc', { 
      state: { 
        documentUrl, 
        documentName: documentMetadata?.filename 
      } 
    });
    onOpenChange(false);
  };

  const handleCreateRequest = () => {
    // Navigate to create signing request wizard with pre-loaded document
    navigate('/signing/new', { 
      state: { 
        documentUrl, 
        documentName: documentMetadata?.filename 
      } 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Sign Document
          </DialogTitle>
          <DialogDescription>
            Choose how you want to proceed with signing "{documentMetadata?.filename}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Option 1: Sign Now */}
          <button
            onClick={() => setSelectedOption('sign')}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selectedOption === 'sign'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className={`p-3 rounded-lg ${
              selectedOption === 'sign' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <PenTool className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Sign This Document</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your signature to complete an existing signing request or sign the document yourself
              </p>
            </div>
          </button>

          {/* Option 2: Create Signing Request */}
          <button
            onClick={() => setSelectedOption('create')}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
              selectedOption === 'create'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className={`p-3 rounded-lg ${
              selectedOption === 'create' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Create Signing Request</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Send this document to multiple people for signatures. Set up signing order and place signature fields
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={selectedOption === 'sign' ? handleSignNow : handleCreateRequest}
            disabled={!selectedOption}
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
