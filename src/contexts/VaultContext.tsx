import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface VaultDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'spreadsheet' | 'folder';
  size: number;
  category: string;
  folderId: string | null;
  createdAt: Date;
  modifiedAt: Date;
  expiryDate?: Date;
  thumbnail?: string;
  starred: boolean;
  shared: boolean;
  sharedWith: string[];
  tags: string[];
  description?: string;
  versions: { id: string; createdAt: Date; size: number }[];
}

export interface VaultFolder {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: Date;
  isCategory: boolean;
}

export interface ShareSettings {
  documentId: string;
  emails: string[];
  permission: 'view' | 'download' | 'edit';
  linkEnabled: boolean;
  linkExpiry?: Date;
  passwordProtected: boolean;
  password?: string;
}

interface VaultContextType {
  documents: VaultDocument[];
  folders: VaultFolder[];
  selectedItems: string[];
  currentFolderId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'modifiedAt' | 'createdAt' | 'size';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  filters: {
    fileTypes: string[];
    categories: string[];
    dateRange: { start?: Date; end?: Date };
    sharedStatus: 'all' | 'shared-by-me' | 'shared-with-me' | 'not-shared';
    tags: string[];
  };
  storageUsed: number;
  storageTotal: number;
  
  setDocuments: (docs: VaultDocument[]) => void;
  setFolders: (folders: VaultFolder[]) => void;
  addDocument: (doc: VaultDocument) => void;
  updateDocument: (id: string, updates: Partial<VaultDocument>) => void;
  deleteDocuments: (ids: string[]) => void;
  addFolder: (folder: VaultFolder) => void;
  deleteFolder: (id: string) => void;
  setSelectedItems: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setCurrentFolderId: (id: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: 'name' | 'modifiedAt' | 'createdAt' | 'size') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: VaultContextType['filters']) => void;
  toggleStar: (id: string) => void;
  moveDocuments: (ids: string[], folderId: string | null) => void;
  getBreadcrumbs: () => VaultFolder[];
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Default categories
const defaultCategories: VaultFolder[] = [
  { id: 'cat-id', name: 'ID Documents', parentId: null, color: '#3b82f6', createdAt: new Date(), isCategory: true },
  { id: 'cat-financial', name: 'Financial', parentId: null, color: '#22c55e', createdAt: new Date(), isCategory: true },
  { id: 'cat-agreements', name: 'Agreements', parentId: null, color: '#f59e0b', createdAt: new Date(), isCategory: true },
  { id: 'cat-licenses', name: 'Licenses', parentId: null, color: '#8b5cf6', createdAt: new Date(), isCategory: true },
  { id: 'cat-medical', name: 'Medical', parentId: null, color: '#ef4444', createdAt: new Date(), isCategory: true },
  { id: 'cat-education', name: 'Education', parentId: null, color: '#06b6d4', createdAt: new Date(), isCategory: true },
];

