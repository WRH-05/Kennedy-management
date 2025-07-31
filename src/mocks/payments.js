// Mock payment and financial data
// This file contains all payment, revenue, and financial mock data that will be replaced with database calls in the future

export const mockRevenue = [
  { studentName: "Ahmed Ben Ali", course: "Mathematics", amount: 500, month: "2024-01", paid: true },
  { studentName: "Fatima Zahra", course: "Physics", amount: 800, month: "2024-01", paid: false },
  { studentName: "Fatima Zahra", course: "Chemistry", amount: 450, month: "2024-01", paid: true },
  { studentName: "Omar Khaled", course: "Biology", amount: 600, month: "2024-01", paid: true },
  { studentName: "Amira Hassan", course: "Mathematics", amount: 500, month: "2024-01", paid: true },
  { studentName: "Karim Mansouri", course: "Physics", amount: 800, month: "2024-01", paid: true },
  { studentName: "Lina Boudraa", course: "Chemistry", amount: 450, month: "2024-01", paid: false },
  { studentName: "Youssef Taleb", course: "Biology", amount: 600, month: "2024-01", paid: true },
];

export const mockPayouts = [
  {
    id: 1,
    teacherId: 1,
    professorName: "Prof. Salim Benali",
    amount: 3250,
    percentage: 65,
    totalGenerated: 5000,
    month: "December 2024",
    status: "pending",
    dueDate: "2024-12-31",
    courses: ["Mathematics 3AS", "Physics BAC"],
  },
  {
    id: 2,
    teacherId: 2,
    professorName: "Prof. Amina Khelifi",
    amount: 2700,
    percentage: 70,
    totalGenerated: 3857,
    month: "December 2024",
    status: "approved",
    dueDate: "2024-12-31",
    courses: ["Chemistry 2AS", "Chemistry 1AS"],
  },
  {
    id: 3,
    teacherId: 3,
    professorName: "Prof. Omar Bentahar",
    amount: 3600,
    percentage: 60,
    totalGenerated: 6000,
    month: "December 2024",
    status: "paid",
    dueDate: "2024-12-31",
    courses: ["Biology 1AS", "Biology 3AS"],
  },
];

export const mockStudentPaymentHistory = [
  {
    id: 1,
    studentId: 1,
    studentName: "Ahmed Ben Ali",
    month: "January 2024",
    amount: 1500,
    status: "Paid",
    date: "2024-01-15",
    courses: ["Mathematics", "Physics"],
  },
  {
    id: 2,
    studentId: 1,
    studentName: "Ahmed Ben Ali",
    month: "February 2024",
    amount: 1500,
    status: "Paid",
    date: "2024-02-14",
    courses: ["Mathematics", "Physics"],
  },
  {
    id: 3,
    studentId: 1,
    studentName: "Ahmed Ben Ali",
    month: "March 2024",
    amount: 1500,
    status: "Pending",
    date: null,
    courses: ["Mathematics", "Physics"],
  },
];

export const mockProfessorPaymentHistory = [
  {
    id: 1,
    professorId: 1,
    professorName: "Prof. Salim Benali",
    month: "January 2024",
    amount: 3250,
    status: "Paid",
    date: "2024-01-31",
    courses: ["Mathematics 3AS", "Physics BAC"],
  },
  {
    id: 2,
    professorId: 1,
    professorName: "Prof. Salim Benali",
    month: "February 2024",
    amount: 3250,
    status: "Paid",
    date: "2024-02-29",
    courses: ["Mathematics 3AS", "Physics BAC"],
  },
  {
    id: 3,
    professorId: 1,
    professorName: "Prof. Salim Benali",
    month: "March 2024",
    amount: 3250,
    status: "Pending",
    date: null,
    courses: ["Mathematics 3AS", "Physics BAC"],
  },
];

export const mockStudentData = [
  {
    id: 1,
    name: "Ahmed Ben Ali",
    course: "Mathematics",
    schoolYear: "3AS",
    coursesEnrolled: 2,
    totalPaid: 1000, // Calculated from payments
    payments: [
      { month: "Jan", amount: 500, paid: true },
      { month: "Feb", amount: 500, paid: true },
      { month: "Mar", amount: 500, paid: false },
    ],
  },
  {
    id: 2,
    name: "Fatima Zahra",
    course: "Chemistry",
    schoolYear: "2AS",
    coursesEnrolled: 1,
    totalPaid: 450, // Calculated from payments
    payments: [
      { month: "Jan", amount: 450, paid: false },
      { month: "Feb", amount: 450, paid: true },
      { month: "Mar", amount: 450, paid: false },
    ],
  },
  {
    id: 3,
    name: "Omar Khaled",
    course: "Biology",
    schoolYear: "1AS",
    coursesEnrolled: 1,
    totalPaid: 1800, // Calculated from payments
    payments: [
      { month: "Jan", amount: 600, paid: true },
      { month: "Feb", amount: 600, paid: true },
      { month: "Mar", amount: 600, paid: true },
    ],
  },
];

export const mockTeacherData = [
  {
    id: 1,
    name: "Prof. Salim Benali",
    subject: "Mathematics",
    students: 15,
    studentCount: 15,
    totalEarnings: 6500, // Calculated from earnings
    earnings: [
      { month: "Jan", amount: 3250, paid: true },
      { month: "Feb", amount: 3250, paid: true },
      { month: "Mar", amount: 3250, paid: false },
    ],
  },
  {
    id: 2,
    name: "Prof. Amina Khelifi",
    subject: "Chemistry",
    students: 12,
    studentCount: 12,
    totalEarnings: 2700, // Calculated from earnings
    earnings: [
      { month: "Jan", amount: 2700, paid: true },
      { month: "Feb", amount: 2700, paid: false },
      { month: "Mar", amount: 2700, paid: false },
    ],
  },
  {
    id: 3,
    name: "Prof. Omar Bentahar",
    subject: "Biology",
    students: 18,
    studentCount: 18,
    totalEarnings: 7200, // Calculated from earnings
    earnings: [
      { month: "Jan", amount: 3600, paid: true },
      { month: "Feb", amount: 3600, paid: true },
      { month: "Mar", amount: 3600, paid: false },
    ],
  },
];

export default {
  mockRevenue,
  mockPayouts,
  mockStudentPaymentHistory,
  mockProfessorPaymentHistory,
  mockStudentData,
  mockTeacherData,
};
