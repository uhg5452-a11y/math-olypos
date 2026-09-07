import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_ACCOUNTS, INITIAL_STUDENTS } from '../data/mockUsers';
import { storageService } from '../services/storageService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storageService.getCurrentUser());
  const [students, setStudents] = useState(() => storageService.getStudents());
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    storageService.saveStudents(students);
  }, [students]);

  // Login for Students with Student ID
  const loginStudent = (studentId, password) => {
    setAuthError(null);
    const cleanId = studentId.trim().toUpperCase();
    const student = students.find(
      s => s.studentId.toUpperCase() === cleanId && s.password === password
    );

    if (student) {
      setCurrentUser(student);
      return { success: true, user: student };
    } else {
      const errorMsg = 'รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง (ตัวอย่าง: STU-2026-001 / password123)';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Login for Admins (Strictly 2 accounts)
  const loginAdmin = (email, password) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const admin = ADMIN_ACCOUNTS.find(
      a => a.email.toLowerCase() === cleanEmail && a.password === password
    );

    if (admin) {
      setCurrentUser(admin);
      return { success: true, user: admin };
    } else {
      const errorMsg = 'อีเมลหรือรหัสผ่านแอดมินไม่ถูกต้อง (จำกัดเฉพาะ 2 บัญชีที่ได้รับอนุญาต)';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Switch demo user easily for testing
  const switchDemoUser = (type, index = 0) => {
    if (type === 'admin') {
      const admin = ADMIN_ACCOUNTS[index] || ADMIN_ACCOUNTS[0];
      setCurrentUser(admin);
    } else {
      const student = students[index] || students[0];
      setCurrentUser(student);
    }
    setAuthError(null);
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthError(null);
  };

  // Update current student profile or registrations
  const updateStudentData = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (currentUser && currentUser.id === updatedStudent.id) {
      setCurrentUser(updatedStudent);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isStudent,
        loginStudent,
        loginAdmin,
        logout,
        switchDemoUser,
        updateStudentData,
        authError,
        setAuthError,
        adminAccounts: ADMIN_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
