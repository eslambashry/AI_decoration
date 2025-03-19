import { Router } from "express";
import { processPayment, handlePaymentSuccess, handlePaymentCancel } from "./order.controller.js";
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";

const router = Router();

router.post('/process-payment', isAuth([systemRoles.USER]), processPayment);
router.get('/success', handlePaymentSuccess);
router.get('/cancel', handlePaymentCancel);

export default router;
