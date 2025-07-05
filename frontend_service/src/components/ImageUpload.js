import React, { useState, useRef } from 'react';

const ImageUpload = ({ currentImage, onImageChange, size = 'large' }) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setPreview(imageData);
        onImageChange(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sizeClass = size === 'small' ? 'image-upload-small' : 'image-upload-large';

  return (
    <div className={`image-upload-container ${sizeClass}`}>
      <div
        className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-image' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Profile" className="preview-image" />
            <div className="image-overlay">
              <span className="change-text">Click to change</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-text">
              <p>Click or drag to upload</p>
              <span>PNG, JPG up to 5MB</span>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <button
          type="button"
          className="remove-image-btn"
          onClick={handleRemove}
        >
          Remove
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUpload;
