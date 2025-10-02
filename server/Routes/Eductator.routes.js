import express from 'express'
import { addCourse, updateRoleToEducator } from '../Controlles/Educator.Controller.js'
import upload from '../Config/multer.js'
import { protectEducator } from '../Middleware/authMiddleware.js'

const educatorRouter = express.Router()
educatorRouter.get('/update-role' , updateRoleToEducator)
educatorRouter.post('/add-course',upload.single('image'),protectEducator ,addCourse)
export default educatorRouter;