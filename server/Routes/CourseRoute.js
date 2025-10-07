import express from 'express'
import { getAllCourse, GetCourseById } from '../Controlles/CourseControll'

const courseRouter = express.Router()

courseRouter.get('/all', getAllCourse)
courseRouter.get('/:id',GetCourseById )

export default courseRouter