import uploadFile from '../middleware/multer.js';
import { forgotPassword, loginUser, registerUser, resetPassword } from '../controller/auth.controller.js'
import express from 'express';


const authRouter = express.Router();

authRouter.post('/register',uploadFile, registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/forgot', forgotPassword)
authRouter.post('/reset/:token', resetPassword)




export default authRouter;