import { getUserProfile, myProfile, updateUserProfile } from '../controllers/user.controller.js';
import express from 'express'
import { isAuth } from '../middleware/auth.js';

const router = express()

router.get('/me',isAuth,myProfile);

router.get('/:userId',isAuth,getUserProfile);
router.put('/updated/:userId',isAuth,updateUserProfile);



export default router;