// Mock student data - TEMPORARILY DISABLED FOR TESTING
// If you see students on your website, you're using Supabase database!

export const students = [
  {
    id: 999,
    name: "🚫 MOCK DATA - If you see this, you're using mock data!",
    schoolYear: "MOCK",
    specialty: "Mock Data",
    address: "Mock Address",
    birthDate: "2000-01-01",
    phone: "+213 000 000 000",
    email: "mock@mock.com",
    school: "Mock School",
    registrationDate: "2024-01-01",
    registrationFeePaid: false,
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
