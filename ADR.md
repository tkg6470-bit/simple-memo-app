# **🏛️ Architecture Decision Records (ADR)**

本プロジェクトにおける重要な技術選定と、その決定に至った背景・理由の記録。

## **ADR-001: 開発環境の完全Docker化**

* **Status**: Accepted  
* **Date**: 2025-xx-xx

### **Context (背景)**

開発者ごとのローカル環境（OS、Node.jsバージョン等）の差異により、「私の環境では動くのに」という問題が発生するリスクがあった。

### **Decision (決定)**

フロントエンド、バックエンド、データベースのすべてを docker-compose.yml で定義し、Dockerコンテナ上で動作させる。  
また、npm install 等のコマンドもホストOSではなくコンテナ経由で実行する運用とする。

### **Consequences (結果)**

* **Positive**: 環境構築が docker compose up コマンド一つで完結するようになった。チーム開発時のオンボーディングコストが激減した。  
* **Negative**: Docker の学習コストが発生する。ボリュームマウント設定（node\_modules）に注意が必要。

## **ADR-002: 言語としてのTypeScript全面採用**

* **Status**: Accepted  
* **Date**: 2025-xx-xx

### **Context (背景)**

JavaScriptによる開発では、実行時エラー（undefined 参照など）が頻発し、大規模化に伴い保守性が低下する懸念があった。

### **Decision (決定)**

フロントエンド（React）、バックエンド（Node.js）の両方で TypeScript を採用する。

### **Consequences (結果)**

* **Positive**: 型定義により、コーディング段階で多くのバグを検知可能になった。IDEの補完機能が効き、開発効率が向上した。  
* **Negative**: 型定義ファイルの作成や、ビルドプロセスの設定（tsconfig.json）が必要になった。

## **ADR-003: インフラとしてのAWS App Runner採用**

* **Status**: Proposed (Phase 2予定)  
* **Date**: 2025-xx-xx

### **Context (背景)**

本番環境へのデプロイにおいて、EC2（仮想サーバー）のOS管理やセキュリティパッチ適用などの運用コストを削減したかった。

### **Decision (決定)**

コンテナネイティブなフルマネージドサービスである AWS App Runner を採用する。

### **Consequences (結果)**

* **Positive**: インフラ管理（サーバー構築、ロードバランサー設定、SSL証明書管理）が不要になり、アプリ開発に集中できる。オートスケーリングも容易。  
* **Negative**: ステートレスな環境であるため、画像ファイルなどをローカル保存できず、S3への外部化が必須となる（ADR-004へ続く）。

## **ADR-004: 画像保存先としてのS3採用**

* **Status**: Proposed (Phase 2予定)  
* **Date**: 2025-xx-xx

### **Context (背景)**

App Runner はコンテナ再起動時に内部データが初期化される（エフェメラルなストレージ）ため、アップロードされた画像を永続化する場所が必要。

### **Decision (決定)**

AWS S3 (Simple Storage Service) を採用し、画像の実体はS3に保存、DBにはそのURLパスのみを保存する。

### **Consequences (結果)**

* **Positive**: 高い耐久性と可用性で画像を保存できる。Webサーバーの負荷を軽減できる。  
* **Negative**: S3バケットの設定や、署名付きURLの発行など、実装の複雑性が増す。