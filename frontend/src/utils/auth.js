export const getToken = () => localStorage.getItem('token');
export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};
export const isAuthenticated = () => !!getToken();
