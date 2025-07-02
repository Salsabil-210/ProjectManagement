const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const API_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",

  USERS: "/users",
  USER_BY_ID: (id) => `/users/${id}`,
  UPDATE_USER: (id) => `/users/${id}`,
  DELETE_USER: (id) => `/users/${id}`,

  PROJECTS: "/projects",
  PROJECT_BY_ID: (id) => `/projects/${id}`,
  CREATE_PROJECT: "/projects",
  UPDATE_PROJECT: (id) => `/projects/${id}`,
  DELETE_PROJECT: (id) => `/projects/${id}`,

  TASKS: "/tasks",
  TASK_BY_ID: (id) => `/tasks/${id}`,
  CREATE_TASK: "/tasks",
  UPDATE_TASK: (id) => `/tasks/${id}`,
  DELETE_TASK: (id) => `/tasks/${id}`,

  // ... add more as needed
};

export { API_URL, API_ENDPOINTS };
