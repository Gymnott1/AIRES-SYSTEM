import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Scan, MessageSquare, BotMessageSquare, BookOpenCheck , FileText, SquareUser } from 'lucide-react';
import { Progress } from './components/ui/progress';

function Analysis({ resumeId }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationList, setConversationList] = useState([]);
  const [showConvoDropdown, setShowConvoDropdown] = useState(false);

  // Check if user is authenticated
  const token = localStorage.getItem('authToken');

  // Fetch analysis results
  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/analyze_resume/',
        { resume_id: resumeId }
      );
      const analysisText = response.data.analysis;
      const jsonStart = analysisText.indexOf('{');
      const jsonEnd = analysisText.lastIndexOf('}');
      let jsonStr = '';
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonStr = analysisText.substring(jsonStart, jsonEnd + 1);
      }
      const parsedResults = JSON.parse(jsonStr);
      setResults(parsedResults);
    } catch (error) {
      console.error("Analysis error", error);
      alert("Analysis failed");
    }
    setLoading(false);
  };

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
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, fetchConversations]);
  

  // Load conversation messages for a given resume (from chat-messages endpoint)
  const loadConversation = async (selectedResumeId) => {
    try {
      const response = await axios.get('http://localhost:8000/api/chat-messages/', {
        params: { resume_id: selectedResumeId },
        headers: token ? { Authorization: `Token ${token}` } : {}
      });
      // Assuming the response data is an array of messages
      setMessages(response.data);
      // Optionally, set resumeId to the selected one (if needed)
    } catch (error) {
      console.error("Failed to load conversation:", error);
      alert("Failed to load conversation.");
    }
  };

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
      // Post the user's message to your chat endpoint
      const response = await axios.post('http://localhost:8000/api/chat/', {
        resume_id: resumeId,
        message: messageToSend,
        conversation: messages
      }, { headers });
      const aiReply = response.data.reply;
      setMessages((prev) => [...prev, { type: 'ai', content: aiReply }]);

      // If authenticated, save the AI message to your conversation endpoint
      if (token) {
        await axios.post('http://localhost:8000/api/chat-messages/', {
          resume_id: resumeId,
          message: aiReply,
          sender: 'ai'
        }, { headers });
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages((prev) => [
        ...prev,
        { type: 'ai', content: "Sorry, an error occurred while processing your message." }
      ]);
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
          <span>{loading ? 'Analyzing...' : 'Analyze Resume'} {loading ? '' : <Scan className="search" />}</span>
        </Button>
      </div>

      {results && (
        <div className="analysis-container">
          <div>
            <h3>AI Analysis Breakdown:</h3>
            <div className="analysis-scores">
              <div>
                <div className="score-label">
                  <span>Skills</span>
                  <span>{results.scores.skills}%</span>
                </div>
                <Progress value={results.scores.skills} className="progress-bar" />
              </div>
              <div>
                <div className="score-label">
                  <span>Experience</span>
                  <span>{results.scores.experience}%</span>
                </div>
                <Progress value={results.scores.experience} className="progress-bar" />
              </div>
              <div>
                <div className="score-label">
                  <span>Education</span>
                  <span>{results.scores.education}%</span>
                </div>
                <Progress value={results.scores.education} className="progress-bar" />
              </div>
              <div>
                <div className="score-label">
                  <span>Overall</span>
                  <span>{results.scores.overall}%</span>
                </div>
                <Progress value={results.scores.overall} className="progress-bar" />
              </div>
            </div>
          </div>

          <div className="key-insights">
            <h3>Key Insights:</h3>
            <ul className="list">
              {results.key_insights.map((insight, idx) => (
                <li key={idx}>
                  <FileText className="filetext" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="improvement-suggestions">
            <h3>Improvement Suggestions:</h3>
            <ul className="list">
              {results.improvement_suggestions.map((suggestion, idx) => (
                <li key={idx}>
                  <FileText className="filetext" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={() => setShowChat(true)} className="scanbtn">
            <span>
              Chat with AI about your Resume <MessageSquare className="messageCircle" />
            </span>
          </Button>

          {token && (
            <div className="conversation-dropdown">
              <Button className="scanbtn" onClick={() => setShowConvoDropdown(!showConvoDropdown)} >
                <span>
                  Chat History <BookOpenCheck className="chevron-down" />
                </span>
              </Button>
              {showConvoDropdown && (
                <ul className="conversation-list">
                  {conversationList.map((convo) => (
                    <li key={convo.resume_id} onClick={() => loadConversation(convo.resume_id)}>
                      {convo.resume_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {showChat && (
        <div className="chart-container">
          <div className="chat-box">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flexchat-c ${message.type === 'user' ? 'user-message-c' : 'ai-message-c'}`}
              >
                {message.type === 'user' ? <SquareUser className="user-icon" /> : <BotMessageSquare className="bot-icon" />}
                <div className={`flexchat ${message.type === 'user' ? 'user-message' : 'ai-message'}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask about your resume..."
            />
            <Button className="scanbtn sendbtn" type="submit">Send</Button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Analysis;
