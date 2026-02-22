import express from "express";
import authRouter from "./routes/auth.routes.js";
import morgan from 'morgan'
import { connectKafka } from "./producer.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

connectKafka()

app.use(morgan('tiny'))
app.use('/api/v1/auth',authRouter)

export default app;