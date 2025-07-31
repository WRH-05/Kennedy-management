export interface Course {
  id: number
  teacherId: number
  teacherName: string
  subject: string
  schoolYear: string
  schedule: string
  monthlyPrice: number
  enrolledStudents: number[]
  studentNames: string[]
  status: "active" | "completed" | "cancelled"
  payments: {
    students: Record<number, boolean>
    teacherPaid: boolean
  }
  percentageCut: number
  courseType: "Group" | "Individual"
  duration: number
  dayOfWeek: string
  startHour: string
  endHour: string
  price: number
  attendance?: Record<number, Record<string, boolean>>
}

export const mockCourses: Course[] = [
  {
    id: 1,
    teacherId: 1,
    teacherName: "Prof. Salim Benali",
    subject: "Mathematics",
    schoolYear: "3AS",
    schedule: "Monday 9:00-11:00",
    monthlyPrice: 500,
    enrolledStudents: [1],
    studentNames: ["Ahmed Ben Ali"],
    status: "active",
    payments: {
      students: { 1: true },
      teacherPaid: false,
    },
    percentageCut: 65,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Monday",
    startHour: "09:00",
    endHour: "11:00",
    price: 500,
    attendance: { 1: { week1: true, week2: false, week3: true, week4: false } },
  },
  {
    id: 2,
    teacherId: 2,
    teacherName: "Prof. Amina Khelifi",
    subject: "Chemistry",
    schoolYear: "2AS",
    schedule: "Tuesday 16:00-18:00",
    monthlyPrice: 450,
    enrolledStudents: [2],
    studentNames: ["Fatima Zahra"],
    status: "active",
    payments: {
      students: { 2: false },
      teacherPaid: false,
    },
    percentageCut: 60,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Tuesday",
    startHour: "16:00",
    endHour: "18:00",
    price: 450,
    attendance: { 2: { week1: false, week2: true, week3: false, week4: true } },
  },
  {
    id: 3,
    teacherId: 3,
    teacherName: "Prof. Omar Mansouri",
    subject: "Biology",
    schoolYear: "2AS",
    schedule: "Wednesday 14:00-16:00",
    monthlyPrice: 400,
    enrolledStudents: [3],
    studentNames: ["Omar Khaled"],
    status: "active",
    payments: {
      students: { 3: false },
      teacherPaid: false,
    },
    percentageCut: 55,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Wednesday",
    startHour: "14:00",
    endHour: "16:00",
    price: 400,
    attendance: { 3: { week1: true, week2: true, week3: false, week4: true } },
  },
]
