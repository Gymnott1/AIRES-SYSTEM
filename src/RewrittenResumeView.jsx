import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { FileDown, RotateCw, FileWarning } from 'lucide-react';
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
  

  useEffect(() => {
    
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

  const preprocessResumeContent = (content) => {
    if (!content) return '';
  
    let processedContent = content.replace(/\\n/g, '\n');
  
    const lines = processedContent.split('\n');
  
    const processedLines = lines.map(line => {
      let trimmedLine = line.trim();
  
      if (trimmedLine.startsWith('#')) {
        const headerLevel = trimmedLine.match(/^(#+)/)[0].length;
        trimmedLine = trimmedLine.replace(/^(#+)/, '').trim();
        trimmedLine = `<h${headerLevel}>${trimmedLine}</h${headerLevel}>`;
      }
  
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        trimmedLine = trimmedLine.replace(/^([*-])/, '').trim();
        trimmedLine = `<li>${trimmedLine}</li>`;
      }
  
      if (trimmedLine.includes('[') && trimmedLine.includes('](')) {
        trimmedLine = trimmedLine.replace(/\[([^\]]+)\]\s*\(\s*([^)]+?)\s*\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      }
  
      trimmedLine = trimmedLine.replace(/`/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
  
      return trimmedLine;
    });
  
    return processedLines.join('\n');
  };
  
  



  const renderResumeContent = (content) => {
    if (!content) return <p className="text-gray-500 italic">Content loading...</p>;
  
    try {
      return content.split('\n').map((line, index) => {
        const key = `line-${index}`;
  
        if (line.startsWith('<h1>')) return <h1 key={key} className="text-2xl font-bold mt-4 mb-2">{line.replace(/<\/?h1>/g, '')}</h1>;
        if (line.startsWith('<h2>')) return <h2 key={key} className="text-xl font-semibold mt-3 mb-2">{line.replace(/<\/?h2>/g, '')}</h2>;
        if (line.startsWith('<h3>')) return <h3 key={key} className="text-lg font-medium mt-2 mb-1">{line.replace(/<\/?h3>/g, '')}</h3>;
        if (line.startsWith('<li>')) return <li key={key} className="list-item">{line.replace(/<\/?li>/g, '')}</li>;
        if (line.trim() === '') return <hr key={key} className="my-4 border-t border-gray-300" />;
  
        return <p key={key} className="my-2">{line}</p>;
      });
    } catch (error) {
      console.error("Rendering error:", error);
      return (
        <div className="alert alert-danger mt-4">
          Error rendering content: {error.message}
        </div>
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


