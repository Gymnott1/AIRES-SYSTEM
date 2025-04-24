import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import './container.css';
import ResumeUpload from './ResumeUpload';
import Analysis from './Analysis';
import ResumeRewrite from './ResumeRewrite';
import About from './pages/About';
import ContactPage from './pages/ContactPage';
import Account from './pages/Account';
import Login from './auth/Login';
import Signup from './auth/Signup';
import RecruiterView from './pages/RecruiterView';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  LogOut, LogIn, Menu, Sun, Moon, CircleUser, Contact, Users, House,
  Briefcase, UserRoundSearch, ChevronDown, UserCheck, Loader2
} from 'lucide-react';
import { useToast } from './components/ui/use-toast';
import { ToastProvider } from './components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import RewrittenResumeView from './RewrittenResumeView';


const API_URL = 'http://localhost:8000/api';


const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};


function App() {
  const [uploadedResume, setUploadedResume] = useState(null);
  const [resumeContent, setResumeContent] = useState(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(window.innerWidth <= 768);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark-mode') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'Job Seeker');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const dropdownRef = useRef(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const storedRole = localStorage.getItem('userRole') || 'Job Seeker';
      const currentAuth = !!token;
      if (currentAuth !== isAuthenticated) setIsAuthenticated(currentAuth);
      if (storedRole !== userRole) setUserRole(storedRole);
      if (!currentAuth && userRole !== 'Job Seeker') setUserRole('Job Seeker');
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [isAuthenticated, userRole]);

  const handleUploadedSuccess = (data) => {
    setUploadedResume(data);
    setResumeContent(data.content || "Resume content not available");
  };

  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('dark-mode', newMode);
  };

  
  const handleRoleChange = (newRole) => {
    const currentRole = userRole;
    if (newRole === currentRole || isUpdatingRole) {
      setSideMenuOpen(false);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in to change roles.", variant: "destructive" });
      setSideMenuOpen(false);
      setIsAuthenticated(false);
      return;
    }

    console.log(`Switching UI role to: ${newRole}`);
    
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
    setUploadedResume(null);
    setResumeContent(null);
    setSideMenuOpen(false);

    
    setIsUpdatingRole(true); 
    const updateBackendRole = async () => {
      try {
        console.log(`Attempting to update backend role to: ${newRole}`);
        const headers = { 'Authorization': `Token ${token}` };
        const response = await axios.post(`${API_URL}/account/role/`, { role: newRole }, { headers });
        console.log("Backend role update response:", response.data);

        
        if (response.data.user) {
          const backendRole = response.data.user.role || newRole; 
          const userToStore = {
            id: response.data.user.id, username: response.data.user.username,
            email: response.data.user.email, role: backendRole
          };
          localStorage.setItem('user', JSON.stringify(userToStore));
        }
      } catch (error) {
        console.error("Failed to update backend role:", error);
        let errorMsg = "Could not sync role with server. Your view has changed, but the server might have the old role.";
        if (error.response) {
          if (error.response.status === 401) {
            errorMsg = "Authentication failed while syncing role. Please log in again.";
            
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            setIsAuthenticated(false);
            setUserRole('Job Seeker');
            navigate('/login', { replace: true });
          } else {
            errorMsg = error.response.data?.error || `Server sync error (${error.response.status}).`;
          }
        }
        toast({ title: "Role Sync Failed", description: errorMsg, variant: "destructive" });
      } finally {
        setIsUpdatingRole(false); 
      }
    };
    updateBackendRole(); 
  };

  
  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      setSmallScreen(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSideMenuOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setSideMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const handleSideMenu = () => setSideMenuOpen(!sideMenuOpen);

  
  const JobSeekerView = () => {
    const [uploadedResumeJS, setUploadedResumeJS] = useState(uploadedResume);
    const [resumeContentJS, setResumeContentJS] = useState(resumeContent);
    const darkModeJS = darkMode; 

    const handleUploadedSuccessJS = (data) => {
      setUploadedResumeJS(data);
      setResumeContentJS(data.content || "Resume content not available");
    };

    
    useEffect(() => {
      return () => {
        setUploadedResumeJS(null);
        setResumeContentJS(null);
      };
    }, []);

    return (
      <div className={`App-content ${darkModeJS ? 'card-dark' : ''}`}>
        <Card className="Card">
          <CardHeader><CardTitle className='App-title'>Smart Resume Scanner</CardTitle></CardHeader>
          <CardContent className='Card-content'>
            <div><ResumeUpload onUploadSuccess={handleUploadedSuccessJS} /></div>
            {uploadedResumeJS && (
              <>
                <Analysis resumeId={uploadedResumeJS.id} />
                <ResumeRewrite resumeId={uploadedResumeJS.id} originalContent={resumeContentJS} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <nav className="nav_bar">
        <div className="left_side">
          <Link to="#" onClick={() => handleRoleChange('Job Seeker')} className="App-link">
            <img src={logo} className="App-logo" alt="logo" />
          </Link>
          <h3 onClick={() => handleRoleChange('Job Seeker')} style={{ cursor: 'pointer' }}>AIRES</h3>

          {isAuthenticated && (
            <div className="role-switcher-container">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="role-dropdown-button" disabled={isUpdatingRole}>
                    <span className="role-indicator">
                      {isUpdatingRole ? <Loader2 size={16} className="role-icon animate-spin mr-1" /> :
                        userRole === 'Job Seeker' ? <UserRoundSearch size={16} className="role-icon" /> :
                        <Briefcase size={16} className="role-icon" />
                      }
                      {userRole}
                      {!isUpdatingRole && <ChevronDown size={14} className="dropdown-arrow" />}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="role-dropdown-content" align="start">
                  <DropdownMenuLabel>Select Your Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleRoleChange('Job Seeker')} disabled={userRole === 'Job Seeker' || isUpdatingRole}>
                    <div className="role-menu-item">
                      <UserRoundSearch size={16} className="role-menu-icon" /><span>Job Seeker</span>
                      {userRole === 'Job Seeker' && !isUpdatingRole && <span className="active-indicator">✓</span>}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleRoleChange('Recruiter')} disabled={userRole === 'Recruiter' || isUpdatingRole}>
                    <div className="role-menu-item">
                      <Briefcase size={16} className="role-menu-icon" /><span>Recruiter</span>
                      {userRole === 'Recruiter' && !isUpdatingRole && <span className="active-indicator">✓</span>}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {!smallScreen && (
          <div className="right_side">
            <span><House /><Link to="#" onClick={() => handleRoleChange('Job Seeker')} className="App-link">Home</Link></span>
            <span><Users /><Link to="/about" className="App-link">About</Link></span>
            <span><Contact /><Link to="/contact" className="App-link">Contact</Link></span>
            {isAuthenticated && <span><CircleUser /><Link to="/account" className="App-link">Account</Link></span>}
            {isAuthenticated ? (
              <span><LogOut /><Link to="/account" className="App-link">Logout</Link></span>
            ) : (
              <span><LogIn /><Link to="/login" className="App-link">Login</Link></span>
            )}
            <Button onClick={handleToggleDarkMode} variant="outline" size="icon" className="dark-mode-toggle">
              {darkMode ? <Sun /> : <Moon />}
            </Button>
          </div>
        )}

        <div ref={dropdownRef} className={smallScreen ? 'dropdown_menu_container' : 'side_menu_hidden'}>
          {smallScreen && <Button onClick={handleSideMenu} variant="ghost" size="icon" className={`dropdown_toggle ${sideMenuOpen ? 'active' : ''}`}><Menu /></Button>}
          {smallScreen && (
            <div className={`dropdown_content ${sideMenuOpen ? 'active' : ''}`}>
              {isAuthenticated && (
                <div className="dropdown_item_group">
                  <div className="dropdown_label">Current Role: {userRole}</div>
                  <div className={`dropdown_item role_switch_item ${userRole === 'Job Seeker' ? 'disabled' : ''} ${isUpdatingRole ? 'disabled' : ''}`} onClick={() => handleRoleChange('Job Seeker')}>
                    {isUpdatingRole && userRole !== 'Job Seeker' ? <Loader2 size={16} className="menu_icon animate-spin" /> : <UserRoundSearch size={16} className="menu_icon" />} Job Seeker
                  </div>
                  <div className={`dropdown_item role_switch_item ${userRole === 'Recruiter' ? 'disabled' : ''} ${isUpdatingRole ? 'disabled' : ''}`} onClick={() => handleRoleChange('Recruiter')}>
                    {isUpdatingRole && userRole !== 'Recruiter' ? <Loader2 size={16} className="menu_icon animate-spin" /> : <Briefcase size={16} className="menu_icon" />} Recruiter
                  </div>
                </div>
              )}
              <div className="dropdown_divider"></div>
              <Link to="#" className="dropdown_item" onClick={() => { handleRoleChange('Job Seeker'); }}><House size={16} className="menu_icon" />Home</Link>
              <Link to="/about" className="dropdown_item" onClick={() => setSideMenuOpen(false)}><Users size={16} className="menu_icon" />About</Link>
              <Link to="/contact" className="dropdown_item" onClick={() => setSideMenuOpen(false)}><Contact size={16} className="menu_icon" />Contact</Link>
              {isAuthenticated && <Link to="/account" className="dropdown_item" onClick={() => setSideMenuOpen(false)}><CircleUser size={16} className="menu_icon" />Account</Link>}
              {isAuthenticated ? (
                <Link to="/account" className="dropdown_item" onClick={() => setSideMenuOpen(false)}><LogOut size={16} className="menu_icon" />Logout</Link>
              ) : (
                <>
                  <Link to="/login" className="dropdown_item" onClick={() => setSideMenuOpen(false)}><LogIn size={16} className="menu_icon" />Login</Link>
                  <Link to="/signup" className="dropdown_item" onClick={() => setSideMenuOpen(false)}><UserCheck size={16} className="menu_icon" />Sign Up</Link>
                </>
              )}
              <div className="dropdown_divider"></div>
              <div className="dropdown_item theme_toggle" onClick={handleToggleDarkMode}>{darkMode ? (<><Sun/> Light Mode</>) : (<><Moon/> Dark Mode</>)}</div>
            </div>
          )}
        </div>
      </nav>

      <span className="line"></span>

<Routes>
  <Route
    path="/"
    element={
      isAuthenticated ? (
        userRole === 'Job Seeker' ? (
          <JobSeekerView key="jobseeker" />
        ) : (
          <RecruiterView key="recruiter" />
        )
      ) : (
        <div className="unauthenticated-message">
          <h2>Welcome to AIRES</h2>
          <p>Please log in or sign up to get started.</p>
          <div className='auth-links'>
            <Button asChild variant="outline"><Link to="/login">Login</Link></Button>
            <Button asChild><Link to="/signup">Sign Up</Link></Button>
          </div>
        </div>
      )
    }
  />
  {}
  <Route 
    path="/rewritten-resume/:resumeId" 
    element={<ProtectedRoute><RewrittenResumeView /></ProtectedRoute>} 
  />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="*" element={<div><h2>404 Not Found</h2><Link to="/">Go Home</Link></div>} />
</Routes>

      <div className="footer">
        <p>AIRES - Helping job seekers stand out from the crowd.</p>
        <p style={{ marginTop: '0.5rem' }}>© 2025 AIRES. All rights reserved.</p>
      </div>
    </div>
  );
}


function AppWrapper() {
  return (
    <ToastProvider>
      <Router>
        <App />
      </Router>
    </ToastProvider>
  );
}

export default AppWrapper;
