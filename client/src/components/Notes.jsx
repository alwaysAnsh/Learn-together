import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotes } from '../redux/slices/noteSlice';
import NoteCard from './NoteCard';
import CreateNote from './CreateNote';
import './Notes.css';

const Notes = () => {
  const dispatch = useDispatch();
  const { notes, isLoading } = useSelector((state) => state.notes);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    dispatch(getAllNotes());
  }, [dispatch]);

  const categories = ['all', 'General', 'DSA', 'System Design', 'Web Dev', 'React', 'JavaScript', 'Other'];

  const filterNotes = (notes) => {
    if (filterCategory === 'all') return notes;
    return notes.filter(note => note.category === filterCategory);
  };

  const groupNotesByCategory = (notes) => {
    const grouped = {};
    categories.filter(c => c !== 'all').forEach(cat => {
      grouped[cat] = notes.filter(note => note.category === cat);
    });
    return grouped;
  };

  const filteredNotes = filterNotes(notes);
  const groupedNotes = groupNotesByCategory(notes);

  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="notes-header-content">
          <h2>Shared Notes</h2>
          <p>Important information accessible to all users</p>
        </div>
        <button className="create-note-btn" onClick={() => setShowCreateModal(true)}>
          + Create Note
        </button>
      </div>

      {/* Category Filter */}
      <div className="notes-filter">
        <label>Filter by Category:</label>
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Display */}
      <div className="notes-content">
        {isLoading ? (
          <div className="loading">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <p>No notes found.</p>
            <p className="empty-subtitle">Create your first shared note!</p>
          </div>
        ) : filterCategory === 'all' ? (
          // Show grouped by category
          <div className="grouped-notes">
            {Object.entries(groupedNotes).map(([category, categoryNotes]) => 
              categoryNotes.length > 0 && (
                <div key={category} className="category-section">
                  <h3 className="category-title">{category}</h3>
                  <div className="notes-grid">
                    {categoryNotes.map(note => (
                      <NoteCard key={note._id} note={note} />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          // Show filtered notes
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <CreateNote onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Notes;