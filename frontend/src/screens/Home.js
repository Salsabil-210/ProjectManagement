import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, adduser } from '../services/authApi';

const mockUsers = [
  { username: 'testuser', name: 'testuser', mail: 'testuser@gmail.com', isAdmin: false },
];

const Home = () => {
  const navigate = useNavigate();
  const [users] = useState(mockUsers);
  const [activeMenu, setActiveMenu] = useState('user');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    is_admin: false
  });

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await adduser(formData);
      if (response.success) {
        setShowAddModal(false);
        setFormData({ name: '', surname: '', email: '', password: '', is_admin: false });
        alert('User added successfully!');
        // You can refresh the user list here if needed
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openAddModal = () => {
    setFormData({ name: '', surname: '', email: '', password: '', is_admin: false });
    setShowAddModal(true);
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.closeBtn} onClick={handleLogout}>&#10006;</span>
          <div style={styles.welcome}>Welcome admin</div>
        </div>
        <nav style={styles.nav}>
          <button
            style={{ ...styles.navBtn, ...(activeMenu === 'user' ? styles.activeNavBtn : {}) }}
            onClick={() => setActiveMenu('user')}
          >
            <span style={styles.icon}>&#128101;</span>
            <span>USERLIST<br />MANAGEMENT</span>
          </button>
          <button
            style={{ ...styles.navBtn, ...(activeMenu === 'project' ? styles.activeNavBtn : {}) }}
            onClick={() => setActiveMenu('project')}
          >
            <span style={styles.icon}>&#128451;</span>
            <span>PROJECT<br />MANAGEMENT</span>
          </button>
        </nav>
      </aside>
      <main style={styles.main}>
        <div style={styles.headerRow}>
          <h2 style={styles.pageTitle}>{activeMenu === 'user' ? 'User List Management' : 'Project Management'}</h2>
          {activeMenu === 'user' && (
            <button style={styles.addUserBtn} onClick={openAddModal}>Add New User +</button>
          )}
        </div>
        {activeMenu === 'user' ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Mail</th>
                <th style={styles.th}>isAdmin</th>
                <th style={styles.th}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.mail}</td>
                  <td style={styles.td}>{String(user.isAdmin)}</td>
                  <td style={styles.td}>
                    <span style={styles.editIcon} title="Edit">&#9998;</span>
                    <span style={styles.deleteIcon} title="Delete">&#128465;</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.placeholder}>Project management content goes here.</div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <input
                type="text"
                name="surname"
                placeholder="Surname"
                value={formData.surname}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={formData.is_admin}
                  onChange={handleInputChange}
                  style={styles.checkbox}
                />
                Is Admin
              </label>
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitBtn}>
                  Add User
                </button>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#1a1723',
    fontFamily: 'Segoe UI, sans-serif',
  },
  sidebar: {
    width: 260,
    background: '#2D2540',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    minHeight: '100vh',
    boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
  },
  sidebarHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '30px 20px 15px 20px',
    borderBottom: '1px solid #4B3B5C',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    fontSize: 24,
    cursor: 'pointer',
    marginBottom: 20,
    color: '#9E9E9E',
  },
  welcome: {
    fontWeight: 500,
    fontSize: 18,
    color: '#E0E0E0',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 30,
    padding: '0 15px',
    gap: 15,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: '#D0D0D0',
    fontSize: 14,
    padding: '18px 10px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 8,
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontWeight: 500,
  },
  activeNavBtn: {
    background: '#888',
    color: '#fff',
    fontWeight: 600,
    borderBottom: '4px solid #00BFFF',
  },
  icon: {
    fontSize: 22,
    marginBottom: 5,
  },
  main: {
    flex: 1,
    background: '#1D1A27',
    padding: 40,
    color: '#fff',
    borderRadius: 15,
    margin: 20,
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.4)',
    minWidth: 0,
    overflowX: 'auto',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 600,
    color: '#F0F0F0',
  },
  addUserBtn: {
    background: '#5E4B7A',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 22px',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },
  th: {
    background: '#2D2540',
    color: '#fff',
    fontWeight: 500,
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: 16,
  },
  tr: {
    backgroundColor: '#23222A',
    borderRadius: 8,
    transition: 'background-color 0.2s',
  },
  td: {
    color: '#D0D0D0',
    padding: '12px 15px',
    fontSize: 15,
    maxWidth: 250,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  editIcon: {
    cursor: 'pointer',
    marginRight: 15,
    fontSize: 18,
    color: '#ccc',
  },
  deleteIcon: {
    cursor: 'pointer',
    fontSize: 18,
    color: '#ccc',
  },
  placeholder: {
    color: '#aaa',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 60,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#2D2540',
    padding: '30px',
    borderRadius: '12px',
    minWidth: '400px',
    color: '#fff',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #4B3B5C',
    borderRadius: '6px',
    background: '#1D1A27',
    color: '#fff',
    fontSize: '14px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    fontSize: '14px',
  },
  checkbox: {
    marginRight: '10px',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  submitBtn: {
    background: '#5E4B7A',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelBtn: {
    background: '#4B3B5C',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Home;
