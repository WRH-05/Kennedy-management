import { mockStudents, type Student } from "@/mocks/students"
import { mockTeachers, type Teacher } from "@/mocks/teachers"
import { mockCourses, type Course } from "@/mocks/courses"
import { mockPayments, type Payment } from "@/mocks/payments"

export class DataService {
  // Students
  static getStudents(): Student[] {
    return mockStudents
  }

  static getStudentById(id: number): Student | undefined {
    return mockStudents.find((student) => student.id === id)
  }

  static addStudent(student: Omit<Student, "id">): Student {
    const newStudent = { ...student, id: Math.max(...mockStudents.map((s) => s.id)) + 1 }
    mockStudents.push(newStudent)
    return newStudent
  }

  static updateStudent(id: number, updates: Partial<Student>): Student | undefined {
    const index = mockStudents.findIndex((student) => student.id === id)
    if (index !== -1) {
      mockStudents[index] = { ...mockStudents[index], ...updates }
      return mockStudents[index]
    }
    return undefined
  }

  static deleteStudent(id: number): boolean {
    const index = mockStudents.findIndex((student) => student.id === id)
    if (index !== -1) {
      mockStudents.splice(index, 1)
      return true
    }
    return false
  }

  // Teachers
  static getTeachers(): Teacher[] {
    return mockTeachers
  }

  static getTeacherById(id: number): Teacher | undefined {
    return mockTeachers.find((teacher) => teacher.id === id)
  }

  static addTeacher(teacher: Omit<Teacher, "id">): Teacher {
    const newTeacher = { ...teacher, id: Math.max(...mockTeachers.map((t) => t.id)) + 1 }
    mockTeachers.push(newTeacher)
    return newTeacher
  }

  static updateTeacher(id: number, updates: Partial<Teacher>): Teacher | undefined {
    const index = mockTeachers.findIndex((teacher) => teacher.id === id)
    if (index !== -1) {
      mockTeachers[index] = { ...mockTeachers[index], ...updates }
      return mockTeachers[index]
    }
    return undefined
  }

  static deleteTeacher(id: number): boolean {
    const index = mockTeachers.findIndex((teacher) => teacher.id === id)
    if (index !== -1) {
      mockTeachers.splice(index, 1)
      return true
    }
    return false
  }

  // Courses
  static getCourses(): Course[] {
    return mockCourses
  }

  static getCourseById(id: number): Course | undefined {
    return mockCourses.find((course) => course.id === id)
  }

  static addCourse(course: Omit<Course, "id">): Course {
    const newCourse = { ...course, id: Math.max(...mockCourses.map((c) => c.id)) + 1 }
    mockCourses.push(newCourse)
    return newCourse
  }

  static updateCourse(id: number, updates: Partial<Course>): Course | undefined {
    const index = mockCourses.findIndex((course) => course.id === id)
    if (index !== -1) {
      mockCourses[index] = { ...mockCourses[index], ...updates }
      return mockCourses[index]
    }
    return undefined
  }

  static deleteCourse(id: number): boolean {
    const index = mockCourses.findIndex((course) => course.id === id)
    if (index !== -1) {
      mockCourses.splice(index, 1)
      return true
    }
    return false
  }

  // Payments
  static getPayments(): Payment[] {
    return mockPayments
  }

  static getPaymentById(id: number): Payment | undefined {
    return mockPayments.find((payment) => payment.id === id)
  }

  static addPayment(payment: Omit<Payment, "id">): Payment {
    const newPayment = { ...payment, id: Math.max(...mockPayments.map((p) => p.id)) + 1 }
    mockPayments.push(newPayment)
    return newPayment
  }

  static updatePayment(id: number, updates: Partial<Payment>): Payment | undefined {
    const index = mockPayments.findIndex((payment) => payment.id === id)
    if (index !== -1) {
      mockPayments[index] = { ...mockPayments[index], ...updates }
      return mockPayments[index]
    }
    return undefined
  }

  static deletePayment(id: number): boolean {
    const index = mockPayments.findIndex((payment) => payment.id === id)
    if (index !== -1) {
      mockPayments.splice(index, 1)
      return true
    }
    return false
  }

  // Helper methods
  static getStudentCourses(studentId: number): Course[] {
    return mockCourses.filter((course) => course.enrolledStudents && course.enrolledStudents.includes(studentId))
  }

  static getTeacherCourses(teacherId: number): Course[] {
    return mockCourses.filter((course) => course.teacherId === teacherId)
  }

  static getPendingPayments(): Payment[] {
    return mockPayments.filter((payment) => payment.status === "pending")
  }

  static getPaymentsByMonth(month: string): Payment[] {
    return mockPayments.filter((payment) => payment.month === month)
  }
}
