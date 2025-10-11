import express from 'express'
import { addUserRating, getUserData, getUserProgress, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../Controlles/UserController.js'
const userRouter = express.Router()

userRouter.get('/data' , getUserData)
userRouter.get('/enrolled-courses' , userEnrolledCourses)
userRouter.post('/purchase' , purchaseCourse)

userRouter.post('/update-course-progress' , updateUserCourseProgress)
userRouter.post('/get-course-progress' , getUserProgress)
userRouter.post('/add-rating' , addUserRating)
export default userRouter