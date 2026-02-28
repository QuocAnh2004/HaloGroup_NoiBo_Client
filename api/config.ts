
export const API_URL = 'http://localhost:3001/api';
// export const API_URL = 'https://project-management-server-two-delta.vercel.app/api';

// Hàm lấy token từ localStorage (hoặc nơi lưu trữ user)
const getToken = () => {
  try {
    const savedUser = localStorage.getItem('hola_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.token;
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Nếu lỗi 401/403 (Unauthorized), có thể logout user tại đây nếu muốn
    if (response.status === 401 || response.status === 403) {
      // localStorage.removeItem('hola_user');
      // window.location.href = '/login'; 
      // (Tạm thời không auto redirect để tránh vòng lặp nếu xử lý lỗi ở UI)
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi API: ${response.statusText}`);
  }
  return response.json();
};

// Wrapper cho fetch để tự động thêm Authorization header
export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

    // ✅ LOG REQUEST
  // console.log('[API REQUEST]', {
  //   url: `${API_URL}${endpoint}`,
  //   method: options.method || 'GET',
  //   headers,
  //   body: options.body ? JSON.parse(options.body as string) : null,
  // });

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  return handleResponse(response);
};
