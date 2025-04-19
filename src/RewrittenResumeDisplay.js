import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Textarea } from './components/ui/textarea';
import { Alert, AlertDescription } from './components/ui/alert';
import { FileWarning } from 'lucide-react';
import './rewrite.css';

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
      return <React.Fragment key={key}>{part}</React.Fragment>;
    });
  } catch (error) {
    console.error(`Inline render error: ${error.message}`);
    return <span key={`${lineKey}-error`} className="text-red-500">[Content Error]</span>;
  }
};

const renderResumeContent = (content) => {
  if (!content) return <p className="text-gray-500 italic">Content loading...</p>;

  try {
    console.log("Rendering content:", content); // Debug log
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

const RewrittenResumeDisplay = ({ rewrittenResume, originalPdfUrl, previewMode, setPreviewMode, renderError }) => {
  return (
    <div className="rewritten-resume-section space-y-6">
      <Tabs value={previewMode} onValueChange={setPreviewMode} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-md p-1">
          <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="original">Original PDF</TabsTrigger>
          <TabsTrigger value="rewritten">AI Enhanced</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Original Resume</CardTitle></CardHeader>
            <CardContent className="h-[70vh] overflow-hidden">
              {originalPdfUrl ? (
                <iframe
                  key={`pdf-${originalPdfUrl}`}
                  src={originalPdfUrl}
                  className="w-full h-full"
                  title="Original Resume"
                />
              ) : (
                <p className="text-gray-500">Loading PDF...</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>AI Enhanced Resume</CardTitle></CardHeader>
            <CardContent className="h-[70vh] overflow-y-auto">
              {rewrittenResume ? (
                <div className="markdown-preview p-4 prose max-w-none">
                  {renderResumeContent(rewrittenResume)}
                </div>
              ) : (
                <p className="text-gray-500 italic">Generating enhanced content...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="original" className="mt-4">
          <Card>
            <CardContent className="h-[80vh]">
              {originalPdfUrl ? (
                <iframe className="w-full h-full" src={originalPdfUrl} title="Original Resume" />
              ) : (
                <p className="text-gray-500">Loading PDF...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewritten" className="mt-4">
          <Card>
            <CardContent className="h-[80vh] overflow-y-auto">
              {rewrittenResume ? (
                <>
                  <div className="markdown-preview p-4 prose max-w-none">
                    {renderError ? (
                      <Alert variant="destructive">
                        <FileWarning className="h-4 w-4" />
                        <AlertDescription>
                          {renderError}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      renderResumeContent(rewrittenResume)
                    )}
                  </div>
                  <Textarea
                    value={rewrittenResume}
                    readOnly
                    className="mt-4 h-40"
                    placeholder="Raw content preview"
                  />
                </>
              ) : (
                <p className="text-gray-500 italic">No content available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewrittenResumeDisplay;
