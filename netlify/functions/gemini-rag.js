const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- サイトの知識データベース ---
// ★将来的には、ここをベクトルデータベースに置き換えます
const siteKnowledge = [
  { text: "Chromachannelは、福祉×AIクリエイターの山本倫久が運営する、AI活用を学ぶ実践サイトです。初心者向けAI学習講座や、福祉現場で使える制作実績（Webアプリ、教材）を無料公開しています。ミッションは「AIで『好き』を仕事に。福祉の現場に、創造の翼を。」です。", path: "/index.html" },
  { text: "学習(Learn)ページでは、全24講座+付録からなる、知識ゼロからAIクリエイターを目指せる体系的な無料学習ロードマップを提供しています。PC基礎から画像・動画生成、Web制作、ビジネス実践までを網羅しています。", path: "/learning-summary.html" },
  { text: "制作実績(Portfolio)ページでは、AI博士やタスク管理ツールなどの実際に動作するWebアプリや、架空NPO法人のサイト制作事例などを掲載しています。", path: "/portfolio.html" },
  { text: "プロンプト集(Prompts)ページでは、コピペで使える30種類以上の高品質なAIへの指示書を公開しています。対話形式で成果物を生み出すノウハウが詰まっています。", path: "/prompt.html" },
  { text: "ブログ(Blog)ページでは、AI学習のコツ、ツールの活用法、福祉現場でのAI活用事例、制作者の思索などを記録しています。", path: "/blog.html" },
  { text: "AI博士の談話室は、ユーザーの質問や悩みに優しく寄り添う対話AIです。プライバシーが守られた安全な設計になっています。", path: "/portfolio/hakase/hakase.html" },
  { text: "Fuwamoco PROJECTは、うさぎの保護活動を行う架空NPO法人の公式サイトで、山本倫久のWebサイト制作実績の一つです。企画・デザイン・実装まで一貫して担当しました。", path: "/portfolio/fuwamoco-detail.html" },
];
// --- ここまで ---

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userQuestion, conversationHistory } = JSON.parse(event.body);

    // --- RAGの「検索(Retrieval)」ステップ ---
    // ★本来はここでベクトル検索を行いますが、今回は簡易的に全知識を渡します
    const context = siteKnowledge.map(item => `- ${item.text} (関連ページ: ${item.path})`).join('\n');
    
    // --- RAGの「拡張(Augmented)」ステップ ---
    const finalPrompt = `
あなたはWebサイト「Chromachannel」の案内役を務める、優しくて物知りな「AI博士」です。
以下の【サイトの知識】と【過去の会話】を参考にして、ユーザーの質問に答えてください。
あなたの一般的な知識ではなく、必ず【サイトの知識】に基づいて回答してください。
関連するページがあれば、必ずそのページのパスを提示してください。

【サイトの知識】
${context}

【過去の会話】
${conversationHistory.map(turn => `${turn.role}: ${turn.parts[0].text}`).join('\n')}

【ユーザーの質問】
${userQuestion}
`;

    // --- RAGの「生成(Generation)」ステップ ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const aiMessage = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: aiMessage }),
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};