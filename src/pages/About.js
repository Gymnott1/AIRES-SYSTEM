import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileUp, MessageSquare, GraduationCap, Award } from 'lucide-react';
import './pages.css'; // Import the CSS file
import { Link } from 'react-router-dom';


function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <div className="page-header">
          <h1 className="page-title">Transform Your Career Journey</h1>
          <p className="page-subtitle">
            Leverage the power of AI to perfect your resume and land your dream job.
          </p>
        </div>

        <Card className="custom-card">
          <CardHeader className="card-header-primary">
            <CardTitle className="card-title">
              <FileUp className="mr-2" /> How ResumeAI Works
            </CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            <div>
              <div className="step-container">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3 className="step-title">Upload Your Resume</h3>
                  <p className="step-description">Simply drag and drop your existing resume in PDF format. Our platform supports PDF file types.</p>
                </div>
              </div>
              
              <div className="step-container">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3 className="step-title">AI-Powered Analysis</h3>
                  <p className="step-description">Within seconds, our advanced AI will analyze your resume for content, formatting, keywords, and industry alignment—identifying strengths and areas for improvement.</p>
                </div>
              </div>
              
              <div className="step-container">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3 className="step-title">Interactive Improvement</h3>
                  <p className="step-description">Chat directly with our AI assistant to refine your resume—ask specific questions, request targeted improvements, or get advice tailored to your industry.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="card-grid">
          <Card className="custom-card">
            <CardHeader className="card-header-green">
              <CardTitle className="card-title">
                <MessageSquare className="mr-2" /> AI Chat Support
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="mb-4">
                Our conversational AI assistant works with you to perfect your resume through natural dialogue.
              </p>
              <ul className="feature-list">
                <li className="feature-item">
                  <span className="feature-check">✓</span>
                  Ask specific questions about improving sections
                </li>
                <li className="feature-item">
                  <span className="feature-check">✓</span>
                  Get personalized writing suggestions
                </li>
                <li className="feature-item">
                  <span className="feature-check">✓</span>
                  Receive industry-specific keyword recommendations
                </li>
                <li className="feature-item">
                  <span className="feature-check">✓</span>
                  Brainstorm better ways to showcase achievements
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="custom-card">
            <CardHeader className="card-header-purple">
              <CardTitle className="card-title">
                <GraduationCap className="mr-2" /> Built By Experts
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <p className="mb-4">
                Our platform combines cutting-edge technology with expert knowledge in recruiting and career development.
              </p>
              <div>
                <div className="expert-item">
                  <div className="expert-icon-container">
                    <Award className="expert-icon" size={18} />
                  </div>
                  <div>
                    <p className="expert-text">AI trained on thousands of successful resumes</p>
                  </div>
                </div>
                <div className="expert-item">
                  <div className="expert-icon-container">
                    <Award className="expert-icon" size={18} />
                  </div>
                  <div>
                    <p className="expert-text">Developed with input from HR professionals</p>
                  </div>
                </div>
                <div className="expert-item">
                  <div className="expert-icon-container">
                    <Award className="expert-icon" size={18} />
                  </div>
                  <div>
                    <p className="expert-text">Continuously updated with latest hiring trends</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="custom-card cta-card">
          <CardContent className="card-content">
            <div className="cta-container">
              <div className="cta-text-container">
                <h3 className="step-title">Ready to elevate your resume?</h3>
                <p className="step-description">Start turning rejections into interviews today.</p>
              </div>
              <Link to="/" ><button className="cta-button">
                Upload Resume Now
                
              </button></Link>
              
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}

export default About;