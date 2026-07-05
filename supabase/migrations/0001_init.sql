-- FAQナレッジベース
create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 問い合わせログ（自動応答／要対応の記録）
create table conversations (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null,
  line_message_id text unique,
  message_text text not null,
  answer_text text,
  status text not null default 'auto_answered'
    check (status in ('auto_answered', 'escalated', 'resolved')),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index conversations_status_created_idx on conversations (status, created_at desc);

-- 配信履歴
create table broadcasts (
  id uuid primary key default gen_random_uuid(),
  message_text text not null,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

-- 設定（単一行）
create table app_settings (
  id int primary key default 1 check (id = 1),
  line_channel_secret text,
  line_channel_access_token text,
  anthropic_api_key text,
  owner_line_user_id text,
  owner_line_user_id_confirmed boolean not null default false,
  setup_code text,
  updated_at timestamptz not null default now()
);
insert into app_settings (id) values (1);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger faqs_updated_at
  before update on faqs
  for each row execute function set_updated_at();

create trigger app_settings_updated_at
  before update on app_settings
  for each row execute function set_updated_at();

-- RLSを有効化しポリシーは追加しない。
-- ブラウザからはanonキーを一切使わず、サーバー側のservice_roleキー（RLSをバイパス）のみが
-- 全テーブルにアクセスする。これにより anon キーが漏れても外部からのアクセスは不可能。
alter table faqs enable row level security;
alter table conversations enable row level security;
alter table broadcasts enable row level security;
alter table app_settings enable row level security;

-- 初期データ: 編集前提の例示のみ（オーナーが管理画面から実際の内容に差し替える）
insert into faqs (question, answer, display_order) values
  ('（例）営業時間を教えてください', '（例）平日10:00〜19:00、土日祝10:00〜17:00です。管理画面から実際の内容に編集してください。', 0),
  ('（例）アクセス方法を教えてください', '（例）〇〇駅から徒歩5分です。管理画面から実際の内容に編集してください。', 1);
