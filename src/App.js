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
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { LogOut, LogIn, Menu, Sun, Moon, CircleUser, Contact, Users, House } from 'lucide-react';
import { ToastProvider } from './components/ui/use-toast';

function App() {
  const [uploadedResume, setUploadedResume] = useState(null);
  const [resumeContent, setResumeContent] = useState(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(window.innerWidth <= 768);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('dark-mode');
    return storedMode === 'true';
  });
  
  const dropdownRef = useRef(null);

  const handleUploadedSuccess = (data) => {
    setUploadedResume(data);
    setResumeContent(data.content || "Resume content not available");
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('dark-mode', !darkMode);
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
  }, []);

  const handleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
  }

  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <nav className="nav_bar">
            <div className="left_side">
              <Link to="/" className="App-link">
                <img src={logo} className="App-logo" alt="logo" />
              </Link>
              <h3>AIRES</h3>
            </div>
            {!smallScreen && (
              <div className="right_side">
                <span>
                  <House />
                  <Link to="/" className="App-link">Home</Link>
                </span>
                <span>
                  <Users />
                  <Link to="/about" className="App-link">About</Link>
                </span>
                <span>
                  <Contact />
                  <Link to="/contact" className="App-link">Contact</Link>
                </span>
                <span>
                  <CircleUser />
                  <Link to="/account" className="App-link">Account</Link>
                </span>
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
                <Button onClick={handleToggleDarkMode} className="dark-mode-toggle">
                  {darkMode ? <Sun /> : <Moon />}
                </Button>
              </div>
            )}

            <div ref={dropdownRef} className={smallScreen ? 'dropdown_menu_container' : 'side_menu_hidden'}>
              {smallScreen && (
                <Button onClick={handleSideMenu} className={`dropdown_toggle ${sideMenuOpen ? 'active' : ''}`}>
                  <Menu />
                </Button>
              )}
              {smallScreen && (
                <div className={`dropdown_content ${sideMenuOpen ? 'active' : ''}`}>
                  <Link to="/" className="dropdown_item">
                    <House size={16} className="menu_icon" />
                    Home
                  </Link>
                  <Link to="/about" className="dropdown_item">
                    <Users size={16} className="menu_icon" />
                    About
                  </Link>
                  <Link to="/contact" className="dropdown_item">
                    <Contact size={16} className="menu_icon" />
                    Contact
                  </Link>
                  <Link to="/account" className="dropdown_item">
                    <CircleUser size={16} className="menu_icon" />
                    Account
                  </Link>
                  {isAuthenticated ? (
                    <Link to="/account" className="dropdown_item">
                      <LogOut size={16} className="menu_icon" />
                      Logout
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown_item">
                        <LogIn size={16} className="menu_icon" />
                        Login
                      </Link>
                      <Link to="/signup" className="dropdown_item">
                        <LogIn size={16} className="menu_icon" />
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
              } 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
