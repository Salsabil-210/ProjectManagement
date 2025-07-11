import React, { useState } from 'react';
import { addTask } from '../services/tasksApi';

const AddTaskModal = ({ show, onClose, onTaskAdded, projectId, users }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Opened',
    start_date: '',
    end_date: '',
    user_id: '',
    project_id: projectId,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await addTask(form);
      if (result.success) {
        onTaskAdded(result.data);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>EDIT SUMMARY</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Summary</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Enter task summary"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              style={{...styles.input, ...styles.textarea}}
              required
              placeholder="Enter task description"
            />
          </div>

          <div style={styles.dateRow}>
            <div style={styles.dateGroup}>
              <label style={styles.label}>Started Time</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.dateGroup}>
              <label style={styles.label}>Finish Time</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.infoRow}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Status:</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Inprogress">Inprogress</option>
                <option value="Opened">Opened</option>
                <option value="Completed">"Completed</option>
              </select>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>User ID:</span>
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.addButton}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#2D2540',
    borderRadius: '8px',
    padding: '24px',
    width: '500px',
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#F0F0F0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#D0D0D0',
  },
  input: {
    backgroundColor: '#1D1A27',
    border: '1px solid #4B3B5C',
    borderRadius: '6px',
    padding: '12px',
    color: '#FFFFFF',
    fontSize: '14px',
  },
  textarea: {
    minHeight: '100px',
    resize: 'vertical',
  },
  select: {
    backgroundColor: '#1D1A27',
    border: '1px solid #4B3B5C',
    borderRadius: '6px',
    padding: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    minWidth: '120px',
  },
  dateRow: {
    display: 'flex',
    gap: '16px',
  },
  dateGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    gap: '24px',
    marginTop: '8px',
  },
  infoItem: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#D0D0D0',
  },
  infoValue: {
    fontSize: '14px',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    border: '1px solid #4B3B5C',
    color: '#FFFFFF',
    borderRadius: '6px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  addButton: {
    backgroundColor: '#5E4B7A',
    border: 'none',
    color: '#FFFFFF',
    borderRadius: '6px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default AddTaskModal;