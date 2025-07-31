export interface Teacher {
  id: number
  name: string
  address: string
  phone: string
  email: string
  school: string
  schoolYears: string[]
  subjects: string[]
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
  },
  {
    id: 2,
    name: "Prof. Amina Khelifi",
    address: "321 Avenue de l'Université, Oran",
    phone: "+213 555 333 444",
    email: "amina.khelifi@school.dz",
    school: "Lycée Ibn Khaldoun",
    schoolYears: ["2AS", "3AS"],
    subjects: ["Physics", "Chemistry"],
  },
  {
    id: 3,
    name: "Prof. Omar Djelloul",
    address: "456 Rue de l'Education, Constantine",
    phone: "+213 555 555 666",
    email: "omar.djelloul@school.dz",
    school: "Lycée Emir Abdelkader",
    schoolYears: ["1AS", "2AS"],
    subjects: ["Arabic", "History"],
  },
]
