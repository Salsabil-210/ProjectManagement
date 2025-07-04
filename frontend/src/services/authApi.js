import axios from 'axios';
import { API_URL, API_ENDPOINTS } from './apiConfig';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const registerUser = async (name, surname, email, password) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.REGISTER}`,
    { name, surname, email, password }
  );
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.LOGIN}`,
    { email, password }
  );
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.FORGOT_PASSWORD}`,
    { email }
  );
  return response.data;
};

export const verifyResetCode = async (email, code) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.VERIFY_RESET_CODE}`,
    { email, code }
  );
  return response.data;
};

export const setNewPassword = async (email, code, newPassword) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.RESET_PASSWORD}`,
    { email, code, newPassword }
  );
  return response.data;
};

export const adduser = async (userData) => {
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.ADD_USER}`,
    userData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get(
    `${API_URL}${API_ENDPOINTS.GET_ALL_USERS}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axios.put(
    `${API_URL}${API_ENDPOINTS.UPDATE_USER}/${userId}`,
    userData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(
    `${API_URL}${API_ENDPOINTS.DELETE_USER}/${userId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const logoutUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No token found");
  const response = await axios.post(
    `${API_URL}${API_ENDPOINTS.LOGOUT}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  localStorage.removeItem('token');
  return response.data;
};