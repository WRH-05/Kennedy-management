export interface CourseHistoryEntry {
  month: string
  students: number[]
  studentNames: string[]
  attendance: Record<number, Record<string, boolean>>
  payments: {
    students: Record<number, boolean>
    teacherPaid: boolean
  }
}

export interface Course {
  id: number
  teacherId: number
  teacherName: string
  subject: string
  schoolYear: string
  schedule: string
  price: number
  courseType: "Group" | "Individual"
  duration: number
  dayOfWeek: string
  startHour: string
  endHour: string
  percentageCut: number
  status: "active" | "completed"
  nextSession?: string
  current: {
    enrolledStudents: number[]
    studentNames: string[]
    payments: {
      students: Record<number, boolean>
      teacherPaid: boolean
    }
    attendance: Record<number, Record<string, boolean>>
  }
  history: CourseHistoryEntry[]
}

export const mockCourses: Course[] = [
  {
    id: 1,
    teacherId: 1,
    teacherName: "Prof. Salim Benali",
    subject: "Mathematics",
    schoolYear: "3AS",
    schedule: "Monday 9:00-11:00",
    price: 500,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Monday",
    startHour: "09:00",
    endHour: "11:00",
    percentageCut: 65,
    status: "active",
    nextSession: "2025-02-03",
    current: {
      enrolledStudents: [1],
      studentNames: ["Ahmed Ben Ali"],
      payments: {
        students: { 1: true },
        teacherPaid: false,
      },
      attendance: { 1: { week1: true, week2: false, week3: true, week4: false } },
    },
    history: [
      {
        month: "2025-01",
        students: [1],
        studentNames: ["Ahmed Ben Ali"],
        attendance: { 1: { week1: true, week2: true, week3: false, week4: true } },
        payments: {
          students: { 1: true },
          teacherPaid: true,
        },
      },
    ],
  },
  {
    id: 2,
    teacherId: 2,
    teacherName: "Prof. Amina Khelifi",
    subject: "Chemistry",
    schoolYear: "2AS",
    schedule: "Tuesday 16:00-18:00",
    price: 450,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Tuesday",
    startHour: "16:00",
    endHour: "18:00",
    percentageCut: 60,
    status: "active",
    nextSession: "2025-02-04",
    current: {
      enrolledStudents: [2],
      studentNames: ["Fatima Zahra"],
      payments: {
        students: { 2: false },
        teacherPaid: false,
      },
      attendance: { 2: { week1: false, week2: true, week3: false, week4: true } },
    },
    history: [],
  },
  {
    id: 3,
    teacherId: 3,
    teacherName: "Prof. Omar Mansouri",
    subject: "Biology",
    schoolYear: "1AS",
    schedule: "Wednesday 14:00-16:00",
    price: 400,
    courseType: "Group",
    duration: 2,
    dayOfWeek: "Wednesday",
    startHour: "14:00",
    endHour: "16:00",
    percentageCut: 55,
    status: "completed",
    nextSession: "2025-02-05",
    current: {
      enrolledStudents: [3],
      studentNames: ["Omar Khaled"],
      payments: {
        students: { 3: true },
        teacherPaid: true,
      },
      attendance: { 3: { week1: true, week2: true, week3: true, week4: false } },
    },
    history: [
      {
        month: "2024-12",
        students: [3],
        studentNames: ["Omar Khaled"],
        attendance: { 3: { week1: true, week2: true, week3: true, week4: true } },
        payments: {
          students: { 3: true },
          teacherPaid: true,
        },
      },
    ],
  },
]
