import express from 'express'
import { updateRoleToEducator } from '../Controlles/Educator.Controller.js'

const educatorRouter = express.Router()
educatorRouter.get('/update-role' , updateRoleToEducator)
export default educatorRouter;