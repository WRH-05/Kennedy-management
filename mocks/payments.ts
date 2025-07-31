export interface Payment {
  id: number
  type: "student" | "teacher"
  studentId?: number
  teacherId?: number
  courseId: number
  amount: number
  month: string
  status: "pending" | "approved" | "rejected"
  createdBy: string
  createdByRole: "receptionist" | "manager"
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  description: string
}

export const mockPayments: Payment[] = [
  {
    id: 1,
    type: "student",
    studentId: 1,
    courseId: 1,
    amount: 500,
    month: "2024-12",
    status: "approved",
    createdBy: "receptionist1",
    createdByRole: "receptionist",
    createdAt: "2024-12-01T10:00:00Z",
    approvedBy: "manager1",
    approvedAt: "2024-12-01T14:00:00Z",
    description: "Mathematics course payment for Ahmed Ben Ali",
  },
  {
    id: 2,
    type: "student",
    studentId: 2,
    courseId: 2,
    amount: 450,
    month: "2024-12",
    status: "pending",
    createdBy: "receptionist1",
    createdByRole: "receptionist",
    createdAt: "2024-12-05T09:00:00Z",
    description: "Chemistry course payment for Fatima Zahra",
  },
  {
    id: 3,
    type: "teacher",
    teacherId: 1,
    courseId: 1,
    amount: 250,
    month: "2024-12",
    status: "pending",
    createdBy: "manager1",
    createdByRole: "manager",
    createdAt: "2024-12-10T16:00:00Z",
    description: "Teacher payment for Prof. Salim Benali - Mathematics",
  },
]
