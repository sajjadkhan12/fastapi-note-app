import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { authService } from '../services/authService';
import ImageUpload from '../components/ImageUpload';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    profile_image: null
  });

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

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        profile_image: user.profile_image || null
      });
    }
  }, [user]);

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

  const handleEditProfile = () => {
    setShowProfileEdit(true);
  };

  const handleCancelEdit = () => {
    setShowProfileEdit(false);
    // Reset form data
    if (user) {
      setEditFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        profile_image: user.profile_image || null
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await authService.updateProfile(editFormData);
    
    if (result.success) {
      setUser(result.data);
      setShowProfileEdit(false);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (imageData) => {
    setEditFormData(prev => ({
      ...prev,
      profile_image: imageData
    }));
  };

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
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="avatar-image" />
            ) : (
              user && getInitials(user.first_name, user.last_name)
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-email">{user?.email}</div>
            <button 
              className="edit-profile-btn"
              onClick={handleEditProfile}
            >
              ✏️ Edit Profile
            </button>
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

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={handleCancelEdit}>×</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <ImageUpload
                  currentImage={editFormData.profile_image}
                  onImageChange={handleImageChange}
                  size="small"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit_first_name">First Name</label>
                  <input
                    type="text"
                    id="edit_first_name"
                    name="first_name"
                    className="form-input"
                    value={editFormData.first_name}
                    onChange={handleEditChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit_last_name">Last Name</label>
                  <input
                    type="text"
                    id="edit_last_name"
                    name="last_name"
                    className="form-input"
                    value={editFormData.last_name}
                    onChange={handleEditChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit_phone">Phone Number</label>
                <input
                  type="tel"
                  id="edit_phone"
                  name="phone"
                  className="form-input"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? <span className="loading"></span> : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
