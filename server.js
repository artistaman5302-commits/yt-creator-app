require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

async function callAI(systemPrompt, userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "yahan_apni_api_key_paste_karo") {
    throw new Error("GEMINI_API_KEY .env file me set nahi hai. README dekho.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "Gemini API se error aaya");
  }

  const candidate = data.candidates && data.candidates[0];
  const parts = candidate && candidate.content && candidate.content.parts;

  if (!parts || parts.length === 0) {
    throw new Error("Gemini se koi response nahi mila. Dobara try karo.");
  }

  return parts.map((p) => p.text || "").join("\n");
}

app.post("/api/script", async (req, res) => {
  try {
    const { topic, duration, language } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: "Topic khali nahi ho sakta" });
    }
    const systemPrompt = `Tum ek experienced YouTube scriptwriter ho jo viral content banana janta hai.
Tumhara kaam hai user ke diye gaye topic par ek engaging script likhna jisme:
1. Pehle 10-15 seconds me strong hook ho jo viewer ko rokta ho
2. Main content clear aur interesting tarike se explain kiya gaya ho
3. Beech me engagement points ho
4. End me clear Call-To-Action ho (subscribe, like, comment)
Script ki language: ${language || "Hindi/Hinglish"}`;
    const userMessage = `Topic: ${topic}\nVideo duration: ${duration || "5-7 minutes"}\n\nPlease is topic par ek complete YouTube script likho.`;
    const result = await callAI(systemPrompt, userMessage);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/title", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: "Topic khali nahi ho sakta" });
    }
    const systemPrompt = `Tum ek YouTube growth expert ho jo viral titles aur thumbnails banana janta hai.
Tumhara kaam hai user ke topic ke liye:
1. 8 alag-alag click-worthy titles dena
2. Har title ke saath ek short thumbnail text/concept suggest karna
Clickbait mat karo, sach ke close raho lekin interesting banao.`;
    const userMessage = `Topic: ${topic}\n\nIs topic ke liye titles aur thumbnail ideas do.`;
    const result = await callAI(systemPrompt, userMessage);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/seo", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, error: "Topic khali nahi ho sakta" });
    }
    const systemPrompt = `Tum ek YouTube SEO expert ho.
Tumhara kaam hai user ke video topic ke liye:
1. Ek optimized video description likhna (150-200 words)
2. 15 relevant tags dena
3. 5 hashtags dena jo search me help karein
Format clear aur copy-paste karne layak rakho.`;
    const userMessage = `Topic: ${topic}\n\nIs video ke liye SEO description, tags aur hashtags do.`;
    const result = await callAI(systemPrompt, userMessage);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/editing", async (req, res) => {
  try {
    const { script } = req.body;
    if (!script || !script.trim()) {
      return res.status(400).json({ success: false, error: "Script khali nahi ho sakti" });
    }
    const systemPrompt = `Tum ek professional video editor ho.
User tumhe apni video script dega. Tumhara kaam hai:
1. Script ko sections me todna aur approximate timestamps dena
2. Har section ke liye B-roll/visual suggestions dena
3. Kaha pe cut/transition lagana chahiye ye batana
4. Background music mood suggest karna`;
    const userMessage = `Yeh hai meri script:\n\n${script}\n\nIsse editing plan me convert karo.`;
    const result = await callAI(systemPrompt, userMessage);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server chal raha hai" });
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});
