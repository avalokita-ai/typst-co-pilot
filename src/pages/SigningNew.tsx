import { SigningProvider } from '@/contexts/SigningContext';
import { CreateSigningWizard } from '@/components/signing/CreateSigningWizard';

export default function SigningNew() {
  return (
    <SigningProvider>
      <CreateSigningWizard />
    </SigningProvider>
  );
}
