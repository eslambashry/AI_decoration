import { Contact } from "../../../Database/models/contactus.model.js";
import { sendEmailService } from "../../services/sendEmail.js";

const submitContactUsForm = async ( req,res,next ) => {
    const { name, email, message } = req.body;
    try {
        const contact = new Contact({name, email, message});
        await contact.save();
        const emailSubject = `New Contact Form Submission from ${name}`
        const emailMessage = `
        Name: ${name}
        Email: ${email}
        Message: ${message}`
        const emailSent = await sendEmailService({
            to: 'eslamhussin600@gmail.com',
            subject: emailSubject,
            text: emailMessage
        })
        if(emailSent) {
            res.status(200).json({ message: "Message submitted successfully!" });
        } else {
            res.status(500).json({ message: "Failed to send email. Please try again later." });
        }

    }catch{
        res.status(500).json({ message: "Failed to submit message. Please try again later." });

    }
}

export default submitContactUsForm;