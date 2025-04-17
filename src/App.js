import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
  Briefcase, UserRoundSearch, ChevronDown, UserCheck
} from 'lucide-react';
import { ToastProvider } from './components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

function App() {
  const [uploadedResume, setUploadedResume] = useState(null);
  const [resumeContent, setResumeContent] = useState(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(window.innerWidth <= 768);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('dark-mode');
    return storedMode === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'Job Seeker'; // Default to Job Seeker
  });

  const dropdownRef = useRef(null);

  const handleUploadedSuccess = (data) => {
    setUploadedResume(data);
    setResumeContent(data.content || "Resume content not available");
    setUserRole('Job Seeker'); // Automatically switch to Job Seeker view on successful upload
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('dark-mode', !darkMode);
  };

  const handleRoleChange = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    setSideMenuOpen(false); // Close menu on selection
    setUploadedResume(null); // Clear resume when switching roles
    setResumeContent(null);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      document.body.classList.add('resize-transition');
      setSmallScreen(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSideMenuOpen(false);
      }
    };

    setSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSideMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <ToastProvider>
      <Router>
        <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
          <nav className="nav_bar">
            <div className="left_side">
              <Link to="/" className="App-link" onClick={() => handleRoleChange('Job Seeker')}>
                <img src={logo} className="App-logo" alt="logo" />
              </Link>
              <h3 onClick={() => handleRoleChange('Job Seeker')} style={{ cursor: 'pointer' }}>AIRES</h3>

              {/* Role Switcher with Custom Dropdown */}
              {isAuthenticated && (
                <div className="role-switcher-container">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="role-dropdown-button">
                        <span className="role-indicator">
                          {userRole === 'Job Seeker' ? (
                            <UserRoundSearch size={16} className="role-icon" />
                          ) : (
                            <Briefcase size={16} className="role-icon" />
                          )}
                          {userRole}
                          <ChevronDown size={14} className="dropdown-arrow" />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="role-dropdown-content" align="center">
                      <DropdownMenuLabel>Select Your Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={userRole === 'Job Seeker' ? 'active-role' : ''}
                        onSelect={() => handleRoleChange('Job Seeker')}
                        disabled={userRole === 'Job Seeker'}
                      >
                        <div className="role-menu-item">
                          <UserRoundSearch size={16} className="role-menu-icon" />
                          <span>Job Seeker</span>
                          {userRole === 'Job Seeker' && <span className="active-indicator">✓</span>}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={userRole === 'Recruiter' ? 'active-role' : ''}
                        onSelect={() => handleRoleChange('Recruiter')}
                        disabled={userRole === 'Recruiter'}
                      >
                        <div className="role-menu-item">
                          <Briefcase size={16} className="role-menu-icon" />
                          <span>Recruiter</span>
                          {userRole === 'Recruiter' && <span className="active-indicator">✓</span>}
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {!smallScreen && (
              <div className="right_side">
                <span>
                  <House />
                  <Link to="/" className="App-link" onClick={() => handleRoleChange('Job Seeker')}>Home</Link>
                </span>
                <span>
                  <Users />
                  <Link to="/about" className="App-link">About</Link>
                </span>
                <span>
                  <Contact />
                  <Link to="/contact" className="App-link">Contact</Link>
                </span>
                {isAuthenticated && (
                  <span>
                    <CircleUser />
                    <Link to="/account" className="App-link">Account</Link>
                  </span>
                )}
                {isAuthenticated ? (
                  <span>
                    <LogOut />
                    <Link to="/account" className="App-link">Logout</Link>
                  </span>
                ) : (
                  <span>
                    <LogIn />
                    <Link to="/login" className="App-link">Login</Link>
                  </span>
                )}
                <Button onClick={handleToggleDarkMode} variant="outline" size="icon" className="dark-mode-toggle">
                  {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                </Button>
              </div>
            )}

            {/* Small Screen Menu */}
            <div ref={dropdownRef} className={smallScreen ? 'dropdown_menu_container' : 'side_menu_hidden'}>
              {smallScreen && (
                <Button onClick={handleSideMenu} variant="ghost" size="icon" className={`dropdown_toggle ${sideMenuOpen ? 'active' : ''}`}>
                  <Menu />
                </Button>
              )}
              {smallScreen && (
                <div className={`dropdown_content ${sideMenuOpen ? 'active' : ''}`}>
                  {isAuthenticated && (
                    <div className="dropdown_item_group">
                      <div className="dropdown_label">Current Role: {userRole}</div>
                      <div
                        className={`dropdown_item role_switch_item ${userRole === 'Job Seeker' ? 'disabled' : ''}`}
                        onClick={() => handleRoleChange('Job Seeker')}
                      >
                        <UserRoundSearch size={16} className="menu_icon" /> Job Seeker
                      </div>
                      <div
                        className={`dropdown_item role_switch_item ${userRole === 'Recruiter' ? 'disabled' : ''}`}
                        onClick={() => handleRoleChange('Recruiter')}
                      >
                        <Briefcase size={16} className="menu_icon" /> Recruiter
                      </div>
                    </div>
                  )}
                  <div className="dropdown_divider"></div>

                  <Link to="/" className="dropdown_item" onClick={() => { handleRoleChange('Job Seeker'); setSideMenuOpen(false); }}>
                    <House size={16} className="menu_icon" />
                    Home
                  </Link>
                  <Link to="/about" className="dropdown_item" onClick={() => setSideMenuOpen(false)}>
                    <Users size={16} className="menu_icon" />
                    About
                  </Link>
                  <Link to="/contact" className="dropdown_item" onClick={() => setSideMenuOpen(false)}>
                    <Contact size={16} className="menu_icon" />
                    Contact
                  </Link>
                  {isAuthenticated && (
                    <Link to="/account" className="dropdown_item" onClick={() => setSideMenuOpen(false)}>
                      <CircleUser size={16} className="menu_icon" />
                      Account
                    </Link>
                  )}
                  {isAuthenticated ? (
                    <Link to="/account" className="dropdown_item" onClick={() => setSideMenuOpen(false)}>
                      <LogOut size={16} className="menu_icon" />
                      Logout
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown_item" onClick={() => setSideMenuOpen(false)}>
                        <LogIn size={16} className="menu_icon" />
                        Login
                      </Link>
                      <Link to="/signup" className="dropdown_item" onClick={() => setSideMenuOpen(false)}>
                        <UserCheck size={16} className="menu_icon" />
                        Sign Up
                      </Link>
                    </>
                  )}
                  <div className="dropdown_divider"></div>
                  <div className="dropdown_item theme_toggle" onClick={handleToggleDarkMode}>
                    {darkMode ?
                      (<><Sun size={16} className="menu_icon" /> Light Mode</>) :
                      (<><Moon size={16} className="menu_icon" /> Dark Mode</>)
                    }
                  </div>
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
                    <div className={`App-content ${darkMode ? 'card-dark' : ''}`}>
                      <Card className="Card">
                        <CardHeader>
                          <CardTitle className='App-title'>Smart Resume Scanner</CardTitle>
                        </CardHeader>
                        <CardContent className='Card-content'>
                          <div>
                            <ResumeUpload onUploadSuccess={handleUploadedSuccess} />
                          </div>
                          {uploadedResume && (
                            <>
                              <Analysis resumeId={uploadedResume.id} />
                              <ResumeRewrite
                                resumeId={uploadedResume.id}
                                originalContent={resumeContent}
                              />
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <RecruiterView />
                  )
                ) : (
                  <div className="unauthenticated-message">
                    <p>Please log in to access this feature.</p>
                    <Link to="/login" className="login-link">Login</Link>
                  </div>
                )
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <div className="footer">
            <p>AIRES - Helping job seekers stand out from the crowd.</p>
            <p style={{ marginTop: '0.5rem' }}>© 2025 AIRES. All rights reserved.</p>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
