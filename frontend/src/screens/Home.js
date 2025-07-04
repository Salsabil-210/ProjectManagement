import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, adduser, getAllUsers } from '../services/authApi';
import { getProjects, addProject, updateProject, deleteProject } from '../services/projectApi';

const Home = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeMenu, setActiveMenu] = useState('user');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    is_admin: false
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    user_ids: []
  });
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState('');
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({
    id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    user_ids: []
  });
  const [editProjectLoading, setEditProjectLoading] = useState(false);
  const [editProjectError, setEditProjectError] = useState('');
  const [deleteProjectModal, setDeleteProjectModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedEditUserId, setSelectedEditUserId] = useState('');
  const [selectedEditUsers, setSelectedEditUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeMenu === 'project') {
      fetchProjects();
    }
  }, [activeMenu]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

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
      setLoading(true);
      const response = await adduser(formData);
      if (response.success) {
        setShowAddModal(false);
        setFormData({ name: '', surname: '', email: '', password: '', is_admin: false });
        alert('User added successfully!');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    } finally {
      setLoading(false);
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

  const openProjectModal = () => {
    setProjectForm({ name: '', description: '', start_date: '', end_date: '', user_ids: [] });
    setProjectError('');
    setShowProjectModal(true);
  };

  const handleProjectInputChange = (e) => {
    const { name, value, multiple, options } = e.target;
    if (multiple) {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setProjectForm(prev => ({ ...prev, [name]: selected }));
    } else {
      setProjectForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setProjectError('');
    setProjectLoading(true);
    try {
      const response = await addProject({
        ...projectForm,
        user_ids: selectedUsers.map(u => u.id)
      });
      if (response.success) {
        setShowProjectModal(false);
        setProjectForm({ name: '', description: '', start_date: '', end_date: '', user_ids: [] });
        fetchProjects();
      } else {
        setProjectError(response.message || 'Failed to add project.');
      }
    } catch (error) {
      setProjectError('Error adding project.');
    } finally {
      setProjectLoading(false);
    }
  };

  const openEditProjectModal = (project) => {
    setEditProjectForm({
      id: project.id,
      name: project.name,
      description: project.description,
      start_date: project.start_date ? project.start_date.slice(0, 10) : '',
      end_date: project.end_date ? project.end_date.slice(0, 10) : '',
      user_ids: project.user_ids || (project.users ? project.users.map(u => u.id) : [])
    });
    setSelectedEditUsers(project.users || []);
    setSelectedEditUserId('');
    setEditProjectError('');
    setEditProjectModal(true);
  };

  const handleEditProjectInputChange = (e) => {
    const { name, value, multiple, options } = e.target;
    if (multiple) {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setEditProjectForm(prev => ({ ...prev, [name]: selected }));
    } else {
      setEditProjectForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setEditProjectError('');
    setEditProjectLoading(true);
    try {
      const { id, ...data } = editProjectForm;
      const response = await updateProject(id, {
        ...data,
        user_ids: selectedEditUsers.map(u => u.id)
      });
      if (response.success) {
        setEditProjectModal(false);
        setEditProjectForm({ id: '', name: '', description: '', start_date: '', end_date: '', user_ids: [] });
        setSelectedEditUsers([]);
        fetchProjects();
      } else {
        setEditProjectError(response.message || 'Failed to update project.');
      }
    } catch (error) {
      setEditProjectError('Error updating project.');
    } finally {
      setEditProjectLoading(false);
    }
  };

  const openDeleteProjectModal = (projectId) => {
    setProjectToDelete(projectId);
    setDeleteProjectModal(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      setLoading(true);
      const response = await deleteProject(projectToDelete);
      if (response.success) {
        fetchProjects();
      } else {
        alert(response.message || 'Failed to delete project.');
      }
    } catch (error) {
      alert('Error deleting project.');
    } finally {
      setLoading(false);
      setDeleteProjectModal(false);
      setProjectToDelete(null);
    }
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
          <div>
            {loading && <div style={styles.loading}>Loading users...</div>}
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Surname</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>isAdmin</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id || idx} style={styles.tr}>
                    <td style={styles.td}>{user.name}</td>
                    <td style={styles.td}>{user.surname}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{String(user.is_admin)}</td>
                    <td style={styles.td}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.editIcon} title="Edit">&#9998;</span>
                      <span style={styles.deleteIcon} title="Delete">&#128465;</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <div style={styles.noUsers}>No users found. Add your first user!</div>
            )}
          </div>
        ) : (
          <div>
            {loading && <div style={styles.loading}>Loading projects...</div>}
            <div style={styles.projectHeaderRow}>
              <h2 style={styles.pageTitle}>Projects List</h2>
              <button style={styles.createProjectBtn} onClick={openProjectModal}>Create Project +</button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>PROJECT NAME</th>
                  <th style={styles.th}>USERS</th>
                  <th style={styles.th}>DETAILS</th>
                  <th style={styles.th}>EDIT</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} style={styles.tr}>
                    <td style={styles.td}>{project.id}</td>
                    <td style={styles.td}>{project.name}</td>
                    <td style={styles.td}>
                      {project.users && project.users.length > 0
                        ? project.users.map(u => `${u.name} ${u.surname}`).join(', ')
                        : 'No users'}
                    </td>
                    <td style={styles.td}><span style={styles.detailsIcon} title="Details">&#128193;</span></td>
                    <td style={styles.td}>
                      <span style={styles.editIcon} title="Edit" onClick={() => openEditProjectModal(project)}>&#9998;</span>
                      <span style={styles.deleteIcon} title="Delete" onClick={() => openDeleteProjectModal(project.id)}>&#128465;</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projects.length === 0 && !loading && (
              <div style={styles.noUsers}>No projects found. Add your first project!</div>
            )}
            {/* Add Project Modal */}
            {showProjectModal && (
              <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                  <h3 style={styles.modalTitle}>Create Project</h3>
                  <form onSubmit={handleAddProject}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Project Name"
                      value={projectForm.name}
                      onChange={handleProjectInputChange}
                      style={styles.input}
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={projectForm.description}
                      onChange={handleProjectInputChange}
                      style={{ ...styles.input, minHeight: 60 }}
                      required
                    />
                    <input
                      type="date"
                      name="start_date"
                      placeholder="Start Date"
                      value={projectForm.start_date}
                      onChange={handleProjectInputChange}
                      style={styles.input}
                      required
                    />
                    <input
                      type="date"
                      name="end_date"
                      placeholder="End Date"
                      value={projectForm.end_date}
                      onChange={handleProjectInputChange}
                      style={styles.input}
                      required
                    />
                    <select
                      value={selectedUserId}
                      onChange={e => setSelectedUserId(e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Choose One</option>
                      {users
                        .filter(u => !selectedUsers.some(su => su.id === u.id))
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} {user.surname}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        const user = users.find(u => u.id === Number(selectedUserId));
                        if (user && !selectedUsers.some(su => su.id === user.id)) {
                          setSelectedUsers([...selectedUsers, user]);
                          setSelectedUserId('');
                        }
                      }}
                      disabled={!selectedUserId}
                    >
                      +
                    </button>
                    <table>
                      <thead>
                        <tr>
                          <th>id</th>
                          <th>Name</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUsers.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>
                              <span
                                style={{ cursor: 'pointer' }}
                                onClick={() =>
                                  setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
                                }
                              >
                                🗑️
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {projectError && <div style={styles.error}>{projectError}</div>}
                    <div style={styles.modalButtons}>
                      <button type="submit" style={styles.submitBtn} disabled={projectLoading}>
                        {projectLoading ? 'Adding...' : 'Add Project'}
                      </button>
                      <button type="button" style={styles.cancelBtn} onClick={() => setShowProjectModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Edit Project Modal */}
            {editProjectModal && (
              <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                  <h3 style={styles.modalTitle}>Edit Project</h3>
                  <form onSubmit={handleUpdateProject}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Project Name"
                      value={editProjectForm.name}
                      onChange={handleEditProjectInputChange}
                      style={styles.input}
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={editProjectForm.description}
                      onChange={handleEditProjectInputChange}
                      style={{ ...styles.input, minHeight: 60 }}
                      required
                    />
                    <input
                      type="date"
                      name="start_date"
                      placeholder="Start Date"
                      value={editProjectForm.start_date}
                      onChange={handleEditProjectInputChange}
                      style={styles.input}
                      required
                    />
                    <input
                      type="date"
                      name="end_date"
                      placeholder="End Date"
                      value={editProjectForm.end_date}
                      onChange={handleEditProjectInputChange}
                      style={styles.input}
                      required
                    />
                    <select
                      value={selectedEditUserId}
                      onChange={e => setSelectedEditUserId(e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Choose One</option>
                      {users
                        .filter(u => !selectedEditUsers.some(su => su.id === u.id))
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} {user.surname}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const user = users.find(u => u.id === Number(selectedEditUserId));
                        if (user && !selectedEditUsers.some(su => su.id === user.id)) {
                          setSelectedEditUsers([...selectedEditUsers, user]);
                          setSelectedEditUserId('');
                        }
                      }}
                      disabled={!selectedEditUserId}
                    >
                      +
                    </button>
                    <table>
                      <thead>
                        <tr>
                          <th>id</th>
                          <th>Name</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEditUsers.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>
                              <span
                                style={{ cursor: 'pointer' }}
                                onClick={() =>
                                  setSelectedEditUsers(selectedEditUsers.filter(u => u.id !== user.id))
                                }
                              >
                                🗑️
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {editProjectError && <div style={styles.error}>{editProjectError}</div>}
                    <div style={styles.modalButtons}>
                      <button type="submit" style={styles.submitBtn} disabled={editProjectLoading}>
                        {editProjectLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" style={styles.cancelBtn} onClick={() => setEditProjectModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Delete Project Confirmation Modal */}
            {deleteProjectModal && (
              <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                  <h3 style={styles.modalTitle}>Delete Project</h3>
                  <div style={{ marginBottom: 20, fontSize: 16 }}>
                    Are you sure you want to delete this project?
                  </div>
                  <div style={styles.modalButtons}>
                    <button style={styles.submitBtn} onClick={handleDeleteProject}>
                      Yes, Delete
                    </button>
                    <button style={styles.cancelBtn} onClick={() => { setDeleteProjectModal(false); setProjectToDelete(null); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Adding...' : 'Add User'}
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
  loading: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
    marginBottom: 20,
    padding: '20px',
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
  detailsIcon: {
    fontSize: 18,
    color: '#fff',
    cursor: 'pointer',
  },
  placeholder: {
    color: '#aaa',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 60,
  },
  noUsers: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    padding: '20px',
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
  projectHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  createProjectBtn: {
    background: '#a259e6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 22px',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: '10px',
    fontSize: '14px',
    textAlign: 'center',
  },
};

export default Home;
