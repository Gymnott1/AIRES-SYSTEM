import React, { useState } from 'react';
import axios from 'axios';
import './container.css';
import { Upload, CircleAlert, CheckCircle2, AlertCircle } from 'lucide-react';

function ResumeUpload({ onUploadSuccess = (data) => console.log('Upload success:', data) }) {
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);

  // Log the event and files for debugging
  const handleFileChange = (e) => {
    console.log('File input changed:', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      validateResume(selectedFile);
      console.log('File set:', selectedFile);
    } else {
      console.error('No files found in event');
    }
  };

  const validateResume = async (selectedFile) => {
    if (!selectedFile) return;
    
    setValidating(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('validate_only', true);
      
      const response = await axios.post('http://localhost:8000/api/upload_resume/', formData);
      setValidationResult(response.data);
      
      // If validation passes, proceed with upload
      if (response.data.is_resume) {
        handleUpload(selectedFile);
      }
    } // Improved error handling
    catch (error) {
      console.error("Validation error:", error);
      if (error.response && error.response.data) {
        console.error("Server response:", error.response.data);
      }
      if (error.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please make sure the backend service is running.");
      } else {
        setError(error.response?.data?.error || "Error validating resume");
      }
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      alert("Please Enter a PDF file");
      return;
    }
    setValidating(true);
    setError(null);
    console.log('Uploading file:', selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/api/upload_resume/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Server response:', response.data);
      // Call the callback if provided, or log the response
      onUploadSuccess(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.error || "File upload failed");
      alert("File upload failed");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="container">
      <div>
        <label className="label">
          <div className="label-content">
            <Upload className="label-input" />
            <p className="label-text">
              {file ? "Click Analyze after uploading" : "Click to upload your resume"}
              {validating && <span> Validating...</span>}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </label>
        
        {validationResult && (
          <div className={`validation-result ${validationResult.is_resume ? 'success' : 'error'}`}>
            {validationResult.is_resume ? (
              <>
                <CheckCircle2 className="success-icon" />
                <span>This appears to be a valid resume! (Confidence: {(validationResult.confidence * 100).toFixed(2)}%)</span>
              </>
            ) : (
              <>
                <AlertCircle className="error-icon" />
                <span className='val-error'>
                  This doesn't appear to be a resume. Please upload a valid resume.
                  
                </span>
              </>
            )}
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <CircleAlert />
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <div>
        <p>Welcome to <b>AI-Powered Resume Enhancement System (AIRES)</b>, where you can effortlessly upload your resume for an in-depth scan. Our system analyzes your document to provide personalized feedback, actionable insights, and recommendations for improvement. Plus, you can chat with our AI to further customize your resume, ensuring it meets market standards and enhances your chances of landing your next job</p>
        <span className='warn'><CircleAlert />Our system does not have capability of analyzing images in your document.</span>
      </div>
    </div>
  );
}

export default ResumeUpload;