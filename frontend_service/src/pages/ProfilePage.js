import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { authService } from '../services/authService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(true);
        const result = await authService.getProfile();
        
        if (result.success) {
          setUser(result.data);
        } else {
          setError(result.error);
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, setUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="card">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading"></div>
              <p style={{ marginTop: '16px', color: '#718096' }}>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="card">
            <div className="error-message">{error}</div>
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Your Profile</h1>
        <p className="profile-subtitle">Manage your account information</p>
      </div>

      <div className="profile-card">
        {user && (
          <>
            <div className="profile-avatar">
              {getInitials(user.first_name, user.last_name)}
            </div>

            <div className="profile-info">
              <h2 className="profile-name">
                {user.first_name} {user.last_name}
              </h2>
              <p className="profile-email">{user.email}</p>
            </div>

            <div className="profile-details">
              <div className="profile-field">
                <span className="profile-field-label">User ID</span>
                <span className="profile-field-value">#{user.id}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">First Name</span>
                <span className="profile-field-value">{user.first_name}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Last Name</span>
                <span className="profile-field-value">{user.last_name}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Email</span>
                <span className="profile-field-value">{user.email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Phone</span>
                <span className="profile-field-value">{user.phone}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={handleLogout} className="btn-logout">
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
