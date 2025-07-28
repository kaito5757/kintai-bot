# 勤怠管理ボット（Kintai Bot）

Slack連携による勤怠管理システム。スラッシュコマンドやボタンで簡単に勤怠を記録できます。

## 機能

- **専用スラッシュコマンド**で簡単入力：`/start`, `/end`, `/break`, `/back`
- メッセージベースでの記録（「業務開始」「業務終了」などのメッセージを送信）
- **ステータス管理**（退勤→業務中→休憩中の適切な遷移チェック）
- Web管理画面で月ごとの勤怠一覧を表示
- 合計稼働時間の自動計算（休憩時間を差し引き）

## 技術スタック

- **Frontend**: Next.js 15.4.4, React 19.1.0, TypeScript 5, Tailwind CSS 4
- **Backend**: Next.js API Routes, Slack Events API
- **Database**: PostgreSQL (Neon), Drizzle ORM 0.44.3
- **Deployment**: Vercel
- **Package Manager**: pnpm

## セットアップ

### 1. 環境設定

`.env.local` ファイルを作成して、必要な情報を設定：

```bash
# Slack設定
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# データベース（Neon PostgreSQL）
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. データベースのセットアップ

```bash
# スキーマをデータベースにプッシュ
pnpm run db:push

# または、マイグレーションファイルを生成してから実行
pnpm run db:generate
pnpm run db:migrate
```

### 4. 開発サーバーの起動

```bash
pnpm run dev
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

以下の専用コマンドを設定：

- Command: `/start`, Request URL: `https://your-domain.com/api/start`, Description: 業務開始
- Command: `/end`, Request URL: `https://your-domain.com/api/end`, Description: 業務終了
- Command: `/break`, Request URL: `https://your-domain.com/api/break`, Description: 休憩開始
- Command: `/back`, Request URL: `https://your-domain.com/api/back`, Description: 休憩終了

### 4. アプリをチャンネルに追加

```bash
/invite @your-bot-name
```

## 使い方

### 🚀 スラッシュコマンド

以下のコマンドで勤怠を記録：

- `/start` - 業務開始
- `/end` - 業務終了
- `/break` - 休憩開始
- `/back` - 休憩終了

### メッセージ送信

チャンネルに以下のメッセージを送信しても記録されます：

- 「業務開始」
- 「業務終了」
- 「休憩開始」
- 「休憩終了」

### Web管理画面

- 勤怠一覧: `http://localhost:3000/attendance`
- チャンネル別勤怠: `http://localhost:3000/attendance/{channelId}`
- ユーザー別勤怠: `http://localhost:3000/attendance/{channelId}/{userId}`

## データベース管理

```bash
# マイグレーション生成
pnpm run db:generate

# マイグレーション実行
pnpm run db:migrate

# スキーマをデータベースにプッシュ（開発時推奨）
pnpm run db:push

# Drizzle Studio（DB管理画面）
pnpm run db:studio
```

## デプロイ

### Vercelへのデプロイ

1. **Vercelプロジェクト作成**

   ```bash
   vercel
   ```

2. **環境変数設定**
   - Vercel Dashboard → Settings → Environment Variables
   - 以下の環境変数を設定：
     - `SLACK_SIGNING_SECRET`
     - `SLACK_BOT_TOKEN`
     - `DATABASE_URL`

3. **Functions実行リージョン設定**
   - Settings → Functions → Region → Asia-Pacific (Tokyo)

4. **デプロイ**

   ```bash
   vercel --prod
   ```

## トラブルシューティング

### Slackコマンドがタイムアウトする

- Vercel Functionsのリージョンが日本に設定されているか確認
- データベースのレイテンシを確認（Neonの場合はシンガポールリージョン）
- DATABASE_URLが正しく設定されているか確認

## 開発

### コード構成

```bash
src/
├── app/
│   ├── api/                # API Routes
│   │   ├── start/         # /start コマンド
│   │   ├── end/           # /end コマンド
│   │   ├── break/         # /break コマンド
│   │   ├── back/          # /back コマンド
│   │   └── slack/         # Slack連携API
│   └── attendance/        # Web管理画面
├── components/            # React コンポーネント
├── db/                   # データベース設定・スキーマ
└── lib/                  # ユーティリティ・ビジネスロジック
```
