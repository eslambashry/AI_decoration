import { Router } from "express";
import * as authCont from './auth.controller.js'
const router = Router()

router.post('/signUp',authCont.signup)
router.post('/login',authCont.login)
router.post('/loginGmail',authCont.loginWithGmail)

export default router