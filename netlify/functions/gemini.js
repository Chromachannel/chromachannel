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
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    const result = await model.generateContentStream(contents);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          if (chunk && typeof chunk.text === 'function') {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
        }
        controller.close();
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
      body: stream,
    };

  } catch (error) {
    console.error("Error in Gemini function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};