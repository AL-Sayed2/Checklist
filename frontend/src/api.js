import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE
});

// Interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (password) => {
  const response = await axios.post(`${BASE}/api/auth/login`, { password });
  if (response.data.token) {
    localStorage.setItem('clinic_token', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('clinic_token');
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('clinic_token');
};

export const saveChecklist = async (data) => {
  const response = await apiClient.post('/api/checklists', data);
  return response.data;
};

export const getHistory = async () => {
  const response = await apiClient.get('/api/checklists');
  return response.data;
};

export const getWeek = async (week) => {
  const response = await apiClient.get(`/api/checklists/${week}`);
  return response.data;
};

export const deleteWeek = async (week) => {
  const response = await apiClient.delete(`/api/checklists/${week}`);
  return response.data;
};

export const getAISummary = async (body) => {
  const response = await apiClient.post('/api/ai/summary', body);
  return response.data;
};

// Compliance Calculation Helper
export const computeCompliance = (data) => {
  let pass = 0, fail = 0, na = 0, empty = 0;
  Object.values(data).forEach((roomMap) => {
    Object.values(roomMap).forEach((status) => {
      if (status === 'pass') pass++;
      else if (status === 'fail') fail++;
      else if (status === 'na') na++;
      else empty++;
    });
  });
  const filled = pass + fail;
  const compliance = filled > 0 ? Math.round((pass / filled) * 100) : 0;
  return { compliance, totalPass: pass, totalFail: fail, totalNA: na, totalEmpty: empty };
};
