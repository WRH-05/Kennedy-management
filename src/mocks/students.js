// Mock student data
// This file contains all student-related mock data that will be replaced with database calls in the future

export const students = [
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
    registrationDate: "2024-01-15",
    registrationFeePaid: true,
    documents: {
      photos: { uploaded: true, filename: "20240115_Ben_Ahmed_Photos.pdf" },
      copyOfId: { uploaded: false, filename: null },
      registrationForm: { uploaded: true, filename: "20240115_Ben_Ahmed_Registration.pdf" },
    },
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
    registrationDate: "2024-01-10",
    registrationFeePaid: true,
    documents: {
      photos: { uploaded: true, filename: "20240110_Zahra_Fatima_Photos.pdf" },
      copyOfId: { uploaded: true, filename: "20240110_Zahra_Fatima_ID.pdf" },
      registrationForm: { uploaded: false, filename: null },
    },
  },
  {
    id: 3,
    name: "Omar Khaled",
    schoolYear: "2AS",
    specialty: "Sciences",
    address: "789 Boulevard de la République, Constantine",
    birthDate: "2006-11-08",
    phone: "+213 555 456 789",
    email: "omar.khaled@email.com",
    school: "Lycée Emir Abdelkader",
    registrationDate: "2024-01-20",
    registrationFeePaid: true,
    documents: {
      photos: { uploaded: false, filename: null },
      copyOfId: { uploaded: true, filename: "20240120_Khaled_Omar_ID.pdf" },
      registrationForm: { uploaded: true, filename: "20240120_Khaled_Omar_Registration.pdf" },
    },
  },
];

export default students;
