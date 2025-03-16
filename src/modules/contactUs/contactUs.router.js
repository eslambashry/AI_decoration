import express from 'express';
import submitContactUsForm from './contactUs.controller.js';


const contactRouter = express.Router();


contactRouter.post('/contactus', submitContactUsForm)

export default contactRouter;
