import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type RecipientRole = 'signer' | 'viewer' | 'approver';
export type SigningOrder = 'sequential' | 'parallel';
export type DocumentStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'declined' | 'expired';
export type FieldType = 'signature' | 'initials' | 'date' | 'text' | 'checkbox' | 'dropdown';

export interface Recipient {
  id: string;
  name: string;
  email: string;
  role: RecipientRole;
  order: number;
  hasSigned: boolean;
  signedAt?: Date;
  color: string;
}

export interface SignatureField {
  id: string;
  type: FieldType;
  recipientId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  value?: string;
  completed: boolean;
}

export interface SigningDocument {
  id: string;
  name: string;
  fileUrl: string;
  thumbnailUrl?: string;
  status: DocumentStatus;
  createdAt: Date;
  dueDate?: Date;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipients: Recipient[];
  fields: SignatureField[];
  signingOrder: SigningOrder;
  message?: string;
  pageCount: number;
}

export interface AuditEvent {
  id: string;
  documentId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details?: string;
}

interface SigningContextType {
  documents: SigningDocument[];
  currentDocument: SigningDocument | null;
  auditTrail: AuditEvent[];
  
  // Document operations
  setDocuments: (docs: SigningDocument[]) => void;
  addDocument: (doc: SigningDocument) => void;
  updateDocument: (id: string, updates: Partial<SigningDocument>) => void;
  setCurrentDocument: (doc: SigningDocument | null) => void;
  
  // Field operations
  addField: (field: SignatureField) => void;
  updateField: (fieldId: string, updates: Partial<SignatureField>) => void;
  removeField: (fieldId: string) => void;
  
  // Recipient operations
  addRecipient: (recipient: Recipient) => void;
  updateRecipient: (recipientId: string, updates: Partial<Recipient>) => void;
  removeRecipient: (recipientId: string) => void;
  reorderRecipients: (recipientIds: string[]) => void;
  
  // Audit trail
  setAuditTrail: (events: AuditEvent[]) => void;
}

const SigningContext = createContext<SigningContextType | undefined>(undefined);

const RECIPIENT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function SigningProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<SigningDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<SigningDocument | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);

  const addDocument = useCallback((doc: SigningDocument) => {
    setDocuments(prev => [...prev, doc]);
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<SigningDocument>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
    if (currentDocument?.id === id) {
      setCurrentDocument(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentDocument]);

  const addField = useCallback((field: SignatureField) => {
    if (currentDocument) {
      const updatedFields = [...currentDocument.fields, field];
      setCurrentDocument({ ...currentDocument, fields: updatedFields });
    }
  }, [currentDocument]);

  const updateField = useCallback((fieldId: string, updates: Partial<SignatureField>) => {
    if (currentDocument) {
      const updatedFields = currentDocument.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      );
      setCurrentDocument({ ...currentDocument, fields: updatedFields });
    }
  }, [currentDocument]);

  const removeField = useCallback((fieldId: string) => {
    if (currentDocument) {
      const updatedFields = currentDocument.fields.filter(f => f.id !== fieldId);
      setCurrentDocument({ ...currentDocument, fields: updatedFields });
    }
  }, [currentDocument]);

  const addRecipient = useCallback((recipient: Recipient) => {
    if (currentDocument) {
      const colorIndex = currentDocument.recipients.length % RECIPIENT_COLORS.length;
      const recipientWithColor = { ...recipient, color: RECIPIENT_COLORS[colorIndex] };
      const updatedRecipients = [...currentDocument.recipients, recipientWithColor];
      setCurrentDocument({ ...currentDocument, recipients: updatedRecipients });
    }
  }, [currentDocument]);

  const updateRecipient = useCallback((recipientId: string, updates: Partial<Recipient>) => {
    if (currentDocument) {
      const updatedRecipients = currentDocument.recipients.map(r => 
        r.id === recipientId ? { ...r, ...updates } : r
      );
      setCurrentDocument({ ...currentDocument, recipients: updatedRecipients });
    }
  }, [currentDocument]);

  const removeRecipient = useCallback((recipientId: string) => {
    if (currentDocument) {
      const updatedRecipients = currentDocument.recipients.filter(r => r.id !== recipientId);
      // Also remove fields assigned to this recipient
      const updatedFields = currentDocument.fields.filter(f => f.recipientId !== recipientId);
      setCurrentDocument({ ...currentDocument, recipients: updatedRecipients, fields: updatedFields });
    }
  }, [currentDocument]);

  const reorderRecipients = useCallback((recipientIds: string[]) => {
    if (currentDocument) {
      const reordered = recipientIds.map((id, index) => {
        const recipient = currentDocument.recipients.find(r => r.id === id);
        return recipient ? { ...recipient, order: index } : null;
      }).filter(Boolean) as Recipient[];
      setCurrentDocument({ ...currentDocument, recipients: reordered });
    }
  }, [currentDocument]);

  return (
    <SigningContext.Provider value={{
      documents,
      currentDocument,
      auditTrail,
      setDocuments,
      addDocument,
      updateDocument,
      setCurrentDocument,
      addField,
      updateField,
      removeField,
      addRecipient,
      updateRecipient,
      removeRecipient,
      reorderRecipients,
      setAuditTrail,
    }}>
      {children}
    </SigningContext.Provider>
  );
}

export function useSigningContext() {
  const context = useContext(SigningContext);
  if (!context) {
    throw new Error('useSigningContext must be used within a SigningProvider');
  }
  return context;
}
