import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, FileText, Users, Pencil, Send, Check, X, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSigningContext, Recipient, SignatureField, SigningOrder } from '@/contexts/SigningContext';
import { useCreateSigningRequest } from '@/hooks/useSigningRequests';
import { FieldPlacementCanvas } from './FieldPlacementCanvas';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Upload Document', icon: Upload },
  { id: 2, title: 'Add Recipients', icon: Users },
  { id: 3, title: 'Place Fields', icon: Pencil },
  { id: 4, title: 'Review & Send', icon: Send },
];

const RECIPIENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function CreateSigningWizard() {
  const navigate = useNavigate();
  const { setCurrentDocument } = useSigningContext();
  const { createRequest, loading: creating } = useCreateSigningRequest();

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [signingOrder, setSigningOrder] = useState<SigningOrder>('parallel');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');
  const [fields, setFields] = useState<SignatureField[]>([]);

  // New recipient form
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '', role: 'signer' as const });

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      handleFileSelect(droppedFile);
    } else {
      toast.error('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }
    
    setIsUploading(true);
    setFile(selectedFile);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setFileUrl(URL.createObjectURL(selectedFile));
        toast.success('Document uploaded successfully');
      }
    }, 100);
  };

  const addRecipient = () => {
    if (!newRecipient.name || !newRecipient.email) {
      toast.error('Please enter name and email');
      return;
    }
    
    const recipient: Recipient = {
      id: crypto.randomUUID(),
      name: newRecipient.name,
      email: newRecipient.email,
      role: newRecipient.role,
      order: recipients.length,
      hasSigned: false,
      color: RECIPIENT_COLORS[recipients.length % RECIPIENT_COLORS.length],
    };
    
    setRecipients([...recipients, recipient]);
    setNewRecipient({ name: '', email: '', role: 'signer' });
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
    setFields(fields.filter(f => f.recipientId !== id));
  };

  const handleFieldsChange = (newFields: SignatureField[]) => {
    setFields(newFields);
  };

  const handleSend = async () => {
    const doc = await createRequest({
      name: file?.name || 'Untitled Document',
      fileUrl: fileUrl || '',
      recipients,
      fields,
      signingOrder,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      message,
      pageCount: 1,
    });

    if (doc) {
      toast.success('Signing request sent successfully!');
      navigate('/signing');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!file;
      case 2: return recipients.filter(r => r.role === 'signer').length > 0;
      case 3: return fields.filter(f => f.type === 'signature').length > 0;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/signing')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">New Signing Request</h1>
              <p className="text-sm text-muted-foreground">
                {file?.name || 'Upload a document to get started'}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="hidden md:flex items-center gap-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Upload Your Document</h2>
            
            {!file ? (
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop PDF here or click to browse</h3>
                <p className="text-muted-foreground mb-4">Maximum file size: 50MB</p>
                <Badge variant="secondary">PDF</Badge>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-14 bg-primary/10 rounded flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {isUploading && (
                        <Progress value={uploadProgress} className="mt-2 h-2" />
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setFile(null); setFileUrl(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Recipients */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Add Recipients</h2>

            {/* Signing Order */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sequential Signing Order</Label>
                    <p className="text-sm text-muted-foreground">Recipients must sign in order</p>
                  </div>
                  <Switch 
                    checked={signingOrder === 'sequential'}
                    onCheckedChange={(checked) => setSigningOrder(checked ? 'sequential' : 'parallel')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recipients List */}
            <div className="space-y-3 mb-6">
              {recipients.map((recipient, index) => (
                <Card key={recipient.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {signingOrder === 'sequential' && (
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      )}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback style={{ backgroundColor: recipient.color + '20', color: recipient.color }}>
                          {recipient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{recipient.name}</div>
                        <div className="text-sm text-muted-foreground">{recipient.email}</div>
                      </div>
                      <Badge variant="secondary" className="capitalize">{recipient.role}</Badge>
                      {signingOrder === 'sequential' && (
                        <Badge variant="outline">#{index + 1}</Badge>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => removeRecipient(recipient.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Recipient Form */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Add Recipient</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input 
                      placeholder="John Smith"
                      value={newRecipient.name}
                      onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      placeholder="john@example.com"
                      value={newRecipient.email}
                      onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select 
                      value={newRecipient.role} 
                      onValueChange={(v) => setNewRecipient({ ...newRecipient, role: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="signer">Signer</SelectItem>
                        <SelectItem value="approver">Approver</SelectItem>
                        <SelectItem value="viewer">Viewer (CC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addRecipient} className="mt-4" variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </CardContent>
            </Card>

            {/* Due Date & Message */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <Label>Due Date (Optional)</Label>
                <Input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Message to Recipients (Optional)</Label>
              <Textarea 
                placeholder="Add a message for all recipients..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 3: Place Fields */}
        {currentStep === 3 && (
          <div className="h-[calc(100vh-12rem)]">
            <FieldPlacementCanvas 
              fileUrl={fileUrl}
              recipients={recipients}
              fields={fields}
              onFieldsChange={handleFieldsChange}
            />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Review & Send</h2>

            <div className="space-y-6">
              {/* Document Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Document</h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-10 w-10 text-primary" />
                    <div>
                      <div className="font-medium">{file?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file?.size || 0 / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recipients Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Recipients ({recipients.length})</h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                  </div>
                  <div className="space-y-2">
                    {recipients.map((r, i) => (
                      <div key={r.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback style={{ backgroundColor: r.color + '20', color: r.color }} className="text-sm">
                            {r.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span className="font-medium">{r.name}</span>
                          <span className="text-muted-foreground ml-2">{r.email}</span>
                        </div>
                        <Badge variant="secondary" className="capitalize">{r.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fields Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Signature Fields ({fields.length})</h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Edit</Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {fields.filter(f => f.type === 'signature').length} signature fields, {' '}
                    {fields.filter(f => f.type !== 'signature').length} other fields
                  </div>
                </CardContent>
              </Card>

              {/* Message */}
              {message && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Message</h3>
                    <p className="text-muted-foreground">{message}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="max-w-2xl mx-auto flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={creating}>
              <Send className="h-4 w-4 mr-2" />
              {creating ? 'Sending...' : 'Send for Signature'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
