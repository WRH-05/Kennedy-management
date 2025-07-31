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
  createdBy: string
  createdByRole: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  description: string
}

export const mockPayments: PaymentRecord[] = [
  {
    id: 1,
    type: "student",
    studentId: 2,
    courseId: 2,
    courseName: "Chemistry - 2AS",
    amount: 450,
    month: "2024-01",
    status: "pending",
    createdBy: "receptionist1",
    createdByRole: "receptionist",
    createdAt: "2024-01-15T10:30:00Z",
    description: "Monthly fee for Fatima Zahra - Chemistry course",
  },
  {
    id: 2,
    type: "student",
    studentId: 3,
    courseId: 3,
    courseName: "Biology - 2AS",
    amount: 400,
    month: "2024-01",
    status: "pending",
    createdBy: "receptionist1",
    createdByRole: "receptionist",
    createdAt: "2024-01-20T14:15:00Z",
    description: "Monthly fee for Omar Khaled - Biology course",
  },
  {
    id: 3,
    type: "teacher",
    teacherId: 1,
    courseId: 1,
    courseName: "Mathematics - 3AS",
    amount: 325,
    month: "2024-01",
    status: "approved",
    createdBy: "receptionist1",
    createdByRole: "receptionist",
    createdAt: "2024-01-10T09:00:00Z",
    approvedBy: "manager1",
    approvedAt: "2024-01-12T11:30:00Z",
    description: "Teacher payout for Prof. Salim Benali - Mathematics course (65% of 500 DA)",
  },
  {
    id: 4,
    type: "teacher",
    teacherId: 2,
    courseId: 2,
    courseName: "Chemistry - 2AS",
    amount: 270,
    month: "2024-01",
    status: "pending",
    createdBy: "receptionist1",
    createdByRole: "receptionist",
    createdAt: "2024-01-18T16:45:00Z",
    description: "Teacher payout for Prof. Amina Khelifi - Chemistry course (60% of 450 DA)",
  },
  {
    id: 5,
    type: "teacher",
    teacherId: 3,
    courseId: 3,
    courseName: "Biology - 2AS",
    amount: 220,
    month: "2024-01",
    status: "pending",
    createdBy: "receptionist1",
    createdByRole: "receptionist",
    createdAt: "2024-01-22T13:20:00Z",
    description: "Teacher payout for Prof. Omar Mansouri - Biology course (55% of 400 DA)",
  },
]
