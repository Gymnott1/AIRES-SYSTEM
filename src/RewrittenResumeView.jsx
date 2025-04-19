import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { FileDown, FileEdit, RotateCw, FileWarning } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Textarea } from './components/ui/textarea';
import { Alert, AlertDescription } from './components/ui/alert';
import { useToast } from './components/ui/use-toast';
import axios from 'axios';
import './RewrittenResumeView.css';
import './rewrite.css';

const RewrittenResumeView = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [originalPdfUrl, setOriginalPdfUrl] = useState('');
  const [rewrittenResume, setRewrittenResume] = useState('');
  const [previewMode, setPreviewMode] = useState('side-by-side');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    // Load rewritten content from localStorage
    const storedResumeData = localStorage.getItem(`rewritten_resume_${resumeId}`);
    if (storedResumeData) {
      try {
        const data = JSON.parse(storedResumeData);
        setRewrittenResume(data.content || '');
      } catch (e) {
        console.error("Error parsing stored resume data:", e);
        setError("Could not load saved resume content.");
      }
    } else {
      setError("No rewritten resume found. Please go back and rewrite your resume first.");
    }

    // Set PDF URL
    if (resumeId) {
      const pdfUrl = `http://localhost:8000/api/resume/${resumeId}/pdf/`;
      setOriginalPdfUrl(pdfUrl);
    }
  }, [resumeId]);

  const handleRevisionRequest = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide specific feedback for the revision",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Token ${token}` } : {};

      const response = await axios.post(
        'http://localhost:8000/api/revise_resume/',
        {
          resume_id: resumeId,
          feedback: feedback,
          current_version: rewrittenResume
        },
        { headers }
      );

      const processedContent = preprocessResumeContent(response.data.revised_content);
      setRewrittenResume(processedContent);

      // Update localStorage with new content
      localStorage.setItem(`rewritten_resume_${resumeId}`, JSON.stringify({
        content: processedContent,
        timestamp: new Date().toISOString()
      }));

      setFeedback('');
      toast({
        title: "Resume revised successfully",
        description: "Your feedback has been incorporated",
        variant: "default",
      });
    } catch (error) {
      console.error("Resume revision error:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to revise resume.";
      setError(errorMsg);
      toast({ title: "Revision Error", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/generate_pdf/',
        { resume_id: resumeId, content: rewrittenResume },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'improved_resume.pdf');
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast({
        title: "Download complete",
        description: "Your improved resume has been downloaded",
        variant: "default",
      });
    } catch (error) {
      console.error("PDF download error:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to generate PDF.";
      setError(errorMsg);
      toast({ title: "Download Error", description: errorMsg, variant: "destructive" });
    } finally {
      setDownloadLoading(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  // Helper functions for rendering markdown content
  const preprocessResumeContent = (content) => {
    if (!content) return '';
    let processedContent = content.replace(/\\n/g, '\n');
    const lines = processedContent.split('\n');
    const processedLines = lines.map(line => {
      let trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        trimmedLine = trimmedLine.replace(/^(#+)(\S)/, '$1 $2');
      }
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        trimmedLine = trimmedLine.replace(/^([*-])(\S)/, '$1 $2');
      }
      if (trimmedLine.includes('[') && trimmedLine.includes('](')) {
        trimmedLine = trimmedLine.replace(/\[([^\]]+)\]\s*\(\s*([^)]+?)\s*\)/g, '[$1]($2)');
      }
      return trimmedLine;
    });
    return processedLines.join('\n');
  };

  const renderInlineMarkdown = (text, lineKey) => {
    try {
      const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
      return parts.map((part, index) => {
        const key = `${lineKey}-inline-${index}`;
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={key}>{part.substring(2, part.length - 2)}</strong>;
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, linkText, linkUrl] = linkMatch;
          const href = linkUrl.startsWith('http') ? linkUrl : `http://${linkUrl}`;
          return <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{linkText}</a>;
        }
        return <Fragment key={key}>{part}</Fragment>;
      });
    } catch (error) {
      console.error(`Inline render error: ${error.message}`);
      return <span key={`${lineKey}-error`} className="text-red-500">[Content Error]</span>;
    }
  };

  const renderResumeContent = (content) => {
    if (!content) return <p className="text-gray-500 italic">Content loading...</p>;

    try {
      return content.split('\n').map((line, index) => {
        const key = `line-${index}`;

        if (line.startsWith('# ')) return <h1 key={key} className="text-2xl font-bold my-4">{renderInlineMarkdown(line.substring(2), key)}</h1>;
        if (line.startsWith('## ')) return <h2 key={key} className="text-xl font-semibold my-3">{renderInlineMarkdown(line.substring(3), key)}</h2>;
        if (line.startsWith('### ')) return <h3 key={key} className="text-lg font-medium my-2">{renderInlineMarkdown(line.substring(4), key)}</h3>;
        if (line.startsWith('* ') || line.startsWith('- ')) return <li key={key} className="ml-4">{renderInlineMarkdown(line.substring(2), key)}</li>;
        if (line.trim() === '') return null;

        return <p key={key} className="my-2">{renderInlineMarkdown(line, key)}</p>;
      });
    } catch (error) {
      console.error("Rendering error:", error);
      return (
        <Alert variant="destructive" className="mt-4">
          <FileWarning className="h-4 w-4" />
          <AlertDescription>
            Error rendering content: {error.message}
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <div className="rewritten-resume-container p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={goBack} variant="outline">
          ← Back to Dashboard
        </Button>
        <h2 className="text-xl font-bold">Rewritten Resume View</h2>
      </div>

      {rewrittenResume && (
        <div className="preview-controls">
          <Tabs value={previewMode} onValueChange={setPreviewMode} className="w-full">
            <TabsList className="tabs-list grid w-full grid-cols-3">
              <TabsTrigger className="tab-trigger" value="side-by-side">Side by Side</TabsTrigger>
              <TabsTrigger className="tab-trigger" value="original">Original</TabsTrigger>
              <TabsTrigger className="tab-trigger" value="rewritten">Rewritten</TabsTrigger>
            </TabsList>

            <TabsContent value="side-by-side" className="mt-4 grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Original Resume</CardTitle>
                </CardHeader>
                <CardContent className="resume-content">
                  {originalPdfUrl ? (
                    <iframe
                      key={originalPdfUrl}
                      src={originalPdfUrl}
                      title="Original Resume PDF Test"
                      style={{ width: '100%', height: '150vh', border: '1px solid red' }}
                      loading="lazy"
                    />
                  ) : (
                    <p>Loading original PDF...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI-Enhanced Resume</CardTitle>
                </CardHeader>
                <CardContent className="resume-content">
                  <div className="markdown-content">
                    {renderResumeContent(rewrittenResume)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="original" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Original Resume</CardTitle>
                </CardHeader>
                <CardContent className="resume-content">
                  {originalPdfUrl ? (
                    <iframe
                      key={originalPdfUrl}
                      src={originalPdfUrl}
                      title="Original Resume PDF Test"
                      style={{ width: '100%', height: '150vh', border: '1px solid red' }}
                      loading="lazy"
                    />
                  ) : (
                    <p>Loading original PDF...</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewritten" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Enhanced Resume</CardTitle>
                </CardHeader>
                <CardContent className="resume-content">
                  <div className="markdown-content">
                    {renderResumeContent(rewrittenResume)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="download-btn"
            >
              {downloadLoading ?
                <RotateCw className="mr-2 h-4 w-4 animate-spin" /> :
                <FileDown className="mr-2 h-4 w-4" />
              }
              {downloadLoading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <FileWarning className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Request Revision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Not satisfied? Provide specific feedback for improvement:</p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide specific feedback for the AI (e.g., 'Make work experience more concise' or 'Emphasize leadership skills')"
              rows={3}
              className="mb-4"
            />
            <Button
              onClick={handleRevisionRequest}
              disabled={loading || !feedback.trim()}
              className="revision-btn"
            >
              {loading ?
                <RotateCw className="mr-2 h-4 w-4 animate-spin" /> :
                <RotateCw className="mr-2 h-4 w-4" />
              }
              {loading ? 'Processing...' : 'Request Revision'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RewrittenResumeView;
