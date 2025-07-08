const API_BASE_URL = '/api/notes/api/v1';

class NotesService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getAuthToken() {
    return localStorage.getItem('token');
  }

  async getAuthHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async createNote(noteData) {
    try {
      const response = await fetch(`${this.baseURL}/notes`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(noteData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to create note' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getNotes(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.is_favorite !== undefined) queryParams.append('is_favorite', filters.is_favorite);
      if (filters.category_id) queryParams.append('category_id', filters.category_id);
      if (filters.tag_ids && filters.tag_ids.length > 0) {
        filters.tag_ids.forEach(id => queryParams.append('tag_ids', id));
      }
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const url = `${this.baseURL}/notes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to fetch notes' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getNote(noteId) {
    try {
      const response = await fetch(`${this.baseURL}/notes/${noteId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to fetch note' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async updateNote(noteId, noteData) {
    try {
      const response = await fetch(`${this.baseURL}/notes/${noteId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(noteData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to update note' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async deleteNote(noteId, permanent = false) {
    try {
      const url = `${this.baseURL}/notes/${noteId}${permanent ? '?permanent=true' : ''}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: await this.getAuthHeaders()
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.detail || 'Failed to delete note' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async toggleFavorite(noteId) {
    try {
      const response = await fetch(`${this.baseURL}/notes/${noteId}/favorite`, {
        method: 'POST',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to toggle favorite' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getDashboardStats() {
    try {
      const response = await fetch(`${this.baseURL}/dashboard`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to fetch dashboard stats' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to fetch categories' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await fetch(`${this.baseURL}/categories`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to create category' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async deleteCategory(categoryId) {
    try {
      const response = await fetch(`${this.baseURL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders()
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.detail || 'Failed to delete category' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getTags() {
    try {
      const response = await fetch(`${this.baseURL}/tags`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to fetch tags' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async createTag(tagData) {
    try {
      const response = await fetch(`${this.baseURL}/tags`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(tagData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.detail || 'Failed to create tag' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }
}

export const notesService = new NotesService();
