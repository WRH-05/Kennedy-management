export interface Teacher {
  id: number
  name: string
  address: string
  phone: string
  email: string
  school: string
  schoolYears: string[]
  subjects: string[]
  totalStudents: number
  monthlyEarnings: number
  joinDate: string
}

export const mockTeachers: Teacher[] = [
  {
    id: 1,
    name: "Prof. Salim Benali",
    address: "789 Rue des Professeurs, Alger",
    phone: "+213 555 111 222",
    email: "salim.benali@school.dz",
    school: "Lycée Mohamed Boudiaf",
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
    schoolYears: ["2AS", "BAC"],
    subjects: ["Physics", "Chemistry"],
    totalStudents: 12,
    monthlyEarnings: 7800,
    joinDate: "2023-10-15",
  },
  {
    id: 3,
    name: "Prof. Omar Mansouri",
    address: "456 Rue de la Science, Constantine",
    phone: "+213 555 777 888",
    email: "omar.mansouri@school.dz",
    school: "Lycée Emir Abdelkader",
    schoolYears: ["1AS", "2AS"],
    subjects: ["Biology", "Chemistry"],
    totalStudents: 18,
    monthlyEarnings: 9200,
    joinDate: "2023-08-20",
  },
]
