import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('to_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('to_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then((r) => {
      setUser(r.data.user);
      localStorage.setItem('to_user', JSON.stringify(r.data.user));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('to_token', data.token);
    localStorage.setItem('to_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('to_token', data.token);
    localStorage.setItem('to_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('to_token');
    localStorage.removeItem('to_user');
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('to_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
