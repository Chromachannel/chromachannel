# Chromachannel | 福祉×AIクリエイター 山本 倫久 公式サイト

福祉×AIクリエイター 山本 倫久 (Norihisa Yamamoto) の活動内容や制作実績を紹介する公式サイトです。
AI技術で福祉の現場に新しい「できる」と「楽しい」を届けることをミッションに、AIを活用した制作実績や、実践的なナレッジ（ブログ記事、プロンプト集など）を紹介しています。

▶ **公式サイトをプレビューする:** [https://chromachannel.online/](https://chromachannel.online/)

## 📖 コンセプト

このサイトは、私、福祉×AIクリエイター 山本 倫久の「AIという最先端のテクノロジーを駆使して、福祉の現場に新しい『できる』と『楽しい』を届ける」というミッションを体現するものです。これは単なるポートフォリオサイトではなく、**私自身の経験に基づき体系化された、知識ゼロからでもAIクリエイターを目指せる完全無料の「教育プラットフォーム」**です。

このサイト自体が、AIを「共同制作者」として活用する、私の制作スタイルの最大のショーケースとなっています。

## ✨ 主な機能と特徴

- **体系的な学習ロードマップ:** 全26の講座を通じて、PCの基本操作から、画像・音声・動画生成、さらにはビジネス応用までをステップ・バイ・ステップで学べます。
- **実践的なプロンプト集:** コピペで使える30種類以上の高品質プロンプトを提供。AIに特定の役割を与え、対話形式で成果物を生み出す独自のノウハウが詰まっています。
- **多様な制作実績:** 静的なウェブサイト制作から、JavaScriptを用いたインタラクティブなゲームやWebアプリケーションまで、幅広い開発スキルを証明しています。
- **高度なインタラクティブUI:** JavaScriptによるコンポーネントの動的読み込み、スクロールに応じたフェードインアニメーション、カテゴリ別フィルター機能などを実装。
- **アクセシビリティへの配慮:** サイトワイドの音声読み上げ機能を`voice-module.js`で独自に実装。`data-speech`属性による読み替えなど、誰にとっても使いやすいサイトを目指しています。
- **高機能AIチャットボット:** Gemini APIと連携した「AI博士の談話室」を設置。会話履歴の`localStorage`への自動保存・復元・削除機能を備えた、プライバシー配慮型の実用的なアプリケーションです。
- **徹底したSEO対策:** 各ページに最適化された`meta`タグ, `canonical`, `OGP`タグ、そして網羅的な`sitemap.xml`と構造化データ（JSON-LD）を活用し、検索エンジンからの評価を最大化しています。

## 💻 使用技術・ツール

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Gemini API](https://img.shields.io/badge/Gemini%20API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

- **AIアシスタント:** ChatGPT, Google Gemini, Microsoft Copilot, Claude
- **画像生成:** Stable Diffusion, ImageFX, Leonardo.Ai, SeaArt.ai
- **音声・音楽生成:** VOICEVOX, Suno AI
- **動画編集:** ゆっくりムービーメーカー4 (YMM4)
- **デザイン・加工:** Canva, GIMP, Inkscape, Photopea, Squoosh
- **ライブラリ:** ress.min.css, Font Awesome

## 📂 サイト構造 (主要ファイル)

```
/ (ルート)
├── index.html (トップページ)
├── portfolio.html (制作実績一覧)
├── learn.html (学習トップ - 講座一覧)
├── blog.html (ブログ一覧)
├── prompt.html (プロンプト一覧)
├── novels.html (小説一覧)
├── privacy.html
├── sitemap.xml
├── readme.md
├── learning-summary.html (各テーマまとめページ x7)
│
├── blog/ (全23記事)
│ ├── announcing-chromapadou.html # ★★★ 追加 ★★★
│ ├── ai-line-stamp-rejection-guide.html
│ └── ... (他21記事)
│
├── learn/ (全26講座)
│   ├── learn_lesson0.html (PC操作入門)
│   ├── ... (lesson1～24)
│   └── learn_lesson25.html (講座付録)
│
├── novels/ (全7小説)
│   ├── hoshizora-no-melody.html
│   └── ... (他6作品)
│
├── portfolio/ (Webアプリ/サイト制作実績)
│   ├── fuwamoco-detail.html
│   ├── hakase/hakase.html (AI博士)
│   ├── Adaptive_System/adaptive_system.html (AIタスク管理)
│   ├── Game/pict.html (AI体験ゲーム)
│   ├── Fuwamoco/ (架空NPOサイト 全9ページ)
│   │   ├── index.html
│   │   └── ... (他8ページ)
│   └── ... (他多数のWebアプリ/ツール)
│
├── prompt/ (全29プロンプト)
│   ├── prompt-architect.html (プロンプト自動設計)
│   └── ... (他28プロンプト)
│
├── CSS/
│   ├── bundle.min.css (共通)
│   └── ... (ページ/アプリ専用CSS x10以上)
│
├── JavaScript/
│   ├── script.js (共通)
│   ├── voice-module.js (音声読み上げ機能)
│   └── ... (各アプリ専用JS x8)
│
├── img/ (画像素材)
└── Sounds/ (音声素材)
```

## 👤 制作者

- **氏名:** 山本 倫久 (Norihisa Yamamoto)
- **役職:** 福祉 × AIクリエイター
- **拠点:** 大阪府大阪市
- **連絡先:** from.aito.the.infinity@gmail.com
- **X (旧Twitter):** [@ChromachannelAI](https://x.com/ChromachannelAI)
- **GitHub:** [Chromachannel](https://github.com/Chromachannel)

---
© 2025 chromachannel. All rights reserved.