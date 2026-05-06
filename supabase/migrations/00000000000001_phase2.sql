-- Phase 2: User ID, Recovery, Labeling, and Notifications

-- 1. Usersテーブルの拡張
ALTER TABLE users ADD COLUMN IF NOT EXISTS aid_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_code TEXT;

-- 既存ユーザーにAID-IDと復旧コードを生成する関数
CREATE OR REPLACE FUNCTION generate_aid_id() RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    new_id := 'AID-' || upper(substring(md5(random()::text), 1, 6));
    IF NOT EXISTS (SELECT 1 FROM users WHERE aid_id = new_id) THEN
      done := TRUE;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 既存データの更新（もしあれば）
UPDATE users SET aid_id = generate_aid_id() WHERE aid_id IS NULL;
UPDATE users SET recovery_code = upper(substring(md5(random()::text), 1, 8)) WHERE recovery_code IS NULL;

-- 2. Labels (団体ごとのラベル定義)
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6', -- デフォルトは青
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 3. Organization Participants (団体が管理する参加者名簿)
-- イベント参加とは別に、団体が継続的に管理するユーザーリスト
CREATE TABLE organization_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 4. User Labels (参加者へのラベル付与)
CREATE TABLE user_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_participant_id UUID NOT NULL REFERENCES organization_participants(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_participant_id, label_id)
);

-- 5. Push Subscriptions (ブラウザプッシュ通知用)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Scouts / Invitations (団体から個人への要請)
CREATE TABLE scout_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
