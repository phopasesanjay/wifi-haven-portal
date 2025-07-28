// API Configuration
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    sendEmailToUser: '/api/sendEmailToUser',
    getAllComplaints: '/api/getAllComplaints',
    getAllUsers: '/api/getAllUsers',
    resolveComplaint: '/api/resolveComplaint',
  }
};

// Helper to get full URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};