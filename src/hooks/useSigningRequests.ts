import { useState, useCallback } from 'react';
import { SigningDocument, AuditEvent } from '@/contexts/SigningContext';

// Mock data for demonstration
const mockDocuments: SigningDocument[] = [
  {
    id: '1',
    name: 'Employment Contract - John Smith.pdf',
    fileUrl: '',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    senderId: 'user1',
    senderName: 'HR Department',
    senderEmail: 'hr@company.com',
    recipients: [
      { id: 'r1', name: 'John Smith', email: 'john@email.com', role: 'signer', order: 0, hasSigned: false, color: '#3b82f6' },
      { id: 'r2', name: 'Jane Doe', email: 'jane@company.com', role: 'approver', order: 1, hasSigned: false, color: '#10b981' },
    ],
    fields: [],
    signingOrder: 'sequential',
    pageCount: 5,
  },
  {
    id: '2',
    name: 'NDA Agreement.pdf',
    fileUrl: '',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    senderId: 'user1',
    senderName: 'Legal Team',
    senderEmail: 'legal@company.com',
    recipients: [
      { id: 'r3', name: 'Alice Johnson', email: 'alice@partner.com', role: 'signer', order: 0, hasSigned: true, signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), color: '#3b82f6' },
      { id: 'r4', name: 'Bob Wilson', email: 'bob@partner.com', role: 'signer', order: 1, hasSigned: false, color: '#10b981' },
      { id: 'r5', name: 'Carol Brown', email: 'carol@company.com', role: 'viewer', order: 2, hasSigned: false, color: '#f59e0b' },
    ],
    fields: [],
    signingOrder: 'sequential',
    pageCount: 3,
  },
  {
    id: '3',
    name: 'Service Agreement Q4.pdf',
    fileUrl: '',
    status: 'completed',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    senderId: 'user1',
    senderName: 'Sales Department',
    senderEmail: 'sales@company.com',
    recipients: [
      { id: 'r6', name: 'David Lee', email: 'david@client.com', role: 'signer', order: 0, hasSigned: true, signedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), color: '#3b82f6' },
    ],
    fields: [],
    signingOrder: 'parallel',
    pageCount: 12,
  },
  {
    id: '4',
    name: 'Lease Agreement Draft.pdf',
    fileUrl: '',
    status: 'draft',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    senderId: 'user1',
    senderName: 'You',
    senderEmail: 'you@company.com',
    recipients: [],
    fields: [],
    signingOrder: 'parallel',
    pageCount: 8,
  },
  {
    id: '5',
    name: 'Vendor Contract Renewal.pdf',
    fileUrl: '',
    status: 'expired',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    senderId: 'user1',
    senderName: 'Procurement',
    senderEmail: 'procurement@company.com',
    recipients: [
      { id: 'r7', name: 'Eve Martinez', email: 'eve@vendor.com', role: 'signer', order: 0, hasSigned: false, color: '#3b82f6' },
    ],
    fields: [],
    signingOrder: 'parallel',
    pageCount: 4,
  },
];

export function useSigningRequests() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (): Promise<SigningDocument[]> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockDocuments;
    } catch (err) {
      setError('Failed to fetch documents');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchDocuments, loading, error };
}

export function useCreateSigningRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCallback(async (document: Partial<SigningDocument>): Promise<SigningDocument | null> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newDoc: SigningDocument = {
        id: crypto.randomUUID(),
        name: document.name || 'Untitled Document',
        fileUrl: document.fileUrl || '',
        status: 'pending',
        createdAt: new Date(),
        dueDate: document.dueDate,
        senderId: 'current-user',
        senderName: 'You',
        senderEmail: 'you@company.com',
        recipients: document.recipients || [],
        fields: document.fields || [],
        signingOrder: document.signingOrder || 'parallel',
        message: document.message,
        pageCount: document.pageCount || 1,
      };
      return newDoc;
    } catch (err) {
      setError('Failed to create signing request');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createRequest, loading, error };
}

export function useSigningRequest(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<SigningDocument | null>(null);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const doc = mockDocuments.find(d => d.id === id) || null;
      setDocument(doc);
      return doc;
    } catch (err) {
      setError('Failed to fetch document');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { document, fetchDocument, loading, error };
}

export function useSubmitSignature() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitSignature = useCallback(async (
    documentId: string, 
    fieldId: string, 
    signatureData: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Signature submitted:', { documentId, fieldId, signatureData });
      return true;
    } catch (err) {
      setError('Failed to submit signature');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitSignature, loading, error };
}

export function useAuditTrail(documentId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  const fetchAuditTrail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockEvents: AuditEvent[] = [
        { id: '1', documentId, action: 'Document created', userId: 'user1', userName: 'HR Department', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: '2', documentId, action: 'Sent for signature', userId: 'user1', userName: 'HR Department', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: '3', documentId, action: 'Document viewed', userId: 'r3', userName: 'Alice Johnson', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { id: '4', documentId, action: 'Document signed', userId: 'r3', userName: 'Alice Johnson', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ];
      setEvents(mockEvents);
      return mockEvents;
    } catch (err) {
      setError('Failed to fetch audit trail');
      return [];
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  return { events, fetchAuditTrail, loading, error };
}
