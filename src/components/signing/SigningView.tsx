import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, CheckCircle2, ChevronRight, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useSigningRequest, useSubmitSignature } from '@/hooks/useSigningRequests';
import { SignatureField } from '@/contexts/SigningContext';
import { SignatureModal } from './SignatureModal';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function SigningView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { document, fetchDocument, loading } = useSigningRequest(id || '');
  const { submitSignature, loading: submitting } = useSubmitSignature();

  const [fields, setFields] = useState<SignatureField[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  useEffect(() => {
    if (document) {
      // Simulate fields for this document
      const mockFields: SignatureField[] = [
        { id: '1', type: 'signature', recipientId: 'current', page: 1, x: 100, y: 400, width: 200, height: 60, required: true, completed: false },
        { id: '2', type: 'initials', recipientId: 'current', page: 1, x: 350, y: 400, width: 80, height: 40, required: true, completed: false },
        { id: '3', type: 'date', recipientId: 'current', page: 1, x: 100, y: 480, width: 120, height: 30, required: true, completed: false },
      ];
      setFields(mockFields);
    }
  }, [document]);

  const requiredFields = fields.filter(f => f.required);
  const completedFields = fields.filter(f => f.completed);
  const remainingRequired = requiredFields.length - completedFields.filter(f => f.required).length;

  const handleFieldClick = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && !field.completed) {
      setSelectedFieldId(fieldId);
      if (field.type === 'signature' || field.type === 'initials') {
        setShowSignatureModal(true);
      } else if (field.type === 'date') {
        // Auto-fill date
        handleSignatureApply(new Date().toLocaleDateString());
      }
    }
  };

  const handleSignatureApply = async (signatureData: string) => {
    if (!selectedFieldId || !id) return;

    const success = await submitSignature(id, selectedFieldId, signatureData);
    if (success) {
      setFields(fields.map(f => 
        f.id === selectedFieldId ? { ...f, completed: true, value: signatureData } : f
      ));
      setShowSignatureModal(false);
      setSelectedFieldId(null);

      // Move to next field
      const currentIndex = fields.findIndex(f => f.id === selectedFieldId);
      const nextIncomplete = fields.findIndex((f, i) => i > currentIndex && !f.completed && f.required);
      if (nextIncomplete !== -1) {
        setCurrentFieldIndex(nextIncomplete);
      }
    }
  };

  const handleNextField = () => {
    const nextIncomplete = fields.findIndex((f, i) => i > currentFieldIndex && !f.completed);
    if (nextIncomplete !== -1) {
      setCurrentFieldIndex(nextIncomplete);
      const field = fields[nextIncomplete];
      handleFieldClick(field.id);
    }
  };

  const handleFinish = () => {
    setIsComplete(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    toast.success('Document signed successfully!');
  };

  const handleDecline = () => {
    toast.error('Document declined');
    navigate('/signing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Signing Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Your signature has been recorded. All parties will receive a copy once everyone has signed.
            </p>
            <div className="space-y-3">
              <Button className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Signed Copy
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/signing')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/signing')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{document?.name || 'Document'}</h1>
              <p className="text-sm text-muted-foreground">
                From: {document?.senderName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {remainingRequired > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3 w-3" />
                {remainingRequired} field{remainingRequired !== 1 ? 's' : ''} remaining
              </Badge>
            )}
            
            <Button variant="outline" onClick={handleDecline}>
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>

            <Button 
              disabled={remainingRequired > 0}
              onClick={handleFinish}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finish
            </Button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border px-6 py-2 bg-muted/30">
        <div className="container mx-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Progress</span>
          <Progress 
            value={(completedFields.length / Math.max(requiredFields.length, 1)) * 100} 
            className="flex-1 h-2" 
          />
          <span className="text-sm font-medium">
            {completedFields.length}/{requiredFields.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Document Viewer */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <ScrollArea className="h-full">
              <div className="relative min-h-[800px] bg-muted/30 p-8">
                {/* Mock document content */}
                <div className="bg-background rounded shadow-lg p-8 max-w-2xl mx-auto min-h-[700px]">
                  <h2 className="text-2xl font-bold mb-4">Employment Agreement</h2>
                  <div className="prose prose-sm text-muted-foreground">
                    <p className="mb-4">
                      This Employment Agreement ("Agreement") is entered into as of the date signed below,
                      by and between the Company and the Employee.
                    </p>
                    <p className="mb-4">
                      WHEREAS, the Company desires to employ the Employee on the terms and conditions set forth herein...
                    </p>
                    <p className="mb-8">
                      NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth...
                    </p>
                  </div>

                  {/* Signature Fields */}
                  <div className="mt-16 space-y-6">
                    {fields.map(field => (
                      <div
                        key={field.id}
                        className={`inline-block cursor-pointer transition-all ${
                          field.completed 
                            ? 'opacity-100' 
                            : 'hover:scale-105'
                        }`}
                        style={{
                          position: 'relative',
                          marginRight: 24,
                        }}
                        onClick={() => handleFieldClick(field.id)}
                      >
                        {field.completed ? (
                          <div className="flex items-center gap-2">
                            {field.type === 'signature' && (
                              <div className="border-b-2 border-foreground px-4 py-2 font-signature text-2xl italic">
                                {field.value}
                              </div>
                            )}
                            {field.type === 'initials' && (
                              <div className="border-b-2 border-foreground px-2 py-1 font-signature text-xl italic">
                                {field.value}
                              </div>
                            )}
                            {field.type === 'date' && (
                              <div className="border-b-2 border-foreground px-2 py-1 text-sm">
                                {field.value}
                              </div>
                            )}
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </div>
                        ) : (
                          <div 
                            className={`border-2 border-dashed rounded px-4 py-3 flex items-center gap-2 ${
                              field.type === 'signature' 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-amber-500 bg-amber-500/5 text-amber-600'
                            }`}
                          >
                            {field.type === 'signature' && (
                              <>
                                <span className="text-sm font-medium">Sign Here</span>
                                <ChevronRight className="h-4 w-4" />
                              </>
                            )}
                            {field.type === 'initials' && (
                              <span className="text-sm font-medium">Initial</span>
                            )}
                            {field.type === 'date' && (
                              <span className="text-sm font-medium">Date</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Fields Panel */}
        <Card className="w-72 m-6 ml-0">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Required Fields</h3>
            <div className="space-y-2">
              {fields.filter(f => f.required).map((field, index) => (
                <div 
                  key={field.id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    field.completed 
                      ? 'bg-emerald-500/10' 
                      : currentFieldIndex === index 
                        ? 'bg-primary/10' 
                        : 'hover:bg-muted'
                  }`}
                  onClick={() => handleFieldClick(field.id)}
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    field.completed 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {field.completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm capitalize">{field.type}</div>
                    <div className="text-xs text-muted-foreground">Page {field.page}</div>
                  </div>
                </div>
              ))}
            </div>

            {remainingRequired > 0 && (
              <Button className="w-full mt-4" onClick={handleNextField}>
                Next Field
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        open={showSignatureModal}
        onOpenChange={setShowSignatureModal}
        fieldType={fields.find(f => f.id === selectedFieldId)?.type || 'signature'}
        onApply={handleSignatureApply}
        loading={submitting}
      />
    </div>
  );
}
