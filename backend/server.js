require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const admin = require('firebase-admin');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin: prefer explicit service account (base64), otherwise try Application Default Credentials (Cloud Run friendly)
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_BASE64');
  } else {
    // Try ADC (works on Cloud Run when a service account is attached)
    admin.initializeApp();
    console.log('Firebase Admin initialized using Application Default Credentials');
  }
} catch (err) {
  console.warn('Firebase Admin not initialized:', err && err.message ? err.message : err);
}

// Middleware to verify Firebase ID token (Authorization: Bearer <token>)
async function verifyTokenMiddleware(req, res, next) {
  // If Firebase Admin is not initialized, allow bypass only in development to make local work easier.
  if ((!admin.apps || admin.apps.length === 0) && process.env.NODE_ENV === 'development') {
    return next();
  }

  if (!admin.apps || admin.apps.length === 0) {
    return res.status(503).json({ error: 'Firebase Admin not initialized' });
  }

  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.*)$/);
  if (!match) return res.status(401).json({ error: 'Unauthorized: Missing token' });

  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('Token verification failed', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Gemini endpoint (protected)
app.post('/api/gemini', verifyTokenMiddleware, async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        // Keep systemInstruction for future use if needed
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Gemini API', error?.response?.data || error.message || error);
    res.status(500).json({ error: error.message || 'Gemini request failed' });
  }
});

// If Firebase Admin is initialized, expose Firestore-backed CRUD endpoints
let firestore = null;
try {
  if (admin.apps && admin.apps.length > 0) {
    firestore = admin.firestore();
    console.log('Firestore available via Firebase Admin');
  }
} catch (e) {
  console.warn('Firestore not available', e);
}

// Utility to convert Firestore docs to plain objects
function docToObject(doc) {
  const data = doc.data();
  return { id: doc.id, ...data };
}

if (firestore) {
  // Inventory routes
  app.get('/api/inventory', async (req, res) => {
    try {
      const snap = await firestore.collection('inventory').get();
      const items = snap.docs.map(docToObject);
      res.json(items);
    } catch (err) {
      console.error('Error fetching inventory', err);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  });

  app.post('/api/inventory', async (req, res) => {
    try {
      const payload = req.body;
      const ref = await firestore.collection('inventory').add(payload);
      const doc = await ref.get();
      res.status(201).json(docToObject(doc));
    } catch (err) {
      console.error('Error adding inventory', err);
      res.status(500).json({ error: 'Failed to add inventory' });
    }
  });

  app.put('/api/inventory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await firestore.collection('inventory').doc(id).set(req.body, { merge: true });
      const doc = await firestore.collection('inventory').doc(id).get();
      res.json(docToObject(doc));
    } catch (err) {
      console.error('Error updating inventory', err);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  });

  app.delete('/api/inventory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await firestore.collection('inventory').doc(id).delete();
      res.json({ id });
    } catch (err) {
      console.error('Error deleting inventory', err);
      res.status(500).json({ error: 'Failed to delete inventory' });
    }
  });

  // Contributions routes
  app.get('/api/contributions', async (req, res) => {
    try {
      const snap = await firestore.collection('contributions').get();
      res.json(snap.docs.map(docToObject));
    } catch (err) {
      console.error('Error fetching contributions', err);
      res.status(500).json({ error: 'Failed to fetch contributions' });
    }
  });

  app.post('/api/contributions', async (req, res) => {
    try {
      const ref = await firestore.collection('contributions').add(req.body);
      const doc = await ref.get();
      res.status(201).json(docToObject(doc));
    } catch (err) {
      console.error('Error adding contribution', err);
      res.status(500).json({ error: 'Failed to add contribution' });
    }
  });

  // Users routes
  app.get('/api/users', async (req, res) => {
    try {
      const snap = await firestore.collection('users').get();
      res.json(snap.docs.map(docToObject));
    } catch (err) {
      console.error('Error fetching users', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const ref = await firestore.collection('users').add(req.body);
      const doc = await ref.get();
      res.status(201).json(docToObject(doc));
    } catch (err) {
      console.error('Error adding user', err);
      res.status(500).json({ error: 'Failed to add user' });
    }
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
