import { SigningProvider } from '@/contexts/SigningContext';
import { SigningDashboard } from '@/components/signing/SigningDashboard';

export default function Signing() {
  return (
    <SigningProvider>
      <SigningDashboard />
    </SigningProvider>
  );
}
