import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  ActualToken: String,
  ActualRefresh: String,
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
