import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'user';

export function normalizeAuthRole(role) {
  if (!role) return '';

  const normalizedRole = String(role).trim().toLowerCase();

  if (normalizedRole === 'user') return 'student';

  return normalizedRole;
}

function normalizeAuthUser(userData) {
  if (!userData || typeof userData !== 'object') return null;

  const email = userData.email || userData.admin_username || '';
  const userId = userData.userId || userData.id || userData._id || null;
  const role = normalizeAuthRole(userData.role || (userId === 'admin' ? 'admin' : 'student'));

  if (!email && !userId && !role) return null;

  return {
    ...userData,
    email,
    userId,
    role,
  };
}

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;

    return normalizeAuthUser(JSON.parse(storedUser));
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading] = useState(false);

  const login = (userData) => {
    const normalizedUser = normalizeAuthUser(userData);

    if (!normalizedUser) {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      return;
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const normalizedRole = normalizeAuthRole(user?.role);
  const isAdmin = normalizedRole === 'admin';
  const isStudent = normalizedRole === 'student';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isStudent, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
