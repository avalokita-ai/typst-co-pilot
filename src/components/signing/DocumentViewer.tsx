import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Printer, FileText, Clock, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSigningRequest, useAuditTrail } from '@/hooks/useSigningRequests';
import { formatDistanceToNow, format } from 'date-fns';

export function DocumentViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { document, fetchDocument, loading } = useSigningRequest(id || '');
  const { events, fetchAuditTrail, loading: loadingAudit } = useAuditTrail(id || '');

  useEffect(() => {
    fetchDocument();
    fetchAuditTrail();
  }, [fetchDocument, fetchAuditTrail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Document not found</h2>
          <Button onClick={() => navigate('/signing')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    pending: 'bg-amber-500/20 text-amber-500',
    in_progress: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-emerald-500/20 text-emerald-500',
    declined: 'bg-destructive/20 text-destructive',
    expired: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/signing')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{document.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>From: {document.senderName}</span>
                <Badge variant="secondary" className={statusColors[document.status]}>
                  {document.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            {document.status !== 'completed' && (
              <Button onClick={() => navigate(`/signing/${id}/sign`)}>
                Sign Document
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Document Preview */}
          <div className="flex-1">
            <Card className="h-[800px]">
              <ScrollArea className="h-full">
                <div className="p-8 bg-muted/30 min-h-full">
                  <div className="bg-background rounded shadow-lg p-8 max-w-2xl mx-auto min-h-[700px]">
                    <div className="flex items-center gap-4 mb-8">
                      <FileText className="h-12 w-12 text-primary" />
                      <div>
                        <h2 className="text-2xl font-bold">{document.name}</h2>
                        <p className="text-muted-foreground">
                          {document.pageCount} page{document.pageCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="prose prose-sm text-muted-foreground">
                      <p>Document preview would be rendered here using @react-pdf-viewer</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Recipients */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {document.recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback 
                        style={{ backgroundColor: recipient.color + '20', color: recipient.color }}
                        className="text-xs"
                      >
                        {recipient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{recipient.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{recipient.email}</div>
                    </div>
                    {recipient.hasSigned ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {index < events.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-medium text-sm">{event.action}</div>
                          <div className="text-xs text-muted-foreground">
                            {event.userName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(event.timestamp, 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Certificate of Completion */}
            {document.status === 'completed' && (
              <Card>
                <CardContent className="p-4">
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
