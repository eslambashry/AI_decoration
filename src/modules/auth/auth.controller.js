import {generateToken, verifyToken} from "../../utilities/tokenFunctions.js"
import {sendEmailService} from "../../services/sendEmail.js"
 import { nanoid } from "nanoid"
import { userModel } from "../../../Database/models/user.model.js"
import { emailTemplate } from "../../utilities/emailTemplate.js"
import catchError from "../../middleware/ErrorHandeling.js"
import CustomError from "../../utilities/customError.js"
import { OAuth2Client } from "google-auth-library"
import pkg from 'bcrypt'

import jwt from "jsonwebtoken";
import { DesignModel } from "../../../Database/models/generate_designs_for_room.model.js"
import { destroyImage } from "../../utilities/imageKitConfigration.js"

export const signup = async(req,res,next) => {
    const { 
        username,
        email,
        password,
        age,
        gender,
        phoneNumber,
        address,
    } = req.body
    //is email exsisted
    const isExsisted = await userModel.findOne({email})
    if(isExsisted){
        return res.status(400).json({message:"Email exsisted"})
    }
 const token = generateToken({
    payload:{
        email,
    },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN, 
    expiresIn: '1h',
 })
    const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}` 
    const isEmailSent = sendEmailService({
        to:email,
        subject:'Confirmation Email',
         message: //`<a href=${confirmationLink}> Click here to confirm </a>`
         emailTemplate({
            link: confirmationLink,
            linkData: 'Click here to confirm',
            subject: 'Confirmation Email',
         })
         ,
    }) 
    if(!isEmailSent){
        return res.status(400).json({message:'fail to sent confirmation email'})
    }

    const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS)
    
    const user = new userModel({
        username,
        email,
        password:hashedPassword,
        age, 
        gender,
        phoneNumber,
        address,
    })
    const saveUser = await user.save()
    res.status(201).json({message:'done', saveUser})
}

export const confirmEmail = async(req,res,next) => {
    const {token} = req.params

    const decode = verifyToken({
        token,
        signature: process.env.CONFIRMATION_EMAIL_TOKEN, // ! process.env.CONFIRMATION_EMAIL_TOKEN
    })
    const user = await userModel.findOneAndUpdate(
        {email: decode?.email, isConfirmed:false},
        {isConfirmed: true},
        {new:true},
        )
        if(!user){
            return res.status(400).json({message:'already confirmed'})
        }
            return res.status(200).json({message:'confirmed done, now log in'})
}


export const login = catchError(async(req,res,next) => {
    const {email,password} = req.body

     
    if(!email || !password){
        return next(new CustomError('Email And Password Is Required',  422 ))
     }

    const userExsist = await userModel.findOne({email})
    if(!userExsist){
        return next(new CustomError('user not found',404))
    } 

    console.log(password);
    
    const passwordExsist = pkg.compareSync(password,userExsist.password)
    console.log(passwordExsist);
    console.log(userExsist.password);
    
    if(!passwordExsist){
        return next(new CustomError('in correct password',404))
    }

    const token = generateToken({
        payload:{
            email,
            _id: userExsist._id,
            role: userExsist.role
        },
        signature: process.env.SIGN_IN_TOKEN_SECRET, // ! process.env.SIGN_IN_TOKEN_SECRET
        expiresIn: '1h',
     })
     

     const userUpdated = await userModel.findOneAndUpdate(
        
        {email},
        
        {
            token,
            status: 'online'
        },
        {new: true},
     )
     res.status(200).json({message: 'Login Success', userUpdated})
})


export const forgetPassword = async(req,res,next) => {
    const {email} = req.body

    const isExist = await userModel.findOne({email})
    if(!isExist){
        return res.status(400).json({message: "Email not found"})
    }

    const code = nanoid()
    const hashcode = pkg.hashSync(code, +process.env.SALT_ROUNDS) // ! process.env.SALT_ROUNDS
    const token = generateToken({
        payload:{
            email,
            sendCode:hashcode,
        },
        signature: process.env.RESET_TOKEN, // ! process.env.RESET_TOKEN
        expiresIn: '1h',
    })
    const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/reset/${token}` // ^ front end url 
    console.log(resetPasswordLink);
    
    const isEmailSent = sendEmailService({
        to:email,
        subject: "Reset Password",
        message: emailTemplate({
            link:resetPasswordLink,
            linkData:"Click Here Reset Password",
            subject: "Reset Password",
        }),
    })    
    if(!isEmailSent){
        return res.status(400).json({message:"Email not found"})
    }

    const userupdete = await userModel.findOneAndUpdate(
        {email},
        {forgetCode:hashcode},
        {new: true},
    )
    return res.status(200).json({message:"password changed",userupdete})
}

export const resetPassword = async(req,res,next) => {
    const {token} = req.params
    const decoded = verifyToken({token, signature: process.env.RESET_TOKEN}) // ! process.env.RESET_TOKEN
    const user = await userModel.findOne({
        email: decoded?.email,
        fotgetCode: decoded?.sentCode
    })

    if(!user){
        return res.status(400).json({message: "you are alreade reset it , try to login"})
    }
    
    const {newPassword} = req.body
    console.log(newPassword);
    
    const hashedPassword = pkg.hashSync(newPassword, +process.env.SALT_ROUNDS)

    user.password = hashedPassword,
    user.forgetCode = null

    const updatedUser = await user.save()
    res.status(200).json({message: "Done",updatedUser})
}

