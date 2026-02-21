import express from "express";
import authRouter from "./routes/auth.routes.js";
import morgan from 'morgan'

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

app.use(morgan('tiny'))
app.use('/api/v1/auth',authRouter)

export default app;