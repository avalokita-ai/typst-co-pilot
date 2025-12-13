import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, ChevronDown, FileText, Clock, CheckCircle2, XCircle, AlertCircle, MoreHorizontal, Eye, RefreshCw, Ban, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useSigningContext, DocumentStatus } from '@/contexts/SigningContext';
import { useSigningRequests } from '@/hooks/useSigningRequests';
import { formatDistanceToNow, format, isPast } from 'date-fns';

const statusConfig: Record<DocumentStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileText },
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-500', icon: RefreshCw },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-500', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'bg-destructive/20 text-destructive', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground', icon: AlertCircle },
};

export function SigningDashboard() {
  const navigate = useNavigate();
  const { documents, setDocuments } = useSigningContext();
  const { fetchDocuments, loading } = useSigningRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, [fetchDocuments, setDocuments]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'waiting-me':
        return matchesSearch && (doc.status === 'pending' || doc.status === 'in_progress');
      case 'waiting-others':
        return matchesSearch && doc.status === 'in_progress';
      case 'completed':
        return matchesSearch && doc.status === 'completed';
      case 'drafts':
        return matchesSearch && doc.status === 'draft';
      default:
        return matchesSearch;
    }
  });

  const getSignedCount = (doc: typeof documents[0]) => {
    const signers = doc.recipients.filter(r => r.role === 'signer');
    const signed = signers.filter(r => r.hasSigned).length;
    return { signed, total: signers.length };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold tracking-tight">SignFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/signing/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Signing Request
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">JD</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Documents</h1>
          <p className="text-muted-foreground">Manage your signing requests and track document status</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="waiting-me">Waiting for me</TabsTrigger>
            <TabsTrigger value="waiting-others">Waiting for others</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-4">Create a new signing request to get started</p>
                <Button onClick={() => navigate('/signing/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Signing Request
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map(doc => {
                  const status = statusConfig[doc.status];
                  const StatusIcon = status.icon;
                  const { signed, total } = getSignedCount(doc);
                  const isOverdue = doc.dueDate && isPast(doc.dueDate) && doc.status !== 'completed';

                  return (
                    <Card 
                      key={doc.id} 
                      className="hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/signing/${doc.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Thumbnail */}
                          <div className="h-14 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-medium truncate">{doc.name}</h3>
                              <Badge variant="secondary" className={status.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>From: {doc.senderName}</span>
                              <span>Created {formatDistanceToNow(doc.createdAt, { addSuffix: true })}</span>
                              {doc.dueDate && (
                                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                                  Due {format(doc.dueDate, 'MMM d, yyyy')}
                                  {isOverdue && ' (Overdue)'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Recipients */}
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {doc.recipients.slice(0, 3).map(recipient => (
                                <Avatar key={recipient.id} className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback 
                                    style={{ backgroundColor: recipient.color + '20', color: recipient.color }}
                                    className="text-xs"
                                  >
                                    {recipient.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {doc.recipients.length > 3 && (
                                <Avatar className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className="text-xs bg-muted">
                                    +{doc.recipients.length - 3}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          {total > 0 && doc.status !== 'completed' && (
                            <div className="w-24 flex-shrink-0">
                              <div className="text-xs text-muted-foreground mb-1 text-right">
                                {signed}/{total} signed
                              </div>
                              <Progress value={(signed / total) * 100} className="h-1.5" />
                            </div>
                          )}

                          {/* Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Ban className="h-4 w-4 mr-2" />
                                Void
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
