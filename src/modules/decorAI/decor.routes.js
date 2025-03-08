import { Router } from "express";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtensions.js";


import { create } from "./decor.controller.js";

const router = Router()

router.post('/create',multerCloudFunction(allowedExtensions.Image).single('image'),create)

export default router
