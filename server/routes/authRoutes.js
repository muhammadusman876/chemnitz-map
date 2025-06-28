import express from 'express';
import multer from "multer";
import { register, login, getCurrentUser, updateUser, uploadAvatar, logout, deleteAvatar, updatePassword } from '../controllers/authController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/user', authMiddleware, updateUser); 
router.put('/password', authMiddleware, updatePassword);
router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", authMiddleware,  deleteAvatar);

export default router;