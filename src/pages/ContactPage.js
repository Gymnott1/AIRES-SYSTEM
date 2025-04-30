import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, MapPin, Phone, MessageSquare, Send, Clock } from 'lucide-react';
import './pages.css'; 
import {  Link } from 'react-router-dom';
function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted:', formData);
    
    alert('Thank you for your message! We will get back to you soon.');
    
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-container">
      <div className="contact-content">
        <div className="page-header">
          <h1 className="page-title">Get in Touch</h1>
          <p className="page-subtitle">
            Have questions about our AI resume analysis? We're here to help!
          </p>
        </div>

        <div className="contact-grid">
          <Card className="custom-card contact-form-card">
            <CardHeader className="card-header-primary">
              <CardTitle className="card-title">
                <MessageSquare className="mr-2" /> Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Gymnott Linus"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="gym@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                    placeholder="Tell us what you need assistance with..."
                    rows="5"
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-button">
                  <Send size={18} className="mr-2" /> Send Message
                </button>
              </form>
            </CardContent>
          </Card>

          <div className="contact-info-container">
            <Card className="custom-card">
              <CardHeader className="card-header-green">
                <CardTitle className="card-title">
                  <MapPin className="mr-2" /> Our Location
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <p className="contact-info-text">
                  400200, Nyayo Road<br />
                  <br />
                  Nairobi<br />
                  Kenya
                </p>
                <div className="map-container">
                  
                  <div className="map-placeholder">
                    <MapPin size={36} />
                    <p>Map location</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="custom-card">
              <CardHeader className="card-header-purple">
                <CardTitle className="card-title">
                  <Clock className="mr-2" /> Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="hours-item">
                  <span className="day">Monday - Friday:</span>
                  <span className="time">9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="hours-item">
                  <span className="day">Saturday:</span>
                  <span className="time">10:00 AM - 4:00 PM PST</span>
                </div>
                <div className="hours-item">
                  <span className="day">Sunday:</span>
                  <span className="time">Closed</span>
                </div>
                <p className="response-time">
                  <span className="response-badge">Average Response Time: 2-4 hours</span>
                </p>
              </CardContent>
            </Card>

            <Card className="custom-card">
              <CardHeader className="card-header-primary">
                <CardTitle className="card-title">
                  <Phone className="mr-2" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="contact-method">
                  <Phone size={18} className="contact-icon" />
                  <div>
                    <span className="contact-label">Phone:</span>
                    <a href="tel:+14155550123" className="contact-link">+245 725828589</a>
                  </div>
                </div>
                <div className="contact-method">
                  <Mail size={18} className="contact-icon" />
                  <div>
                    <span className="contact-label">Email:</span>
                    <a href="mailto:gymnottwc@gmail.com" className="contact-link">gymnottwc@gmail.com</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="custom-card cta-card">
          <CardContent className="card-content">
            <div className="cta-container">
              <div className="cta-text-container">
                <h3 className="step-title">Need immediate help with your resume?</h3>
                <p className="step-description">Try our AI assistant right now and get instant feedback.</p>
              </div>
              <Link  to="/">
              <button className="cta-button">
                Start Resume Chat
              </button>
              </Link>
              
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}

export default ContactPage;