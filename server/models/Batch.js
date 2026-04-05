import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: String,
  batchStatus: { type: Boolean, default: true },
  enrolledTokens: [{
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accessToken: String,
    refreshToken: String,
    randomId: String,
    tokenStatus: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
  }]
});

export const Batch = mongoose.model('Batch', batchSchema);
