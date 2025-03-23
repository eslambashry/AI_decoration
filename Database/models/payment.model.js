import mongoose from 'mongoose'
const { Schema } = mongoose

const paymentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  designsCount: {
    type: Number,
    required: true
  }
}, { timestamps: true })

export const Payment = mongoose.model('Payment', paymentSchema)
