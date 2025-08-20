const fetch = require('node-fetch');

exports.handler = async function(event) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

  try {
    const requestBody = JSON.parse(event.body); // データを一度取り出す

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: requestBody.contents,
        systemInstruction: requestBody.systemInstruction
      }), // 正しい形式で再構築して送る
    });

    if (!response.ok) {
        const errorData = await response.text();
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: `API Error: ${errorData}` }),
        };
    }
    
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};