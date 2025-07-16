import express from 'express'
import { login, signup, updateProfile } from '../controllers/userController.js'
import { checkAuth, protectRoute } from '../middleware/auth.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.put('/update-profile',protectRoute,upload.single('profilePic'),updateProfile)
router.get('/check-auth',protectRoute,checkAuth)

export default router;

