import { Router } from "express";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtentions.js";


import { createWithImage, createwithoutImage } from "./decor.controller.js";
import { systemRoles } from "../../utilities/systemRole.js";
import { isAuth } from "../../middleware/isAuth.js";

const router = Router()

router.post('/createWithImage', isAuth([systemRoles.ADMIN, systemRoles.USER]), multerCloudFunction(allowedExtensions.Image).single('image'), createWithImage)
router.post('/createwithoutImage', isAuth([systemRoles.ADMIN, systemRoles.USER]), createwithoutImage)
export default router
