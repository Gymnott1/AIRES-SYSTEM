import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { FileEdit, RotateCw, FileWarning } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';
import { useToast } from './components/ui/use-toast';

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





function ResumeRewrite({ resumeId, originalContent, analysisResults }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    if (resumeId) {
      const storedResumeData = localStorage.getItem(`rewritten_resume_${resumeId}`);
      if (storedResumeData) {
        
        toast({
          title: "Resume Already Rewritten",
          description: "You already have a rewritten version of this resume",
          action: (
            <Button onClick={() => navigate(`/rewritten-resume/${resumeId}`)} variant="outline">
              View It
            </Button>
          ),
        });
      }
    }
  }, [resumeId, navigate, toast]);

  const handleRewriteRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Token ${token}` } : {};

      const response = await axios.post(
        'http://localhost:8000/api/rewrite_resume/',
        { resume_id: resumeId },
        { headers }
      );

      console.log("Full API Response:", response); 

      if (response.data?.rewritten_content) {
        const processedContent = preprocessResumeContent(response.data.rewritten_content);
        console.log("Processed Content:", processedContent);
        
        
        localStorage.setItem(`rewritten_resume_${resumeId}`, JSON.stringify({
          content: processedContent,
          timestamp: new Date().toISOString()
        }));
        
        toast({
          title: "Resume rewritten successfully",
          description: "Your resume has been enhanced with AI.",
          variant: "default",
        });
        
        
        navigate(`/rewritten-resume/${resumeId}`);
      } else {
        console.error("Received null or invalid content from server:", response.data);
        throw new Error("Received null or invalid content from server");
      }
    } catch (error) {
      console.error("Resume rewrite error:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to rewrite resume.";
      setError(errorMsg);
      toast({ title: "Rewrite Error", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-rewrite-container p-4 md:p-6 space-y-6">
      <div className="flex justify-center items-center min-h-[200px]">
        <Button
          onClick={handleRewriteRequest}
          disabled={loading || !resumeId}
          size="lg"
          className="rewrite-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md"
        >
          {loading ? (
            <>
              <RotateCw className="mr-2 h-5 w-5 animate-spin" />
              Rewriting Resume... Any Details in this page will be lost.
            </>
          ) : (
            <>
              <FileEdit className="mr-2 h-5 w-5" />
              Rewrite Resume with AI
            </>
          )}
        </Button>
      </div>

      {error && !loading && (
        <Alert variant="destructive" className="mt-4">
          <FileWarning className="h-4 w-4" />
          <AlertDescription>
            <strong>Operation Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default ResumeRewrite;



