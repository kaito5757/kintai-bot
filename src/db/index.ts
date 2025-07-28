import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString, {
  max: 5, // 最大接続数をさらに制限
  idle_timeout: 10, // アイドル接続のタイムアウトを短縮 (秒)
  max_lifetime: 60 * 15, // 接続の最大生存時間を短縮 (秒)
  connect_timeout: 10, // 接続タイムアウト (秒)
});

export const db = drizzle(client, { schema });