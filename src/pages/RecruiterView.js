import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {  Link } from 'react-router-dom'; 
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Upload, Loader2, AlertCircle, FileText, XCircle, Award, Briefcase, BookOpen,
  CheckCircle, ListChecks, AlertTriangle, ThumbsUp, ThumbsDown, Star, ShieldCheck, ShieldAlert,
  LogIn 
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import './RecruiterView.css';



const API_URL = 'http://localhost:8000/api';

const VALIDATION_STATUS = {
  PENDING: 'pending',
  VALIDATING: 'validating',
  VALID: 'valid',
  INVALID: 'invalid',
  ERROR: 'error',
};

function RecruiterView() {
  const [jobDescription, setJobDescription] = useState('');
  const [validatedFiles, setValidatedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [overallError, setOverallError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const MAX_FILES = 5;


  
  useEffect(() => {
    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);
        if (!token) {
            
            setValidatedFiles([]);
            setAnalysisResults(null);
            setJobDescription('');
        }
    };
    checkAuth(); 
    window.addEventListener('storage', checkAuth); 
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  
  useEffect(() => {
    console.log("State updated - validatedFiles:", validatedFiles);
  }, [validatedFiles]);

  
  const handleUnauthorized = (errorSource) => {
      console.warn(`Unauthorized (401) detected during ${errorSource}.`);
      setOverallError("Your session has expired or is invalid. Please log in again.");
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      
      
  };

  
  const validateSingleFile = async (fileId, file) => {
    console.log(`Starting validation for file: ${file.name} (ID: ${fileId})`);

    
    const token = localStorage.getItem('authToken');
    if (!token) {
        handleUnauthorized("file validation");
        
        setValidatedFiles(prevFiles =>
            prevFiles.map(vf =>
                vf.id === fileId ? { ...vf, status: VALIDATION_STATUS.ERROR, message: 'Login required' } : vf
            )
        );
        return; 
    }

    
    setValidatedFiles(prevFiles =>
      prevFiles.map(vf =>
        vf.id === fileId ? { ...vf, status: VALIDATION_STATUS.VALIDATING, message: '' } : vf
      )
    );

    const formData = new FormData();
    formData.append('file', file);
    formData.append('validate_only', 'true'); 

    
    const headers = {
        
        'Authorization': `Token ${token}`
    };

    try {
      
      const response = await axios.post(`${API_URL}/upload_resume/`, formData, { headers }); 
      const { is_resume, details } = response.data;
      const status = is_resume ? VALIDATION_STATUS.VALID : VALIDATION_STATUS.INVALID;
      const message = is_resume ? 'Verified as Resume' : (details?.details?.error || details?.error || "File doesn't appear to be a resume.");

      console.log(`Validation completed for ${file.name}: Status=${status}, Message=${message}`);

      
      setValidatedFiles(prevFiles => {
        const updatedFiles = prevFiles.map(vf =>
          vf.id === fileId ? { ...vf, status, message } : vf
        );
        console.log("Updated files after validation:", updatedFiles);
        return updatedFiles;
      });
    } catch (error) {
      console.error("Validation API error for file:", file.name, error);
      let errorMsg = "Validation check failed.";
      if (error.response) {
        
        if (error.response.status === 401) {
            handleUnauthorized("file validation");
            errorMsg = 'Authentication failed.'; 
        } else {
            errorMsg = error.response.data.error || error.response.data.details || errorMsg;
        }
      } else if (error.request) {
        errorMsg = "Network error during validation.";
      }

      
      setValidatedFiles(prevFiles =>
        prevFiles.map(vf =>
          vf.id === fileId ? { ...vf, status: VALIDATION_STATUS.ERROR, message: errorMsg } : vf
        )
      );
    }
  };

  
  const handleFileChange = (event) => {
     
    if (!isLoggedIn) {
        setOverallError("Please log in to upload resumes.");
        return;
    }

    setOverallError(null);
    const selectedRawFiles = Array.from(event.target.files);
    const newFilesToValidate = [];
    let nonPdfWarning = null;

    selectedRawFiles.forEach(file => {
        const alreadyExists = validatedFiles.some(vf => vf.file.name === file.name);
        if (alreadyExists) {
            console.log(`File ${file.name} already selected, skipping.`);
            return;
        }

        if (file.type === 'application/pdf') {
             if (validatedFiles.length + newFilesToValidate.length < MAX_FILES) {
                const fileId = `${file.name}-${Date.now()}`;
                newFilesToValidate.push({
                    id: fileId,
                    file: file,
                    status: VALIDATION_STATUS.PENDING,
                    message: ''
                 });
            }
        } else {
            nonPdfWarning = `Only PDF files are allowed. Non-PDF files were ignored.`;
        }
    });

    const updatedFiles = [...validatedFiles, ...newFilesToValidate];
    let currentError = nonPdfWarning;

    if (updatedFiles.length > MAX_FILES) {
        currentError = `Maximum ${MAX_FILES} resumes allowed. Some files were not added. ${nonPdfWarning || ''}`.trim();
        setValidatedFiles(updatedFiles.slice(0, MAX_FILES));
    } else {
        setValidatedFiles(updatedFiles);
    }

    setOverallError(currentError);

    
    newFilesToValidate.forEach(vf => {
        validateSingleFile(vf.id, vf.file); 
    });

    event.target.value = null; 
  };

  
  const removeFile = (idToRemove) => {
    setValidatedFiles(prevFiles => prevFiles.filter(vf => vf.id !== idToRemove));
    setOverallError(null); 
  };

  
  const handleAnalyzeCandidates = async () => {
     
    const token = localStorage.getItem('authToken');
    if (!token) {
        handleUnauthorized("analysis");
        return;
    }

    if (!jobDescription.trim()) {
      setOverallError('Please provide a job description.');
      return;
    }

    const filesToAnalyze = validatedFiles.filter(vf => vf.status === VALIDATION_STATUS.VALID);

    if (filesToAnalyze.length === 0) {
      setOverallError('No valid resume files available to analyze. Please upload valid resumes.');
      return;
    }

     if (validatedFiles.some(vf => vf.status === VALIDATION_STATUS.VALIDATING || vf.status === VALIDATION_STATUS.PENDING)) {
        setOverallError('Please wait for all file validations to complete before analyzing.');
        return;
     }

     const invalidOrErrorFiles = validatedFiles.filter(vf => vf.status === VALIDATION_STATUS.INVALID || vf.status === VALIDATION_STATUS.ERROR);
     if (invalidOrErrorFiles.length > 0) {
         console.warn(`Analyzing only ${filesToAnalyze.length} valid resumes. Ignoring ${invalidOrErrorFiles.length} invalid/error files.`);
         
     }

    setLoadingAnalysis(true);
    setOverallError(null);
    setAnalysisResults(null);

    const formData = new FormData();
    formData.append('job_description', jobDescription);
    filesToAnalyze.forEach((vf) => {
      formData.append('resumes', vf.file);
    });

    
    const headers = {
        
        'Authorization': `Token ${token}`
    };

    try {
      
      const response = await axios.post(`${API_URL}/recruiter_analyze/`, formData, { headers });
      console.log("Recruiter Analysis Response:", response.data);

      
      if (response.data && Array.isArray(response.data.candidate_analysis) && Array.isArray(response.data.ranking)) {
        if (response.data.processing_warnings) {
            setOverallError(`Note: ${response.data.processing_warnings.join(' ')}`);
        }
        setAnalysisResults(response.data);
      } else {
        setOverallError("Received an incomplete or unexpected analysis format from the server.");
        setAnalysisResults(null);
      }
    } catch (err) {
      console.error('Recruiter analysis error:', err);
      let errorMsg = "An unexpected error occurred during analysis.";
       if (err.response) {
            
            if (err.response.status === 401) {
                handleUnauthorized("analysis");
                errorMsg = 'Authentication failed.'; 
            } else {
                errorMsg = err.response.data?.error || err.response.data?.details || `Server error: ${err.response.status}`;
            }
       } else if (err.request) {
           errorMsg = "Could not reach the analysis server.";
       } else {
           errorMsg = `Failed to send analysis request: ${err.message}`;
       }
       setOverallError(errorMsg);
       setAnalysisResults(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  
  
  const getSafeFileName = (identifier) => {
    if (typeof identifier === 'string') {
      const parts = identifier.split(/[\\/]/);
      return parts[parts.length - 1] || identifier || 'Unknown File';
    }
    return identifier || 'Unknown File';
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'skills': return <Award className="category-icon" size={16} />;
      case 'experience': return <Briefcase className="category-icon" size={16} />;
      case 'education': return <BookOpen className="category-icon" size={16} />;
      case 'keywords': return <ListChecks className="category-icon" size={16} />;
      default: return <Star className="category-icon" size={16} />;
    }
  };

  const generateRadarPoints = (candidate, categories = ['skills', 'experience', 'education', 'keywords']) => {
      const centerX = 50;
      const centerY = 50;
      const radius = 40;
      const points = [];
      const getScore = (cat) => candidate?.details?.[`${cat}_score`] ?? 0;

      categories.forEach((category, i) => {
          const score = getScore(category);
          const angle = (Math.PI / 2) - (2 * Math.PI * i) / categories.length;
          const normalizedRadius = (radius * Math.max(0, Math.min(100, score))) / 100;
          const x = centerX + normalizedRadius * Math.cos(angle);
          const y = centerY - normalizedRadius * Math.sin(angle);
          points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      });
      return points.join(' ');
  };

  const renderListWithIcon = (items, icon, listContainerClass = '', iconClass = '') => {
    if (!items || items.length === 0) return <p className="list-item-none-noted">None noted.</p>;
    return (
        <ul className={`detail-list ${listContainerClass}`}>
            {items.map((item, index) => (
                <li key={index} className="detail-list-item">
                    {React.cloneElement(icon, { className: `detail-list-icon ${iconClass}`, size: 16 })}
                    <span className="detail-list-text">{item}</span>
                </li>
            ))}
        </ul>
    );
  };


  
  const hasValidFiles = validatedFiles.some(vf => vf.status === VALIDATION_STATUS.VALID);
  const hasPendingFiles = validatedFiles.some(vf => vf.status === VALIDATION_STATUS.PENDING || vf.status === VALIDATION_STATUS.VALIDATING);

  
  const disableAnalyzeButton = !isLoggedIn ||
                               loadingAnalysis ||
                               !jobDescription.trim() ||
                               !hasValidFiles ||
                               hasPendingFiles;

  
  if (!isLoggedIn) {
      return (
          <div className="recruiter-view recruiter-login-prompt">
              <Card className="main-card login-card">
                   <CardHeader>
                       <CardTitle className="main-title">Recruiter Analysis</CardTitle>
                       <CardDescription>This feature requires authentication.</CardDescription>
                   </CardHeader>
                   <CardContent>
                       <AlertCircle size={48} className="login-prompt-icon" />
                       <p>Please log in to access the Recruiter Analyzer.</p>
                       <Button asChild className="login-prompt-button">
                           <Link to="/login">
                               <LogIn className="mr-2 h-4 w-4" /> Login
                           </Link>
                       </Button>
                   </CardContent>
              </Card>
          </div>
      );
  }

  
  return (
    <div className="recruiter-view">
      <Card className="main-card">
        <CardHeader className="card-header">
          <CardTitle className="main-title">AIRES Analyzer</CardTitle>
          <CardDescription>
            Validate and analyze up to {MAX_FILES} resumes (PDF) against a job description.
          </CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <div className="grid-layout">
            
            <div className="input-column">
              
              <div className="input-section">
                 <label htmlFor="jobDescription" className="input-label">Job Description / Requirements</label>
                 <Textarea id="jobDescription" placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} className="textarea-input" disabled={loadingAnalysis || !isLoggedIn} />
              </div>

              
              <div className="input-section">
                 <label htmlFor="resumeFiles" className="input-label">Upload Resumes (Max {MAX_FILES} PDFs)</label>
                 <div className="upload-zone">
                   <Input id="resumeFiles" type="file" accept="application/pdf" multiple onChange={handleFileChange} className="file-input" disabled={loadingAnalysis || validatedFiles.length >= MAX_FILES || !isLoggedIn} />
                   <label htmlFor="resumeFiles" className={`upload-label ${loadingAnalysis || validatedFiles.length >= MAX_FILES || !isLoggedIn ? 'disabled' : ''}`}>
                     <Upload size={24} className="upload-icon" />
                     <span>{validatedFiles.length > 0 ? `${validatedFiles.length} file(s) selected` : 'Click or Drag & drop resumes here'}</span>
                     <span className='upload-subtext'>(Max {MAX_FILES} PDFs)</span>
                   </label>
                 </div>

                
                 {validatedFiles.length > 0 && (
                   <div className="selected-files-list validation-list">
                     <p className="files-header">Selected Resumes & Validation Status:</p>
                     <ul>
                       {validatedFiles.map((vf) => (
                         <li key={vf.id} className={`selected-file-item validation-item status-${vf.status}`}>
                           
                           <span className="validation-status-icon">
                             {vf.status === VALIDATION_STATUS.VALIDATING && <Loader2 size={16} className="animate-spin text-blue-500" />}
                             {vf.status === VALIDATION_STATUS.VALID && <ShieldCheck size={16} className="text-green-600" />}
                             {vf.status === VALIDATION_STATUS.INVALID && <ShieldAlert size={16} className="text-orange-500" />}
                             {vf.status === VALIDATION_STATUS.ERROR && <AlertCircle size={16} className="text-red-600" />}
                             {vf.status === VALIDATION_STATUS.PENDING && <FileText size={16} className="text-gray-400" />}
                           </span>
                           
                           <span className="file-name" title={vf.file.name}>{vf.file.name}</span>
                           <span className="file-size">({(vf.file.size / 1024).toFixed(1)} KB)</span>
                           
                           {(vf.status === VALIDATION_STATUS.INVALID || vf.status === VALIDATION_STATUS.ERROR) && (
                               <span className="validation-message" title={vf.message}>{vf.message}</span>
                           )}
                           {vf.status === VALIDATION_STATUS.VALID && (
                                <span className="validation-message valid">{vf.message || 'Verified'}</span>
                           )}
                           
                           <Button variant="ghost" size="sm" onClick={() => removeFile(vf.id)} disabled={loadingAnalysis} className="remove-file-btn" aria-label={`Remove ${vf.file.name}`}>
                             <XCircle size={16} />
                           </Button>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>

               
               {overallError && (
                 <div className="error-message">
                   <AlertCircle size={18} />
                   <span>{overallError}</span>
                 </div>
               )}

              
               <div className="analyze-button-container">
                 <Button
                    onClick={handleAnalyzeCandidates}
                    disabled={disableAnalyzeButton} 
                    className="analyze-button">
                   {loadingAnalysis ? (
                     <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Candidates... </>
                   ) : (
                     `Analyze ${hasValidFiles ?
                                `${validatedFiles.filter(vf => vf.status === VALIDATION_STATUS.VALID).length} Valid Candidate(s)` :
                                'Candidates'}`
                   )}
                 </Button>
               </div>
             </div> 

            
             <div className="results-column">
               {loadingAnalysis && ( <div className="loading-indicator"> <Loader2 className="mr-2 h-6 w-6 animate-spin" /> <p>Analyzing candidate data...</p> </div> )}
               {!loadingAnalysis && !analysisResults && !overallError && ( <div className="placeholder-results"> <FileText size={48} className="placeholder-icon" /> <p>Analysis results will appear here.</p> </div> )}

                
               {analysisResults && !loadingAnalysis && (
                 <div className="analysis-results">
                    <h3 className="results-title">Candidate Analysis Results</h3>
                    
                    <Card className="ranking-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Candidate Ranking (Best Match First)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        
                        <div className="ranking-visualization">
                          {analysisResults.ranking?.length > 0 ? (
                              analysisResults.ranking.map((rankedIdentifier, index) => {
                                  const candidate = analysisResults.candidate_analysis?.find(
                                      c => getSafeFileName(c.resume_identifier) === getSafeFileName(rankedIdentifier)
                                  );
                                  const matchScore = candidate?.match_score ?? 0;
                                  return ( 
                                      <div key={index} className="rank-bar-container" title={`Overall Match: ${matchScore}%`}>
                                          <div className="rank-info">
                                              <span className="rank-number">{index + 1}</span>
                                              <span className="rank-name">{getSafeFileName(rankedIdentifier)}</span>
                                          </div>
                                          <div className="rank-bar-wrapper">
                                              <div
                                                  className="rank-bar"
                                                  style={{ width: `${Math.max(2, matchScore)}%` }}
                                                  data-score={`${matchScore}%`}
                                              >
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

                    
                    {analysisResults.comparative_analysis && (
                      <Card className="comparison-card">
                        <CardHeader>
                          <CardTitle className="text-lg">Head-to-Head Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="comparison-text">{analysisResults.comparative_analysis}</p>
                        </CardContent>
                      </Card>
                    )}

                    
                    <h3 className="results-subtitle">Individual Candidate Breakdown</h3>
                    <div className="candidate-grid">
                      {analysisResults.candidate_analysis?.map((candidate, index) => (
                        <Card key={index} className={`candidate-card tier-${(candidate.recommendation_tier || 'default').toLowerCase().replace(' ', '-')}`}>
                          
                           <CardHeader className="candidate-header">
                             <CardTitle className="candidate-title">
                               <FileText size={18} className="mr-2" />
                               {getSafeFileName(candidate.resume_identifier)}
                             </CardTitle>
                             {candidate.recommendation_tier && ( 
                                 <span className={`recommendation-badge tier-${candidate.recommendation_tier.toLowerCase().replace(' ', '-')}`}>
                                     {candidate.recommendation_tier}
                                 </span>
                             )}
                             {candidate.match_score !== undefined && ( 
                               <div className="score-section overall-score-section" title={`Overall Match Score: ${candidate.match_score}%`}>
                                   <Progress value={candidate.match_score} className="score-progress overall-progress" />
                                   <span className='score-percent-label'>{candidate.match_score}%</span>
                               </div>
                             )}
                           </CardHeader>
                           
                           <CardContent className="candidate-content">
                             
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
                                         ) : null;
                                     })}
                                 </div>
                                 
                                 {candidate.details && ( 
                                   <div className="radar-chart-container" title="Visual representation of score breakdown">
                                       <svg viewBox="0 0 100 100" className="radar-chart">
                                           {[40, 30, 20, 10].map(r => <circle key={r} cx="50" cy="50" r={r} className="radar-grid-circle" />)}
                                           {['skills', 'experience', 'education', 'keywords'].map((_, i, arr) => {
                                               const angle = (Math.PI / 2) - (2 * Math.PI * i) / arr.length;
                                               const x2 = 50 + 40 * Math.cos(angle);
                                               const y2 = 50 - 40 * Math.sin(angle);
                                               return <line key={i} x1="50" y1="50" x2={x2} y2={y2} className="radar-axis" />;
                                           })}
                                           <text x="50" y="8" textAnchor="middle" className="radar-label">Skills</text>
                                           <text x="92" y="52" textAnchor="start" className="radar-label">Experience</text>
                                           <text x="50" y="95" textAnchor="middle" className="radar-label">Education</text>
                                           <text x="8" y="52" textAnchor="end" className="radar-label">Keywords</text>
                                           <polygon
                                               points={generateRadarPoints(candidate, ['skills', 'experience', 'education', 'keywords'])}
                                               className="radar-data-polygon"
                                           />
                                       </svg>
                                   </div>
                                  )}
                             </div>
                             
                              <div className="detail-section">
                                 <h4 className="detail-heading"><ListChecks size={16} className="inline-block mr-1" /> Keyword Match</h4>
                                 <div className='keyword-columns'>
                                     <div>
                                          <h5 className='keyword-subheading'>Matched:</h5>
                                          {renderListWithIcon(candidate.details?.keywords_matched, <CheckCircle />, 'matched-keywords-list', 'icon-success')}
                                     </div>
                                     <div>
                                          <h5 className='keyword-subheading'>Missing:</h5>
                                          {renderListWithIcon(candidate.details?.keywords_missing, <XCircle />, 'missing-keywords-list', 'icon-danger')}
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="detail-section">
                                 <h4 className="detail-heading">Analysis Summary</h4>
                                 <div className="strengths-weaknesses">
                                     <div>
                                         <h5 className='strength-weakness-title'><ThumbsUp size={16} className='inline-block mr-1 text-green-600'/>Strengths</h5>
                                         {renderListWithIcon(candidate.details?.strengths, <ThumbsUp />, 'strengths-list', 'icon-success')}
                                     </div>
                                     <div>
                                         <h5 className='strength-weakness-title'><ThumbsDown size={16} className='inline-block mr-1 text-orange-600'/>Weaknesses/Gaps</h5>
                                         {renderListWithIcon(candidate.details?.weaknesses, <ThumbsDown />, 'weaknesses-list', 'icon-warning')}
                                     </div>
                                 </div>
                             </div>
                             
                             {candidate.details?.red_flags && candidate.details.red_flags.length > 0 && ( 
                                 <div className="detail-section red-flags-section">
                                     <h4 className="detail-heading"><AlertTriangle size={16} className="inline-block mr-1 text-red-600" /> Potential Red Flags</h4>
                                     {renderListWithIcon(candidate.details.red_flags, <AlertTriangle />, 'red-flags-list', 'icon-danger')}
                                 </div>
                             )}
                             
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