export interface CourseHistory {
  month: string
  students: number[]
  attendance: Record<number, boolean[]>
  payments: {
    students: Record<number, boolean>
    teacherPaid: boolean
  }
  completedSessions: number
}

export interface Course {
  id: number
  templateId?: number
  teacherId: number
  teacherName: string
  subject: string
  schoolYear: string
  schedule: string
  monthlyPrice?: number
  price: number
  enrolledStudents: number[]
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
  current: {
    students: number[]
    attendance: Record<number, boolean[]>
    payments: {
      students: Record<number, boolean>
      teacherPaid: boolean
    }
  }
  history: CourseHistory[]
}

export const mockCourses: Course[] = [
  {
    id: 1,
    templateId: 1,
    teacherId: 1,
    teacherName: "Prof. Salim Benali",
    subject: "Mathematics",
    schoolYear: "3AS",
    schedule: "Monday 9:00-11:00",
    monthlyPrice: 500,
    price: 500,
    enrolledStudents: [1],
    status: "active",
    payments: {
      students: { 1: true },
      teacherPaid: false,
    },
    percentageCut: 50,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Monday",
    startHour: "09:00",
    endHour: "11:00",
    current: {
      students: [1],
      attendance: { 1: [true, true, false, true] },
      payments: {
        students: { 1: true },
        teacherPaid: false,
      },
    },
    history: [
      {
        month: "2024-11",
        students: [1],
        attendance: { 1: [true, true, true, true] },
        payments: {
          students: { 1: true },
          teacherPaid: true,
        },
        completedSessions: 4,
      },
    ],
  },
  {
    id: 2,
    templateId: 2,
    teacherId: 2,
    teacherName: "Prof. Amina Khelifi",
    subject: "Chemistry",
    schoolYear: "2AS",
    schedule: "Tuesday 16:00-18:00",
    monthlyPrice: 450,
    price: 450,
    enrolledStudents: [2, 3],
    status: "active",
    payments: {
      students: { 2: false, 3: false },
      teacherPaid: false,
    },
    percentageCut: 50,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Tuesday",
    startHour: "16:00",
    endHour: "18:00",
    current: {
      students: [2, 3],
      attendance: { 2: [true, false, true], 3: [false, true, true] },
      payments: {
        students: { 2: false, 3: false },
        teacherPaid: false,
      },
    },
    history: [],
  },
]
