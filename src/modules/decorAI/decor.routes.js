import { Router } from "express";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtentions.js";


import * as decorationCon from "./decor.controller.js";
import { systemRoles } from "../../utilities/systemRole.js";
import { isAuth } from "../../middleware/isAuth.js";

const router = Router()

router.post('/createWithImage', isAuth([systemRoles.ADMIN, systemRoles.USER]), multerCloudFunction(allowedExtensions.Image).single('image'), decorationCon.createWithImage)
router.post('/createwithoutImage', isAuth([systemRoles.ADMIN, systemRoles.USER]), decorationCon.createwithoutImage)
router.get('/getDesignByUserId', isAuth([systemRoles.USER]), decorationCon.getDesignById)
// router.get('/getDesigns', decorationCon.getDesigns)
export default router
