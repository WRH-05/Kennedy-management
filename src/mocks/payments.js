// Mock payment and financial data
// This file contains all payment, revenue, and financial mock data that will be replaced with database calls in the future

export const mockRevenue = [
  { month: "January", revenue: 25000, profit: 8750 },
  { month: "February", revenue: 28000, profit: 9800 },
  { month: "March", revenue: 32000, profit: 11200 },
  { month: "April", revenue: 29000, profit: 10150 },
  { month: "May", revenue: 31000, profit: 10850 },
  { month: "June", revenue: 35000, profit: 12250 },
  { month: "July", revenue: 27000, profit: 9450 },
  { month: "August", revenue: 30000, profit: 10500 },
  { month: "September", revenue: 33000, profit: 11550 },
  { month: "October", revenue: 36000, profit: 12600 },
  { month: "November", revenue: 34000, profit: 11900 },
  { month: "December", revenue: 38000, profit: 13300 },
];

export const mockPayouts = [
  {
    id: 1,
    teacherId: 1,
    teacherName: "Prof. Salim Benali",
    amount: 3250,
    month: "December 2024",
    status: "Pending",
    dueDate: "2024-12-31",
    courses: ["Mathematics 3AS", "Physics BAC"],
  },
  {
    id: 2,
    teacherId: 2,
    teacherName: "Prof. Amina Khelifi",
    amount: 2700,
    month: "December 2024",
    status: "Approved",
    dueDate: "2024-12-31",
    courses: ["Chemistry 2AS", "Chemistry 1AS"],
  },
  {
    id: 3,
    teacherId: 3,
    teacherName: "Prof. Omar Bentahar",
    amount: 3600,
    month: "December 2024",
    status: "Paid",
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
    name: "Ahmed Ben Ali",
    course: "Mathematics",
    schoolYear: "3AS",
    payments: [
      { month: "Jan", amount: 500, paid: true },
      { month: "Feb", amount: 500, paid: true },
      { month: "Mar", amount: 500, paid: false },
    ],
  },
  {
    name: "Fatima Zahra",
    course: "Chemistry",
    schoolYear: "2AS",
    payments: [
      { month: "Jan", amount: 450, paid: false },
      { month: "Feb", amount: 450, paid: true },
      { month: "Mar", amount: 450, paid: false },
    ],
  },
  {
    name: "Omar Khaled",
    course: "Biology",
    schoolYear: "1AS",
    payments: [
      { month: "Jan", amount: 600, paid: true },
      { month: "Feb", amount: 600, paid: true },
      { month: "Mar", amount: 600, paid: true },
    ],
  },
];

export const mockTeacherData = [
  {
    name: "Prof. Salim Benali",
    subject: "Mathematics",
    students: 15,
    earnings: [
      { month: "Jan", amount: 3250, paid: true },
      { month: "Feb", amount: 3250, paid: true },
      { month: "Mar", amount: 3250, paid: false },
    ],
  },
  {
    name: "Prof. Amina Khelifi",
    subject: "Chemistry",
    students: 12,
    earnings: [
      { month: "Jan", amount: 2700, paid: true },
      { month: "Feb", amount: 2700, paid: false },
      { month: "Mar", amount: 2700, paid: false },
    ],
  },
  {
    name: "Prof. Omar Bentahar",
    subject: "Biology",
    students: 18,
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
