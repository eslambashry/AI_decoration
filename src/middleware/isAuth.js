import { userModel } from '../../Database/models/user.model.js'
import { generateToken, verifyToken } from '../utilities/tokenFunctions.js'

export const isAuth = (roles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers
      if (!authorization) {
        return next(new Error('Please login first' , 400 ))
      }

      // if (!authorization.startsWith('ecomm__')) {
      //   return next(new Error('invalid token prefix', { cause: 400 }))
      // }
      // console.log(authorization);
      
      const splitedToken = authorization.split(' ')[1]
      // console.log(splitedToken);
      
      try {
        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.SIGN_IN_TOKEN_SECRET, // ! process.env.SIGN_IN_TOKEN_SECRET STITCH
        })
        // console.log("decodedData: ",decodedData);
        // console.log("decodedData: ",decodedData._id);
        
        const findUser = await userModel.findById(
          decodedData._id,
          'email userName role',
        )
        
        if (!findUser) {
          return next(new Error('Please SignUp', { cause: 400 }))
        }
        // console.log(roles);
        // console.log(findUser.role);
        // ~ Authorization error
        if(!roles.includes(findUser.role)){
          return next(new Error('UnAuthorized to access this api', { cause: 400 }))
        }
        req.authUser = findUser
        next()
      } catch (error) {
        // token  => search in db
        if (error == 'TokenExpiredError: jwt expired') {
          // refresh token
          const user = await userModel.findOne({ token: splitedToken })
          if (!user) {
            return next(new Error('Wrong token', { cause: 400 }))
          }
          // generate new token
          const userToken = generateToken({
            payload: {
              email: user.email,
              _id: user._id,
            },
            signature: process.env.SIGN_IN_TOKEN_SECRET, // ! process.env.SIGN_IN_TOKEN_SECRET
            expiresIn: '1h',
          })

          if (!userToken) {
            return next(
              new Error('token generation fail, payload canot be empty', {
                cause: 400,
              }),
            )
          }

          // user.token = userToken
          // await user.save()
          await userModel.findOneAndUpdate(
            { token: splitedToken },
            { token: userToken },
          )
          return res.status(200).json({ message: 'Token refreshed', userToken })
        }
        return next(new Error('invalid token', { cause: 500 }))
      }
    } catch (error) {
      console.log(error)
      next(new Error('catch error in auth', { cause: 500 }))
    }
  }
}