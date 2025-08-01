// Migration utility to switch between mock data and Supabase
// This allows you to test Supabase integration while keeping mock data as fallback

import { dataService as mockDataService } from './dataService.js'
import { databaseService as supabaseDataService } from './databaseService.js'

// Feature flag to switch between mock and real database
const USE_SUPABASE = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'

// Add a debug function to check which service is being used
export const getDataSourceInfo = () => {
  return {
    usingSupabase: USE_SUPABASE,
    nodeEnv: process.env.NODE_ENV,
    useSupabaseFlag: process.env.NEXT_PUBLIC_USE_SUPABASE,
    dataSource: USE_SUPABASE ? 'Supabase Database' : 'Mock Data'
  }
}

// Wrapper service that chooses between mock and Supabase based on configuration
export const studentService = {
  async getAllStudents(includeArchived = false) {
    console.log('🔍 Data Source Check:', {
      usingSupabase: USE_SUPABASE,
      nodeEnv: process.env.NODE_ENV,
      useSupabaseFlag: process.env.NEXT_PUBLIC_USE_SUPABASE,
      dataSource: USE_SUPABASE ? 'Supabase Database' : 'Mock Data'
    })
    
    if (USE_SUPABASE) {
      return await supabaseDataService.students.getAllStudents(includeArchived)
    } else {
      const students = await mockDataService.students.getAllStudents()
      return includeArchived ? students : students.filter(s => !s.archived)
    }
  },

  async getStudentById(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.students.getStudentById(id)
    } else {
      return await mockDataService.students.getStudentById(id)
    }
  },

  async addStudent(studentData) {
    if (USE_SUPABASE) {
      return await supabaseDataService.students.addStudent(studentData)
    } else {
      return await mockDataService.students.addStudent(studentData)
    }
  },

  async updateStudent(id, updatedData) {
    if (USE_SUPABASE) {
      return await supabaseDataService.students.updateStudent(id, updatedData)
    } else {
      return await mockDataService.students.updateStudent(id, updatedData)
    }
  },

  async deleteStudent(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.students.deleteStudent(id)
    } else {
      return await mockDataService.students.deleteStudent(id)
    }
  },

  async archiveStudent(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.students.archiveStudent(id)
    } else {
      return await mockDataService.students.archiveStudent(id)
    }
  },

  async unarchiveStudent(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.students.unarchiveStudent(id)
    } else {
      return await mockDataService.students.unarchiveStudent(id)
    }
  },
}

export const teacherService = {
  async getAllTeachers(includeArchived = false) {
    if (USE_SUPABASE) {
      return await supabaseDataService.teachers.getAllTeachers(includeArchived)
    } else {
      const teachers = await mockDataService.teachers.getAllTeachers()
      return includeArchived ? teachers : teachers.filter(t => !t.archived)
    }
  },

  async getTeacherById(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.teachers.getTeacherById(id)
    } else {
      return await mockDataService.teachers.getTeacherById(id)
    }
  },

  async addTeacher(teacherData) {
    if (USE_SUPABASE) {
      return await supabaseDataService.teachers.addTeacher(teacherData)
    } else {
      return await mockDataService.teachers.addTeacher(teacherData)
    }
  },

  async updateTeacher(id, updatedData) {
    if (USE_SUPABASE) {
      return await supabaseDataService.teachers.updateTeacher(id, updatedData)
    } else {
      return await mockDataService.teachers.updateTeacher(id, updatedData)
    }
  },

  async deleteTeacher(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.teachers.deleteTeacher(id)
    } else {
      return await mockDataService.teachers.deleteTeacher(id)
    }
  },

  async archiveTeacher(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.teachers.archiveTeacher(id)
    } else {
      return await mockDataService.teachers.archiveTeacher(id)
    }
  },

  async unarchiveTeacher(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.teachers.unarchiveTeacher(id)
    } else {
      return await mockDataService.teachers.unarchiveTeacher(id)
    }
  },
}

