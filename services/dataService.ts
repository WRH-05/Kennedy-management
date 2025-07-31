import { mockStudents, type Student } from "@/mocks/students"
import { mockTeachers, type Teacher } from "@/mocks/teachers"
import { mockCourses, type Course } from "@/mocks/courses"
import { mockPayments, type PaymentRecord } from "@/mocks/payments"

// This service abstracts data access to make future API integration easier
export class DataService {
  // Students
  static getStudents(): Student[] {
    return mockStudents
  }

  static getStudentById(id: number): Student | undefined {
    return mockStudents.find((s) => s.id === id)
  }

  static addStudent(student: Omit<Student, "id">): Student {
    const newStudent = { ...student, id: Math.max(...mockStudents.map((s) => s.id)) + 1 }
    mockStudents.push(newStudent)
    return newStudent
  }

  static updateStudent(id: number, updates: Partial<Student>): Student | undefined {
    const index = mockStudents.findIndex((s) => s.id === id)
    if (index === -1) return undefined
    mockStudents[index] = { ...mockStudents[index], ...updates }
    return mockStudents[index]
  }

  // Teachers
  static getTeachers(): Teacher[] {
    return mockTeachers
  }

  static getTeacherById(id: number): Teacher | undefined {
    return mockTeachers.find((t) => t.id === id)
  }

  static addTeacher(teacher: Omit<Teacher, "id">): Teacher {
    const newTeacher = { ...teacher, id: Math.max(...mockTeachers.map((t) => t.id)) + 1 }
    mockTeachers.push(newTeacher)
    return newTeacher
  }

  static updateTeacher(id: number, updates: Partial<Teacher>): Teacher | undefined {
    const index = mockTeachers.findIndex((t) => t.id === id)
    if (index === -1) return undefined
    mockTeachers[index] = { ...mockTeachers[index], ...updates }
    return mockTeachers[index]
  }

  // Courses
  static getCourses(): Course[] {
    return mockCourses
  }

  static getCourseById(id: number): Course | undefined {
    return mockCourses.find((c) => c.id === id)
  }

  static addCourse(course: Omit<Course, "id">): Course {
    const newCourse = { ...course, id: Math.max(...mockCourses.map((c) => c.id)) + 1 }
    mockCourses.push(newCourse)
    return newCourse
  }

  static updateCourse(id: number, updates: Partial<Course>): Course | undefined {
    const index = mockCourses.findIndex((c) => c.id === id)
    if (index === -1) return undefined
    mockCourses[index] = { ...mockCourses[index], ...updates }
    return mockCourses[index]
  }

  static resetCourseForNewMonth(id: number, currentMonth: string): Course | undefined {
    const course = this.getCourseById(id)
    if (!course) return undefined

    // Move current data to history
    course.history.push({
      month: currentMonth,
      students: [...course.current.enrolledStudents],
      studentNames: [...course.current.studentNames],
      attendance: { ...course.current.attendance },
      payments: { ...course.current.payments },
    })

    // Reset current data
    course.current = {
      enrolledStudents: [...course.current.enrolledStudents], // Keep students enrolled
      studentNames: [...course.current.studentNames],
      payments: {
        students: Object.fromEntries(course.current.enrolledStudents.map((id) => [id, false])),
        teacherPaid: false,
      },
      attendance: Object.fromEntries(
        course.current.enrolledStudents.map((id) => [id, { week1: false, week2: false, week3: false, week4: false }]),
      ),
    }

    return course
  }

  // Payments
  static getPayments(): PaymentRecord[] {
    return mockPayments
  }

  static addPayment(payment: Omit<PaymentRecord, "id">): PaymentRecord {
    const newPayment = { ...payment, id: Math.max(...mockPayments.map((p) => p.id)) + 1 }
    mockPayments.push(newPayment)
    return newPayment
  }

  static updatePayment(id: number, updates: Partial<PaymentRecord>): PaymentRecord | undefined {
    const index = mockPayments.findIndex((p) => p.id === id)
    if (index === -1) return undefined
    mockPayments[index] = { ...mockPayments[index], ...updates }
    return mockPayments[index]
  }

  static approvePayment(id: number, approvedBy: string): PaymentRecord | undefined {
    return this.updatePayment(id, {
      status: "approved",
      approvedBy,
      approvedAt: new Date().toISOString(),
    })
  }
}
