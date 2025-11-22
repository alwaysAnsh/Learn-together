import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { getMyTasks, getAssignedByMe } from '../redux/slices/taskSlice';
import TaskCard from './TaskCard';
import AssignTask from './AssignTask';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { myTasks, assignedByMe, isLoading } = useSelector((state) => state.tasks);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    dispatch(getMyTasks());
    dispatch(getAssignedByMe());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const categories = ['all', 'DSA', 'System Design', 'Web Dev', 'React', 'JavaScript', 'Other'];

  const filterTasks = (tasks) => {
    if (filterCategory === 'all') return tasks;
    return tasks.filter(task => task.category === filterCategory);
  };

  const groupTasksByCategory = (tasks) => {
    const grouped = {};
    categories.filter(c => c !== 'all').forEach(cat => {
      grouped[cat] = tasks.filter(task => task.category === cat);
    });
    return grouped;
  };

  const currentTasks = activeTab === 'my-tasks' ? myTasks : assignedByMe;
  const filteredTasks = filterTasks(currentTasks);
  const groupedTasks = groupTasksByCategory(currentTasks);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
         <div className="header-left">
  <h1 className="dashboard-title">📘 Task Assignment</h1>
  <p className="dashboard-subtitle">
    Welcome back, <strong>{user?.name}</strong> 👋
  </p>
</div>
          <div className="header-right">
            <button className="assign-btn" onClick={() => setShowAssignModal(true)}>
              + Assign Task
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'my-tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-tasks')}
        >
          My Tasks ({myTasks.length})
        </button>
        <button
          className={`tab ${activeTab === 'assigned-by-me' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned-by-me')}
        >
          Assigned by Me ({assignedByMe.length})
        </button>
      </div>

      {/* Category Filter */}
      <div className="filter-container">
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

      {/* Tasks Display */}
      <div className="tasks-content">
        {isLoading ? (
          <div className="loading">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found.</p>
            {activeTab === 'my-tasks' && (
              <p className="empty-subtitle">Waiting for tasks to be assigned to you.</p>
            )}
          </div>
        ) : filterCategory === 'all' ? (
          // Show grouped by category when 'all' is selected
          <div className="grouped-tasks">
            {Object.entries(groupedTasks).map(([category, tasks]) => 
              tasks.length > 0 && (
                <div key={category} className="category-section">
                  <h2 className="category-title">{category}</h2>
                  <div className="tasks-grid">
                    {tasks.map(task => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        showAssignedTo={activeTab === 'assigned-by-me'}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          // Show filtered tasks when specific category is selected
          <div className="tasks-grid">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task._id} 
                task={task} 
                showAssignedTo={activeTab === 'assigned-by-me'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <AssignTask onClose={() => setShowAssignModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;