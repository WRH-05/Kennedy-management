export interface Student {
  id: number
  name: string
  schoolYear: string
  specialty: string
  address: string
  birthDate: string
  phone: string
  email: string
  school: string
  registrationFeePaid: boolean
}

export const mockStudents: Student[] = [
  {
    id: 1,
    name: "Ahmed Ben Ali",
    schoolYear: "3AS",
    specialty: "Math",
    address: "123 Rue de la Paix, Alger",
    birthDate: "2005-03-15",
    phone: "+213 555 123 456",
    email: "ahmed.benali@email.com",
    school: "Lycée Mohamed Boudiaf",
    registrationFeePaid: true,
  },
  {
    id: 2,
    name: "Fatima Zahra",
    schoolYear: "BAC",
    specialty: "Sciences",
    address: "456 Avenue Mohamed V, Oran",
    birthDate: "2004-07-22",
    phone: "+213 555 789 012",
    email: "fatima.zahra@email.com",
    school: "Lycée Ibn Khaldoun",
    registrationFeePaid: true,
  },
  {
    id: 3,
    name: "Youssef Mansouri",
    schoolYear: "2AS",
    specialty: "Sciences",
    address: "789 Boulevard de la République, Constantine",
    birthDate: "2006-01-10",
    phone: "+213 555 345 678",
    email: "youssef.mansouri@email.com",
    school: "Lycée Emir Abdelkader",
    registrationFeePaid: false,
  },
]
