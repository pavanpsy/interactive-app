import dotenv from "dotenv"

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions"

dotenv.config()
const openrouter_api_key = process.env.OPENROUTER_API_KEY!

async function callAiAgent(prompt: string): Promise<string> {
  const res = await fetch(`${OPENROUTER_URL}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openrouter_api_key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://yourapp.com",
        "X-Title": "Agent Runner"
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-nano-30b-a3b:free",
      messages: [
        {
            role: "system",
            content: prompt
        }
      ]
    })
  })


  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI Agent error: ${err}`)
  }

  const data = await res.json()
    // AI Agent response safety
  const text =
    data["choices"][0]["message"]["content"]

  return text.replace(/```json|```/g, "").trim()
}

/* ---------------- QUESTIONS ---------------- */

export async function generateQuestions(
  topic: string,
  difficulty: string
): Promise<string[]> {
  const prompt = `
You are a game show host.

Generate exactly 5 short questions.
Topic: ${topic}
Difficulty: ${difficulty}

Rules:
- Max 1 sentence per question
- No numbering
- Return ONLY valid JSON array of strings
`

  const text = await callAiAgent(prompt)

  try {
    return JSON.parse(text)
  } catch {
    console.error("Invalid questions JSON:", text)
    return []
  }
}

/* ---------------- JUDGING ---------------- */

export async function judgeAnswer(
  question: string,
  answer: string
): Promise<{ score: number; feedback: string }> {
  const prompt = `
You are a strict but fair game judge.

Question:
"${question}"

Player answer:
"${answer}"

Rules:
- Score from 0 to 10 (integer only)
- 1 short feedback sentence
- Return ONLY valid JSON

Format:
{
  "score": number,
  "feedback": string
}
`

  const text = await callAiAgent(prompt)

  try {
    const result = JSON.parse(text)
    return {
      score: Math.max(0, Math.min(10, result.score)),
      feedback: result.feedback || ""
    }
  } catch {
    console.error("Invalid judge JSON:", text)
    return { score: 0, feedback: "Could not judge answer." }
  }
}

/* ---------------- AI HOST INTRO ---------------- */

export async function aiIntro(): Promise<string> {
  const prompt = `
You are a sarcastic, playful game host.
Introduce yourself in 1–2 short lines.
No rules. No explanations.
`
  return callAiAgent(prompt)
}
