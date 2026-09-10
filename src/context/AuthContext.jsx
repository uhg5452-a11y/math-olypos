import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_ACCOUNTS, ADMIN_WHITELIST, INITIAL_STUDENTS } from '../data/mockUsers';
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

  // Login for Students with Student ID + Individual Private PIN
  const loginStudent = (studentId, privatePin) => {
    setAuthError(null);
    const cleanId = studentId.trim().toUpperCase();
    const cleanPin = (privatePin || '').trim();

    const student = students.find(
      s => s.studentId.toUpperCase() === cleanId && s.privatePin === cleanPin
    );

    if (student) {
      setCurrentUser(student);
      return { success: true, user: student };
    } else {
      const errorMsg = 'รหัสนักเรียนหรือรหัสเฉพาะส่วนตัว (Private PIN) ไม่ถูกต้อง';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Register New School Student with their own unique Private PIN
  const registerStudent = (studentData) => {
    setAuthError(null);
    const cleanId = studentData.studentId.trim().toUpperCase();
    const cleanPin = studentData.privatePin.trim();

    // Check if Student ID already exists
    const existing = students.find(s => s.studentId.toUpperCase() === cleanId);
    if (existing) {
      const errorMsg = `รหัสนักเรียน ${cleanId} มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบด้วย Private PIN ของคุณ`;
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }

    const newStudent = {
      id: 'student_' + Date.now(),
      studentId: cleanId,
      privatePin: cleanPin,
      name: studentData.name.trim(),
      school: studentData.school.trim() || 'โรงเรียนตัวแทนศูนย์คณิตศาสตร์',
      grade: studentData.grade.trim() || 'มัธยมศึกษา',
      role: 'student',
      elo: 1500,
      avatar: '🧑‍🎓',
      registeredTournaments: [],
      stats: {
        mathElo: 1500,
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        practiceCompleted: 0
      }
    };

    const updatedList = [newStudent, ...students];
    setStudents(updatedList);
    setCurrentUser(newStudent);
    return { success: true, user: newStudent };
  };

  // Login for Admins (Strict Whitelist of the 2 creator accounts)
  const loginAdmin = (email, password) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // Check strict whitelist
    if (!ADMIN_WHITELIST.includes(cleanEmail)) {
      const errorMsg = 'การเข้าถึงถูกปฏิเสธ: อีเมลนี้ไม่ได้รับอนุญาตในระบบ Whitelist แอดมิน (จำกัดเฉพาะ 2 บัญชีผู้สร้างเท่านั้น)';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }

    const admin = ADMIN_ACCOUNTS.find(
      a => a.email.toLowerCase() === cleanEmail && a.password === password
    );

    if (admin) {
      setCurrentUser(admin);
      return { success: true, user: admin };
    } else {
      const errorMsg = 'รหัสผ่านแอดมินไม่ถูกต้อง';
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

  const isAdmin = currentUser?.role === 'admin' && ADMIN_WHITELIST.includes(currentUser?.email?.toLowerCase());
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isStudent,
        loginStudent,
        registerStudent,
        loginAdmin,
        logout,
        switchDemoUser,
        updateStudentData,
        authError,
        setAuthError,
        adminAccounts: ADMIN_ACCOUNTS,
        adminWhitelist: ADMIN_WHITELIST,
        students
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
