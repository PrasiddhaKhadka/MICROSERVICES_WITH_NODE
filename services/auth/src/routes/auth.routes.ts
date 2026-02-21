import uploadFile from '../middleware/multer.js';
import { loginUser, registerUser } from '../controller/auth.controller.js'
import express from 'express';


const authRouter = express.Router();

authRouter.post('/register',uploadFile, registerUser)
authRouter.post('/login', loginUser)




export default authRouter;