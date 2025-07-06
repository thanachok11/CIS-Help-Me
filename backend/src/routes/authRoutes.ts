import express from "express";
import { register, login, renewToken, showAllUsers } from "../controllers/authController";
import { verifyToken } from '../middlewares/auth';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/renew", renewToken);

router.get("/users", verifyToken, showAllUsers);

export default router;
