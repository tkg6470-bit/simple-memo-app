

### **📘 開発手順書 (Phase 1-4: Hono移行編)**

今回の移行作業のログです。将来「なぜ Express をやめたのか？」「どうやって移行したのか？」を振り返るのに役立ちます。

Markdown

\# 📘 メモアプリ開発手順書 (Phase 1-4: Honoへの移行)

本フェーズでは、バックエンドフレームワークを \`Express\` から、より高速でTypeScript親和性の高い \`Hono\` へ移行した。

\#\# 🚀 1\. 移行の背景  
\* **\*\*パフォーマンス\*\***: Hono は Express に比べて圧倒的に軽量・高速である。  
\* **\*\*Web標準\*\***: Web Standards (Fetch API) に準拠しており、将来的には Cloudflare Workers や AWS Lambda 等への展開も容易になる。  
\* **\*\*TypeScript\*\***: 型推論が強力で、開発体験が向上する。

\#\# 🛠️ 2\. 実施内容

\#\#\# **\*\*2.1 ライブラリの入れ替え\*\***  
Express 関連を削除し、Hono および Node.js アダプタを導入。  
\`\`\`bash  
npm uninstall express @types/express cors @types/cors  
npm install hono @hono/node-server

### **2.2 コントローラーの書き換え (controllers/)**

Express の req, res パターンから、Hono の Context (c) パターンへ変更。

* **レスポンス**: res.json(data) → return c.json(data)  
* **リクエストボディ**: req.body → await c.req.json()  
* **パスパラメータ**: req.params.id → c.req.param('id')  
* **ステータスコード**: res.status(201) → return c.json(data, 201\)

### **2.3 ルーティングの書き換え (routes/)**

* express.Router() → new Hono()  
* メソッド定義は app.get, app.post 等、ほぼ同様の使用感で移行可能。

### **2.4 エントリーポイントの変更 (index.ts)**

* app.listen ではなく、@hono/node-server の serve 関数を使用。  
* CORS設定を hono/cors ミドルウェアに変更。

## **✅ 3\. 成果**

* ディレクトリ構造（Controller/Service分離）を維持したまま、フレームワークのみを差し替えることに成功。  
* フロントエンド側のコード変更なしで、バックエンドの刷新が完了した。

\---

\#\#\# 🔮 次のステップ

これでバックエンドが最新鋭の状態になりました。  
ロードマップに戻ると、次は \*\*「1-5. バリデーション (Zod) の導入」\*\* です。

今のままだと、「タイトルが空のメモ」などを送られた時にエラーチェックが弱いです。Zod を入れて\*\*「正しいデータしか保存させない」\*\*ようにして、アプリを堅牢にしますか？  
