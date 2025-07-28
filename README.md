# 勤怠管理ボット（Kintai Bot）

Slack連携による勤怠管理システム。スラッシュコマンドやボタンで簡単に勤怠を記録できます。

## 機能

- **専用スラッシュコマンド**で簡単入力：`/start`, `/end`, `/break`, `/back`
- `/kintai` スラッシュコマンドでインタラクティブなボタンを表示
- テキストコマンドでの直接入力も可能（`/kintai start`, `/kintai end` など）
- メッセージベースでの記録（「業務開始」「業務終了」などのメッセージを送信）
- **ステータス管理**（退勤→業務中→休憩中の適切な遷移チェック）
- Web管理画面で月ごとの勤怠一覧を表示
- 合計稼働時間の自動計算（休憩時間を差し引き）

## セットアップ

### 1. 環境設定

`.env.example` を `.env.local` にコピーして、必要な情報を設定：

```bash
cp .env.example .env.local
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. データベースの起動

```bash
docker-compose up -d
```

### 4. データベースのセットアップ

```bash
npm run db:push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## Slack App設定

### 1. OAuth & Permissions
- Bot Token Scopesに以下を追加：
  - `chat:write`
  - `channels:history`
  - `commands`

### 2. Event Subscriptions
- Enable Events: ON
- Request URL: `https://your-domain.com/api/slack/events`
- Subscribe to bot events:
  - `message.channels`

### 3. Slash Commands
**メインコマンド:**
- Command: `/kintai`
- Request URL: `https://your-domain.com/api/slack/commands`
- Short Description: 勤怠を記録
- Usage Hint: [start|end|break|back]

**専用コマンド（推奨）:**
- Command: `/start`, Request URL: `https://your-domain.com/api/start`, Description: 業務開始
- Command: `/end`, Request URL: `https://your-domain.com/api/end`, Description: 業務終了  
- Command: `/break`, Request URL: `https://your-domain.com/api/break`, Description: 休憩開始
- Command: `/back`, Request URL: `https://your-domain.com/api/back`, Description: 休憩終了

### 4. Interactivity & Shortcuts
- Interactivity: ON
- Request URL: `https://your-domain.com/api/slack/interactions`

### 5. アプリをチャンネルに追加
```
/invite @your-bot-name
```

## 使い方

### 🚀 専用スラッシュコマンド（推奨）
最も簡単な方法：
- `/start` - 業務開始
- `/end` - 業務終了
- `/break` - 休憩開始
- `/back` - 休憩終了

### スラッシュコマンド
- `/kintai` - ボタン付きのインタラクティブメニューを表示
- `/kintai start` または `/kintai 開始` - 業務開始
- `/kintai end` または `/kintai 終了` - 業務終了
- `/kintai break` または `/kintai 休憩` - 休憩開始
- `/kintai back` または `/kintai 戻る` - 休憩終了

### メッセージ送信
チャンネルに以下のメッセージを送信しても記録されます：
- 「業務開始」
- 「業務終了」
- 「休憩開始」
- 「休憩終了」

### Web管理画面
http://localhost:3000/attendance で勤怠一覧を確認できます。

## データベース管理

```bash
# マイグレーション生成
npm run db:generate

# マイグレーション実行
npm run db:migrate

# Drizzle Studio（DB管理画面）
npm run db:studio
```