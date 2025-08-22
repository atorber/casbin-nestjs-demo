'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  forceRefresh: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  forceRefresh: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // 添加刷新键
  const router = useRouter();

  const fetchUserInfo = async (authToken: string) => {
    console.log('fetchUserInfo 开始执行，token:', authToken);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('使用的 API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log('认证响应状态:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await response.json();
      console.log('获取到的用户数据:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user info:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthContext useEffect 执行，检查本地存储');
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem('token');
    console.log('本地存储中的 token:', storedToken ? '存在' : '不存在');
    if (storedToken) {
      setToken(storedToken);
      fetchUserInfo(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    console.log('login 开始执行，新 token:', newToken);
    // 先清理旧状态
    setUser(null);
    setToken(null);
    // 清理本地存储
    localStorage.removeItem('token');
    sessionStorage.clear();
    // 设置新 token
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // 获取用户信息
    fetchUserInfo(newToken);
    console.log('login 执行完成');
  };

  const logout = () => {
    console.log('logout 开始执行');
    // 立即清理状态
    setToken(null);
    setUser(null);
    setIsLoading(false);
    // 清理本地存储
    localStorage.removeItem('token');
    // 清理 sessionStorage（如果有的话）
    sessionStorage.clear();
    // 最后进行路由跳转
    router.push('/login');
    console.log('logout 执行完成');
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserInfo(token);
    }
  };

  const forceRefresh = () => {
    console.log('强制刷新认证状态');
    setRefreshKey(prev => prev + 1);
    // 强制重新获取用户信息
    if (token) {
      fetchUserInfo(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, forceRefresh, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 