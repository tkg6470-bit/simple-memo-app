# **💾 データベース設計書 (Database Design Document)**

## **1\. ER図 (Entity Relationship Diagram)**

erDiagram  
    USERS ||--o{ MEMOS : "owns"  
    USERS {  
        string id PK "Clerk User ID"  
        string email "Email Address"  
        datetime created\_at  
    }  
    MEMOS {  
        int id PK "Auto Increment"  
        string user\_id FK "Ref: USERS.id"  
        string title "Memo Title"  
        text content "Memo Body"  
        string image\_url "S3 Object URL"  
        datetime created\_at "Default: now()"  
        datetime updated\_at "Auto update"  
    }

## **2\. テーブル定義 (Table Definitions)**

### **2.1 Memos テーブル**

メモの本体データを管理するテーブル。

| 論理名 | 物理名 | 型 | NULL | PK | FK | デフォルト値 | 備考 |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| メモID | id | SERIAL | NG | ○ |  | 自動連番 |  |
| ユーザーID | user\_id | VARCHAR(255) | NG |  | ○ |  | 認証プロバイダのID |
| タイトル | title | VARCHAR(255) | NG |  |  |  |  |
| 本文 | content | TEXT | NG |  |  |  |  |
| 画像URL | image\_url | VARCHAR(2048) | OK |  |  | NULL | S3のURL |
| 作成日時 | created\_at | TIMESTAMP | NG |  |  | CURRENT\_TIMESTAMP |  |
| 更新日時 | updated\_at | TIMESTAMP | NG |  |  | CURRENT\_TIMESTAMP | 更新時に自動更新 |

※ Usersテーブルは認証基盤（Clerk）側で管理されるため、本DBには user\_id のみを持つ（またはキャッシュ用のコピーを持つ）設計とする。