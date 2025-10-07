import express from 'express'
import { educatorDashboard,addCourse, getEducatorCourses, updateRoleToEducator,getEnrolledStudentsData } from '../Controlles/Educator.Controller.js'
import upload from '../Config/multer.js'
import { protectEducator } from '../Middleware/authMiddleware.js'

const educatorRouter = express.Router()
educatorRouter.get('/update-role' , updateRoleToEducator)
educatorRouter.post('/add-course',upload.single('image'),protectEducator ,addCourse)
educatorRouter.get('/courses',protectEducator ,getEducatorCourses)
educatorRouter.get('/dashboard',protectEducator ,educatorDashboard)
educatorRouter.get('/enrolled-students',protectEducator ,getEnrolledStudentsData)
export default educatorRouter;