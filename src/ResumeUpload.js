import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './container.css';
import { Upload, CircleAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; 


const API_URL = 'http://localhost:8000/api';

function ResumeUpload({ onUploadSuccess = (data) => console.log('Upload success:', data) }) {
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const navigate = useNavigate(); 

  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token); 
  }, []);


  const handleFileChange = (e) => {
    console.log('File input changed:', e.target.files);
    
    if (!isLoggedIn) {
        setError("Please log in or sign up to upload a resume.");
        
        
        return; 
    }
    

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null); 
      setValidationResult(null); 
      validateResume(selectedFile); 
      console.log('File set:', selectedFile);
    } else {
      console.error('No files found in event');
    }
  };

  const validateResume = async (selectedFile) => {
    if (!selectedFile) return;

    
    const token = localStorage.getItem('authToken');
    if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoggedIn(false); 
        return; 
    }
    

    setValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('validate_only', 'true'); 

      
      const headers = {
        'Content-Type': 'multipart/form-data', 
        'Authorization': `Token ${token}`     
      };
      

      console.log("DEBUG: Sending validation request with headers:", headers); 

      
      const response = await axios.post(`${API_URL}/upload_resume/`, formData, { headers });
      

      console.log('Validation response:', response.data);
      setValidationResult(response.data);

      
      if (response.data.is_resume) {
        
        
        
        
        handleFinalUpload(selectedFile, token); 
      } else {
          
          setValidating(false); 
      }
    }
    catch (error) {
      console.error("Validation error:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
         
         if (error.response.status === 401) {
             setError("Your session may have expired. Please log in again.");
             localStorage.removeItem('authToken'); 
             localStorage.removeItem('user');
             setIsLoggedIn(false);
             
             
         } else {
             setError(error.response.data?.error || error.response.data?.detail || "Error validating resume");
         }
      } else if (error.request) {
          setError("Cannot connect to server. Please check your network or if the server is running.");
      } else {
          setError("An unexpected error occurred during validation.");
      }
      setValidationResult(null);
      setValidating(false); 
    }
    
  };

  
  const handleFinalUpload = async (selectedFile, token) => {
    

    setValidating(true); 
    setError(null);
    console.log('Uploading file (final step):', selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);
    

    try {
      
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${token}`
      };

      console.log("DEBUG: Sending final upload request with headers:", headers);

      
      const response = await axios.post(`${API_URL}/upload_resume/`, formData, { headers });

      console.log('Final Upload Server response:', response.data);
      
      onUploadSuccess(response.data);
      
      setFile(null); 
      
      setValidationResult({ is_resume: true, confidence: validationResult?.confidence || 1 }); 
    } catch (error) {
      console.error("Final Upload error:", error);
       if (error.response) {
        console.error("Server response:", error.response.data);
         if (error.response.status === 401) {
             setError("Your session may have expired. Please log in again.");
             localStorage.removeItem('authToken');
             localStorage.removeItem('user');
             setIsLoggedIn(false);
         } else {
             setError(error.response?.data?.error || error.response?.data?.detail || "File upload failed");
         }
      } else if (error.request) {
          setError("Cannot connect to server during upload.");
      } else {
          setError("An unexpected error occurred during upload.");
      }
      
      
      alert("File upload failed: " + (error.response?.data?.error || error.message)); 
    } finally {
      setValidating(false); 
    }
  };

  return (
    <div className="container">
      <div>
        {}
        {!isLoggedIn ? (
           <div className="login-prompt">
             <CircleAlert className="info-icon" />
             <span>Please <Link to="/login">Login</Link> or <Link to="/signup">Sign Up</Link> to upload and analyze your resume.</span>
           </div>
        ) : (
          <label className={`label ${validating ? 'disabled' : ''}`}>
            <div className="label-content">
              <Upload className="label-input" />
              <p className="label-text">
                {file ? `Selected: ${file.name}` : "Click to upload your resume (PDF only)"}
                {validating && <span className="spinner"></span>} {}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={validating} 
              key={file ? 'file-selected' : 'no-file'} 
            />
          </label>
        )}

        {}
        {validationResult && (
          <div className={`validation-result ${validationResult.is_resume ? 'success' : 'error'}`}>
            {validationResult.is_resume ? (
              <>
                <CheckCircle2 className="success-icon" />
                <span>Resume format looks good! Uploading... (Confidence: {(validationResult.confidence * 100).toFixed(1)}%)</span>
              </>
            ) : (
              <>
                <AlertCircle className="error-icon" />
                <span className='val-error'>
                  This file doesn't appear to be a resume. Please upload a valid PDF resume.
                </span>
              </>
            )}
          </div>
        )}

        {}
        {error && (
          <div className="error-message">
            <CircleAlert className="error-icon" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {}
      <div>
        <p>Welcome to <b>AI-Powered Resume Enhancement System (AIRES)</b>, where you can effortlessly upload your resume for an in-depth scan. Our system analyzes your document to provide personalized feedback, actionable insights, and recommendations for improvement. Plus, you can chat with our AI to further customize your resume, ensuring it meets market standards and enhances your chances of landing your next job</p>
        <span className='warn'><CircleAlert />Our system does not have capability of analyzing images in your document.</span>
      </div>
    </div>
  );
}

export default ResumeUpload;