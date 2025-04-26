import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

// Avoid "Cannot overwrite model" error
export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);