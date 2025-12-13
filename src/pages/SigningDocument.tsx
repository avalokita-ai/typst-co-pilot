import { SigningProvider } from '@/contexts/SigningContext';
import { DocumentViewer } from '@/components/signing/DocumentViewer';

export default function SigningDocument() {
  return (
    <SigningProvider>
      <DocumentViewer />
    </SigningProvider>
  );
}
