import express from 'express';
import { register, login, getCurrentUser, updateUser } from '../controllers/authController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/user', authMiddleware, updateUser); // Assuming this is for updating user info

export default router;