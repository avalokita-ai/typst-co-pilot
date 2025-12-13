import { SigningProvider } from '@/contexts/SigningContext';
import { SigningView } from '@/components/signing/SigningView';

export default function SigningSign() {
  return (
    <SigningProvider>
      <SigningView />
    </SigningProvider>
  );
}
