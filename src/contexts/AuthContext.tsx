'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  setTestUser: (user: User) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从localStorage加载token或检查测试模式
  useEffect(() => {
    // 检查测试模式
    const testMode = localStorage.getItem('test_mode');
    if (testMode === 'true') {
      const testUser: User = {
        id: 999,
        username: 'test_user',
        email: 'test@example.com',
        role: 'USER',
        firstName: '测试',
        lastName: '用户',
        isActive: true
      };
      setUser(testUser);
      setToken('test_token');
      setLoading(false);
      return;
    }

    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // 获取当前用户信息
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token无效，清除本地存储
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        // 清除测试模式标志
        localStorage.removeItem('test_mode');
        return true;
      } else {
        setError(data.message || '登录失败');
        return false;
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        // 清除测试模式标志
        localStorage.removeItem('test_mode');
        return true;
      } else {
        setError(data.message || '注册失败');
        return false;
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('test_mode');
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  // 设置测试用户
  const setTestUser = (testUser: User) => {
    setUser(testUser);
    setToken('test_token');
    localStorage.setItem('test_mode', 'true');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    clearError,
    setTestUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 