import { Contact } from "../../../Database/models/contactus.model.js";
import { sendEmailService } from "../../services/sendEmail.js";

const submitContactUsForm = async ( req,res,next ) => {
    const { name, email, message ,subject} = req.body;
    try {
        const contact = new Contact({name, email, message, subject});
        await contact.save();
        const emailMessage = `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 20px auto; color: #333;">
                <p style="margin-bottom: 12px; font-size: 16px;">
                    <strong style="font-weight: bold; color: #007bff;">Name:</strong> ${name}
                </p>
                <p style="margin-bottom: 12px; font-size: 16px;">
                    <strong style="font-weight: bold; color: #007bff;">Email:</strong> ${email}
                </p>
                <p style="margin-bottom: 12px; font-size: 16px;">
                    <strong style="font-weight: bold; color: #007bff;">Message:</strong> ${message}
                </p>
            </div>
            `
        const emailSent = await sendEmailService({
            to: 'eslamhussin600@gmail.com',
            subject: `New Contact Us message , User Subject: ${subject}`,
            text: emailMessage,
            from: email,
            message:emailMessage
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