'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, UserType, UserContextType } from '@/types';

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_KEY = 'littleSprouts_session';

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userType, setUserType] = useState<UserType>('PROSPECTIVE');
  const [childData, setChildData] = useState<Student | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        if (session.userType) setUserType(session.userType);
        if (session.childData) setChildData(session.childData);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (!isHydrated) return; // Don't save until initial load is complete
    
    try {
      if (userType === 'PROSPECTIVE' && !childData) {
        localStorage.removeItem(SESSION_KEY);
      } else {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ userType, childData }));
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [userType, childData, isHydrated]);

  const parentName = childData?.parentName ?? null;

  const logout = () => {
    setUserType('PROSPECTIVE');
    setChildData(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <UserContext.Provider
      value={{
        userType,
        setUserType,
        childData,
        setChildData,
        parentName,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
