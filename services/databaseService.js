import { studentService } from "./studentService"
import { teacherService } from "./teacherService"
import { courseService } from "./courseService"
import { archiveService } from "./archiveService"
import { paymentService } from "./paymentService"
import { attendanceService } from "./attendanceService"
import { profileService } from "./profileService"


export const databaseService = {
  students: studentService,
  teachers: teacherService,
  courses: courseService,
  archives: archiveService,
  payments: paymentService,
  attendance: attendanceService,
  profile: profileService
}

export default databaseService
