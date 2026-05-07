-- ログインID・パスワードハッシュカラムを追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- login_id のユニーク制約（NULL は除外）
CREATE UNIQUE INDEX IF NOT EXISTS users_login_id_idx
  ON users(login_id)
  WHERE login_id IS NOT NULL;
