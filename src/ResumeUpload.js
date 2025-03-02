import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import './container.css'
import { Upload, CircleAlert } from 'lucide-react';


function ResumeUpload({ onUploadSuccess = (data) => console.log('Upload success:', data) }) {
  const [file, setFile] = useState(null);

  // Log the event and files for debugging
  const handleFileChange = (e) => {
    console.log('File input changed:', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      handleUpload(selectedFile);
      console.log('File set:', e.target.files[0]);
    } else {
      console.error('No files found in event');
    }
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      alert("Please Enter a PDF file");
      return;
    }

    console.log('Uploading file:', file);
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
      
      alert("File upload failed");
    }
  };

  return (
    <div className="container">
      <div>
          <label className="label">
          <div className="label-content">
            <Upload className="label-input" />
              <p className="label-text">
                {file ? "You Can Now Scan Your Resume" : "Click to upload your resume"}
              </p>
            </div>
          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <div>
         <p>Welcome to <b>AI-Powered Resume Enhancement System (AIRES)</b>, where you can effortlessly upload your resume for an in-depth scan. Our system analyzes your document to provide personalized feedback, actionable insights, and recommendations for improvement. Plus, you can chat with our AI to further customize your resume, ensuring it meets market standards and enhances your chances of landing your next job</p>
        <span className='warn'><CircleAlert />Our system does not have capability of analyzing images in your document.</span>
      </div>
      
      
    </div>
  );
}

export default ResumeUpload;
