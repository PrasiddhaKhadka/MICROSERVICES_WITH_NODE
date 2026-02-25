import express from 'express';
import dotenv from 'dotenv';
import router from './routes/user.routes.js'


dotenv.config()

const app = express()
app.use(express.json())


app.use('/api/v1/user',router)
 
app.listen(process.env.PORT,()=>{
    console.log(`Server is running @ http://localhost:${process.env.PORT}`)
})

export default app;