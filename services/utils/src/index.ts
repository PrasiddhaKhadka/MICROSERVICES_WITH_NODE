import express from 'express';


const app = express()


const PORT = process.env.port || 8001


app.listen(PORT,()=>{
    console.log('Utils Server is running at http://localhost:8001')
})