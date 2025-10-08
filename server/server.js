import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './DB/Db.js'
import { clerkWebhook } from './Controlles/Webhook.js'
import educatorRouter from './Routes/Eductator.routes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './Config/Cloudinary.js'
import courseRouter from './Routes/CourseRoute.js'
import userRouter from './Routes/UserRoutes.js'


// initialize express
const app = express()

await connectDB();
await connectCloudinary();

// middlewares
app.use(cors())
app.use(clerkMiddleware())

// Routes
app.get('/',(req,res)=> res.send("Api working On versel"))
app.post('/clerk',express.json() , clerkWebhook)
app.use('/api/educator',express.json() ,educatorRouter)
app.use('/api/course' ,express.json() , courseRouter)
app.use('/api/user' ,express.json() , userRouter)

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT ,()=>{
    console.log(`Server is runnig on port http://localhost:${5000}`)
})

