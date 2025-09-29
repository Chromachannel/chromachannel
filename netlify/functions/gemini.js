const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables.");
    return { statusCode: 500, body: JSON.stringify({ error: "API key is not configured." }) };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const { contents, systemInstruction } = JSON.parse(event.body);
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
    }); 

    // ▼▼▼ ここからが最終修正箇所 ▼▼▼
    // systemInstructionを、会話履歴の最初の「モデル」の発言として組み込む
    const historyWithSystemPrompt = [
      {
        role: "user",
        parts: [{ text: systemInstruction.parts[0].text }],
      },
      {
        role: "model",
        parts: [{ text: "はい、承知いたしました。その役割として対話を開始します。" }],
      },
      ...contents
    ];

    const result = await model.generateContent({ contents: historyWithSystemPrompt });
    // ▲▲▲ ここまでが最終修正箇所 ▲▲▲
    
    const response = result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
    };

  } catch (error) {
    console.error("Error in Gemini function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};