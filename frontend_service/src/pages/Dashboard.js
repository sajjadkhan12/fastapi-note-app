import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { authService } from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) {
        setLoading(true);
        const result = await authService.getDashboard();
        
        if (result.success) {
          setUser(result.data);
        } else {
          setError(result.error);
        }
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, setUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'notes', label: 'All Notes', icon: '📝' },
    { id: 'create', label: 'Create Note', icon: '➕' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'favorites', label: 'Favorites', icon: '⭐' },
    { id: 'archive', label: 'Archive', icon: '📦' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="loading"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-screen">
          <div className="error-message">{error}</div>
          <button onClick={handleLogout} className="btn-logout">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h1>Welcome back, {user?.first_name}! 👋</h1>
              <p>Here's what's happening with your notes today.</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <h3>12</h3>
                  <p>Total Notes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-info">
                  <h3>4</h3>
                  <p>Categories</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h3>3</h3>
                  <p>Favorites</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>2</h3>
                  <p>Archived</p>
                </div>
              </div>
            </div>

            <div className="recent-notes">
              <h2>Recent Notes</h2>
              <div className="notes-list">
                <div className="note-item">
                  <div className="note-title">Meeting Notes - Q1 Planning</div>
                  <div className="note-meta">2 hours ago • Work</div>
                </div>
                <div className="note-item">
                  <div className="note-title">Book Ideas - Fiction Project</div>
                  <div className="note-meta">1 day ago • Personal</div>
                </div>
                <div className="note-item">
                  <div className="note-title">Shopping List</div>
                  <div className="note-meta">2 days ago • Lists</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'notes':
        return (
          <div className="dashboard-content">
            <h1>All Notes</h1>
            <div className="notes-grid">
              <div className="note-card">
                <h3>Meeting Notes</h3>
                <p>Quarterly planning session...</p>
                <div className="note-tags">
                  <span className="tag">Work</span>
                  <span className="tag">Important</span>
                </div>
              </div>
              <div className="note-card">
                <h3>Book Ideas</h3>
                <p>Collection of story concepts...</p>
                <div className="note-tags">
                  <span className="tag">Personal</span>
                  <span className="tag">Creative</span>
                </div>
              </div>
              <div className="note-card">
                <h3>Shopping List</h3>
                <p>Groceries and household items...</p>
                <div className="note-tags">
                  <span className="tag">Lists</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'create':
        return (
          <div className="dashboard-content">
            <h1>Create New Note</h1>
            <div className="create-note-form">
              <input 
                type="text" 
                placeholder="Note title..." 
                className="note-title-input"
              />
              <textarea 
                placeholder="Start writing your note..." 
                className="note-content-input"
                rows="15"
              ></textarea>
              <div className="form-actions">
                <button className="btn-primary">Save Note</button>
                <button className="btn-secondary">Save as Draft</button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <h1>{menuItems.find(item => item.id === activeTab)?.label}</h1>
            <p>Coming soon! This feature is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">📝</div>
            <span>Notes App</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            {user && getInitials(user.first_name, user.last_name)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
