'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Student, UserType, UserContextType } from '@/types';

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userType, setUserType] = useState<UserType>('PROSPECTIVE');
  const [childData, setChildData] = useState<Student | null>(null);

  const parentName = childData?.parentName ?? null;

  const logout = () => {
    setUserType('PROSPECTIVE');
    setChildData(null);
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
