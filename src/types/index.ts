// Student data structure matching students.json
export interface Student {
  id: string;
  parentName: string;
  parentPhone: string;
  childName: string;
  classroom: string;
  teacher: string;
  status: string;
  lastMeal: string;
  mood: string;
  attendance: string;
}

// User authentication types
export type UserType = 'PROSPECTIVE' | 'LOGGED_IN' | 'ADMIN';

export interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  childData: Student | null;
  setChildData: (data: Student | null) => void;
  parentName: string | null;
  logout: () => void;
}
