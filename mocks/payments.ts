export interface PaymentRecord {
  id: number
  type: "student" | "teacher"
  studentId?: number
  teacherId?: number
  courseId: number
  courseName: string
  amount: number
  month: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: string
  createdBy: string
  createdAt: string
}

export const mockPayments: PaymentRecord[] = [
  {
    id: 1,
    type: "student",
    studentId: 1,
    courseId: 1,
    courseName: "Mathematics - 3AS",
    amount: 500,
    month: "2025-02",
    status: "approved",
    approvedBy: "manager",
    approvedAt: "2025-02-01T10:00:00Z",
    createdBy: "receptionist",
    createdAt: "2025-01-28T14:30:00Z",
  },
  {
    id: 2,
    type: "student",
    studentId: 2,
    courseId: 2,
    courseName: "Chemistry - 2AS",
    amount: 450,
    month: "2025-02",
    status: "pending",
    createdBy: "receptionist",
    createdAt: "2025-01-30T09:15:00Z",
  },
  {
    id: 3,
    type: "teacher",
    teacherId: 1,
    courseId: 1,
    courseName: "Mathematics - 3AS",
    amount: 325,
    month: "2025-02",
    status: "pending",
    createdBy: "receptionist",
    createdAt: "2025-02-01T16:45:00Z",
  },
  {
    id: 4,
    type: "teacher",
    teacherId: 2,
    courseId: 2,
    courseName: "Chemistry - 2AS",
    amount: 270,
    month: "2025-02",
    status: "approved",
    approvedBy: "manager",
    approvedAt: "2025-02-02T11:20:00Z",
    createdBy: "receptionist",
    createdAt: "2025-02-01T13:10:00Z",
  },
]
