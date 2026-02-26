import { isAuth } from '../middleware/auth.js';
import { createCompany, createJob, deleteCompany, updateCompany } from '../controllers/job.js';
import express from 'express'

const router = express()


router.post('/create/company',isAuth, createCompany)
router.put('/update/company',isAuth, updateCompany)
router.delete('/delete/company',isAuth, deleteCompany)
router.post('/create/job',isAuth, createJob)


export default router;