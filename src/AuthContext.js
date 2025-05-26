// 캔버스에 작성된 코드 - 복사하여 사용하세요.
// src/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    // 앱이 로드될 때 로컬 스토리지에 토큰이 있으면 사용자 정보를 복원하여 로그인 상태를 유지
    if (token) {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("저장된 사용자 정보를 불러오는 데 실패했습니다.", e);
            logout(); // 문제가 있으면 로그아웃 처리
        }
    }
  }, [token]);

  // 로그인 시 호출될 함수
  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  // 로그아웃 시 호출될 함수
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Context Provider를 통해 전달할 값들
  const authContextValue = {
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 다른 컴포넌트에서 쉽게 context를 사용하기 위한 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};