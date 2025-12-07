---

# **📘 開発手順書 (Phase 2-2: 画像アップロード)**

本フェーズでは、AWS S3 互換のオブジェクトストレージ **MinIO** を Docker 環境に導入し、メモへの画像添付機能を実装した。

## **🎯 1\. 目的**

* **メディア対応**: テキストだけでなく画像を扱えるようにし、アプリの実用性を高める。  
* **クラウドシミュレーション**: ローカル環境で AWS S3 と同等の開発を行い、本番移行をスムーズにする。

## **🛠️ 2\. インフラ構築 (MinIO)**

### **2.1 docker-compose.yml の修正**

MinIO 本体と、バケット自動作成用のコンテナを追加した。

* **MinIO本体**:  
  * ポート 9000 (API用) と 9001 (管理画面用) を開放。  
  * データ永続化のためにボリューム (minio\_data) を設定。  
* **createbuckets**:  
  * 起動時に mc コマンドを実行し、memo-bucket の作成と公開設定 (public) を自動で行う。

YAML

  minio:  
    image: minio/minio  
    ports: \["9000:9000", "9001:9001"\]  
    \# ...  
  createbuckets:  
    image: minio/mc  
    entrypoint: \>  
      /bin/sh \-c "  
      mc alias set myminio http://minio:9000 minio\_user minio\_password;  
      mc mb myminio/memo-bucket;  
      mc anonymous set public myminio/memo-bucket;  
      exit 0;  
      "

### **2.2 環境変数の設定 (.env)**

MinIO への接続情報を定義。本番環境（AWS）に移行する際は、ここの値を変更するだけで済む設計とした。

コード スニペット

AWS\_ACCESS\_KEY\_ID=minio\_user  
AWS\_SECRET\_ACCESS\_KEY=minio\_password  
AWS\_ENDPOINT=http://minio:9000  
AWS\_PUBLIC\_ENDPOINT=http://localhost:9000

## **📝 3\. バックエンド実装**

### **3.1 データベース改修 (schema.prisma)**

Memo モデルに画像URLを保存するためのカラムを追加。

コード スニペット

model Memo {  
  // ...  
  imageUrl  String?  @map("image\_url") // 任意項目  
}

### **3.2 ストレージサービス (services/storageService.ts)**

AWS SDK (@aws-sdk/client-s3) を使用して、画像データをアップロードするロジックを実装。

* ファイル名は uuid でランダム生成し、重複を防ぐ。  
* アップロード後、ブラウザからアクセス可能なURLを生成して返す。

### **3.3 サービス層の修正 (services/memoService.ts)**

createMemo と updateMemo の引数に imageUrl を追加し、DB保存時に画像URLも記録できるように変更。

### **3.4 コントローラーの修正 (controllers/memoController.ts)**

* リクエストの受け取り方を c.req.json() から c.req.parseBody() (FormData) に変更。  
* 画像ファイルが含まれている場合、storageService を呼び出してアップロードし、URLを取得してから memoService に渡すフローを構築。

### **3.5 ルート定義の修正 (routes/memoRoutes.ts)**

バリデーション（Zod）の設定を 'json' から 'form' に変更し、FormData 形式のリクエストを受け付けるようにした。

## **🎨 4\. フロントエンド実装 (App.tsx)**

* **フォーム変更**: \<input type="file"\> を追加し、画像を選択できるようにした。  
* **送信処理**: axios.post で送信するデータを FormData オブジェクトに変更。  
* **表示処理**: メモ一覧に \<img src={memo.imageUrl} /\> を追加し、画像がある場合のみ表示するようにした。

## **✅ 5\. 成果**

* ローカル環境 (Docker) だけで、AWS S3 と同等の画像アップロード機能を完全再現できた。  
* メモの作成・更新時に画像を添付し、一覧画面でプレビュー表示できることを確認した。

---

この手順書を docs/phase2-2-image.md などに保存しておくと、後で見返すのに便利です。  
本当にお疲れ様でした！これで Phase 2 も完遂です！