import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_ACCOUNTS, ADMIN_WHITELIST, TEACHER_WHITELIST, INITIAL_TEACHERS, INITIAL_STUDENTS } from '../data/mockUsers';
import { storageService } from '../services/storageService';
import { realtimeService } from '../services/realtimeService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storageService.getCurrentUser());
  const [students, setStudents] = useState(() => storageService.getStudents());
  const [teachers, setTeachers] = useState(() => storageService.getTeachers());
  const [announcements, setAnnouncements] = useState(() => storageService.getAnnouncements());
  const [liveAnnouncement, setLiveAnnouncement] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    storageService.saveStudents(students);
  }, [students]);

  useEffect(() => {
    storageService.saveTeachers(teachers);
  }, [teachers]);

  useEffect(() => {
    storageService.saveAnnouncements(announcements);
  }, [announcements]);

  // Real-time student sync across tabs/devices (Requirement 2 & 3)
  useEffect(() => {
    const unsubStudent = realtimeService.subscribe('system_sync', 'student_updated', (payload) => {
      if (payload?.student) {
        setStudents(prev => {
          const exists = prev.some(s => s.id === payload.student.id || s.studentId === payload.student.studentId);
          if (exists) {
            return prev.map(s => s.studentId === payload.student.studentId ? payload.student : s);
          }
          return [payload.student, ...prev];
        });
      }
    });

    // Real-time Announcements from Teachers / Arbiters
    const unsubAnnounce = realtimeService.subscribe('system_broadcast', 'announcement', (payload) => {
      if (payload) {
        setAnnouncements(prev => [payload, ...prev.slice(0, 19)]);
        setLiveAnnouncement(payload);
        // Clear live popup after 8 seconds
        setTimeout(() => {
          setLiveAnnouncement(null);
        }, 8000);
      }
    });

    return () => {
      unsubStudent();
      unsubAnnounce();
    };
  }, []);

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
      const errorMsg = 'เลขประจำตัวนักเรียนหรือรหัสผ่านเฉพาะตัว (Private PIN) ไม่ถูกต้อง';
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
      const errorMsg = `เลขประจำตัวนักเรียน ${cleanId} มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบด้วย Private PIN ของคุณ`;
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }

    const newStudent = {
      id: 'student_' + Date.now(),
      studentId: cleanId,
      privatePin: cleanPin,
      name: studentData.name.trim(),
      school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
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

    // Broadcast update across devices & windows in Real-time
    realtimeService.sendEvent('system_sync', 'student_updated', { student: newStudent });

    return { success: true, user: newStudent };
  };

  // Login for Teachers / Arbiters (Strict Whitelist from โรงเรียนบรรหารแจ่มใสวิทยา 3)
  const loginTeacher = (email, password) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // Whitelist check
    const isWhitelisted = TEACHER_WHITELIST.some(w => w.toLowerCase() === cleanEmail) ||
      teachers.some(t => t.email.toLowerCase() === cleanEmail);

    if (!isWhitelisted) {
      const errorMsg = 'การเข้าถึงถูกปฏิเสธ: บัญชีอีเมลนี้ไม่อยู่ในฐานข้อมูลครูกลุ่มสาระฯ หรือกรรมการที่ได้รับอนุมัติ (ห้ามบุคคลภายนอกหรือนักเรียนแอบอ้าง)';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }

    const teacher = teachers.find(
      t => t.email.toLowerCase() === cleanEmail && t.password === password
    );

    if (teacher) {
      setCurrentUser(teacher);
      return { success: true, user: teacher };
    } else {
      const errorMsg = 'รหัสผ่านครูผู้ดูแล / กรรมการไม่ถูกต้อง';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
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

  // Teacher / Admin broadcast announcement
  const sendTeacherAnnouncement = (title, message, urgency = 'normal') => {
    const item = {
      id: 'ann_' + Date.now(),
      title,
      message,
      urgency, // 'normal', 'urgent'
      sender: currentUser?.name || 'ครูผู้ดูแลการแข่งขัน',
      school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
      timestamp: new Date().toISOString()
    };

    setAnnouncements(prev => [item, ...prev]);
    setLiveAnnouncement(item);
    realtimeService.sendEvent('system_broadcast', 'announcement', item);
    return item;
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
    realtimeService.sendEvent('system_sync', 'student_updated', { student: updatedStudent });
  };

  // Strict RBAC
  const isAdmin = currentUser?.role === 'admin' && ADMIN_WHITELIST.includes(currentUser?.email?.toLowerCase());
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isTeacher,
        isStudent,
        loginStudent,
        registerStudent,
        loginTeacher,
        loginAdmin,
        logout,
        updateStudentData,
        sendTeacherAnnouncement,
        announcements,
        liveAnnouncement,
        setLiveAnnouncement,
        authError,
        setAuthError,
        adminAccounts: ADMIN_ACCOUNTS,
        adminWhitelist: ADMIN_WHITELIST,
        teacherWhitelist: TEACHER_WHITELIST,
        teachers,
        students
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
