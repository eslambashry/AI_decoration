import { Router } from "express";
import * as authCont from './auth.controller.js'
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";
const router = Router()

router.post('/signUp',authCont.signup)
router.post('/login',authCont.login)
router.post('/logout',authCont.logout)
router.post('/loginGmail',authCont.loginWithGmail)
router.get('/payment-history', isAuth([systemRoles.USER]), authCont.getPaymentHistory)
router.get('/payment-history/:transactionId', isAuth([systemRoles.USER]), authCont.getPaymentDetails)
router.get('/getAllUser', authCont.getAllUser)
router.get('/confirm/:token',authCont.confirmEmail)
router.post('/forgetPassword',authCont.forgetPassword)
router.post('/resetPassword/:token',authCont.resetPassword)



//  ! ============================ for dasboard ============================
router.get('/getUsers', isAuth([systemRoles.ADMIN]), authCont.getUsers)
router.delete('/deleteUser/:id', isAuth([systemRoles.ADMIN]), authCont.deleteUser)
router.post('/updateUser/:id', isAuth([systemRoles.ADMIN]), authCont.addCredit)
router.get('/getSingle/:id', isAuth([systemRoles.ADMIN]), authCont.getSingleUser)


export default router