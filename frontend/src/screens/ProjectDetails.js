import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddTaskModal from '../components/AddTaskModal';
import { getTasks } from '../services/tasksApi';
import { getProjects } from '../services/projectApi';

const ProjectDetails = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const isAdmin = user && user.is_admin;

  useEffect(() => {
    const fetchProject = async () => {
      const response = await getProjects();
      if (response.success) {
        const found = response.data.find(p => String(p.id) === String(projectId));
        setProject(found);
      }
    };
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      const response = await getTasks(projectId);
      if (response.success) setTasks(response.data);
    };
    fetchProjectTasks();
  }, [projectId, showAddTaskModal]);

  if (!project) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            style={{ ...styles.addSummaryButton, marginRight: 16 }}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1 style={styles.projectTitle}>Project {project.name}</h1>
        </div>
        <button 
          style={styles.addSummaryButton}
          onClick={() => setShowAddTaskModal(true)}
        >
          Add Summary
        </button>
      </div>
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>USER</th>
              <th style={styles.th}>SUMMARY</th>
              <th style={styles.th}>DESCRIPTION</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th}>STARTED</th>
              <th style={styles.th}>FINISH</th>
              <th style={styles.th}>EDIT</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={styles.tr}>
                <td style={styles.td}>{task.id}</td>
                <td style={styles.td}>{task.user_name || 'NULL'}</td>
                <td style={styles.td}>{task.name}</td>
                <td style={styles.td}>
                  {task.description && `"${task.description.length > 50 ? 
                    `${task.description.substring(0, 50)}...` : 
                    task.description}"`}
                </td>
                <td style={{...styles.td, color: '#FFA500'}}>Inprogress</td>
                <td style={styles.td}>10.10.2020</td>
                <td style={styles.td}>10.10.2020</td>
                <td style={styles.td}>
                  <span style={styles.editIcon}>✅</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddTaskModal && (
        <AddTaskModal
          show={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onTaskAdded={() => {
            setShowAddTaskModal(false);
            const fetchProjectTasks = async () => {
              const response = await getTasks(projectId);
              if (response.success) setTasks(response.data);
            };
            fetchProjectTasks();
          }}
          projectId={project.id}
          users={project.users || []}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    color: '#fff',
    backgroundColor: '#1a1723',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
  },
  projectTitle: {
    fontSize: '24px',
    fontWeight: '500',
    marginBottom: '24px',
    color: '#F0F0F0',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },
  th: {
    background: '#2D2540',
    color: '#fff',
    fontWeight: '500',
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '14px',
  },
  tr: {
    backgroundColor: '#23222A',
    borderRadius: '8px',
  },
  td: {
    color: '#D0D0D0',
    padding: '12px 15px',
    fontSize: '14px',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  editIcon: {
    cursor: 'pointer',
    fontSize: '16px',
  },
  addSummaryContainer: {
    marginTop: '32px',
  },
  divider: {
    height: '1px',
    width: '100%',
    backgroundColor: '#4B3B5C',
    marginBottom: '16px',
  },
  addSummaryWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
  addSummaryButton: {
    background: '#5E4B7A',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default ProjectDetails;