
import { Router } from "express";
import * as authController from '../controllers/auth';
import { privateRoute } from "../middleware/private-routes";

export const authRoutes = Router();

authRoutes.post('/signup', authController.signup);

authRoutes.post('/signin', authController.signin);

authRoutes.post('/validate', privateRoute, authController.validate);