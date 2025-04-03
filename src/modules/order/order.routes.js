import { Router } from "express";
import { processPayment, handlePaymentSuccess, handlePaymentCancel, getDashboardData } from "./order.controller.js";
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";

const router = Router();

router.post('/process-payment', isAuth([systemRoles.USER]), processPayment);
router.get('/success', handlePaymentSuccess);
router.get('/cancel', handlePaymentCancel);
router.get('/dashboard/getPaymentsData', isAuth([systemRoles.ADMIN]), getDashboardData);

export default router;
