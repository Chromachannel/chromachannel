// node-fetchを使わず、Node.js標準のhttpsモジュールを使用
const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables.");
    return { statusCode: 500, body: JSON.stringify({ error: "API key is not configured." }) };
  }

  try {
    const { contents, systemInstruction } = JSON.parse(event.body);
    const model = "gemini-1.5-flash-latest";

    const requestBody = JSON.stringify({
      contents: contents,
      systemInstruction: systemInstruction,
    });

    // https.requestを使った、確実なAPI呼び出し
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            console.error("Google API Error:", data);
            reject(new Error(`Google API responded with status ${res.statusCode}`));
          } else {
            resolve(JSON.parse(data));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(requestBody);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error("Error in Gemini function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};