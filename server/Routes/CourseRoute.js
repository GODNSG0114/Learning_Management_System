import express from 'express'
import { getAllCourse, GetCourseById, getAiSuggestedFlow, aiChat } from '../Controlles/CourseControll.js'

const courseRouter = express.Router()

courseRouter.get('/all', getAllCourse)
courseRouter.post('/ai-flow', getAiSuggestedFlow)
courseRouter.post('/ai-chat', aiChat)
courseRouter.get('/:id',GetCourseById )

export default courseRouter