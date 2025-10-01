import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './DB/Db.js'
import { clerkWebhook } from './Controlles/Webhook.js'
import educatorRouter from './Routes/Eductator.routes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './Config/Cloudinary.js'


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

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT ,()=>{
    console.log(`Server is runnig on port http://localhost:${5000}`)
})

