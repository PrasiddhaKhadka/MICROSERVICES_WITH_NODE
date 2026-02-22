import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import routes from './routes.js'
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary'
import { startSendMailConsumer } from './consumer.js';



dotenv.config()

startSendMailConsumer();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const app = express()
app.use(cors())
app.use(express.json({ limit:"50mb" }))
app.use(urlencoded({ limit:"50mb", extended:true }))


const PORT = process.env.port || 8001

app.use('/api/v1/utils', routes)


app.listen(PORT,()=>{
    console.log('Utils Server is running at http://localhost:8001')
})