// Mock documents for demo
const mockDocuments: VaultDocument[] = [
  {
    id: '1',
    name: 'Passport Scan.pdf',
    type: 'pdf',
    size: 2500000,
    category: 'cat-id',
    folderId: 'cat-id',
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2024-01-15'),
    expiryDate: new Date('2029-06-20'),
    starred: true,
    shared: false,
    sharedWith: [],
    tags: ['passport', 'travel'],
    versions: [],
  },
  {
    id: '2',
    name: 'Tax Return 2023.pdf',
    type: 'pdf',
    size: 1800000,
    category: 'cat-financial',
    folderId: 'cat-financial',
    createdAt: new Date('2024-03-10'),
    modifiedAt: new Date('2024-03-10'),
    starred: false,
    shared: true,
    sharedWith: ['accountant@email.com'],
    tags: ['taxes', '2023'],
    versions: [],
  },
  {
    id: '3',
    name: 'Employment Contract.pdf',
    type: 'pdf',
    size: 450000,
    category: 'cat-agreements',
    folderId: 'cat-agreements',
    createdAt: new Date('2023-08-01'),
    modifiedAt: new Date('2023-08-01'),
    starred: true,
    shared: false,
    sharedWith: [],
    tags: ['work', 'contract'],
    versions: [],
  },
  {
    id: '4',
    name: 'Drivers License.jpg',
    type: 'image',
    size: 1200000,
    category: 'cat-licenses',
    folderId: 'cat-licenses',
    createdAt: new Date('2024-02-20'),
    modifiedAt: new Date('2024-02-20'),
    expiryDate: new Date('2025-02-20'),
    starred: false,
    shared: false,
    sharedWith: [],
    tags: ['license', 'driving'],
    versions: [],
  },
  {
    id: '5',
    name: 'Medical Report 2024.pdf',
    type: 'pdf',
    size: 3200000,
    category: 'cat-medical',
    folderId: 'cat-medical',
    createdAt: new Date('2024-06-05'),
    modifiedAt: new Date('2024-06-05'),
    starred: false,
    shared: false,
    sharedWith: [],
    tags: ['health', 'checkup'],
    versions: [],
  },
];

export function VaultProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<VaultDocument[]>(mockDocuments);
  const [folders, setFolders] = useState<VaultFolder[]>(defaultCategories);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'modifiedAt' | 'createdAt' | 'size'>('modifiedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<VaultContextType['filters']>({
    fileTypes: [],
    categories: [],
    dateRange: {},
    sharedStatus: 'all',
    tags: [],
  });

  // Calculate storage
  const storageUsed = documents.reduce((acc, doc) => acc + doc.size, 0);
  const storageTotal = 15 * 1024 * 1024 * 1024; // 15 GB

  const addDocument = useCallback((doc: VaultDocument) => {
    setDocuments(prev => [...prev, doc]);
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<VaultDocument>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates, modifiedAt: new Date() } : doc
    ));
  }, []);

  const deleteDocuments = useCallback((ids: string[]) => {
    setDocuments(prev => prev.filter(doc => !ids.includes(doc.id)));
    setSelectedItems([]);
  }, []);

  const addFolder = useCallback((folder: VaultFolder) => {
    setFolders(prev => [...prev, folder]);
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setDocuments(prev => prev.map(doc => 
      doc.folderId === id ? { ...doc, folderId: null } : doc
    ));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    const currentDocs = documents.filter(d => d.folderId === currentFolderId);
    setSelectedItems(currentDocs.map(d => d.id));
  }, [documents, currentFolderId]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const toggleStar = useCallback((id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, starred: !doc.starred } : doc
    ));
  }, []);

  const moveDocuments = useCallback((ids: string[], folderId: string | null) => {
    setDocuments(prev => prev.map(doc => 
      ids.includes(doc.id) ? { ...doc, folderId, modifiedAt: new Date() } : doc
    ));
    setSelectedItems([]);
  }, []);

  const getBreadcrumbs = useCallback((): VaultFolder[] => {
    const crumbs: VaultFolder[] = [];
    let current = folders.find(f => f.id === currentFolderId);
    while (current) {
      crumbs.unshift(current);
      current = folders.find(f => f.id === current?.parentId);
    }
    return crumbs;
  }, [folders, currentFolderId]);

  return (
    <VaultContext.Provider
      value={{
        documents,
        folders,
        selectedItems,
        currentFolderId,
        viewMode,
        sortBy,
        sortOrder,
        searchQuery,
        filters,
        storageUsed,
        storageTotal,
        setDocuments,
        setFolders,
        addDocument,
        updateDocument,
        deleteDocuments,
        addFolder,
        deleteFolder,
        setSelectedItems,
        toggleSelection,
        selectAll,
        clearSelection,
        setCurrentFolderId,
        setViewMode,
        setSortBy,
        setSortOrder,
        setSearchQuery,
        setFilters,
        toggleStar,
        moveDocuments,
        getBreadcrumbs,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
