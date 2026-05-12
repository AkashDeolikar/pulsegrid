const axios = require('axios');

const API = 'http://localhost:YOUR_PORT/api/events/publish';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let orderCounter = 1;
let authToken = null;

// 🔐 Step 1: Register/Login (same as your test)
async function getAuthToken() {
  const res = await axios.post('http://localhost:YOUR_PORT/api/auth/register', {
    email: `bbd_${Date.now()}@test.com`,
    username: 'bbduser',
    password: 'password123',
  });

  return res.data.token;
}

// 📦 Send event (same structure as your backend expects)
const sendOrder = async () => {
  try {
    await axios.post(
      API,
      {
        topic: "orders",
        payload: {   // ✅ IMPORTANT: use payload (not data)
          orderId: `BBD-${Date.now()}-${orderCounter++}`,
          userId: `USR-${Math.floor(Math.random() * 1000)}`,
          amount: Math.floor(Math.random() * 5000) + 500,
          status: "PLACED",
          createdAt: new Date().toISOString()
        }
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}` // ✅ FIX
        }
      }
    );
  } catch (e) {
    console.error("Failed:", e.response?.status);
  }
};

async function runSimulation() {

  authToken = await getAuthToken(); // 🔥 MUST

  console.log("🔥 Warmup phase...");
  for (let i = 0; i < 20; i++) {
    await sendOrder();
    await sleep(500);
  }

  console.log("⚡ Spike phase...");
  await Promise.all(
    Array.from({ length: 50 }, () => sendOrder())
  );

  await sleep(2000);

  console.log("📉 Cooldown...");
  for (let i = 0; i < 10; i++) {
    await sendOrder();
    await sleep(300);
  }

  console.log("💥 Mega Burst...");
  await Promise.all(
    Array.from({ length: 100 }, () => sendOrder())
  );

  console.log("✅ Simulation done");
}

runSimulation();