import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { authService } from '../services/authService';
import { notesService } from '../services/notesService';
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
  
  // Note creation state
  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: '',
    category_id: null,
    tag_ids: []
  });
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');
  
  // Note viewing/editing state
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editNoteData, setEditNoteData] = useState({
    title: '',
    content: '',
    category_id: null,
    tag_ids: []
  });
  const [editNoteSaving, setEditNoteSaving] = useState(false);
  const [editNoteError, setEditNoteError] = useState('');
  const [editNoteSuccess, setEditNoteSuccess] = useState('');
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    total_notes: 0,
    favorite_notes: 0,
    categories_count: 0,
    tags_count: 0,
    recent_notes: []
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  
  // Notes list state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');

  // Favorites state
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');

  // Categories and Tags state
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Category management state
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#007bff' });
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);

  // Tag creation during note creation
  const [newTagInput, setNewTagInput] = useState('');

  // Dashboard stats fetching
  const fetchDashboardStats = async () => {
    setDashboardLoading(true);
    setDashboardError('');

    try {
      const result = await notesService.getDashboardStats();
      
      if (result.success) {
        setDashboardStats(result.data);
      } else {
        setDashboardError(result.error || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      setDashboardError('An unexpected error occurred');
    } finally {
      setDashboardLoading(false);
    }
  };

  // Notes fetching
  const fetchNotes = async () => {
    setNotesLoading(true);
    setNotesError('');

    try {
      const result = await notesService.getNotes({ limit: 50 });
      
      if (result.success) {
        setNotes(result.data.notes || []);
      } else {
        setNotesError(result.error || 'Failed to fetch notes');
      }
    } catch (error) {
      setNotesError('An unexpected error occurred');
    } finally {
      setNotesLoading(false);
    }
  };

  // Favorites fetching
  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    setFavoritesError('');

    try {
      const result = await notesService.getNotes({ is_favorite: true, limit: 50 });
      
      if (result.success) {
        setFavoriteNotes(result.data.notes || []);
      } else {
        setFavoritesError(result.error || 'Failed to fetch favorite notes');
      }
    } catch (error) {
      setFavoritesError('An unexpected error occurred');
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Categories fetching
  const fetchCategories = async () => {
    setCategoriesLoading(true);

    try {
      const result = await notesService.getCategories();
      
      if (result.success) {
        // The API returns {categories: [...], total: X}
        const categoriesArray = result.data.categories || [];
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      } else {
        console.error('Failed to fetch categories:', result.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('An unexpected error occurred fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Tags fetching
  const fetchTags = async () => {
    try {
      const result = await notesService.getTags();
      
      if (result.success) {
        // The API returns {tags: [...], total: X}
        const tagsArray = result.data.tags || [];
        setTags(Array.isArray(tagsArray) ? tagsArray : []);
      } else {
        console.error('Failed to fetch tags:', result.error);
        setTags([]);
      }
    } catch (error) {
      console.error('An unexpected error occurred fetching tags');
      setTags([]);
    }
  };

  // Category management functions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    setCategorySaving(true);
    setCategoryError('');
    setCategorySuccess('');

    try {
      const result = await notesService.createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        color: newCategory.color
      });

      if (result.success) {
        setCategorySuccess('Category created successfully!');
        setNewCategory({ name: '', description: '', color: '#007bff' });
        
        // Refresh categories list
        await fetchCategories();
        
        // Auto-clear success message
        setTimeout(() => setCategorySuccess(''), 3000);
      } else {
        setCategoryError(result.error || 'Failed to create category');
      }
    } catch (error) {
      setCategoryError('An unexpected error occurred');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const result = await notesService.deleteCategory(categoryId);
      
      if (result.success) {
        setCategorySuccess('Category deleted successfully!');
        await fetchCategories();
        setTimeout(() => setCategorySuccess(''), 3000);
      } else {
        setCategoryError(result.error || 'Failed to delete category');
      }
    } catch (error) {
      setCategoryError('An unexpected error occurred');
    }
  };

  // Inline tag creation functions
  const handleNewTagKeyPress = async (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      await createInlineTag();
    }
  };

  const createInlineTag = async () => {
    const tagName = newTagInput.trim();
    if (!tagName) return;

    // Check if tag already exists
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      // Add to selection if not already selected
      if (!Array.isArray(noteFormData.tag_ids) || !noteFormData.tag_ids.includes(existingTag.id)) {
        setNoteFormData(prev => ({
          ...prev,
          tag_ids: [...(Array.isArray(prev.tag_ids) ? prev.tag_ids : []), existingTag.id]
        }));
      }
      setNewTagInput('');
      return;
    }

    try {
      const result = await notesService.createTag({ name: tagName });
      
      if (result.success) {
        // Add new tag to tags list
        setTags(prev => [...prev, result.data]);
        
        // Add to current note selection
        setNoteFormData(prev => ({
          ...prev,
          tag_ids: [...(Array.isArray(prev.tag_ids) ? prev.tag_ids : []), result.data.id]
        }));
        
        setNewTagInput('');
      } else {
        console.error('Failed to create tag:', result.error);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

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

  // Effect to fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardStats();
    } else if (activeTab === 'notes') {
      fetchNotes();
    } else if (activeTab === 'create') {
      // Fetch categories and tags for the create form
      fetchCategories();
      fetchTags();
    } else if (activeTab === 'categories') {
      // Fetch categories for management
      fetchCategories();
    } else if (activeTab === 'favorites') {
      // Fetch favorite notes
      fetchFavorites();
    }
  }, [activeTab]);

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

  // Note creation handlers
  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setNoteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    setNoteFormData(prev => ({
      ...prev,
      category_id: categoryId
    }));
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    
    if (!noteFormData.title.trim()) {
      setNoteError('Note title is required');
      return;
    }
    
    if (!noteFormData.content.trim()) {
      setNoteError('Note content is required');
      return;
    }

    setNoteSaving(true);
    setNoteError('');
    setNoteSuccess('');

    try {
      const result = await notesService.createNote({
        title: noteFormData.title.trim(),
        content: noteFormData.content.trim(),
        category_id: noteFormData.category_id || null,
        tag_ids: noteFormData.tag_ids
      });

      if (result.success) {
        setNoteSuccess('Note created successfully!');
        // Reset form
        setNoteFormData({
          title: '',
          content: '',
          category_id: null,
          tag_ids: []
        });
        // Refresh dashboard/notes data
        await refreshDashboard();
        // Auto-clear success message after 3 seconds
        setTimeout(() => setNoteSuccess(''), 3000);
      } else {
        setNoteError(result.error || 'Failed to create note');
      }
    } catch (error) {
      setNoteError('An unexpected error occurred');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    if (!noteFormData.title.trim() && !noteFormData.content.trim()) {
      setNoteError('Please add a title or content to save as draft');
      return;
    }

    setNoteSaving(true);
    setNoteError('');
    setNoteSuccess('');

    try {
      const result = await notesService.createNote({
        title: noteFormData.title.trim() || 'Untitled Draft',
        content: noteFormData.content.trim(),
        category_id: noteFormData.category_id || null,
        tag_ids: noteFormData.tag_ids
      });

      if (result.success) {
        setNoteSuccess('Draft saved successfully!');
        // Reset form
        setNoteFormData({
          title: '',
          content: '',
          category_id: null,
          tag_ids: []
        });
        // Refresh dashboard/notes data
        await refreshDashboard();
        // Auto-clear success message after 3 seconds
        setTimeout(() => setNoteSuccess(''), 3000);
      } else {
        setNoteError(result.error || 'Failed to save draft');
      }
    } catch (error) {
      setNoteError('An unexpected error occurred');
    } finally {
      setNoteSaving(false);
    }
  };

  // Note viewing/editing handlers
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setEditNoteData({
      title: note.title,
      content: note.content,
      category_id: note.category_id,
      tag_ids: note.tags ? note.tags.map(tag => tag.id) : []
    });
    setIsEditingNote(false);
    setEditNoteError('');
    setEditNoteSuccess('');
    
    // Fetch categories and tags for editing
    fetchCategories();
    fetchTags();
  };

  const handleEditNote = () => {
    setIsEditingNote(true);
  };

  const handleCancelNoteEdit = () => {
    setIsEditingNote(false);
    if (selectedNote) {
      setEditNoteData({
        title: selectedNote.title,
        content: selectedNote.content,
        category_id: selectedNote.category_id,
        tag_ids: selectedNote.tags ? selectedNote.tags.map(tag => tag.id) : []
      });
    }
    setEditNoteError('');
    setEditNoteSuccess('');
  };

  const handleBackToNotes = () => {
    setSelectedNote(null);
    setIsEditingNote(false);
    setEditNoteError('');
    setEditNoteSuccess('');
  };

  const handleEditNoteChange = (e) => {
    const { name, value } = e.target;
    setEditNoteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCategoryChange = (e) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    setEditNoteData(prev => ({
      ...prev,
      category_id: categoryId
    }));
  };

  const handleEditTagChange = (e) => {
    const tagId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    setEditNoteData(prev => ({
      ...prev,
      tag_ids: isChecked 
        ? [...(Array.isArray(prev.tag_ids) ? prev.tag_ids : []), tagId]
        : (Array.isArray(prev.tag_ids) ? prev.tag_ids : []).filter(id => id !== tagId)
    }));
  };

  const handleSaveEditNote = async (e) => {
    e.preventDefault();
    
    if (!editNoteData.title.trim()) {
      setEditNoteError('Note title is required');
      return;
    }
    
    if (!editNoteData.content.trim()) {
      setEditNoteError('Note content is required');
      return;
    }

    setEditNoteSaving(true);
    setEditNoteError('');
    setEditNoteSuccess('');

    try {
      const result = await notesService.updateNote(selectedNote.id, {
        title: editNoteData.title.trim(),
        content: editNoteData.content.trim(),
        category_id: editNoteData.category_id || null,
        tag_ids: editNoteData.tag_ids
      });

      if (result.success) {
        setEditNoteSuccess('Note updated successfully!');
        setSelectedNote(result.data);
        setIsEditingNote(false);
        
        // Update the note in the current notes list
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === selectedNote.id ? result.data : note
          )
        );
        
        // Refresh dashboard stats if needed
        await fetchDashboardStats();
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setEditNoteSuccess(''), 3000);
      } else {
        setEditNoteError(result.error || 'Failed to update note');
      }
    } catch (error) {
      setEditNoteError('An unexpected error occurred');
    } finally {
      setEditNoteSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setEditNoteSaving(true);
    setEditNoteError('');

    try {
      const result = await notesService.deleteNote(selectedNote.id);

      if (result.success) {
        setEditNoteSuccess('Note deleted successfully!');
        
        // Go back to notes list first
        handleBackToNotes();
        
        // Force refresh both notes list and dashboard stats
        await Promise.all([
          fetchNotes(),
          fetchDashboardStats()
        ]);
        
      } else {
        setEditNoteError(result.error || 'Failed to delete note');
      }
    } catch (error) {
      setEditNoteError('An unexpected error occurred');
    } finally {
      setEditNoteSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    setEditNoteSaving(true);
    setEditNoteError('');

    try {
      const result = await notesService.toggleFavorite(selectedNote.id);

      if (result.success) {
        setSelectedNote(result.data);
        setEditNoteSuccess(`Note ${result.data.is_favorite ? 'added to' : 'removed from'} favorites!`);
        
        // Update the note in the current notes list
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === selectedNote.id ? result.data : note
          )
        );
        
        // Update the favorites list
        if (result.data.is_favorite) {
          // Add to favorites if not already there
          setFavoriteNotes(prevFavorites => {
            const exists = prevFavorites.some(note => note.id === selectedNote.id);
            return exists ? prevFavorites.map(note => 
              note.id === selectedNote.id ? result.data : note
            ) : [...prevFavorites, result.data];
          });
        } else {
          // Remove from favorites
          setFavoriteNotes(prevFavorites => 
            prevFavorites.filter(note => note.id !== selectedNote.id)
          );
        }
        
        // Refresh dashboard stats
        await fetchDashboardStats();
        
        // Auto-clear success message after 2 seconds
        setTimeout(() => setEditNoteSuccess(''), 2000);
      } else {
        setEditNoteError(result.error || 'Failed to toggle favorite');
      }
    } catch (error) {
      setEditNoteError('An unexpected error occurred');
    } finally {
      setEditNoteSaving(false);
    }
  };

  // Toggle favorite from notes list
  const handleToggleFavoriteFromList = async (noteId, currentFavoriteStatus) => {
    try {
      const result = await notesService.toggleFavorite(noteId);

      if (result.success) {
        // Update the notes list
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === noteId ? result.data : note
          )
        );
        
        // Update the favorites list
        if (result.data.is_favorite) {
          // Add to favorites if not already there
          setFavoriteNotes(prevFavorites => {
            const exists = prevFavorites.some(note => note.id === noteId);
            return exists ? prevFavorites.map(note => 
              note.id === noteId ? result.data : note
            ) : [...prevFavorites, result.data];
          });
        } else {
          // Remove from favorites
          setFavoriteNotes(prevFavorites => 
            prevFavorites.filter(note => note.id !== noteId)
          );
        }
        
        // Refresh dashboard stats
        await fetchDashboardStats();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Refresh dashboard stats after successful note creation/deletion
  const refreshDashboard = async () => {
    if (activeTab === 'overview') {
      await fetchDashboardStats();
    } else if (activeTab === 'notes') {
      await fetchNotes();
    }
    // Always refresh dashboard stats regardless of current tab 
    // since note operations affect the overview stats
    await fetchDashboardStats();
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
            
            {dashboardError && (
              <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d8000c', border: '1px solid #d8000c', borderRadius: '4px' }}>
                {dashboardError}
              </div>
            )}
            
            {dashboardLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard stats...</div>
            ) : (
              <>
                <div className="stats-grid">
                  <div 
                    className="stat-card"
                    onClick={() => setActiveTab('notes')}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                      <h3>{dashboardStats.total_notes}</h3>
                      <p>Total Notes</p>
                      <span style={{ fontSize: '12px', color: '#007bff', marginTop: '4px', display: 'block' }}>
                        Click to view all →
                      </span>
                    </div>
                  </div>
                  <div 
                    className="stat-card"
                    onClick={() => setActiveTab('categories')}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="stat-icon">📁</div>
                    <div className="stat-info">
                      <h3>{dashboardStats.categories_count}</h3>
                      <p>Categories</p>
                      <span style={{ fontSize: '12px', color: '#007bff', marginTop: '4px', display: 'block' }}>
                        Click to manage →
                      </span>
                    </div>
                  </div>
                  <div 
                    className="stat-card"
                    onClick={() => setActiveTab('favorites')}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                      <h3>{dashboardStats.favorite_notes}</h3>
                      <p>Favorites</p>
                      <span style={{ fontSize: '12px', color: '#007bff', marginTop: '4px', display: 'block' }}>
                        Click to view →
                      </span>
                    </div>
                  </div>
                </div>

                <div className="recent-notes">
                  <h2>Recent Notes</h2>
                  <div className="notes-list">
                    {dashboardStats.recent_notes && dashboardStats.recent_notes.length > 0 ? (
                      dashboardStats.recent_notes.map((note) => (
                        <div 
                          key={note.id} 
                          className="note-item"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Switch to notes tab and select the note
                            setActiveTab('notes');
                            handleNoteClick(note);
                          }}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div className="note-title">{note.title}</div>
                              <div className="note-meta">
                                {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                                {note.category && ` • ${note.category.name}`}
                                {note.tags && note.tags.length > 0 && (
                                  <span> • Tags: {note.tags.map(tag => tag.name).join(', ')}</span>
                                )}
                              </div>
                              <div style={{ 
                                marginTop: '8px', 
                                fontSize: '12px', 
                                color: '#007bff', 
                                fontWeight: '500' 
                              }}>
                                Click to view →
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleFavoriteFromList(note.id, note.is_favorite);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '18px',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  color: note.is_favorite ? '#ffc107' : '#dee2e6'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = note.is_favorite ? '#fff3cd' : '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                ⭐
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notes" style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                        No recent notes found. <span style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => setActiveTab('create')}>Create your first note!</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case 'notes':
        // If a note is selected, show the note detail view
        if (selectedNote) {
          return (
            <div className="dashboard-content">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <button 
                  onClick={handleBackToNotes}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '18px', 
                    cursor: 'pointer', 
                    marginRight: '10px',
                    color: '#007bff'
                  }}
                >
                  ← Back to Notes
                </button>
                <h1 style={{ margin: 0 }}>
                  {isEditingNote ? 'Edit Note' : 'View Note'}
                </h1>
              </div>

              {editNoteError && (
                <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d8000c', border: '1px solid #d8000c', borderRadius: '4px' }}>
                  {editNoteError}
                </div>
              )}

              {editNoteSuccess && (
                <div className="success-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e6ffe6', color: '#4caf50', border: '1px solid #4caf50', borderRadius: '4px' }}>
                  {editNoteSuccess}
                </div>
              )}

              {isEditingNote ? (
                // Edit mode
                <form onSubmit={handleSaveEditNote} className="note-detail-form">
                  <input 
                    type="text"
                    name="title"
                    value={editNoteData.title}
                    onChange={handleEditNoteChange}
                    placeholder="Note title..."
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      fontSize: '18px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      marginBottom: '15px'
                    }}
                    disabled={editNoteSaving}
                  />

                  <textarea 
                    name="content"
                    value={editNoteData.content}
                    onChange={handleEditNoteChange}
                    placeholder="Note content..."
                    rows="15"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      fontSize: '14px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      resize: 'vertical',
                      marginBottom: '20px'
                    }}
                    disabled={editNoteSaving}
                  />

                  {/* Category Selection */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Category (Optional)
                    </label>
                    <select 
                      value={editNoteData.category_id || ''}
                      onChange={handleEditCategoryChange}
                      disabled={editNoteSaving || categoriesLoading}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">No Category</option>
                      {Array.isArray(categories) && categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags Selection */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Tags (Optional)
                    </label>
                    {Array.isArray(tags) && tags.length > 0 ? (
                      <div className="tags-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                        gap: '8px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f9f9f9',
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}>
                        {tags.map(tag => (
                          <label key={tag.id} className="tag-checkbox-label" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            fontSize: '14px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            <input
                              type="checkbox"
                              value={tag.id}
                              checked={Array.isArray(editNoteData.tag_ids) && editNoteData.tag_ids.includes(tag.id)}
                              onChange={handleEditTagChange}
                              disabled={editNoteSaving}
                              style={{ marginRight: '6px' }}
                            />
                            {tag.name}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        No tags available. You can create tags from the tags section.
                      </div>
                    )}
                  </div>

                  <div className="form-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      type="submit"
                      disabled={editNoteSaving}
                      style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: editNoteSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {editNoteSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button"
                      onClick={handleCancelNoteEdit}
                      disabled={editNoteSaving}
                      style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: editNoteSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // View mode
                <div className="note-detail-view">
                  <div className="note-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{selectedNote.title}</h2>
                    <div className="note-meta" style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                      {selectedNote.category && <span>Category: {selectedNote.category.name}</span>}
                      {selectedNote.is_favorite && <span>{selectedNote.category ? ' • ' : ''}⭐ Favorite</span>}
                      <br />
                      <span>Created: {new Date(selectedNote.created_at).toLocaleDateString()}</span>
                      {selectedNote.updated_at && <span> • Updated: {new Date(selectedNote.updated_at).toLocaleDateString()}</span>}
                    </div>
                    <div className="note-tags" style={{ marginBottom: '20px' }}>
                      {selectedNote.tags && selectedNote.tags.length > 0 ? (
                        selectedNote.tags.map((tag) => (
                          <span key={tag.id} className="tag" style={{ 
                            display: 'inline-block',
                            padding: '4px 8px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            fontSize: '12px',
                            marginRight: '5px'
                          }}>{tag.name}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: '#999' }}>No tags</span>
                      )}
                    </div>
                  </div>

                  <div className="note-content" style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '4px',
                    marginBottom: '20px',
                    minHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}>
                    {selectedNote.content}
                  </div>

                  <div className="note-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={handleEditNote}
                      disabled={editNoteSaving}
                      style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: editNoteSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Edit Note
                    </button>
                    <button 
                      onClick={handleToggleFavorite}
                      disabled={editNoteSaving}
                      style={{ 
                        padding: '12px 24px', 
                        backgroundColor: selectedNote.is_favorite ? '#ffc107' : '#28a745', 
                        color: selectedNote.is_favorite ? '#000' : 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: editNoteSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {editNoteSaving ? 'Updating...' : (selectedNote.is_favorite ? '⭐ Remove Favorite' : '⭐ Add to Favorites')}
                    </button>
                    <button 
                      onClick={handleDeleteNote}
                      disabled={editNoteSaving}
                      style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: editNoteSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {editNoteSaving ? 'Deleting...' : 'Delete Note'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Default notes list view
        return (
          <div className="dashboard-content">
            <h1>All Notes</h1>
            
            {notesError && (
              <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d8000c', border: '1px solid #d8000c', borderRadius: '4px' }}>
                {notesError}
              </div>
            )}
            
            {notesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading notes...</div>
            ) : (
              <div className="notes-grid">
                {notes && notes.length > 0 ? (
                  notes.map((note) => (
                    <div 
                      key={note.id} 
                      className="note-card"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNoteClick(note);
                      }}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, flex: 1 }}>{note.title}</h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleFavoriteFromList(note.id, note.is_favorite);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '18px',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              color: note.is_favorite ? '#ffc107' : '#dee2e6'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = note.is_favorite ? '#fff3cd' : '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            ⭐
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: '8px 0' }}>{note.content && note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}</p>
                      <div className="note-meta" style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                        {note.category && `Category: ${note.category.name}`}
                        {note.updated_at && ` • Updated: ${new Date(note.updated_at).toLocaleDateString()}`}
                      </div>
                      <div className="note-tags">
                        {note.tags && note.tags.length > 0 ? (
                          note.tags.map((tag) => (
                            <span key={tag.id} className="tag">{tag.name}</span>
                          ))
                        ) : (
                          <span className="tag" style={{ opacity: 0.5 }}>No tags</span>
                        )}
                      </div>
                      <div style={{ 
                        marginTop: '10px', 
                        fontSize: '12px', 
                        color: '#999', 
                        textAlign: 'right' 
                      }}>
                        Click to view/edit
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notes" style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    No notes found. <span style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => setActiveTab('create')}>Create your first note!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'create':
        return (
          <div className="dashboard-content">
            <h1>Create New Note</h1>
            
            {noteError && (
              <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d8000c', border: '1px solid #d8000c', borderRadius: '4px' }}>
                {noteError}
              </div>
            )}
            
            {noteSuccess && (
              <div className="success-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e6ffe6', color: '#4caf50', border: '1px solid #4caf50', borderRadius: '4px' }}>
                {noteSuccess}
              </div>
            )}
            
            <form className="create-note-form" onSubmit={handleSaveNote}>
              <input 
                type="text" 
                name="title"
                value={noteFormData.title}
                onChange={handleNoteChange}
                placeholder="Note title..." 
                className="note-title-input"
                disabled={noteSaving}
              />
              
              <textarea 
                name="content"
                value={noteFormData.content}
                onChange={handleNoteChange}
                placeholder="Start writing your note..." 
                className="note-content-input"
                rows="15"
                disabled={noteSaving}
              ></textarea>

              {/* Category Selection */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Category (Optional)
                </label>
                <select 
                  value={noteFormData.category_id || ''}
                  onChange={handleCategoryChange}
                  disabled={noteSaving || categoriesLoading}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">No Category</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoriesLoading && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Loading categories...
                  </div>
                )}
              </div>

              {/* Tags Selection */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Tags (Optional)
                </label>
                
                {/* Inline Tag Creation */}
                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={handleNewTagKeyPress}
                    placeholder="Type tag name and press Enter or Space to add..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #007bff',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    disabled={noteSaving}
                  />
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    💡 Tip: Type a tag name and press Enter or Space to create and add it instantly!
                  </div>
                </div>

                {/* Selected Tags Display */}
                {Array.isArray(noteFormData.tag_ids) && noteFormData.tag_ids.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Selected Tags:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {noteFormData.tag_ids.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <span key={tagId} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 8px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => setNoteFormData(prev => ({
                                ...prev,
                                tag_ids: prev.tag_ids.filter(id => id !== tagId)
                              }))}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '12px'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={noteSaving}
                >
                  {noteSaving ? 'Saving...' : 'Save Note'}
                </button>
                <button 
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn-secondary"
                  disabled={noteSaving}
                >
                  {noteSaving ? 'Saving...' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        );
      case 'categories':
        return (
          <div className="dashboard-content">
            <h1>Manage Categories</h1>
            
            {categoryError && (
              <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d8000c', border: '1px solid #d8000c', borderRadius: '4px' }}>
                {categoryError}
              </div>
            )}
            
            {categorySuccess && (
              <div className="success-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e6ffe6', color: '#4caf50', border: '1px solid #4caf50', borderRadius: '4px' }}>
                {categorySuccess}
              </div>
            )}

            {/* Create New Category Form */}
            <div className="create-category-section" style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h2 style={{ marginBottom: '20px' }}>Create New Category</h2>
              <form onSubmit={handleCreateCategory}>
                <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Work, Personal, Learning"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      disabled={categorySaving}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this category"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      disabled={categorySaving}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Color
                    </label>
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      style={{
                        width: '60px',
                        height: '40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      disabled={categorySaving}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={categorySaving}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: categorySaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {categorySaving ? 'Creating...' : 'Create Category'}
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="categories-list">
              <h2 style={{ marginBottom: '20px' }}>Existing Categories</h2>
              
              {categoriesLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading categories...</div>
              ) : (
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                    Debug: Found {Array.isArray(categories) ? categories.length : 'invalid'} categories
                  </div>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {categories.map(category => (
                    <div key={category.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '15px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: category.color,
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        ></div>
                        <div>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{category.name}</h3>
                          {category.description && (
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{category.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No categories found. Create your first category above!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 'favorites':
        return (
          <div className="dashboard-content">
            <h1>⭐ Favorite Notes</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Your starred notes appear here. You can add notes to favorites from the All Notes tab.
            </p>
            
            {favoritesError && (
              <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d8000c', border: '1px solid #d8000c', borderRadius: '4px' }}>
                {favoritesError}
              </div>
            )}
            
            {favoritesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading favorite notes...</div>
            ) : (
              <div className="notes-container">
                {favoriteNotes.length > 0 ? (
                  <div className="notes-list">
                    {favoriteNotes.map((note) => (
                      <div 
                        key={note.id} 
                        className="note-item"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNoteClick(note);
                        }}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f8ff';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div className="note-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>⭐</span>
                              {note.title}
                            </div>
                            <div className="note-preview" style={{ 
                              color: '#666', 
                              fontSize: '14px', 
                              marginTop: '4px',
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {note.content?.substring(0, 150)}...
                            </div>
                            <div className="note-meta">
                              {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                              {note.category && ` • ${note.category.name}`}
                              {note.tags && note.tags.length > 0 && (
                                <span> • Tags: {note.tags.map(tag => tag.name).join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleFavoriteFromList(note.id, note.is_favorite);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '18px',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              color: '#ffc107',
                              marginLeft: '12px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fff3cd';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Remove from favorites"
                          >
                            ⭐
                          </button>
                        </div>
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: '#007bff', 
                          fontWeight: '500' 
                        }}>
                          Click to view →
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-notes" style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    padding: '60px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px dashed #dee2e6'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
                    <h3 style={{ marginBottom: '8px', color: '#495057' }}>No favorite notes yet</h3>
                    <p style={{ marginBottom: '20px' }}>
                      Start by adding some notes to your favorites from the{' '}
                      <span 
                        style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }} 
                        onClick={() => setActiveTab('notes')}
                      >
                        All Notes
                      </span>
                      {' '}tab.
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Create Your First Note
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="dashboard-content">
            <h1>⚙️ Settings</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Manage your account preferences and application settings.
            </p>

            <div style={{ display: 'grid', gap: '30px' }}>
              {/* Profile Settings Section */}
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '24px', 
                borderRadius: '8px', 
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}>
                <h2 style={{ marginBottom: '16px', fontSize: '18px', color: '#495057' }}>
                  👤 Profile Information
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      backgroundColor: '#007bff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {user?.profile_image ? (
                        <img src={user.profile_image} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        getInitials(user?.first_name, user?.last_name)
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {user?.email}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {user?.phone || 'No phone number'}
                      </div>
                    </div>
                    <button
                      onClick={handleEditProfile}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Application Preferences */}
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '24px', 
                borderRadius: '8px', 
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}>
                <h2 style={{ marginBottom: '16px', fontSize: '18px', color: '#495057' }}>
                  🎨 Application Preferences
                </h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Default View</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Choose what you see when you first login</div>
                    </div>
                    <select style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <option value="overview">Overview Dashboard</option>
                      <option value="notes">All Notes</option>
                      <option value="favorites">Favorites</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Notes per Page</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>How many notes to show at once</div>
                    </div>
                    <select style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <option value="20">20 notes</option>
                      <option value="50" selected>50 notes</option>
                      <option value="100">100 notes</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Auto-save Drafts</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Automatically save notes as you type</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ fontSize: '14px' }}>Enabled</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data & Privacy */}
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '24px', 
                borderRadius: '8px', 
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}>
                <h2 style={{ marginBottom: '16px', fontSize: '18px', color: '#495057' }}>
                  🔒 Data & Privacy
                </h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Account Created</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Total Notes</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {dashboardStats.total_notes} notes created
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Categories</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {dashboardStats.categories_count} categories organized
                      </div>
                    </div>
                  </div>

                  <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e9ecef' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px', color: '#dc3545' }}>Export Data</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Download all your notes and data</div>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '24px', 
                borderRadius: '8px', 
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}>
                <h2 style={{ marginBottom: '16px', fontSize: '18px', color: '#495057' }}>
                  🚨 Account Actions
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>Sign Out</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Sign out of your account on this device</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px', color: '#dc3545' }}>Delete Account</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Permanently delete your account and all data</div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your notes, categories, and data.')) {
                          alert('Account deletion feature will be implemented soon. Please contact support for now.');
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

              {/* App Information */}
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: '12px', fontSize: '16px', color: '#495057' }}>
                  📝 Notes App
                </h3>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                  Version 1.0.0<br />
                  Built with React & FastAPI<br />
                  <span style={{ marginTop: '8px', display: 'block' }}>
                    Made with ❤️ for organizing your thoughts
                  </span>
                </div>
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
