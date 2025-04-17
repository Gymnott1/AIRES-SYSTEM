import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Upload, Loader2, AlertCircle, FileText, XCircle, Award, Briefcase, BookOpen,
  CheckCircle, ListChecks, AlertTriangle, ThumbsUp, ThumbsDown, Star // Added icons
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import './RecruiterView.css'; 
import { cn } from '../components/lib/utils'; 

function RecruiterView() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFiles, setResumeFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const MAX_FILES = 5;

  // --- handleFileChange, removeFile, handleAnalyzeCandidates remain the same ---
  const handleFileChange = (event) => {
    setError(null);
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    const nonPdfFiles = files.filter(file => file.type !== 'application/pdf');

    if (nonPdfFiles.length > 0) {
      setError(`Only PDF files are allowed. ${nonPdfFiles.map(f => f.name).join(', ')} were ignored.`);
    }

    // Combine previous valid files with new valid files, enforcing the limit
    setResumeFiles(prevFiles => {
        const combined = [...prevFiles, ...pdfFiles];
        // Remove duplicates by name (simple check)
        const uniqueFiles = Array.from(new Map(combined.map(file => [file.name, file])).values());
         if (uniqueFiles.length > MAX_FILES) {
             setError(`You can upload a maximum of ${MAX_FILES} resumes. Only the first ${MAX_FILES} were kept.`);
             return uniqueFiles.slice(0, MAX_FILES);
         }
         return uniqueFiles;
     });

    // Clear the input value so the same file can be selected again if removed
    event.target.value = null;
  };

  const removeFile = (indexToRemove) => {
    setResumeFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setError(null); // Clear error when file is removed
  };

  const handleAnalyzeCandidates = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }
    if (resumeFiles.length === 0) {
      setError('Please upload at least one resume (PDF).');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResults(null);

    const formData = new FormData();
    formData.append('job_description', jobDescription);
    resumeFiles.forEach((file) => {
      // Use a consistent key, backend should handle multiple files with this key
      formData.append('resumes', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/api/recruiter_analyze/', formData, {
        headers: {
          // Browser usually sets this correctly for FormData, but explicitly can help
          // 'Content-Type': 'multipart/form-data',
        },
        // Add timeout?
        // timeout: 60000 // 60 seconds
      });
      console.log("Recruiter Analysis Response:", response.data);

      // More robust check for expected structure
      if (response.data && Array.isArray(response.data.candidate_analysis) && Array.isArray(response.data.ranking)) {
        setAnalysisResults(response.data);
      } else {
        console.error("Unexpected response structure received:", response.data);
        setError("Received an incomplete or unexpected analysis format from the server.");
        setAnalysisResults(null);
      }
    } catch (err) {
      console.error('Recruiter analysis error:', err);
      let errorMsg = "An unexpected error occurred during analysis.";
      if (err.response) {
          // Server responded with a status code outside 2xx range
          errorMsg = err.response.data?.error || err.response.data?.details || `Server error: ${err.response.status}`;
          console.error("Server Response Data:", err.response.data);
      } else if (err.request) {
          // Request was made but no response received (network error, timeout)
          errorMsg = "Could not reach the analysis server. Please check your connection or try again later.";
          console.error("No response received:", err.request);
      } else {
          // Something else happened in setting up the request
          errorMsg = `Failed to send analysis request: ${err.message}`;
      }
      setError(errorMsg);
      setAnalysisResults(null);
    } finally {
      setLoading(false);
    }
  };
  // --- end unchanged functions ---


  const getSafeFileName = (identifier) => {
    if (typeof identifier === 'string') {
      const parts = identifier.split(/[\\/]/);
      return parts[parts.length - 1] || identifier || 'Unknown File';
    }
    return identifier || 'Unknown File';
  };

  // Helper function to get category-specific icons (minor update)
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'skills': return <Award className="category-icon" size={16} />;
      case 'experience': return <Briefcase className="category-icon" size={16} />;
      case 'education': return <BookOpen className="category-icon" size={16} />;
      case 'keywords': return <ListChecks className="category-icon" size={16} />; // Added keyword icon
      default: return <Star className="category-icon" size={16} />; // Default icon
    }
  };

  // **MODIFIED**: Generate radar chart data points using structured scores
  const generateRadarPoints = (candidate, categories = ['skills', 'experience', 'education', 'keywords']) => {
      const centerX = 50;
      const centerY = 50;
      const radius = 40; // Max radius of the chart
      const points = [];

      // Fallback if details or scores are missing
      const getScore = (cat) => {
          const scoreKey = `${cat}_score`;
          // Use optional chaining and provide a default (e.g., 0 or 5) if score is missing
          return candidate?.details?.[scoreKey] ?? 0;
      };

      categories.forEach((category, i) => {
          const score = getScore(category); // Get numerical score
          const angle = (Math.PI / 2) - (2 * Math.PI * i) / categories.length; // Rotated starting top
          const normalizedRadius = (radius * Math.max(0, Math.min(100, score))) / 100; // Clamp score 0-100
          const x = centerX + normalizedRadius * Math.cos(angle);
          const y = centerY - normalizedRadius * Math.sin(angle); // Y decreases upwards in SVG
          points.push(`${x.toFixed(2)},${y.toFixed(2)}`); // Use toFixed for cleaner SVG points
      });

      return points.join(' ');
  };

  
    const renderListWithIcon = (items, icon, itemClassName = '', iconClassName = '') => {
      if (!items || items.length === 0) return <p className="text-sm text-muted-foreground italic">None noted.</p>;
      return (
          <ul className={`list-none p-0 m-0 grid gap-1 ${itemClassName}`}>
              {items.map((item, index) => (
                  <li key={index} className="flex items-start gap-1 text-sm">
                      {React.cloneElement(icon, { className: cn('mt-0.5 flex-shrink-0', iconClassName), size: 16 })}

                      <span className="flex-1 break-words">{item}</span>
                  </li>
              ))}
          </ul>
      );
  };

  return (
    <div className="recruiter-view">
      <Card className="main-card">
        {/* Card Header remains largely the same */}
        <CardHeader className="card-header">
          <CardTitle className="main-title">AIRES Candidate Analyzer</CardTitle>
          <CardDescription>
            Analyze up to {MAX_FILES} resumes (PDF) against a job description for detailed insights.
          </CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <div className="grid-layout">
             {/* Input Column remains largely the same */}
            <div className="input-column">
              <div className="input-section">
                <label htmlFor="jobDescription" className="input-label">
                  Job Description / Requirements
                </label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="textarea-input"
                  disabled={loading}
                />
              </div>

              <div className="input-section">
                <label htmlFor="resumeFiles" className="input-label">
                  Upload Resumes (Max {MAX_FILES} PDFs)
                </label>
                <div className="upload-zone">
                  <Input
                    id="resumeFiles"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="file-input" // Hidden, label acts as trigger
                    disabled={loading || resumeFiles.length >= MAX_FILES}
                  />
                  {/* Make the whole zone clickable */}
                  <label htmlFor="resumeFiles" className={`upload-label ${loading || resumeFiles.length >= MAX_FILES ? 'disabled' : ''}`}>
                     <Upload size={24} className="upload-icon" />
                     <span>{resumeFiles.length > 0 ? `${resumeFiles.length} file(s) selected` : 'Click or Drag & drop resumes here'}</span>
                     <span className='upload-subtext'>(Max {MAX_FILES} PDFs)</span>
                  </label>
                </div>

                {resumeFiles.length >= MAX_FILES && (
                  <p className="max-files-warning">Maximum number of files reached.</p>
                )}

                {resumeFiles.length > 0 && (
                  <div className="selected-files-list">
                    <p className="files-header">Selected resumes:</p>
                    <ul>
                      {resumeFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="selected-file-item">
                          <FileText size={16} className="file-icon" />
                          <span className="file-name" title={file.name}>{file.name}</span>
                          <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={loading}
                            className="remove-file-btn"
                            aria-label={`Remove ${file.name}`}
                          >
                            <XCircle size={16} />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="analyze-button-container">
                <Button
                  onClick={handleAnalyzeCandidates}
                  disabled={loading || resumeFiles.length === 0 || !jobDescription.trim()}
                  className="analyze-button" // Main action button style
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Candidates...
                    </>
                  ) : (
                    'Analyze Candidates'
                  )}
                </Button>
              </div>
            </div>


             {/* Results Column - Significantly Enhanced */}
            <div className="results-column">
              {loading && (
                <div className="loading-indicator">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <p>Analyzing candidate data... This may take a moment.</p>
                  {/* You could try a more dynamic progress estimate if possible */}
                  {/* <Progress value={progressEstimate} className="loading-progress" /> */}
                </div>
              )}

              {!loading && !analysisResults && !error && (
                 <div className="placeholder-results">
                     <FileText size={48} className="placeholder-icon" />
                     <p>Analysis results will appear here after you upload resumes and provide a job description.</p>
                 </div>
              )}

              {analysisResults && !loading && (
                <div className="analysis-results">
                  <h3 className="results-title">Candidate Analysis Results</h3>

                  {/* Ranking Card */}
                  <Card className="ranking-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Candidate Ranking </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="ranking-visualization">
                        {analysisResults.ranking?.length > 0 ? (
                            analysisResults.ranking.map((rankedIdentifier, index) => {
                                const candidate = analysisResults.candidate_analysis?.find(
                                    c => getSafeFileName(c.resume_identifier) === getSafeFileName(rankedIdentifier)
                                );
                                const matchScore = candidate?.match_score ?? 0; // Default to 0 if not found

                                return (
                                    <div key={index} className="rank-bar-container" title={`Overall Match: ${matchScore}%`}>
                                        <div className="rank-info">
                                            <span className="rank-number">{index + 1}</span>
                                            <span className="rank-name">{getSafeFileName(rankedIdentifier)}</span>
                                        </div>
                                        <div className="rank-bar-wrapper">
                                            <div
                                                className="rank-bar"
                                                style={{ width: `${Math.max(2, matchScore)}%` }} // Min width 2% for visibility
                                                data-score={`${matchScore}%`} // Use data-attribute for score text
                                            >
                                                {/* Score inside or outside bar depending on width? For now, use data-attr */}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No ranking available.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comparative Analysis Card */}
                  {analysisResults.comparative_analysis && (
                    <Card className="comparison-card">
                      <CardHeader>
                        <CardTitle className="text-lg">COMPARISON</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="comparison-text">{analysisResults.comparative_analysis}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Individual Candidate Analysis Grid */}
                  <h3 className="results-subtitle">Individual Candidate Breakdown</h3>
                  <div className="candidate-grid">
                    {analysisResults.candidate_analysis?.map((candidate, index) => (
                      <Card key={index} className={`candidate-card tier-${(candidate.recommendation_tier || 'default').toLowerCase().replace(' ', '-')}`}>
                        <CardHeader className="candidate-header">
                          <CardTitle className="candidate-title">
                            <FileText size={18} className="mr-2" />
                            {getSafeFileName(candidate.resume_identifier)}
                          </CardTitle>
                           {/* Recommendation Tier Badge */}
                           {candidate.recommendation_tier && (
                               <span className={`recommendation-badge tier-${candidate.recommendation_tier.toLowerCase().replace(' ', '-')}`}>
                                   {candidate.recommendation_tier}
                               </span>
                           )}
                           {/* Overall Score */}
                          {candidate.match_score !== undefined && (
                            <div className="score-section overall-score-section" title={`Overall Match Score: ${candidate.match_score}%`}>
                                <Progress value={candidate.match_score} className="score-progress overall-progress" />
                                <span className='score-percent-label'>{candidate.match_score}%</span>
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="candidate-content">
                          {/* --- NEW: Structured Scores & Radar Chart --- */}
                          <div className="scores-and-radar">
                              <div className="structured-scores">
                                  <h4 className="detail-heading">Score Breakdown</h4>
                                  {['skills', 'experience', 'education', 'keywords'].map(category => {
                                      const scoreKey = `${category}_score`;
                                      const score = candidate.details?.[scoreKey];
                                      return score !== undefined ? (
                                          <div key={category} className="structured-score-item" title={`${category.charAt(0).toUpperCase() + category.slice(1)} Match: ${score}%`}>
                                              {getCategoryIcon(category)}
                                              <span className='structured-score-label'>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                              <Progress value={score} className={`score-progress category-progress ${category}-progress`} />
                                              <span className='score-percent-label'>{score}%</span>
                                          </div>
                                      ) : null; // Don't render if score is missing
                                  })}
                              </div>
                              {/* Radar Chart */}
                              {candidate.details && (
                                <div className="radar-chart-container" title="Visual representation of score breakdown">
                                    <svg viewBox="0 0 100 100" className="radar-chart">
                                        {/* Grid Lines & Axes */}
                                        {[40, 30, 20, 10].map(r => <circle key={r} cx="50" cy="50" r={r} className="radar-grid-circle" />)}
                                        {['skills', 'experience', 'education', 'keywords'].map((_, i, arr) => {
                                            const angle = (Math.PI / 2) - (2 * Math.PI * i) / arr.length;
                                            const x2 = 50 + 40 * Math.cos(angle);
                                            const y2 = 50 - 40 * Math.sin(angle);
                                            return <line key={i} x1="50" y1="50" x2={x2} y2={y2} className="radar-axis" />;
                                        })}
                                        {/* Labels (adjust positions) */}
                                        <text x="50" y="8" textAnchor="middle" className="radar-label">Skills</text>
                                        <text x="92" y="52" textAnchor="start" className="radar-label">Experience</text>
                                        <text x="50" y="95" textAnchor="middle" className="radar-label">Education</text>
                                        <text x="8" y="52" textAnchor="end" className="radar-label">Keywords</text>
                                        {/* Data Polygon */}
                                        <polygon
                                            points={generateRadarPoints(candidate, ['skills', 'experience', 'education', 'keywords'])}
                                            className="radar-data-polygon"
                                        />
                                    </svg>
                                </div>
                               )}
                          </div>

                           {/* --- NEW: Keywords Section --- */}
                           <div className="detail-section">
                               <h4 className="detail-heading"><ListChecks size={16} className="inline-block mr-1" /> Keyword Match</h4>
                               <div className='keyword-columns'>
                                   <div>
                                        <h5 className='keyword-subheading'>Matched:</h5>
                                        {renderListWithIcon(candidate.details?.keywords_matched, <CheckCircle />, 'matched-keywords', 'text-green-600')}
                                   </div>
                                   <div>
                                        <h5 className='keyword-subheading'>Missing:</h5>
                                        {renderListWithIcon(candidate.details?.keywords_missing, <XCircle />, 'missing-keywords', 'text-red-600')}
                                   </div>
                               </div>
                           </div>

                          {/* --- NEW: Strengths / Weaknesses --- */}
                          <div className="detail-section">
                              <h4 className="detail-heading">Analysis Summary</h4>
                              <div className="strengths-weaknesses">
                                  <div>
                                      <h5 className='strength-weakness-title text-green-600'><ThumbsUp size={16} className='inline-block mr-1 text-green-600'/>Strengths</h5>
                                      {renderListWithIcon(candidate.details?.strengths, <ThumbsUp />, 'strengths-list', 'text-green-600')}
                                  </div>
                                  <div>
                                      <h5 className='strength-weakness-title'><ThumbsDown size={16} className='inline-block mr-1 text-orange-600'/>Weaknesses/Gaps</h5>
                                      {renderListWithIcon(candidate.details?.weaknesses, <ThumbsDown />, 'weaknesses-list', 'text-orange-600')}
                                  </div>
                              </div>
                          </div>

                          {/* --- NEW: Red Flags --- */}
                          {candidate.details?.red_flags && candidate.details.red_flags.length > 0 && (
                              <div className="detail-section red-flags-section">
                                  <h4 className="detail-heading"><AlertTriangle size={16} className="inline-block mr-1 text-red-600" /> Potential Red Flags</h4>
                                  {renderListWithIcon(candidate.details.red_flags, <AlertTriangle />, 'red-flags-list', 'text-red-600')}
                              </div>
                          )}

                          {/* AI Summary (Kept from previous) */}
                          <div className="detail-section">
                                <h4 className="detail-heading">AI Overall Summary:</h4>
                                <p className="candidate-summary">{candidate.summary || 'No summary provided.'}</p>
                          </div>

                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}

export default RecruiterView;