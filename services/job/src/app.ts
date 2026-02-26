import express from 'express';
import dotenv from 'dotenv';
import router from './routes/routes.js';


dotenv.config();

const app = express();

app.use('/api/v1/jobs',router)


export default app;

