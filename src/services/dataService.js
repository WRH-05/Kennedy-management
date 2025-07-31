// Data Service Layer
// This service provides a centralized interface for data access and manipulation
// Currently uses mock data, but will be easily replaceable with database calls in the future

import { students } from '../mocks/students.js';
import { teachers } from '../mocks/teachers.js';
import { courseTemplates, courseInstances } from '../mocks/courses.js';
import {
  mockRevenue,
  mockPayouts,
  mockStudentPaymentHistory,
  mockProfessorPaymentHistory,
  mockStudentData,
  mockTeacherData,
} from '../mocks/payments.js';

// Student Services
export const studentService = {
  // Get all students
  async getAllStudents() {
    // Simulate async database call
    return new Promise((resolve) => {
      setTimeout(() => resolve(students), 100);
    });
  },

  // Get student by ID
  async getStudentById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const student = students.find(s => s.id === parseInt(id));
        resolve(student);
      }, 100);
    });
  },

  // Add new student
  async addStudent(studentData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStudent = {
          id: Math.max(...students.map(s => s.id)) + 1,
          ...studentData,
        };
        students.push(newStudent);
        resolve(newStudent);
      }, 100);
    });
  },

  // Update student
  async updateStudent(id, updatedData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = students.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
          students[index] = { ...students[index], ...updatedData };
          resolve(students[index]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },

  // Delete student
  async deleteStudent(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = students.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
          const deletedStudent = students.splice(index, 1)[0];
          resolve(deletedStudent);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },
};

// Teacher Services
export const teacherService = {
  // Get all teachers
  async getAllTeachers() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(teachers), 100);
    });
  },

  // Get teacher by ID
  async getTeacherById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const teacher = teachers.find(t => t.id === parseInt(id));
        resolve(teacher);
      }, 100);
    });
  },

  // Add new teacher
  async addTeacher(teacherData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTeacher = {
          id: Math.max(...teachers.map(t => t.id)) + 1,
          ...teacherData,
        };
        teachers.push(newTeacher);
        resolve(newTeacher);
      }, 100);
    });
  },

  // Update teacher
  async updateTeacher(id, updatedData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = teachers.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
          teachers[index] = { ...teachers[index], ...updatedData };
          resolve(teachers[index]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },

  // Delete teacher
  async deleteTeacher(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = teachers.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
          const deletedTeacher = teachers.splice(index, 1)[0];
          resolve(deletedTeacher);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },
};

// Course Services
export const courseService = {
  // Get all course templates
  async getAllCourseTemplates() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(courseTemplates), 100);
    });
  },

  // Get all course instances
  async getAllCourseInstances() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(courseInstances), 100);
    });
  },

  // Get course template by ID
  async getCourseTemplateById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const template = courseTemplates.find(c => c.id === parseInt(id));
        resolve(template);
      }, 100);
    });
  },

  // Get course instance by ID
  async getCourseInstanceById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instance = courseInstances.find(c => c.id === parseInt(id));
        resolve(instance);
      }, 100);
    });
  },

  // Get courses by teacher ID
  async getCoursesByTeacherId(teacherId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const teacherCourses = courseInstances.filter(c => c.teacherId === parseInt(teacherId));
        resolve(teacherCourses);
      }, 100);
    });
  },

  // Get courses by student ID
  async getCoursesByStudentId(studentId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const studentCourses = courseInstances.filter(c => 
          c.enrolledStudents && c.enrolledStudents.includes(parseInt(studentId))
        );
        resolve(studentCourses);
      }, 100);
    });
  },

  // Add new course template
  async addCourseTemplate(templateData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate = {
          id: Math.max(...courseTemplates.map(c => c.id)) + 1,
          ...templateData,
        };
        courseTemplates.push(newTemplate);
        resolve(newTemplate);
      }, 100);
    });
  },

  // Add new course instance
  async addCourseInstance(instanceData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInstance = {
          id: Math.max(...courseInstances.map(c => c.id)) + 1,
          ...instanceData,
        };
        courseInstances.push(newInstance);
        resolve(newInstance);
      }, 100);
    });
  },

  // Update course instance
  async updateCourseInstance(id, updatedData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = courseInstances.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
          courseInstances[index] = { ...courseInstances[index], ...updatedData };
          resolve(courseInstances[index]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },

  // Enroll student in course
  async enrollStudent(courseId, studentId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const courseIndex = courseInstances.findIndex(c => c.id === parseInt(courseId));
        if (courseIndex !== -1) {
          if (!courseInstances[courseIndex].enrolledStudents) {
            courseInstances[courseIndex].enrolledStudents = [];
          }
          if (!courseInstances[courseIndex].enrolledStudents.includes(parseInt(studentId))) {
            courseInstances[courseIndex].enrolledStudents.push(parseInt(studentId));
          }
          resolve(courseInstances[courseIndex]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },
};

// Payment Services
export const paymentService = {
  // Get revenue data
  async getRevenueData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRevenue), 100);
    });
  },

  // Get pending payouts
  async getPendingPayouts() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPayouts), 100);
    });
  },

  // Get student payment history
  async getStudentPaymentHistory(studentId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = mockStudentPaymentHistory.filter(p => 
          p.studentId === parseInt(studentId)
        );
        resolve(payments);
      }, 100);
    });
  },

  // Get professor payment history
  async getProfessorPaymentHistory(professorId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = mockProfessorPaymentHistory.filter(p => 
          p.professorId === parseInt(professorId)
        );
        resolve(payments);
      }, 100);
    });
  },

  // Get student data for management
  async getStudentData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStudentData), 100);
    });
  },

  // Get teacher data for management
  async getTeacherData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTeacherData), 100);
    });
  },

  // Update payment status
  async updatePaymentStatus(paymentId, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payoutIndex = mockPayouts.findIndex(p => p.id === parseInt(paymentId));
        if (payoutIndex !== -1) {
          mockPayouts[payoutIndex].status = status;
          resolve(mockPayouts[payoutIndex]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },

  // Toggle student payment for course
  async toggleStudentPayment(courseId, studentId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const courseIndex = courseInstances.findIndex(c => c.id === parseInt(courseId));
        if (courseIndex !== -1 && courseInstances[courseIndex].payments) {
          const currentStatus = courseInstances[courseIndex].payments.students[studentId];
          courseInstances[courseIndex].payments.students[studentId] = !currentStatus;
          resolve(courseInstances[courseIndex]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },
};

// Attendance Services
export const attendanceService = {
  // Update attendance for student in course
  async updateAttendance(courseId, studentId, week, attended) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const courseIndex = courseInstances.findIndex(c => c.id === parseInt(courseId));
        if (courseIndex !== -1) {
          if (!courseInstances[courseIndex].attendance) {
            courseInstances[courseIndex].attendance = {};
          }
          if (!courseInstances[courseIndex].attendance[studentId]) {
            courseInstances[courseIndex].attendance[studentId] = {};
          }
          courseInstances[courseIndex].attendance[studentId][week] = attended;
          resolve(courseInstances[courseIndex]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  },

  // Get attendance for course
  async getCourseAttendance(courseId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const course = courseInstances.find(c => c.id === parseInt(courseId));
        resolve(course ? course.attendance : null);
      }, 100);
    });
  },
};

// Combined export for easy importing
export const dataService = {
  students: studentService,
  teachers: teacherService,
  courses: courseService,
  payments: paymentService,
  attendance: attendanceService,
};

export default dataService;
