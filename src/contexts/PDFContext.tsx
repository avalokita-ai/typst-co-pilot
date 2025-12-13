import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  pageCount: number;
  fileSize: number;
  uploadedAt: Date;
}

interface PDFContextType {
  // Document state
  documentUrl: string | null;
  documentMetadata: DocumentMetadata | null;
  isLoading: boolean;
  
  // Viewer state
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  
  // Chat state
  messages: ChatMessage[];
  isTyping: boolean;
  
  // Recent documents
  recentDocuments: DocumentMetadata[];
  
  // Actions
  setDocumentUrl: (url: string | null) => void;
  setDocumentMetadata: (metadata: DocumentMetadata | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoomLevel: (level: number) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setIsTyping: (typing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addRecentDocument: (doc: DocumentMetadata) => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

const RECENT_DOCS_KEY = 'pdf-reader-recent-docs';

export function PDFProvider({ children }: { children: ReactNode }) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<DocumentMetadata[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_DOCS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addRecentDocument = useCallback((doc: DocumentMetadata) => {
    setRecentDocuments(prev => {
      const filtered = prev.filter(d => d.id !== doc.id);
      const updated = [doc, ...filtered].slice(0, 10);
      localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <PDFContext.Provider
      value={{
        documentUrl,
        documentMetadata,
        isLoading,
        currentPage,
        totalPages,
        zoomLevel,
        messages,
        isTyping,
        recentDocuments,
        setDocumentUrl,
        setDocumentMetadata,
        setCurrentPage,
        setTotalPages,
        setZoomLevel,
        addMessage,
        clearMessages,
        setIsTyping,
        setIsLoading,
        addRecentDocument,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
}

export function usePDFContext() {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error('usePDFContext must be used within a PDFProvider');
  }
  return context;
}
