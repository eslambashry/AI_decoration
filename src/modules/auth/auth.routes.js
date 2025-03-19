import { Router } from "express";
import * as authCont from './auth.controller.js'
import { verifyToken } from "../../utilities/tokenFunctions.js";
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";
const router = Router()

router.post('/signUp',authCont.signup)
router.post('/login',authCont.login)
router.post('/loginGmail',authCont.loginWithGmail)
router.get('/payment-history', isAuth([systemRoles.USER]), authCont.getPaymentHistory)
router.get('/payment-history/:transactionId', isAuth([systemRoles.USER]), authCont.getPaymentDetails)
router.get('/getAllUser', authCont.getAllUser)
router.get('/confirm/:token',authCont.confirmEmail)
router.post('/forgetPassword',authCont.forgetPassword)
router.post('/resetPassword/:token',authCont.resetPassword)



//  ! ============================ for dasboard ============================
router.get('/getUsers', authCont.getUsers)
export default router