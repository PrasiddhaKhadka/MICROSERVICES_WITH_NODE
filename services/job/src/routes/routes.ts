import { isAuth } from '../middleware/auth.js';
import { createCompany, createJob } from '../controllers/job.js';
import express from 'express'

const router = express()


router.post('/create/company',isAuth, createCompany)
router.post('/create/job',isAuth, createJob)


export default router;