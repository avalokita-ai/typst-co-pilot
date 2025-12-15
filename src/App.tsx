import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PDFReader from "./pages/PDFReader";
import Vault from "./pages/Vault";
import Signing from "./pages/Signing";
import SigningNew from "./pages/SigningNew";
import SigningDocument from "./pages/SigningDocument";
import SigningSign from "./pages/SigningSign";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pdf-reader" 
            element={
              <ProtectedRoute>
                <PDFReader />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vault" 
            element={
              <ProtectedRoute>
                <Vault />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signing" 
            element={
              <ProtectedRoute>
                <Signing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signing/new" 
            element={
              <ProtectedRoute>
                <SigningNew />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signing/document/:id" 
            element={
              <ProtectedRoute>
                <SigningDocument />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signing/sign/:id" 
            element={
              <ProtectedRoute>
                <SigningSign />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auth" 
            element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
