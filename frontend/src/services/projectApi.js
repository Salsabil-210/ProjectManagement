import axios from 'axios';
import { API_URL, API_ENDPOINTS } from './apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getProjects = async () => {
  const response = await axios.get(
    `${API_URL}${API_ENDPOINTS.GET_PROJECTS}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const addProject = async (projectData) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.ADD_PROJECT}`,
    projectData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await axios.put(
    `${API_URL}${API_ENDPOINTS.UPDATE_PROJECT}/${projectId}`,
    projectData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await axios.delete(
    `${API_URL}${API_ENDPOINTS.DELETE_PROJECT}/${projectId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const addTask = async (taskData) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.ADD_TASK}`,
    taskData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const getTasks = async () => {
  const response = await axios.get(
    `${API_URL}${API_ENDPOINTS.GET_TASKS}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await axios.put(
    `${API_URL}${API_ENDPOINTS.UPDATE_TASK}/${taskId}`,
    taskData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await axios.delete(
    `${API_URL}${API_ENDPOINTS.DELETE_TASK}/${taskId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}; 