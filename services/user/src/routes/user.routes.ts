import { addSkills, deleteSkillFromUser, getUserProfile, myProfile, updateResume, updateUserProfile } from '../controllers/user.controller.js';
import { isAuth } from '../middleware/auth.js';
import express from 'express'
import uploadFile from '../middleware/multer.js';


const router = express()


router.get('/me',isAuth,myProfile);
router.get('/:userId',isAuth,getUserProfile);
router.put('/update/:userId',isAuth,updateUserProfile);
router.put('/update/pic', isAuth, uploadFile, updateUserProfile)
router.put('/update/resume', isAuth, uploadFile, updateResume)
router.put('/skill/add', isAuth, addSkills)
router.put('/skill/delete', isAuth, deleteSkillFromUser)





export default router;