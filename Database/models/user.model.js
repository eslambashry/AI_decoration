import { Schema,model } from "mongoose"
 
const userSchema = new Schema({

    username:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    isConfirmed:{
        type:Boolean,
        required:true,
        default:false,
    },
    role:{
        type:String,
        default:'user',
        enum:["user","admin","superAdmin"],
    },
    phoneNumber:{
        type:String,
    },
    profilePicture:{
        secure_url:String,
        public_id:String,
    },
    status:{
        type:String,
        default:'offline',
        enum:['offline','online'],
    },
    provider: {
        type: String,
        default: 'System',
        enum: ['System', 'GOOGLE'],
    },
    paymentHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Payment'
      }],
      
      totalDesignsAvailable: {
        type: Number,
        default: 0
      },
    token:String,
    forgetCode:String,
},{timestamps:true})


export const userModel = model('User', userSchema)
