import axios from 'axios';

// Use environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // ✅ CHANGED: Set to true for proper cookie/auth handling
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // ✅ FIXED: Better token retrieval from multiple storage options
    let token;
    try {
      token = localStorage.getItem('token');
      
      // Also try sessionStorage as fallback
      if (!token) {
        token = sessionStorage.getItem('token');
      }
    } catch (error) {
      console.warn('Could not access storage:', error);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Token attached to ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`⚠️ No token found for ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Log request for debugging
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data && Object.keys(config.data).length > 0) {
      console.log('📦 Request data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data; // ✅ CHANGED: Return only data for cleaner usage
  },
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      requestData: error.config?.data
    };
    
    console.error('❌ API Error Details:', JSON.stringify(errorDetails, null, 2));
    
    // Handle network/CORS errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('🌐 Network/CORS error detected. Check:');
      console.error('1. Is backend server running?');
      console.error('2. Try accessing:', `${API_URL}/api/health`);
      console.error('3. Check CORS settings on backend');
      
      return Promise.reject({
        success: false,
        message: 'Cannot connect to server. Please make sure backend is running.',
        type: 'network',
        details: `Backend URL: ${API_URL}`
      });
    }
    
    // Handle request timeout
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
      return Promise.reject({
        success: false,
        message: 'Request timeout. The server is taking too long to respond.',
        type: 'timeout'
      });
    }
    
    // Handle 400 Bad Request (JSON parsing error)
    if (error.response?.status === 400) {
      console.error('📝 JSON Parsing Error - Check request format');
      return Promise.reject({
        success: false,
        message: error.response.data?.message || 'Invalid request format',
        details: error.response.data,
        type: 'bad_request'
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized access');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject({
        success: false,
        message: 'Session expired. Please login again.',
        type: 'unauthorized'
      });
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Forbidden access');
      return Promise.reject({
        success: false,
        message: 'You do not have permission to access this resource.',
        type: 'forbidden'
      });
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 Resource not found');
      return Promise.reject({
        success: false,
        message: error.response.data?.message || 'Resource not found',
        type: 'not_found'
      });
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('💥 Server error');
      return Promise.reject({
        success: false,
        message: 'Internal server error. Please try again later.',
        type: 'server_error'
      });
    }
    
    // Handle request made but no response
    if (error.request) {
      console.error('❌ No response received:', error.request);
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
        type: 'no_response'
      });
    }
    
    // Handle error in request setup
    if (!error.response && !error.request) {
      console.error('❌ Request setup error:', error.message);
      return Promise.reject({
        success: false,
        message: 'Error setting up request: ' + error.message,
        type: 'request_error'
      });
    }
    
    // Default error handling
    return Promise.reject(error.response?.data || {
      success: false,
      message: 'An unexpected error occurred',
      type: 'unknown'
    });
  }
);

// ✅ ADDED: Helper function to check backend health
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000
    });
    return {
      success: true,
      status: 'connected',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: 'disconnected',
      message: `Cannot connect to backend at ${API_URL}`,
      error: error.message
    };
  }
};

// ✅ ADDED: Helper function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};


// ✅ ADDED: Helper function to clear auth
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export default api;