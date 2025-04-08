import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { FileDown, FileEdit, RotateCw, FileWarning } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Textarea } from './components/ui/textarea';
import { Alert, AlertDescription } from './components/ui/alert';
import { useToast } from './components/ui/use-toast';
import './rewrite.css';

// Preprocessing function
const preprocessResumeContent = (content) => {
  if (!content) return '';

  const lines = content.split('\n');
  const processedLines = lines.map(line => {
    let trimmedLine = line.trim();

    if (trimmedLine.startsWith('#')) {
      trimmedLine = trimmedLine.replace(/^(#+)/, '$1 ');
    }

    if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
      trimmedLine = trimmedLine.replace(/^([*-])/, '$1 ');
    }

    if (trimmedLine.includes('[') && trimmedLine.includes('](')) {
      trimmedLine = trimmedLine.replace(/\[([^\]]+)\]\s*\(([^\)]+)\)/g, '[$1]($2)');
    }

    return trimmedLine;
  });

  return processedLines.join('\n');
};

function ResumeRewrite({ resumeId }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [originalPdfUrl, setOriginalPdfUrl] = useState('');
  const [rewrittenResume, setRewrittenResume] = useState(null);
  const [previewMode, setPreviewMode] = useState('side-by-side');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (resumeId) {
      const pdfUrl = `http://localhost:8000/api/resume/${resumeId}/pdf/`;
      setOriginalPdfUrl(pdfUrl);
    } else {
      setOriginalPdfUrl('');
    }
  }, [resumeId]);

  const handleRewriteRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/rewrite_resume/',
        { resume_id: resumeId }
      );

      const processedContent = preprocessResumeContent(response.data.rewritten_content);
      setRewrittenResume(processedContent);
      toast({
        title: "Resume rewritten successfully",
        description: "Your resume has been enhanced with AI",
        status: "success"
      });
    } catch (error) {
      console.error("Resume rewrite error", error);
      setError("Failed to rewrite resume. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to rewrite resume. Please try again later.",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevisionRequest = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide specific feedback for the revision",
        status: "warning"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/revise_resume/',
        {
          resume_id: resumeId,
          feedback: feedback,
          current_version: rewrittenResume
        }
      );

      const processedContent = preprocessResumeContent(response.data.revised_content);
      setRewrittenResume(processedContent);
      setFeedback('');
      toast({
        title: "Resume revised successfully",
        description: "Your feedback has been incorporated",
        status: "success"
      });
    } catch (error) {
      console.error("Resume revision error", error);
      setError("Failed to revise resume. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to revise resume. Please try again later.",
        status: "error"
      });
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
        status: "success"
      });
    } catch (error) {
      console.error("PDF download error", error);
      setError("Failed to generate PDF. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again later.",
        status: "error"
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const renderResumeContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    let currentListType = null;

    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
      }
      else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-3 mb-2">{line.substring(3)}</h2>;
      }
      else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-2 mb-1">{line.substring(4)}</h3>;
      }
      else if (line.startsWith('* ')) {
        if (currentListType !== 'ul') {
          currentListType = 'ul';
          return <ul key={index}><li className="ml-5 list-disc">{line.substring(2)}</li></ul>;
        } else {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
      }
      else if (line.startsWith('- ')) {
        if (currentListType !== 'ul') {
          currentListType = 'ul';
          return <ul key={index}><li className="ml-5 list-disc">{line.substring(2)}</li></ul>;
        } else {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
      }
      else if (line.startsWith('---')) {
        return <hr key={index} className="my-2" />;
      }
      else if (line.trim() === '') {
        currentListType = null;
        return <div key={index} className="h-2"></div>;
      }
      else if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="my-1">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.substring(2, part.length - 2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
      else if (line.includes('[') && line.includes('](')) {
        const linkMatch = line.match(/\[([^\]]+)\]\(([^\)]+)\)/);
        if (linkMatch) {
          const [, text, url] = linkMatch;
          return <p key={index} className="my-1"><a href={url} target="_blank" rel="noopener noreferrer">{text}</a></p>;
        }
      }
      else {
        currentListType = null;
        return <p key={index} className="my-1">{line}</p>;
      }
    });
  };

  return (
    <div className="resume-rewrite-container">
      {!rewrittenResume ? (
        <Button
          onClick={handleRewriteRequest}
          disabled={loading}
          className={loading ? 'rewrite-btn-loading' : 'rewrite-btn'}
        >
          <span>
            {loading ? 'Rewriting...' : 'Rewrite Resume with AI'}
            {loading ? <RotateCw className="ml-2 h-4 w-4 animate-spin" /> : <FileEdit className="ml-2 h-4 w-4" />}
          </span>
        </Button>
      ) : (
        <div className="rewritten-resume-container">
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
                      style={{ width: '30vw', height: '150vh', border: '1px solid red' }}
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
                      style={{ width: '80vw', height: '150vh', border: '1px solid red' }}
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
      )}
    </div>
  );
}

export default ResumeRewrite;
