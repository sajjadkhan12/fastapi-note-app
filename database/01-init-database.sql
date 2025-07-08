-- Database initialization script for notes_app
-- This script will be automatically executed when PostgreSQL container starts for the first time

-- Create users table for authentication service
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500)
);

-- Create categories table for notes service
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#667eea',
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table for notes service
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table for notes service
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create note_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS note_tags (
    id SERIAL PRIMARY KEY,
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(note_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at column
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional, for testing)
-- Password for all test users is 'password123' (you should hash these properly in your app)
INSERT INTO users (first_name, last_name, email, phone, hashed_password) VALUES 
    ('Test', 'User1', 'test1@example.com', '+1234567890', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeUPGkP8Ws3QJXnW6'),
    ('Test', 'User2', 'test2@example.com', '+1234567891', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeUPGkP8Ws3QJXnW6')
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description, color, user_id) VALUES 
    ('Work', 'Work-related notes and tasks', '#3B82F6', 1),
    ('Personal', 'Personal notes and reminders', '#10B981', 1),
    ('Ideas', 'Creative ideas and brainstorming', '#F59E0B', 1),
    ('Study', 'Learning and educational content', '#8B5CF6', 2)
ON CONFLICT DO NOTHING;

-- Insert sample tags
INSERT INTO tags (name, user_id) VALUES 
    ('urgent', 1),
    ('important', 1),
    ('meeting', 1),
    ('project', 1),
    ('reminder', 2),
    ('research', 2)
ON CONFLICT DO NOTHING;

-- Insert some sample notes with categories and is_favorite
INSERT INTO notes (title, content, user_id, category_id, is_favorite) VALUES 
    ('Welcome Note', 'Welcome to your notes app! This is your first note.', 1, 2, true),
    ('Important Reminders', 'Remember to:\n- Check your emails\n- Update your password\n- Backup your data', 1, 1, false),
    ('Project Ideas', 'Ideas for future projects:\n- Mobile app version\n- Real-time collaboration\n- File attachments', 2, 3, true)
ON CONFLICT DO NOTHING;

-- Insert sample note-tag relationships
INSERT INTO note_tags (note_id, tag_id) VALUES 
    (1, 2), -- Welcome Note -> important
    (2, 1), -- Important Reminders -> urgent
    (2, 2), -- Important Reminders -> important
    (3, 4), -- Project Ideas -> project
    (3, 6)  -- Project Ideas -> research
ON CONFLICT (note_id, tag_id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
