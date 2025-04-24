import React, { useState } from 'react';
import { Upload, FileText, Search, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const SmartResumeScanner = () => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setResults(null);
    setShowChat(false);
  };

  const handleScan = async () => {
    setScanning(true);
    
    
    
    
    
    
    setTimeout(() => {
      setResults({
        skills: 85,
        experience: 78,
        education: 90,
        overall: 84,
        insights: [
          "Strong technical background in web development",
          "Could improve description of leadership experiences",
          "Well-structured education section"
        ]
      });
      setScanning(false);
    }, 2000);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([...messages, { type: 'user', content: newMessage }]);
    
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: "Based on your resume, I can help answer questions about your experience. What would you like to know specifically?"
      }]);
    }, 1000);
    
    setNewMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Smart Resume Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-md">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    {file ? file.name : "Click to upload your resume"}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            <Button
              onClick={handleScan}
              disabled={!file || scanning}
              className="w-full max-w-md"
            >
              {scanning ? "Scanning..." : "Scan Resume"}
              {!scanning && <Search className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {}
          {results && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Score Breakdown</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Skills</span>
                        <span>{results.skills}%</span>
                      </div>
                      <Progress value={results.skills} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Experience</span>
                        <span>{results.experience}%</span>
                      </div>
                      <Progress value={results.experience} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Education</span>
                        <span>{results.education}%</span>
                      </div>
                      <Progress value={results.education} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Overall</span>
                        <span className="font-semibold">{results.overall}%</span>
                      </div>
                      <Progress value={results.overall} className="w-full" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {results.insights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <FileText className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button
                onClick={() => setShowChat(true)}
                className="w-full"
              >
                Chat with AI about your Resume
                <MessageCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {}
          {showChat && (
            <div className="mt-6 border rounded-lg p-4">
              <div className="h-64 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask about your resume..."
                  className="flex-1 p-2 border rounded-lg"
                />
                <Button type="submit">Send</Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartResumeScanner;