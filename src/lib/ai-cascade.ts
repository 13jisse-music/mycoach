// Cascade IA : Gemini (gratuit) → Groq (gratuit) → OpenAI (payant)

interface AIResponse {
  text: string;
  provider: string;
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function aiCascade(
  prompt: string,
  geminiKey?: string,
  groqKey?: string
): Promise<AIResponse> {
  // 1. Gemini Flash (gratuit)
  if (geminiKey) {
    try {
      const text = await callGemini(prompt, geminiKey);
      if (text) return { text, provider: "gemini" };
    } catch {
      // fallback
    }
  }

  // 2. Groq Llama (gratuit)
  if (groqKey) {
    try {
      const text = await callGroq(prompt, groqKey);
      if (text) return { text, provider: "groq" };
    } catch {
      // fallback
    }
  }

  return { text: "Aucun service IA disponible", provider: "none" };
}
