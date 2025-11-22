import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, getAllUsers, getMyTasks, getAssignedByMe } from '../redux/slices/taskSlice';
import './AssignTask.css';

const AssignTask = ({ onClose }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.tasks);
  
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    category: 'DSA',
    assignedTo: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const categories = ['DSA', 'System Design', 'Web Dev', 'React', 'JavaScript', 'Other'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.assignedTo) {
      alert('Please select a user to assign the task to');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(createTask(formData)).unwrap();
      // Refresh both task lists
      dispatch(getMyTasks());
      dispatch(getAssignedByMe());
      onClose();
    } catch (error) {
      alert('Error creating task: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign New Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="assign-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Two Sum Problem"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="link">Link *</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://leetcode.com/problems/..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assign To *</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes or instructions..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTask;