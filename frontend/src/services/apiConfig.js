export const API_URL = "http://localhost:3000/api";

export const API_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_RESET_CODE: "/auth/verify-reset-code",
  RESET_PASSWORD: "/auth/reset-password",
  
  ADD_USER: "/auth/addUser",
  GET_ALL_USERS: "/auth/all",
  UPDATE_USER: "/auth/updateUser",
  DELETE_USER: "/auth/deleteUser",

  GET_PROJECTS: "/projects/getprojects",
  ADD_PROJECT: "/projects/addprojects",
  UPDATE_PROJECT: "/projects/updateprojects",
  DELETE_PROJECT: "/projects/deleteprojects",

  ADD_TASK: "/tasks/addtask",
  GET_TASKS: "/tasks/gettasks",
  UPDATE_TASK: "/tasks/updatetasks",
  DELETE_TASK: "/tasks/deletetasks",
}; 