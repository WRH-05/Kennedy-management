import { mockStudents, type Student } from "@/mocks/students"
import { mockTeachers, type Teacher } from "@/mocks/teachers"
import { mockCourses, type Course } from "@/mocks/courses"
import { mockPayments, type PaymentRecord } from "@/mocks/payments"

// This service abstracts data access and can be easily swapped for real API calls
export class DataService {
  // Students
  static getStudents(): Student[] {
    return [...mockStudents]
  }

  static getStudentById(id: number): Student | null {
    return mockStudents.find((student) => student.id === id) || null
  }

  static addStudent(studentData: Omit<Student, "id" | "registrationDate" | "documents">): Student {
    const newStudent: Student = {
      ...studentData,
      id: Math.max(...mockStudents.map((s) => s.id)) + 1,
      registrationDate: new Date().toISOString().split("T")[0],
      documents: {
        photos: { uploaded: false, filename: null },
        copyOfId: { uploaded: false, filename: null },
        registrationForm: { uploaded: false, filename: null },
      },
    }
    mockStudents.push(newStudent)
    return newStudent
  }

  static updateStudent(id: number, updates: Partial<Student>): Student | null {
    const index = mockStudents.findIndex((student) => student.id === id)
    if (index === -1) return null
    mockStudents[index] = { ...mockStudents[index], ...updates }
    return mockStudents[index]
  }

  // Teachers
  static getTeachers(): Teacher[] {
    return [...mockTeachers]
  }

  static getTeacherById(id: number): Teacher | null {
    return mockTeachers.find((teacher) => teacher.id === id) || null
  }

  static addTeacher(teacherData: Omit<Teacher, "id" | "totalStudents" | "monthlyEarnings" | "joinDate">): Teacher {
    const newTeacher: Teacher = {
      ...teacherData,
      id: Math.max(...mockTeachers.map((t) => t.id)) + 1,
      totalStudents: 0,
      monthlyEarnings: 0,
      joinDate: new Date().toISOString().split("T")[0],
    }
    mockTeachers.push(newTeacher)
    return newTeacher
  }

  static updateTeacher(id: number, updates: Partial<Teacher>): Teacher | null {
    const index = mockTeachers.findIndex((teacher) => teacher.id === id)
    if (index === -1) return null
    mockTeachers[index] = { ...mockTeachers[index], ...updates }
    return mockTeachers[index]
  }

  // Courses
  static getCourses(): Course[] {
    return [...mockCourses]
  }

  static getCourseById(id: number): Course | null {
    return mockCourses.find((course) => course.id === id) || null
  }

  static addCourse(courseData: Omit<Course, "id" | "studentNames">): Course {
    const newCourse: Course = {
      ...courseData,
      id: Math.max(...mockCourses.map((c) => c.id)) + 1,
      studentNames: [],
    }
    mockCourses.push(newCourse)
    return newCourse
  }

  static updateCourse(id: number, updates: Partial<Course>): Course | null {
    const index = mockCourses.findIndex((course) => course.id === id)
    if (index === -1) return null
    mockCourses[index] = { ...mockCourses[index], ...updates }
    return mockCourses[index]
  }

  // Payments
  static getPayments(): PaymentRecord[] {
    return [...mockPayments]
  }

  static getPaymentById(id: number): PaymentRecord | null {
    return mockPayments.find((payment) => payment.id === id) || null
  }

  static addPayment(paymentData: Omit<PaymentRecord, "id" | "createdAt">): PaymentRecord {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: Math.max(...mockPayments.map((p) => p.id)) + 1,
      createdAt: new Date().toISOString(),
    }
    mockPayments.push(newPayment)
    return newPayment
  }

  static updatePayment(id: number, updates: Partial<PaymentRecord>): PaymentRecord | null {
    const index = mockPayments.findIndex((payment) => payment.id === id)
    if (index === -1) return null
    mockPayments[index] = { ...mockPayments[index], ...updates }
    return mockPayments[index]
  }

  static approvePayment(id: number, approvedBy: string): PaymentRecord | null {
    const payment = this.getPaymentById(id)
    if (!payment) return null

    return this.updatePayment(id, {
      status: "approved",
      approvedBy,
      approvedAt: new Date().toISOString(),
    })
  }

  // Helper methods
  static getStudentCourses(studentId: number): Course[] {
    return mockCourses.filter((course) => course.enrolledStudents.includes(studentId))
  }

  static getTeacherCourses(teacherId: number): Course[] {
    return mockCourses.filter((course) => course.teacherId === teacherId)
  }

  static getPaymentsByMonth(month: string): PaymentRecord[] {
    return mockPayments.filter((payment) => payment.month === month)
  }

  static getPendingPayments(): PaymentRecord[] {
    return mockPayments.filter((payment) => payment.status === "pending")
  }
}
