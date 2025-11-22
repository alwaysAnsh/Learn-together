import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskStatus, deleteTask } from '../redux/slices/taskSlice';
import './TaskCard.css';

const TaskCard = ({ task, showAssignedTo }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const statusOptions = [
    'not completed',
    'completed',
    'mark as read',
    'need revision'
  ];

  const statusColors = {
    'completed': '#48bb78',
    'mark as read': '#4299e1',
    'not completed': '#ed8936',
    'need revision': '#f56565'
  };

  const handleStatusChange = (newStatus) => {
    dispatch(updateTaskStatus({ id: task._id, status: newStatus, notes }));
  };

  const handleNotesUpdate = () => {
    dispatch(updateTaskStatus({ id: task._id, status: task.status, notes }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task._id));
    }
  };

  const isMyTask = task.assignedTo._id === user?.id;
  const cardStyle = {
    borderLeft: `4px solid ${statusColors[task.status]}`
  };

  return (
    <div className="task-card" style={cardStyle}>
      <div className="task-header">
        <span className="task-category">{task.category}</span>
        <button className="delete-btn" onClick={handleDelete} title="Delete task">
          ×
        </button>
      </div>

      <h3 className="task-title">{task.title}</h3>

      <a 
        href={task.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="task-link"
      >
        Open Link →
      </a>

      <div className="task-meta">
        {showAssignedTo ? (
          <p className="task-assignee">
            <strong>Assigned to:</strong> {task.assignedTo.name}
          </p>
        ) : (
          <p className="task-assignee">
            <strong>Assigned by:</strong> {task.assignedBy.name}
          </p>
        )}
        <p className="task-date">
          {new Date(task.createdAt).toLocaleDateString()}
        </p>
      </div>

      {isMyTask && (
        <div className="task-status">
          <label>Status:</label>
          <div className="status-buttons">
            {statusOptions.map(status => (
              <button
                key={status}
                className={`status-btn ${task.status === status ? 'active' : ''}`}
                style={{
                  backgroundColor: task.status === status ? statusColors[status] : '#e2e8f0',
                  color: task.status === status ? 'white' : '#4a5568'
                }}
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isMyTask && (
        <div className="readonly-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: statusColors[task.status] }}
          >
            {task.status}
          </span>
        </div>
      )}

      <div className="task-notes-section">
        <button 
          className="notes-toggle"
          onClick={() => setShowNotes(!showNotes)}
        >
          {showNotes ? '▼' : '▶'} Notes
        </button>

        {showNotes && (
          <div className="notes-content">
            {isMyTask && isEditing ? (
              <div className="notes-edit">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  rows="3"
                />
                <div className="notes-actions">
                  <button className="save-btn" onClick={handleNotesUpdate}>
                    Save
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditing(false);
                      setNotes(task.notes || '');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="notes-display">
                <p>{notes || 'No notes added yet.'}</p>
                {isMyTask && (
                  <button 
                    className="edit-notes-btn" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;