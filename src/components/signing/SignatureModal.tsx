import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pen, Type, Upload, Trash2 } from 'lucide-react';
import { FieldType } from '@/contexts/SigningContext';

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldType: FieldType;
  onApply: (signatureData: string) => void;
  loading?: boolean;
}

const signatureFonts = [
  { name: 'Dancing Script', style: 'Dancing Script, cursive' },
  { name: 'Great Vibes', style: 'Great Vibes, cursive' },
  { name: 'Pacifico', style: 'Pacifico, cursive' },
  { name: 'Caveat', style: 'Caveat, cursive' },
  { name: 'Sacramento', style: 'Sacramento, cursive' },
];

export function SignatureModal({ open, onOpenChange, fieldType, onApply, loading }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(signatureFonts[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script&family=Great+Vibes&family=Pacifico&family=Caveat&family=Sacramento&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const getSignatureData = (): string | null => {
    switch (activeTab) {
      case 'draw':
        if (signatureRef.current?.isEmpty()) return null;
        return signatureRef.current?.toDataURL() || null;
      case 'type':
        return typedName.trim() || null;
      case 'upload':
        return uploadedImage;
      default:
        return null;
    }
  };

  const handleApply = () => {
    const data = getSignatureData();
    if (data && hasConsent) {
      onApply(activeTab === 'type' ? typedName : data);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isValid = hasConsent && getSignatureData() !== null;
  const title = fieldType === 'initials' ? 'Add Your Initials' : 'Add Your Signature';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw" className="gap-2">
              <Pen className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="gap-2">
              <Type className="h-4 w-4" />
              Type
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          {/* Draw Tab */}
          <TabsContent value="draw" className="mt-4">
            <div className="border border-border rounded-lg bg-background relative">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-40 cursor-crosshair',
                  style: { width: '100%', height: '160px' }
                }}
                backgroundColor="transparent"
                penColor="#000"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearSignature}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Draw your {fieldType === 'initials' ? 'initials' : 'signature'} above
            </p>
          </TabsContent>

          {/* Type Tab */}
          <TabsContent value="type" className="mt-4 space-y-4">
            <div>
              <Label>Your {fieldType === 'initials' ? 'Initials' : 'Name'}</Label>
              <Input
                placeholder={fieldType === 'initials' ? 'JD' : 'John Doe'}
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="mt-1"
              />
            </div>

            {typedName && (
              <div>
                <Label>Style</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {signatureFonts.map((font) => (
                    <button
                      key={font.name}
                      type="button"
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedFont.name === font.name
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedFont(font)}
                    >
                      <span
                        className="text-2xl"
                        style={{ fontFamily: font.style }}
                      >
                        {typedName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-4">
            {uploadedImage ? (
              <div className="relative border border-border rounded-lg p-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded signature" 
                  className="max-h-32 mx-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setUploadedImage(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('signature-upload')?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload your signature image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 2MB
                </p>
                <input
                  id="signature-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Legal Consent */}
        <div className="flex items-start gap-3 pt-4 border-t border-border">
          <Checkbox
            id="consent"
            checked={hasConsent}
            onCheckedChange={(checked) => setHasConsent(checked as boolean)}
          />
          <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer">
            I agree that this electronic signature is the legal equivalent of my manual signature
            and I consent to be legally bound by this document.
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!isValid || loading}>
            {loading ? 'Applying...' : 'Adopt and Sign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
