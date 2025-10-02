import express from 'express'
import { addCourse, getEducatorCourses, updateRoleToEducator } from '../Controlles/Educator.Controller.js'
import upload from '../Config/multer.js'
import { protectEducator } from '../Middleware/authMiddleware.js'

const educatorRouter = express.Router()
educatorRouter.get('/update-role' , updateRoleToEducator)
educatorRouter.post('/add-course',upload.single('image'),protectEducator ,addCourse)
educatorRouter.get('/courses',protectEducator ,getEducatorCourses)
export default educatorRouter;