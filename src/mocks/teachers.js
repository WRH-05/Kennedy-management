// Mock teacher/professor data
// This file contains all teacher-related mock data that will be replaced with database calls in the future

export const teachers = [
  {
    id: 1,
    name: "Prof. Salim Benali",
    address: "789 Rue des Professeurs, Alger",
    phone: "+213 555 111 222",
    email: "salim.benali@school.dz",
    school: "Lycée Mohamed Boudiaf",
    schools: ["Lycée Mohamed Boudiaf", "Lycée Ibn Sina"],
    schoolYears: ["3AS", "BAC"],
    subjects: ["Mathematics", "Physics"],
    totalStudents: 15,
    monthlyEarnings: 10500,
    joinDate: "2023-09-01",
  },
  {
    id: 2,
    name: "Prof. Amina Khelifi",
    address: "321 Avenue de l'Université, Oran",
    phone: "+213 555 333 444",
    email: "amina.khelifi@school.dz",
    school: "Lycée Ibn Khaldoun",
    schools: ["Lycée Ibn Khaldoun"],
    schoolYears: ["2AS"],
    subjects: ["Physics", "Chemistry"],
    totalStudents: 12,
    monthlyEarnings: 7800,
    joinDate: "2023-10-15",
  },
  {
    id: 3,
    name: "Prof. Omar Bentahar",
    address: "654 Rue de l'Indépendance, Constantine",
    phone: "+213 555 555 666",
    email: "omar.bentahar@school.dz",
    school: "Lycée Emir Abdelkader",
    schools: ["Lycée Emir Abdelkader"],
    schoolYears: ["1AS", "2AS"],
    subjects: ["Biology", "Chemistry"],
    totalStudents: 18,
    monthlyEarnings: 9200,
    joinDate: "2023-08-15",
  },
];

export default teachers;
