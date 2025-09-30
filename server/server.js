import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './DB/Db.js'
import { clerkWebhook } from './Controlles/Webhook.js'


// initialize express
const app = express()

await connectDB();

// middlewares
app.use(cors())

// Routes
app.get('/',(req,res)=> res.send("Api working On versel"))
app.post("/clerk", bodyParser.raw({ type: "application/json" }), clerkWebhook);

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT ,()=>{
    console.log(`Server is runnig on port http://localhost:${5000}`)
})

