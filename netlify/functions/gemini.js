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

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const { contents, systemInstruction } = JSON.parse(event.body);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 

    // ストリーミングではなく、通常の一括生成に変更
    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      // フロントエンドが期待する形式で、完成したテキストを一度に返す
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