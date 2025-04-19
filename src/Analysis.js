// src/Analysis.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Scan, MessageSquare, BotMessageSquare, BookOpenCheck , FileText, SquareUser, Loader2 } from 'lucide-react'; // Added Loader2
import { Progress } from './components/ui/progress';
// Removed toast import if not used elsewhere in this simplified version

function Analysis({ resumeId }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationList, setConversationList] = useState([]);
  const [showConvoDropdown, setShowConvoDropdown] = useState(false);

  const token = localStorage.getItem('authToken'); // Check auth token

  // --- Corrected handleAnalysis ---
  const handleAnalysis = async () => {
    setLoading(true);
    setResults(null); // Clear previous results
    try {
      // Add Authorization header if user is logged in
      const headers = {};
      if (token) {
          headers['Authorization'] = `Token ${token}`;
      }

      const response = await axios.post(
        'http://localhost:8000/api/analyze_resume/',
        { resume_id: resumeId },
        { headers } // Pass headers
      );

      // --- FIX: Directly use response.data ---
      // response.data is the parsed JSON object returned by the backend view
      const analysisData = response.data;

      // --- Keep original assumption that data structure is correct ---
      // If backend guarantees the structure, this is simpler:
      if (analysisData) {
          console.log("Received analysis results:", analysisData);
          setResults(analysisData); // Set the state with the received JSON object
      } else {
          // Handle case where backend might return empty success (unlikely but possible)
           console.error("Received empty or invalid analysis data structure:", analysisData);
          throw new Error("Received empty analysis data from the server.");
      }
      // --- END FIX ---

    } catch (error) {
      console.error("Analysis error", error);
      let errorMsg = "Analysis failed.";
      if (error.response) {
          errorMsg = error.response.data?.error || error.response.data?.details || `Server error (${error.response.status})`;
          if(error.response.status === 401) errorMsg = "Authentication required or session expired.";
      } else if (error.request) {
          errorMsg = "Could not reach server.";
      } else {
           errorMsg = error.message;
      }
      setResults(null); // Clear results on error
      alert("Analysis failed: " + errorMsg); // Use original alert for feedback
    } finally {
        setLoading(false);
    }
  };
  // --- End Corrected handleAnalysis ---

  // --- REMOVED extractFirstJsonObject function - no longer needed ---


  // Fetch conversation list if user is logged in
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:8000/api/user-conversations/', {
        headers: { Authorization: `Token ${token}` }
      });
      setConversationList(response.data);
    } catch (error) {
      console.error("Failed to fetch conversation list:", error);
      // Optionally alert here if needed: alert("Could not fetch chat history.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, fetchConversations]);


  // Load conversation messages for a given resume
  const loadConversation = async (selectedResumeId) => {
    try {
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const response = await axios.get('http://localhost:8000/api/chat-messages/', {
        params: { resume_id: selectedResumeId },
        headers
      });
      setMessages(response.data);
      setShowChat(true); // Show chat when history is loaded
      setShowConvoDropdown(false); // Close dropdown
    } catch (error) {
      console.error("Failed to load conversation:", error);
      alert("Failed to load conversation.");
    }
  };

  // Handle Chat Submission (remains the same as your provided version)
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { type: 'user', content: newMessage };
    setMessages([...messages, userMessage]);
    const messageToSend = newMessage;
    setNewMessage('');

    let headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Token ${token}`;

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', {
        resume_id: resumeId,
        message: messageToSend,
        conversation: messages.slice(-10) // Example: send last 10 messages
      }, { headers });

      let aiReply = response.data.reply || "Sorry, I couldn't process that.";

      // Basic sanitization from your version
      aiReply = aiReply.replace(/[^\w\s.,:;!?'"()-]/g, '');
      aiReply = aiReply.replace(/\s+/g, ' ').trim();
      aiReply = aiReply.replace(/(\d+\.\s)/g, '<br />$1');
      aiReply = aiReply.replace(/\n/g, '<br />');

      const aiMessage = { type: 'ai', content: aiReply };
      setMessages((prev) => [...prev, aiMessage]);

      if (token) {
        try {
           await axios.post('http://localhost:8000/api/chat-messages/', {
              resume_id: resumeId,
              message: aiReply,
              sender: 'ai'
            }, { headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json'} });
        } catch (saveError) {
             console.error("Failed to save AI message:", saveError);
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg = error.response?.data?.error || "Error communicating with AI chat.";
      setMessages((prev) => [
        ...prev,
        { type: 'ai', content: `Sorry, an error occurred: ${errorMsg}` }
      ]);
      // No toast here in this simplified version
    }
  };


  return (
    <div className="scanbtndiv">
      <div className="scanbtn-container">
        <Button
          onClick={handleAnalysis}
          disabled={loading}
          className={loading ? 'scanbtn-loading' : 'scanbtn'}
        >
          {loading ? (
             <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing... </>
          ) : (
             <> Analyze Resume <Scan className="ml-2 h-4 w-4 search" /> </> // Added back search class if needed
          )}
        </Button>
      </div>

      {/* Conditional Rendering based on 'results' state */}
      {results && (
        <div className="analysis-container">
          {/* Analysis Breakdown */}
          <div>
            <h3>AI Analysis Breakdown:</h3>
            {/* Assume results.scores exists if results is truthy */}
            <div className="analysis-scores">
                <div>
                    <div className="score-label">
                    <span>Skills</span>
                    {/* Use optional chaining ?. for safer access */}
                    <span>{results.scores?.skills ?? 'N/A'}%</span>
                    </div>
                    <Progress value={results.scores?.skills ?? 0} className="progress-bar" />
                </div>
                <div>
                    <div className="score-label">
                    <span>Experience</span>
                    <span>{results.scores?.experience ?? 'N/A'}%</span>
                    </div>
                    <Progress value={results.scores?.experience ?? 0} className="progress-bar" />
                </div>
                 <div>
                    <div className="score-label">
                    <span>Education</span>
                    <span>{results.scores?.education ?? 'N/A'}%</span>
                    </div>
                    <Progress value={results.scores?.education ?? 0} className="progress-bar" />
                </div>
                <div>
                    <div className="score-label">
                    <span>Overall</span>
                    <span>{results.scores?.overall ?? 'N/A'}%</span>
                    </div>
                    <Progress value={results.scores?.overall ?? 0} className="progress-bar" />
                </div>
            </div>
          </div>

          {/* Key Insights */}
          {/* Assume results.key_insights exists and is array */}
          <div className="key-insights">
            <h3>Key Insights:</h3>
            <ul className="list">
              {(results.key_insights || []).map((insight, idx) => ( // Default to empty array
                <li key={idx}>
                  <FileText className="filetext" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Suggestions */}
          {/* Assume results.improvement_suggestions exists and is array */}
          <div className="improvement-suggestions">
            <h3>Improvement Suggestions:</h3>
            <ul className="list">
              {(results.improvement_suggestions || []).map((suggestion, idx) => ( // Default to empty array
                <li key={idx}>
                  <FileText className="filetext" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>


          {/* Chat Button */}
          <Button onClick={() => setShowChat(true)} className="scanbtn">
            <span> Chat with AI <MessageSquare className="ml-2 h-4 w-4 messageCircle" /> </span> {/* Added back messageCircle class */}
          </Button>

          {/* Chat History */}
          {token && (
            <div className="conversation-dropdown">
              <Button className="scanbtn" onClick={() => setShowConvoDropdown(!showConvoDropdown)} >
                <span> Chat History <BookOpenCheck className="ml-2 h-4 w-4 chevron-down" /> </span> {/* Added back chevron-down class */}
              </Button>
              {showConvoDropdown && (
                <ul className="conversation-list">
                  {conversationList.length > 0 ? (
                      conversationList.map((convo) => (
                        <li key={convo.resume_id} onClick={() => loadConversation(convo.resume_id)}>
                          {convo.resume_name || `Resume ${convo.resume_id}`}
                        </li>
                      ))
                  ) : (
                      <li className="no-history">No previous chats found.</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      )} {/* End results conditional rendering */}


        {/* Chat UI */}
      {showChat && (
        <div className="chart-container">
          <div className="chat-box">
            {messages.length === 0 && <p className='empty-chat-message'>Ask the AI about your analysis...</p>}
            {messages.map((message, index) => (
              <div key={index} className={`flexchat-c ${message.sender === 'user' || message.type === 'user' ? 'user-message-c' : 'ai-message-c'}`}>
                 {message.sender === 'user' || message.type === 'user' ? <SquareUser className="user-icon" /> : <BotMessageSquare className="bot-icon" />}
                 <div
                    className={`flexchat ${message.sender === 'user' || message.type === 'user' ? 'user-message' : 'ai-message'}`}
                    dangerouslySetInnerHTML={{ __html: message.message || message.content }}
                 />
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="chat-input-form form"> {/* Added back form class */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask about your resume..."
              className="chat-input" // Kept specific class if needed
            />
            <Button className="scanbtn sendbtn" type="submit">Send</Button>
          </form>
        </div>
      )}


    </div> // End scanbtndiv
  );
}

export default Analysis;