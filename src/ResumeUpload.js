import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import './container.css';
import { Upload, CircleAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // Import for potential redirect

// Define your API base URL (makes it easier to manage)
const API_URL = 'http://localhost:8000/api';

function ResumeUpload({ onUploadSuccess = (data) => console.log('Upload success:', data) }) {
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const navigate = useNavigate(); // Hook for navigation

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token); // Set true if token exists, false otherwise
  }, []);


  const handleFileChange = (e) => {
    console.log('File input changed:', e.target.files);
    // --- Check if logged in before proceeding ---
    if (!isLoggedIn) {
        setError("Please log in or sign up to upload a resume.");
        // Optionally redirect to login after a delay or provide a link
        // setTimeout(() => navigate('/login'), 3000);
        return; // Stop processing if not logged in
    }
    // --- End login check ---

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null); // Clear previous errors
      setValidationResult(null); // Clear previous validation results
      validateResume(selectedFile); // Start validation immediately
      console.log('File set:', selectedFile);
    } else {
      console.error('No files found in event');
    }
  };

  const validateResume = async (selectedFile) => {
    if (!selectedFile) return;

    // --- Retrieve Auth Token ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoggedIn(false); // Update login status state
        return; // Don't proceed without a token
    }
    // --- End Auth Token Check ---

    setValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('validate_only', 'true'); // Send as string 'true'

      // --- Construct Headers with Auth Token ---
      const headers = {
        'Content-Type': 'multipart/form-data', // Required for FormData
        'Authorization': `Token ${token}`     // Include the token
      };
      // --- End Header Construction ---

      console.log("DEBUG: Sending validation request with headers:", headers); // Log headers

      // --- Make Request with Headers ---
      const response = await axios.post(`${API_URL}/upload_resume/`, formData, { headers });
      // --- End Make Request ---

      console.log('Validation response:', response.data);
      setValidationResult(response.data);

      // If validation passes, proceed with the actual upload
      if (response.data.is_resume) {
        // Note: The handleUpload function is now implicitly called
        // if validation succeeds because the backend saves on the
        // second non-validate_only request. We can simplify this.
        // Let's directly call the final upload if validation is successful.
        handleFinalUpload(selectedFile, token); // Pass token along
      } else {
          // If it's not a resume, the validationResult state will show the message.
          setValidating(false); // Stop validating spinner if it's not a resume
      }
    }
    catch (error) {
      console.error("Validation error:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
         // Handle specific errors like 401 Unauthorized explicitly
         if (error.response.status === 401) {
             setError("Your session may have expired. Please log in again.");
             localStorage.removeItem('authToken'); // Clear invalid token
             localStorage.removeItem('user');
             setIsLoggedIn(false);
             // Optionally redirect to login
             // navigate('/login');
         } else {
             setError(error.response.data?.error || error.response.data?.detail || "Error validating resume");
         }
      } else if (error.request) {
          setError("Cannot connect to server. Please check your network or if the server is running.");
      } else {
          setError("An unexpected error occurred during validation.");
      }
      setValidationResult(null);
      setValidating(false); // Ensure spinner stops on error
    }
    // Removing finally { setValidating(false); } here, as it's handled within try/catch now
  };

  // Renamed handleUpload to handleFinalUpload for clarity
  const handleFinalUpload = async (selectedFile, token) => {
    // No need to re-validate or re-check token here, assuming validateResume succeeded

    setValidating(true); // Keep spinner active for upload
    setError(null);
    console.log('Uploading file (final step):', selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);
    // DO NOT send 'validate_only' this time, so the backend saves it

    try {
      // Construct headers again (or pass from validateResume)
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${token}`
      };

      console.log("DEBUG: Sending final upload request with headers:", headers);

      // Make the final upload request
      const response = await axios.post(`${API_URL}/upload_resume/`, formData, { headers });

      console.log('Final Upload Server response:', response.data);
      // Call the callback passed via props
      onUploadSuccess(response.data);
      // Maybe clear the file input or give other success feedback
      setFile(null); // Clear file state after successful upload
      // Keep validation result showing success
      setValidationResult({ is_resume: true, confidence: validationResult?.confidence || 1 }); // Ensure success message persists briefly
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
      // Don't clear validation result on upload error, maybe it was valid but upload failed
      // setValidationResult(null);
      alert("File upload failed: " + (error.response?.data?.error || error.message)); // Show alert too
    } finally {
      setValidating(false); // Stop spinner after upload attempt
    }
  };

  return (
    <div className="container">
      <div>
        {/* Conditionally render upload or login message */}
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
                {validating && <span className="spinner"></span>} {/* Basic spinner */}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={validating} // Disable input while processing
              key={file ? 'file-selected' : 'no-file'} // Reset input field after upload/clear
            />
          </label>
        )}

        {/* Validation Result Area */}
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

        {/* General Error Area */}
        {error && (
          <div className="error-message">
            <CircleAlert className="error-icon" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Informational Text */}
      <div>
        <p>Welcome to <b>AI-Powered Resume Enhancement System (AIRES)</b>, where you can effortlessly upload your resume for an in-depth scan. Our system analyzes your document to provide personalized feedback, actionable insights, and recommendations for improvement. Plus, you can chat with our AI to further customize your resume, ensuring it meets market standards and enhances your chances of landing your next job</p>
        <span className='warn'><CircleAlert />Our system does not have capability of analyzing images in your document.</span>
      </div>
    </div>
  );
}

export default ResumeUpload;