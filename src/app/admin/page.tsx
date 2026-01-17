'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { Inquiry } from '@/lib/storage';

// Empty mock data as we are now fetching from API (kept for reference)
const mockInquiries: Inquiry[] = [];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('January 15, 2026');
  const router = useRouter();



  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Load knowledge and inquiries on mount
  useEffect(() => {
    fetch('/api/admin/knowledge')
      .then((res) => res.json())
      .then((data) => setKnowledge(data.content || ''))
      .catch(() => setKnowledge('Failed to load knowledge base.'));

    // Initial fetch of inquiries
    const fetchInquiries = () => {
      fetch('/api/admin/inquiries')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setInquiries(data);
          }
        })
        .catch(console.error);
    };

    fetchInquiries();
    const interval = setInterval(fetchInquiries, 1000); // Poll every 1 second for responsiveness

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo password check
    if (password === 'admin' || password === 'littlesprouts') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Try "admin" for demo.');
    }
  };

  const handleSaveKnowledge = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: knowledge }),
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        setLastUpdated(new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }));
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setError('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = () => {
    // Simulate PDF upload processing
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setLastUpdated(new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }));
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const getConfidenceBadge = (confidence: 'green' | 'yellow' | 'red') => {
    const styles = {
      green: 'bg-green-100 text-green-800 hover:bg-green-100',
      yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      red: 'bg-red-100 text-red-800 hover:bg-red-100 animate-pulse',
    };
    const labels = {
      green: '✓ High',
      yellow: '? Medium',
      red: '! Low',
    };
    return (
      <Badge className={`${styles[confidence]} rounded-full`}>
        {labels[confidence]}
      </Badge>
    );
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-xl rounded-2xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mx-auto mb-4">
              <span className="text-3xl">👩‍💻</span>
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your admin password to access the control center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl text-center"
                  autoFocus
                />
                {error && (
                  <p className="text-destructive text-sm mt-2 text-center">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-12 rounded-2xl text-lg">
                Access Dashboard
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/')}
              >
                ← Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👩‍💻</span>
            <div>
              <span className="font-semibold text-lg">Little Sprouts Admin</span>
              <p className="text-xs text-secondary-foreground/70">Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-secondary-foreground/10 text-secondary-foreground border-secondary-foreground/20">
              Director Sarah
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
              onClick={() => setIsAuthenticated(false)}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="triage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md rounded-2xl h-12">
            <TabsTrigger value="triage" className="rounded-xl text-base">
              📋 Triage Dashboard
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="rounded-xl text-base">
              📚 Knowledge Base
            </TabsTrigger>
          </TabsList>

          {/* Triage Dashboard Tab */}
          <TabsContent value="triage" className="space-y-4">

            {/* Alert Banner */}
            {inquiries.some((i) => i.confidence === 'red') && (
              <Card className="bg-red-50 border-red-200 rounded-2xl">
                <CardContent className="py-4 flex items-center gap-4">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <p className="font-semibold text-red-900">Priority Alert</p>
                    <p className="text-sm text-red-700">
                      A parent requested to speak with a person. Review immediately.
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="ml-auto rounded-xl">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>🚨 Escalation Details</DialogTitle>
                        <DialogDescription>
                          Parent requested human assistance
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {inquiries.filter(i => i.confidence === 'red').map((esc, idx) => (
                           <div key={idx} className="border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                            <div>
                              <p className="font-medium">Parent:</p>
                              <p className="text-muted-foreground">{esc.parent} ({esc.child}&apos;s parent)</p>
                            </div>
                            <div className="mt-2">
                              <p className="font-medium">Topic:</p>
                              <p className="text-muted-foreground">{esc.topic || 'General Inquiry'}</p>
                            </div>
                            {esc.reviewReason && (
                              <div className="mt-2">
                                <p className="font-medium">Reason:</p>
                                <p className="text-muted-foreground">{esc.reviewReason}</p>
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="font-medium">Time:</p>
                              <p className="text-muted-foreground">{esc.timestamp}</p>
                            </div>
                           </div>
                        ))}
                        <div className="flex gap-2 mt-4">
                          <Button className="rounded-xl">📞 Call Parent</Button>
                          <Button variant="outline" className="rounded-xl">Mark Resolved</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{inquiries.length}</p>
                  <p className="text-sm text-muted-foreground">Total Today</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {inquiries.filter((i) => i.confidence === 'green').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Auto-Resolved</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {inquiries.filter((i) => i.confidence === 'yellow').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Needs Review</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {inquiries.filter((i) => i.confidence === 'red').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Escalated</p>
                </CardContent>
              </Card>
            </div>

            {/* Inquiries Table */}
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>AI-handled parent conversations - click row to view transcript</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>AI Confidence</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <p className="text-lg">No inquiries yet! 💬</p>
                          <p className="text-sm mt-1">Start a chat at <span className="font-mono">/chat</span> to see messages here.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      inquiries.map((inquiry) => (
                        <Fragment key={inquiry.id}>
                          <TableRow 
                            className={`cursor-pointer hover:bg-muted/50 ${inquiry.confidence === 'red' ? 'bg-red-50' : ''}`}
                            onClick={() => toggleRow(inquiry.id)}
                          >
                            <TableCell className="text-muted-foreground">
                              {expandedRows.has(inquiry.id) ? '▼' : '▶'}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{inquiry.lastUpdated || inquiry.timestamp}</TableCell>
                            <TableCell>{inquiry.parent}</TableCell>
                            <TableCell className="max-w-xs">
                              <span className="font-medium">{inquiry.topic || 'General Inquiry'}</span>
                              {inquiry.needsHumanReview && (
                                <Badge className="ml-2 bg-red-100 text-red-800 text-xs">Escalated</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {getConfidenceBadge(inquiry.confidence)}
                              {inquiry.confidenceScore !== undefined && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({Math.round(inquiry.confidenceScore * 100)}%)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={inquiry.confidence === 'red' ? 'font-bold text-red-600' : ''}>
                                {inquiry.status}
                              </span>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(inquiry.id) && (
                            <TableRow key={`${inquiry.id}-transcript`}>
                              <TableCell colSpan={6} className="bg-muted/30 p-4">
                                <div className="space-y-3">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    📝 Conversation Transcript
                                    {inquiry.reviewReason && (
                                      <span className="ml-2 text-red-600">| {inquiry.reviewReason}</span>
                                    )}
                                  </p>
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {inquiry.transcript?.map((msg, idx) => (
                                      <div 
                                        key={idx} 
                                        className={`p-2 rounded-lg text-sm ${
                                          msg.role === 'user' 
                                            ? 'bg-primary/10 ml-8' 
                                            : 'bg-card mr-8 border'
                                        }`}
                                      >
                                        <span className="font-medium text-xs text-muted-foreground">
                                          {msg.role === 'user' ? '👤 Parent' : '🤖 AI'} • {msg.timestamp}
                                        </span>
                                        <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                                      </div>
                                    )) || <p className="text-muted-foreground italic">No transcript available</p>}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Management Tab */}
          <TabsContent value="knowledge" className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              {/* Editor */}
              <div className="col-span-2">
                <Card className="rounded-2xl shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Policy Editor</CardTitle>
                        <CardDescription>
                          Edit school policies that the AI uses to answer questions
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Last updated:</p>
                        <p className="font-medium">{lastUpdated}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={knowledge}
                      onChange={(e) => setKnowledge(e.target.value)}
                      className="min-h-[400px] font-mono text-sm rounded-xl"
                      placeholder="Loading knowledge base..."
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Changes are applied instantly to the AI assistant.
                      </p>
                      <div className="flex gap-2">
                        {saveSuccess && (
                          <Badge className="bg-green-100 text-green-800 rounded-full">
                            ✓ Saved!
                          </Badge>
                        )}
                        <Button
                          onClick={handleSaveKnowledge}
                          disabled={isSaving}
                          className="rounded-xl"
                        >
                          {isSaving ? 'Saving...' : '💾 Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload & Info Panel */}
              <div className="space-y-4">
                <Card className="rounded-2xl shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">📄 Upload Document</CardTitle>
                    <CardDescription>
                      Upload a PDF or image of your handbook
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isUploading ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Analyzing Handbook...</p>
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {uploadProgress}% complete
                        </p>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={handleFileUpload}
                      >
                        <span className="text-3xl">📁</span>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Click to upload PDF/Image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (Simulated for demo)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Use clear headers with ## for sections</p>
                    <p>• Add [Action: ...] tags for clickable actions</p>
                    <p>• Use bold **text** for important info</p>
                    <p>• Keep policies concise and scannable</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
