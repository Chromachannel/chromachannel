const { GoogleGenerativeAI } = require("@google/generative-ai");

// Netlifyの環境変数からAPIキーを取得
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { contents, systemInstruction } = JSON.parse(event.body);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    // ストリーミングでコンテンツを生成
    const result = await model.generateContentStream(contents);

    // Node.jsのストリームを作成し、Netlify Functionsのストリーミング応答に対応
    const { PassThrough } = require("stream");
    const stream = new PassThrough();

    // 非同期でストリームを処理
    (async () => {
      for await (const chunk of result.stream) {
        stream.write(JSON.stringify(chunk));
      }
      stream.end();
    })();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: stream,
      isBase64Encoded: false,
    };

  } catch (error) {
    console.error("Error in Gemini function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};