import { 
  Search, Grid, List, ChevronDown, Upload, FolderPlus, 
  SlidersHorizontal, Bell, User, Settings, LogOut,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useVault } from '@/contexts/VaultContext';
import { cn } from '@/lib/utils';

interface VaultHeaderProps {
  onUpload: () => void;
  onNewFolder: () => void;
  onFilterToggle: () => void;
}

export function VaultHeader({ onUpload, onNewFolder, onFilterToggle }: VaultHeaderProps) {
  const { 
    viewMode, setViewMode, 
    sortBy, setSortBy, 
    sortOrder, setSortOrder,
    searchQuery, setSearchQuery,
    getBreadcrumbs,
    setCurrentFolderId
  } = useVault();

  const breadcrumbs = getBreadcrumbs();

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'modifiedAt', label: 'Date modified' },
    { value: 'createdAt', label: 'Date added' },
    { value: 'size', label: 'Size' },
  ];

  return (
    <div className="border-b border-border bg-background">
      {/* Breadcrumb Row */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                className="cursor-pointer hover:text-foreground"
                onClick={() => setCurrentFolderId(null)}
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => setCurrentFolderId(folder.id)}
                    >
                      {folder.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Controls Row */}
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border"
          />
        </div>

        {/* Filter Toggle */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onFilterToggle}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>

        {/* View Toggle */}
        <div className="flex items-center border border-border rounded-lg p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-md",
              viewMode === 'grid' && "bg-muted"
            )}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 rounded-md",
              viewMode === 'list' && "bg-muted"
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Sort: {sortOptions.find(o => o.value === sortBy)?.label}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  if (sortBy === option.value) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option.value as typeof sortBy);
                    setSortOrder('desc');
                  }
                }}
                className={cn(sortBy === option.value && "bg-muted")}
              >
                {option.label}
                {sortBy === option.value && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              New
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewFolder}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
