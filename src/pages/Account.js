import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, CircleUser, Lock, Edit, LogOut, Trash2, Bell, Shield, Save } from 'lucide-react';
import './pages.css';

function AccountPage() {
  const [user, setUser] = useState(null); // Will store user details from DB
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    productNews: false,
    securityAlerts: true
  });

  // Fetch user details from the backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8000/api/account/', {
          headers: { Authorization: `Token ${token}` }
        });
        setUser(response.data);
        // Pre-populate the form with details from the DB
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          location: response.data.location,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Failed to fetch account details:', error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put('http://localhost:8000/api/account/update/', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      setUser(response.data);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Profile update failed.');
    }
  };
  

  const handlePasswordUpdate = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put('http://localhost:8000/api/account/password/', {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    }, {
      headers: { Authorization: `Token ${token}` }
    });
    alert(response.data.message || 'Password updated successfully!');
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  } catch (error) {
    console.error('Password update failed:', error);
    alert('Password update failed: ' + (error.response.data.error || ''));
  }
};


  const handleLogout = () => {
    console.log('User logged out');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    alert('You have been logged out.');
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmed) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete('http://localhost:8000/api/account/delete/', {
          headers: { Authorization: `Token ${token}` }
        });
        alert('Your account has been deleted.');
        // Optionally remove token from localStorage and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/signup'; // or homepage/login page
      } catch (error) {
        console.error('Account deletion failed:', error);
        alert('Account deletion failed.');
      }
    }
  };
  

  // Helper to get the initial letter for placeholder
  const getInitial = () => {
    return user && user.name ? user.name.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="account-container">
      <div className="account-content">
        <div className="page-header">
          <h1 className="page-title">
            Account Details <CircleUser />
          </h1>
          <p className="page-subtitle">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        <div className="account-grid">
          <div className="account-main">
            <Card className="custom-card profile-card">
              <CardHeader className="card-header-primary">
                <CardTitle className="card-title">
                  <User className="mr-2" /> Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                {user ? (
                  <div className="profile-container">
                    <div className="profile-avatar-section">
                      {user.avatar ? (
                          <div className="profile-avatar-placeholder">
                          {getInitial()}
                        </div>
                      ) : (
                        <div className="profile-avatar-placeholder">
                          {getInitial()}
                        </div>
                      )}
                      {!isEditing && (
                        <button className="edit-button" onClick={() => setIsEditing(true)}>
                          <Edit size={16} className="mr-2" /> Edit Profile
                        </button>
                      )}
                    </div>
                    
                    <div className="profile-details">
                      {isEditing ? (
                        <form onSubmit={handleSubmit}>
                          <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="form-input"
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
                              className="form-input"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="form-input"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                              type="text"
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              className="form-input"
                            />
                          </div>
                          
                          <div className="form-actions">
                            <button type="submit" className="submit-button">
                              <Save size={16} className="mr-2" /> Save Changes
                            </button>
                            <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="profile-info">
                          <div className="info-group">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{user.name}</span>
                          </div>
                          <div className="info-group">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{user.email}</span>
                          </div>
                          <div className="info-group">
                            <span className="info-label">Phone:</span>
                            <span className="info-value">{user.phone}</span>
                          </div>
                          <div className="info-group">
                            <span className="info-label">Location:</span>
                            <span className="info-value">{user.location}</span>
                          </div>
                          <div className="info-group">
                            <span className="info-label">Member Since:</span>
                            <span className="info-value">{user.joined}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>Loading profile information...</p>
                )}
              </CardContent>
            </Card>

            <Card className="custom-card">
              <CardHeader className="card-header-purple">
                <CardTitle className="card-title">
                  <Lock className="mr-2" /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <form onSubmit={handlePasswordUpdate}>
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <button type="submit" className="submit-button">
                    <Shield size={16} className="mr-2" /> Update Password
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="account-sidebar">
            <Card className="custom-card">
              <CardHeader className="card-header-green">
                <CardTitle className="card-title">
                  <Bell className="mr-2" /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="notification-options">
                  <div className="notification-option">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="emailUpdates"
                        name="emailUpdates"
                        checked={notifications.emailUpdates}
                        onChange={handleNotificationChange}
                        className="checkbox-input"
                      />
                      <label htmlFor="emailUpdates" className="checkbox-label">
                        Email Updates
                      </label>
                    </div>
                    <p className="notification-description">
                      Receive updates about your account activity
                    </p>
                  </div>
                  <div className="notification-option">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="productNews"
                        name="productNews"
                        checked={notifications.productNews}
                        onChange={handleNotificationChange}
                        className="checkbox-input"
                      />
                      <label htmlFor="productNews" className="checkbox-label">
                        Product News
                      </label>
                    </div>
                    <p className="notification-description">
                      Get notified about new features and updates
                    </p>
                  </div>
                  <div className="notification-option">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="securityAlerts"
                        name="securityAlerts"
                        checked={notifications.securityAlerts}
                        onChange={handleNotificationChange}
                        className="checkbox-input"
                      />
                      <label htmlFor="securityAlerts" className="checkbox-label">
                        Security Alerts
                      </label>
                    </div>
                    <p className="notification-description">
                      Receive important security notifications
                    </p>
                  </div>
                </div>
                <button className="submit-button mt-4">Save Preferences</button>
              </CardContent>
            </Card>

            <Card className="custom-card danger-zone">
              <CardHeader className="card-header-danger">
                <CardTitle className="card-title">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="account-actions">
                  <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" /> Log Out
                  </button>
                  <button className="delete-button" onClick={handleDeleteAccount}>
                    <Trash2 size={16} className="mr-2" /> Delete Account
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="footer">
          <p>AIRES - Helping job seekers stand out from the crowd.</p>
          <p style={{ marginTop: '0.5rem' }}>© 2025 AIRES. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;