export const courseService = {
  async getAllCourseInstances(includeArchived = false) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.getAllCourseInstances(includeArchived)
    } else {
      const courses = await mockDataService.courses.getAllCourseInstances()
      return includeArchived ? courses : courses.filter(c => !c.archived)
    }
  },

  async getCourseInstanceById(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.getCourseInstanceById(id)
    } else {
      return await mockDataService.courses.getCourseInstanceById(id)
    }
  },

  async getCoursesByTeacherId(teacherId) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.getCoursesByTeacherId(teacherId)
    } else {
      return await mockDataService.courses.getCoursesByTeacherId(teacherId)
    }
  },

  async getCoursesByStudentId(studentId) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.getCoursesByStudentId(studentId)
    } else {
      return await mockDataService.courses.getCoursesByStudentId(studentId)
    }
  },

  async addCourseInstance(instanceData) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.addCourseInstance(instanceData)
    } else {
      return await mockDataService.courses.addCourseInstance(instanceData)
    }
  },

  async updateCourseInstance(id, updatedData) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.updateCourseInstance(id, updatedData)
    } else {
      return await mockDataService.courses.updateCourseInstance(id, updatedData)
    }
  },

  async archiveCourse(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.archiveCourse(id)
    } else {
      return await mockDataService.courses.archiveCourse(id)
    }
  },

  async unarchiveCourse(id) {
    if (USE_SUPABASE) {
      return await supabaseDataService.courses.unarchiveCourse(id)
    } else {
      return await mockDataService.courses.unarchiveCourse(id)
    }
  },
}

// Payment Services
export const paymentService = {
  async getRevenueData() {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.getRevenueData()
    } else {
      return await mockDataService.payments.getRevenueData()
    }
  },

  async getPendingPayouts() {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.getPendingPayouts()
    } else {
      return await mockDataService.payments.getPendingPayouts()
    }
  },

  async getStudentPaymentHistory(studentId) {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.getStudentPaymentHistory(studentId)
    } else {
      return await mockDataService.payments.getStudentPaymentHistory(studentId)
    }
  },

  async getProfessorPaymentHistory(professorId) {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.getProfessorPaymentHistory(professorId)
    } else {
      return await mockDataService.payments.getProfessorPaymentHistory(professorId)
    }
  },

  async getStudentData() {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.getStudentData()
    } else {
      return await mockDataService.payments.getStudentData()
    }
  },

  async getTeacherData() {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.getTeacherData()
    } else {
      return await mockDataService.payments.getTeacherData()
    }
  },

  async updatePaymentStatus(paymentId, status, approverName = null) {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.updatePaymentStatus(paymentId, status, approverName)
    } else {
      return await mockDataService.payments.updatePaymentStatus(paymentId, status, approverName)
    }
  },

  async getAllPayments() {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.getAllPayments()
    } else {
      return await mockDataService.payments.getAllPayments()
    }
  },

  async toggleStudentPayment(courseId, studentId) {
    if (USE_SUPABASE) {
      return await supabaseDataService.payments.toggleStudentPayment(courseId, studentId)
    } else {
      return await mockDataService.payments.toggleStudentPayment(courseId, studentId)
    }
  },
}

// Attendance Services
export const attendanceService = {
  async updateAttendance(courseId, studentId, week, attended) {
    if (USE_SUPABASE) {
      return await supabaseDataService.attendance.updateAttendance(courseId, studentId, week, attended)
    } else {
      return await mockDataService.attendance.updateAttendance(courseId, studentId, week, attended)
    }
  },

  async getCourseAttendance(courseId) {
    if (USE_SUPABASE) {
      return await supabaseDataService.attendance.getCourseAttendance(courseId)
    } else {
      return await mockDataService.attendance.getCourseAttendance(courseId)
    }
  },
}

// Export unified service
export const appDataService = {
  students: studentService,
  teachers: teacherService,
  courses: courseService,
  payments: paymentService,
  attendance: attendanceService,
}

export default appDataService
