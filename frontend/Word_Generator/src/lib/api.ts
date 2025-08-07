
const API_BASE_URL = "http://localhost:8000"; // Update this to your backend URL

interface SignupData {
  email: string;
  password: string;
  job_title: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }
  
  return data;
};

// Auth API calls
export const signup = async (userData: SignupData): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

export const login = async (credentials: LoginData): Promise<{ access_token: string; token_type: string }> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  return handleResponse(response);
};

// Word generation API calls
export const generateData = async (): Promise<any> => {
  console.log('Calling generateData API:', `${API_BASE_URL}/generate-data`);
  try {
    const response = await fetch(`${API_BASE_URL}/generate-data`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    console.log('Generate data response status:', response.status);
    const result = await handleResponse(response);
    console.log('Generate data result:', result);
    return result;
  } catch (error) {
    console.error('Generate data error:', error);
    throw error;
  }
};

export const getData = async (): Promise<any> => {
  console.log('Calling getData API:', `${API_BASE_URL}/get-data`);
  try {
    const response = await fetch(`${API_BASE_URL}/get-data`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    console.log('Get data response status:', response.status);
    const result = await handleResponse(response);
    console.log('Get data result:', result);
    return result;
  } catch (error) {
    console.error('Get data error:', error);
    throw error;
  }
};
