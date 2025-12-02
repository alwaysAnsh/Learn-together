import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteNote, updateNote } from '../redux/slices/noteSlice';
import './NoteCard.css';

const NoteCard = ({ note }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editCategory, setEditCategory] = useState(note.category);

  const categories = ['General', 'DSA', 'System Design', 'Web Dev', 'React', 'JavaScript', 'Other'];
  const isCreator = note.createdBy._id === user?.id;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch(deleteNote(note._id));
    }
  };

  const handleUpdate = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content are required');
      return;
    }

    dispatch(updateNote({
      id: note._id,
      title: editTitle,
      content: editContent,
      category: editCategory
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setIsEditing(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="note-card">
      <div className="note-card-header">
        <span className="note-category">{note.category}</span>
        {isCreator && (
          <div className="note-actions">
            <button 
              className="edit-icon-btn" 
              onClick={() => setIsEditing(!isEditing)}
              title="Edit note"
            >
              ✏️
            </button>
            <button 
              className="delete-icon-btn" 
              onClick={handleDelete}
              title="Delete note"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="note-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="note-edit-title"
            placeholder="Note title"
          />
          
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="note-edit-category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="note-edit-content"
            placeholder="Note content"
            rows="6"
          />

          <div className="note-edit-actions">
            <button className="save-btn" onClick={handleUpdate}>
              Save
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="note-title">{note.title}</h3>
          <p className="note-content">{note.content}</p>

          <div className="note-footer">
            <div className="note-meta">
              <span className="note-author">
                📝 {note.createdBy.name}
              </span>
              <span className="note-date">
                {formatDate(note.updatedAt)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NoteCard;