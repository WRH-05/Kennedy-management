// Simplified data service that uses Supabase directly
// All mock data fallback has been removed since Supabase is now fully integrated

import { databaseService as supabaseDataService } from './databaseService.js'

// Student Services - Direct Supabase calls
export const studentService = {
  async getAllStudents(includeArchived = false) {
    return await supabaseDataService.students.getAllStudents(includeArchived)
  },

  async getStudentById(id) {
    return await supabaseDataService.students.getStudentById(id)
  },

  async addStudent(studentData) {
    return await supabaseDataService.students.addStudent(studentData)
  },

  async updateStudent(id, updatedData) {
    return await supabaseDataService.students.updateStudent(id, updatedData)
  },

  async deleteStudent(id) {
    return await supabaseDataService.students.deleteStudent(id)
  },

  async archiveStudent(id) {
    return await supabaseDataService.students.archiveStudent(id)
  },

  async unarchiveStudent(id) {
    return await supabaseDataService.students.unarchiveStudent(id)
  },
}

// Teacher Services - Direct Supabase calls
export const teacherService = {
  async getAllTeachers(includeArchived = false) {
    return await supabaseDataService.teachers.getAllTeachers(includeArchived)
  },

  async getTeacherById(id) {
    return await supabaseDataService.teachers.getTeacherById(id)
  },

  async addTeacher(teacherData) {
    return await supabaseDataService.teachers.addTeacher(teacherData)
  },

  async updateTeacher(id, updatedData) {
    return await supabaseDataService.teachers.updateTeacher(id, updatedData)
  },

  async deleteTeacher(id) {
    return await supabaseDataService.teachers.deleteTeacher(id)
  },

  async archiveTeacher(id) {
    return await supabaseDataService.teachers.archiveTeacher(id)
  },

  async unarchiveTeacher(id) {
    return await supabaseDataService.teachers.unarchiveTeacher(id)
  },
}

// Course Services - Direct Supabase calls
export const courseService = {
  async getAllCourseInstances(includeArchived = false) {
    return await supabaseDataService.courses.getAllCourseInstances(includeArchived)
  },

  async getCourseInstanceById(id) {
    return await supabaseDataService.courses.getCourseInstanceById(id)
  },

  async getCoursesByTeacherId(teacherId) {
    return await supabaseDataService.courses.getCoursesByTeacherId(teacherId)
  },

  async getCoursesByStudentId(studentId) {
    return await supabaseDataService.courses.getCoursesByStudentId(studentId)
  },

  async addCourseInstance(instanceData) {
    return await supabaseDataService.courses.addCourseInstance(instanceData)
  },

  async updateCourseInstance(id, updatedData) {
    return await supabaseDataService.courses.updateCourseInstance(id, updatedData)
  },

  async archiveCourse(id) {
    return await supabaseDataService.courses.archiveCourse(id)
  },

  async unarchiveCourse(id) {
    return await supabaseDataService.courses.unarchiveCourse(id)
  },
}

// Payment Services - Direct Supabase calls
export const paymentService = {
  async getRevenueData() {
    return await supabaseDataService.payments.getRevenueData()
  },

  async getPendingPayouts() {
    return await supabaseDataService.payments.getPendingPayouts()
  },

  async getAllPayouts() {
    return await supabaseDataService.payments.getAllPayouts()
  },

  async getStudentPaymentHistory(studentId) {
    return await supabaseDataService.payments.getStudentPaymentHistory(studentId)
  },

  async getProfessorPaymentHistory(professorId) {
    return await supabaseDataService.payments.getProfessorPaymentHistory(professorId)
  },

  async getStudentData() {
    return await supabaseDataService.payments.getStudentData()
  },

  async getTeacherData() {
    return await supabaseDataService.payments.getTeacherData()
  },

  /**
   * @param {string} paymentId
   * @param {string} status
   * @param {string | null} [approverName]
   */
  async updatePaymentStatus(paymentId, status, approverName = null) {
    return await supabaseDataService.payments.updatePaymentStatus(paymentId, status, approverName)
  },

  async getAllPayments() {
    return await supabaseDataService.payments.getAllPayments()
  },

  async toggleStudentPayment(courseId, studentId) {
    return await supabaseDataService.payments.toggleStudentPayment(courseId, studentId)
  },

  async toggleTeacherPayment(courseId, teacherId, amount, percentage) {
    return await supabaseDataService.payments.toggleTeacherPayment(courseId, teacherId, amount, percentage)
  },

  async isTeacherPaidForMonth(teacherId, month = null) {
    return await supabaseDataService.payments.isTeacherPaidForMonth(teacherId, month)
  },
}

// Attendance Services - Direct Supabase calls
export const attendanceService = {
  async updateAttendance(courseId, studentId, week, attended) {
    return await supabaseDataService.attendance.updateAttendance(courseId, studentId, week, attended)
  },

  async getCourseAttendance(courseId) {
    return await supabaseDataService.attendance.getCourseAttendance(courseId)
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
