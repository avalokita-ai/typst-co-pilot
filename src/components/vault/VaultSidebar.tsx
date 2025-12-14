import { useState } from 'react';
import { 
  Home, Clock, Star, Users, Trash2, Plus, 
  FileText, CreditCard, FileCheck, Award, Heart, GraduationCap,
  ChevronDown, ChevronRight, FolderPlus, HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useVault } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';

interface VaultSidebarProps {
  onNewFolder: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  'cat-id': FileText,
  'cat-financial': CreditCard,
  'cat-agreements': FileCheck,
  'cat-licenses': Award,
  'cat-medical': Heart,
  'cat-education': GraduationCap,
};

const categoryColors: Record<string, string> = {
  'cat-id': 'text-blue-400',
  'cat-financial': 'text-green-400',
  'cat-agreements': 'text-amber-400',
  'cat-licenses': 'text-purple-400',
  'cat-medical': 'text-red-400',
  'cat-education': 'text-cyan-400',
};

export function VaultSidebar({ onNewFolder, activeView, setActiveView }: VaultSidebarProps) {
  const { folders, setCurrentFolderId, storageUsed, storageTotal, documents } = useVault();
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const storagePercentage = (storageUsed / storageTotal) * 100;

  const categories = folders.filter(f => f.isCategory);
  const customFolders = folders.filter(f => !f.isCategory);

  const navItems = [
    { id: 'home', icon: Home, label: 'All Files', count: documents.length },
    { id: 'recent', icon: Clock, label: 'Recent', count: 5 },
    { id: 'starred', icon: Star, label: 'Starred', count: documents.filter(d => d.starred).length },
    { id: 'shared', icon: Users, label: 'Shared with me', count: 3 },
    { id: 'trash', icon: Trash2, label: 'Trash', count: 0 },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    if (id === 'home') {
      setCurrentFolderId(null);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveView('category');
    setCurrentFolderId(categoryId);
  };

  return (
    <div className="w-[260px] h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">DocVault</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                activeView === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count > 0 && (
                <span className="text-xs text-muted-foreground">{item.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Categories */}
        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen} className="mt-6">
          <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
            <span>Categories</span>
            {categoriesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1">
            {categories.map(category => {
              const Icon = categoryIcons[category.id] || FileText;
              const colorClass = categoryColors[category.id] || 'text-muted-foreground';
              const docCount = documents.filter(d => d.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeView === 'category' && category.id === folders.find(f => f.id)?.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", colorClass)} />
                  <span className="flex-1 text-left">{category.name}</span>
                  <span className="text-xs text-muted-foreground">{docCount}</span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Custom Folders */}
        {customFolders.length > 0 && (
          <div className="mt-6">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Folders
            </div>
            <div className="mt-1 space-y-1">
              {customFolders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleCategoryClick(folder.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New Folder Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={onNewFolder}
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </Button>
      </ScrollArea>

      {/* Storage Usage */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Storage</span>
          <span>{formatBytes(storageUsed)} of {formatBytes(storageTotal)}</span>
        </div>
        <Progress value={storagePercentage} className="h-1.5" />
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 text-xs"
        >
          Upgrade Storage
        </Button>
      </div>
    </div>
  );
}
