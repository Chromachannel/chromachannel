# Chromachannel | 福祉×AIクリエイター 山本 倫久 公式サイト

福祉×AIクリエイター 山本 倫久 (Norihisa Yamamoto) の活動内容や制作実績を紹介する公式サイトです。
AI技術で福祉の現場に新しい「できる」と「楽しい」を届けることをミッションに、AIを活用した制作実績や、実践的なナレッジ（ブログ記事、プロンプト集など）を紹介しています。

▶ **公式サイトをプレビューする:** [https://chromachannel.online/](https://chromachannel.online/)

## 📖 コンセプト

このサイトは、私、福祉×AIクリエイター 山本 倫久の「AIという最先端のテクノロジーを駆使して、福祉の現場に新しい『できる』と『楽しい』を届ける」というミッションを体現するものです。これは単なるポートフォリオサイトではなく、**私自身の経験に基づき体系化された、知識ゼロからでもAIクリエイターを目指せる完全無料の「教育プラットフォーム」**です。

このサイト自体が、AIを「共同制作者」として活用する、私の制作スタイルの最大のショーケースとなっています。

## ✨ 主な機能と特徴

- **🔰 初心者向けガイド:** サイトの歩き方や、初心者におすすめのコンテンツをまとめた案内ページを設置。
- **🤖 対話型AIチャットボット「AI博士」:** ユーザーの質問や悩みに優しく寄り添うAIと自由に会話できる機能を搭載。
- **🔊 全面的な音声読み上げ対応:** 記事や講座の主要なテキストに再生ボタンを設置し、アクセシビリティを確保。
- **🎮 体験型学習アプリ:** AIの仕組みをゲーム感覚で学べる、インタラクティブなWebアプリケーションを複数開発。
- **📚 体系的な学習ロードマップ:** ステップ0からステップ4まで、知識ゼロからでも挫折しない学習フローを設計。
- **🪄 実践的なプロンプト集:** コピペで使える30種類以上の高品質プロンプトを提供。AIに特定の役割を与え、対話形式で成果物を生み出す独自のノウハウが詰まっています。
- **🎨 多様な制作実績:** 静的なウェブサイト制作から、JavaScriptを用いたインタラクティブなゲームやWebアプリケーションまで、幅広い開発スキルを証明しています。
- **✨ 高度なインタラクティブUI:** JavaScriptによるコンポーネントの動的読み込み、スクロールに応じたフェードインアニメーション、カテゴリ別フィルター機能などを実装。
- **🗣️ アクセシビリティへの配慮:** サイトワイドの音声読み上げ機能を`voice-module.js`で独自に実装。`data-speech`属性による読み替えなど、誰にとっても使いやすいサイトを目指しています。
- **💬 高機能AIチャットボット:** Gemini APIと連携した「AI博士の談話室」を設置。会話履歴の`localStorage`への自動保存・復元・削除機能を備えた、プライバシー配慮型の実用的なアプリケーションです。
- **📈 徹底したSEO対策:** 各ページに最適化された`meta`タグ, `canonical`, `OGP`タグ、そして網羅的な`sitemap.xml`と構造化データ（JSON-LD）を活用し、検索エンジンからの評価を最大化しています。

## 💻 使用技術・ツール

- **フロントエンド:**![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
- **バックエンド:**![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
- **AI API:** ![Google Gemini API](https://img.shields.io/badge/Gemini%20API-4285F4?style=for-the-badge&logo=google&logoColor=white)
- **AIアシスタント:** ChatGPT, Google Gemini, Microsoft Copilot, Claude
- **画像生成:** Stable Diffusion, ImageFX, Leonardo.Ai, SeaArt.ai
- **音声・音楽生成:** VOICEVOX, Suno AI
- **動画編集:** ゆっくりムービーメーカー4 (YMM4)
- **デザイン・加工:** Canva, GIMP, Inkscape, Photopea, Squoosh
- **ライブラリ:** ress.min.css, Font Awesome

## 📂 サイト構造 (主要ファイル)

```
/ (ルートディレクトリ)
├── 📂 blog/               # ブログ記事 (全22記事)
│   ├── announcing-ai-hakase.html
│   └── ... (他21記事)
├── 📂 CSS/                 # スタイルシート (全15ファイル)
│   ├── style.css             # サイト共通スタイル
│   ├── only_read.css         # 記事・ポートフォリオカード共通スタイル
│   ├── only_app.css          # 講座ページ共通スタイル
│   └── ... (各アプリ・ページ専用CSS x12)
├── 📂 img/                 # 画像素材 (OGP画像、アイキャッチ、ロゴ等)
├── 📂 JavaScript/          # JavaScriptファイル (全11ファイル)
│   ├── bundle.min.js         # サイト共通スクリプト(動的読込、UI制御、音声機能)
│   └── ... (各アプリ専用JS x10)
├── 📂 learn/               # 学習コンテンツ (全27ページ)
│   ├── learn_lesson0.html    # ステップ0
│   ├── ...                 # ステップ1～4 (計24講座)
│   ├── learn_lesson25.html   # 講座付録
│   └── glossary.html       # 用語集
├── 📂 novels/              # 小説 (全7作品)
│   ├── hoshizora-no-melody.html
│   └── ... (他6作品)
├── 📂 portfolio/           # 制作実績 (Webアプリ/サイト)
│   ├── 📂 Adaptive_System/   # AI適応型タスク管理システム
│   ├── 📂 Ai-Slide-App/     # AI体験スライドアプリ
│   ├── 📂 chirashi/          # AI活用チラシ
│   ├── 📂 Components/        # AIの赤ちゃん 育成アプリ
│   ├── 📂 Demo/              # AIってなんだろう？デモ
│   ├── 📂 Fuwamoco/          # 架空NPO法人サイト (全9ページ)
│   ├── 📂 hakase/            # AI博士の談話室
│   ├── 📂 Household_Account_Book/ # かわいい家計簿アプリ
│   ├── 📂 pict/              # AI体験ゲーム
│   ├── 📂 Real-time-preview/ # リアルタイムプレビューエディタ
│   ├── 📂 Task-Tool/         # 利用者向けタスク管理ツール
│   └── 📂 Timer/             # 多機能オンライン時計
├── 📂 prompt/              # プロンプト指示書 (全28ページ)
│   ├── prompt-architect.html
│   └── ... (他27プロンプト)
├── 📂 Sounds/              # 音声素材 (インタラクティブデモ用)
│
├── index.html              # サイトの玄関 (トップページ)
├── beginner-guide.html     # 初心者向けガイド
├── portfolio.html          # 制作実績トップ
├── prompt.html             # プロンプト集トップ
├── blog.html               # ブログトップ
├── novels.html             # 小説トップ
├── profile.html            # 運営者プロフィール
├── contact.html            # お問い合わせ (未作成)
├── privacy.html            # プライバシーポリシー
│
├── 📄 **まとめページ群 (全7ページ)**
├── learning-summary.html   # AI学習 全講座まとめ
├── apps-summary.html       # アプリ・ツール まとめ
├── lifehack-summary.html   # 暮らし・生活改善 まとめ
├── business-summary.html   # ビジネス・仕事術 まとめ
├── entertainment-summary.html # エンタメ まとめ
├── creative-summary.html   # 創作・クリエイティブ まとめ
└── rabbit-summary.html     # うさぎ まとめ
│
├── sitemap.xml             # サイトマップ
└── readme.md               # プロジェクト概要
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