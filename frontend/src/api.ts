import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Your backend URL
});

// RAOFtf6y6bemiJqH
// kanishk21soni_db_user

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
