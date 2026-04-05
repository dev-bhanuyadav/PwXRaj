import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  ownerName: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  randomId: { type: String },
  userId: { type: String },
  tokenStatus: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

export const Token = mongoose.model('Token', tokenSchema);

const heartbeatSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  lastActive: { type: Date, default: Date.now, expires: 120 } // Auto-expire after 2 minutes
});

export const Heartbeat = mongoose.model('Heartbeat', heartbeatSchema);

const contextCaptureSchema = new mongoose.Schema({
  deviceId: String,
  context: mongoose.Schema.Types.Mixed,
  capturedAt: { type: Date, default: Date.now }
});

export const ContextCapture = mongoose.model('ContextCapture', contextCaptureSchema);
