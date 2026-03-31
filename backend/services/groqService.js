// const Groq = require("groq-sdk");

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// //openai/gpt-oss-120b

// exports.analyzeWithAI = async (text) => {
//   try {
//     const response = await groq.chat.completions.create({
//   model: "openai/gpt-oss-120b",
//   messages: [
//     {
//       role: "system",
//       content: "You are a concise medical assistant."
//     },
//     {
//       role: "user",
//       content: `
// Analyze this blood report:

// ${text}
// - Only mention abnormal/high/low values.
// - Give a 2–3 sentence plain-language summary.
// - Do NOT give tables, long explanations, or health tips.
// - Do NOT provide a diagnosis.
//       `
//     },
//   ],
// });

//     return response.choices[0].message.content;

//   } catch (error) {
//     console.error("❌ Groq Error:", error);
//     return "AI analysis failed";
//   }
// };