export const getAllUser = async(req,res,next) => {
    const users = await userModel.find().populate(`paymentHistory`)
    // TODO users.paymentHistory.planId
    res.status(201).json({message:"Users",users})
}



// ! ======================loginWithGmail============================
export const loginWithGmail = async (req, res, next) => {

    const client = new OAuth2Client()
    const { idToken } = req.body
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      })
      const payload = ticket.getPayload()
      return payload
    }
    const { email_verified, email, name } = await verify()
    console.log(email_verified);
    console.log(email);
    console.log(name);
    
    if (!email_verified) {
      return next(new CustomError('invalid email', 400 ))
    }
    const user = await userModel.findOne({ email, provider: 'GOOGLE' })
    //login
    if (user) {
      const token = generateToken({
        payload: {
          email,
          _id: user._id,
          role: user.role,
        },
        signature: process.env.SIGN_IN_TOKEN_SECRET,
        expiresIn: '1h',
      })
  
      const userUpdated = await userModel.findOneAndUpdate(
        { email },
        {
          token,
          status: 'online',
        },
        {
          new: true,
        },
      )
      return res.status(200).json({ messge: 'Login done', userUpdated, token })
    }
  
    // signUp
    const userObject = {
    username: name,
      email,
      password: nanoid(6),
      provider: 'GOOGLE',
      isConfirmed: true,
      phoneNumber: ' ',
      role: 'user',
    }
    const newUser = await userModel.create(userObject)
    const token = generateToken({
      payload: {
        email: newUser.email,
        _id: newUser._id,
        role: newUser.role,
      },
      signature: process.env.SIGN_IN_TOKEN_SECRET,
      expiresIn: '1h',
    })
    newUser.token = token
    newUser.status = 'online'
    await newUser.save()
    res.status(200).json({ message: 'Verified', newUser })
}
  
  
  export const getPaymentHistory = catchError(async (req, res,next) => {
    const userId = req.authUser._id
    const user = await userModel.findById(userId).populate('paymentHistory')
    return res.status(200).json({ paymentHistory: user.paymentHistory })
  })
  
  export const getPaymentDetails = catchError( async (req, res,next) => {
    const { transactionId } = req.params
    const userId = req.authUser._id

    const userPaymentData = await userModel.findOne({
      _id: userId,
    }).populate('paymentHistory')
    
    const payment = userPaymentData.paymentHistory.find(p => p.transactionId === transactionId);

    if (payment) {
      return res.status(200).json({ payment });
    }

    return res.status(404).json({ message: 'payment not found' })
  })


  export const logout = async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SIGN_IN_TOKEN_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          // إذا انتهت صلاحية التوكن، نقوم فقط بفك تشفيره بدون التحقق منه
          decoded = jwt.decode(token);
        } else {
          return res.status(401).json({ message: "Invalid token" });
        }
      }
  
      if (!decoded || !decoded.email) {
        return res.status(401).json({ message: "Invalid token" });
      }
  
      const email = decoded.email;
  
      // console.log("Decoded email:", email);
  
      // البحث عن المستخدم
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // تحديث حالة المستخدم إلى "offline" حتى لو كان التوكن منتهي الصلاحية
      await userModel.findOneAndUpdate(
        { email },
        { token: null, status: "offline" },
        { new: true }
      );
  
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


// ! =================================== for dashboard =================================

export const getUsers = catchError(async (req, res,next) => {

  const user = await userModel.find()
  .select(`email username phoneNumber totalDesignsAvailable status createdAt`)
  .populate({
    path: 'paymentHistory',
    select: 'planId designsCount createdAt transactionId amount status currency',
  })

  return res.status(200).json({ message:"Users:" , user })
})


export const deleteUser = catchError(async (req, res,next) => {
  const { id } = req.params
  
  const paymentHistory = await paymentModel.find({ userId: id })
  if (paymentHistory.length > 0) {
    await paymentModel.deleteMany({ userId: id })
  }
  const designs = await DesignModel.find({ userId: id })
  
  // Delete all images associated with the user's designs
  for (const design of designs) {
    try {
      // Delete the original uploaded image
      if (design.uploadedImage && design.uploadedImage.public_id) {
        await destroyImage(design.uploadedImage.public_id);
        console.log(`Deleted original image with ID: ${design.uploadedImage.public_id}`);
      }

      // Delete all generated images
      if (design.generatedImage && design.generatedImage.length > 0) {
        for (const image of design.generatedImage) {
          if (image.public_id) {
            await destroyImage(image.public_id);
            console.log(`Deleted generated image with ID: ${image.public_id}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error deleting images for design ${design._id}:`, error);
    }
  }

  // Delete all designs
  if (designs.length > 0) {
    await DesignModel.deleteMany({ userId: id });
  }


  const user = await userModel.findByIdAndDelete(id)
  if(!user){
    return next(new CustomError('user not found',404))
  }
  return res.status(200).json({message:'user deleted'})
})

export const addCredit = catchError(async (req, res,next) => {
  const { id } = req.params
  const { amount } = req.body
  const user = await userModel.findByIdAndUpdate(id, {
    $inc: { totalDesignsAvailable: amount },
  })
  if(!user){
    return next(new CustomError('user not found',404))
  }
  return res.status(200).json({message:'credit added'})
})


export const getSingleUser = catchError(async (req, res,next) => {
  const { id } = req.params
  const user = await userModel.findById(id)
  .populate({
    path: 'paymentHistory'
  })

  if(!user){
    return next(new CustomError('user not found',404))
  }
  return res.status(200).json({message:'user',user})
})