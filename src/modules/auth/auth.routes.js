import { Router } from "express";
import * as authCont from './auth.controller.js'
import { verifyToken } from "../../utilities/tokenFunctions.js";
const router = Router()

router.post('/signUp',authCont.signup)
router.post('/login',authCont.login)
router.post('/loginGmail',authCont.loginWithGmail)
router.get('/payment-history', verifyToken, authCont.getPaymentHistory)
router.get('/payment-history/:transactionId', verifyToken, authCont.getPaymentDetails)
router.get('/getAllUser', authCont.getAllUser)
router.get('/confirm/:token',authCont.confirmEmail)


export default router