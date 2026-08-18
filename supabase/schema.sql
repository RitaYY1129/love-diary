-- ============================================================================
--  Love Diary —— Supabase 全量建表 SQL
--  说明：
--  1. 本项目前端不走 Supabase Auth，使用本地账号体系，owner_id 为前端生成的 UUID。
--  2. 由于是 anon 角色写入，这里统一关闭 RLS（DISABLE ROW LEVEL SECURITY），
--     权限由应用层（本地账号 + couple_id）控制。若你之后接入 Supabase Auth，
--     再按需开启 RLS 并配置 policy。
--  3. 在 Supabase SQL Editor 中全选执行本文件即可。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles：用户资料
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key,
  phone       text unique,
  username    text unique,
  password    text,                       -- bcrypt 哈希
  nickname    text,
  avatar_url  text,
  birthday    date,
  invite_code text unique,
  partner_id  uuid references profiles(id),
  couple_id   uuid,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- couple_shared_states：情侣共享状态（双向同步）
-- ----------------------------------------------------------------------------
create table if not exists couple_shared_states (
  id         bigint generated always as identity primary key,
  couple_id  uuid not null,
  module     text not null,
  state      jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (couple_id, module)
);

-- ----------------------------------------------------------------------------
-- diaries：日记
-- ----------------------------------------------------------------------------
create table if not exists diaries (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid,
  title       text,
  content     text,
  mood        text,
  images      jsonb default '[]',
  weather     text,
  location    text,
  is_private  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- wishes：心愿单 / 愿望
-- ----------------------------------------------------------------------------
create table if not exists wishes (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid,
  title        text not null,
  description  text,
  completed    boolean default false,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- plans：计划
-- ----------------------------------------------------------------------------
create table if not exists plans (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid,
  title        text not null,
  description  text,
  date         date,
  time         time,
  completed    boolean default false,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- anniversaries：纪念日
--  注意字段名为 count_mode（snake_case），前端使用 camelCase 的 countMode，
--  PostgREST 会自动转换。
-- ----------------------------------------------------------------------------
create table if not exists anniversaries (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid,
  title        text not null,
  date         date not null,
  type         text default 'custom',
  emoji        text,
  note         text,
  count_mode   text default 'anniversary',  -- anniversary | age | daysPassed
  repeat_year  boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- photos：相册
-- ----------------------------------------------------------------------------
create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid,
  title       text,
  url         text,
  thumbnail   text,
  album       text,
  taken_at    timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- moods：心情
-- ----------------------------------------------------------------------------
create table if not exists moods (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid,
  score       integer not null,
  tags        jsonb default '[]',
  note        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- checkins：打卡
-- ----------------------------------------------------------------------------
create table if not exists checkins (
  id         bigint generated always as identity primary key,
  owner_id   uuid not null,
  date       date not null,
  note       text,
  created_at timestamptz default now(),
  unique (owner_id, date)
);

-- ----------------------------------------------------------------------------
-- locations：位置共享
-- ----------------------------------------------------------------------------
create table if not exists locations (
  id          bigint generated always as identity primary key,
  owner_id    uuid not null,
  couple_id   uuid,
  latitude    double precision not null,
  longitude   double precision not null,
  address     text,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- finances：记账
-- ----------------------------------------------------------------------------
create table if not exists finances (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid,
  type         text not null,               -- income | expense
  amount       numeric(12,2) not null,
  category     text,
  note         text,
  happened_at  timestamptz default now(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- chat_messages：聊天消息
-- ----------------------------------------------------------------------------
create table if not exists chat_messages (
  id          bigint generated always as identity primary key,
  couple_id   uuid not null,
  sender_id   uuid not null,
  type        text default 'text',          -- text | image | voice | system
  content     text,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- call_records：通话记录
-- ----------------------------------------------------------------------------
create table if not exists call_records (
  id          bigint generated always as identity primary key,
  couple_id   uuid not null,
  caller_id   uuid not null,
  callee_id   uuid not null,
  duration    integer default 0,            -- 秒
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- calm_modes：冷静模式
-- ----------------------------------------------------------------------------
create table if not exists calm_modes (
  id              bigint generated always as identity primary key,
  couple_id       uuid not null,
  requester_id    uuid not null,
  duration_hours  integer,
  status          text default 'pending',   -- pending | active | ended
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 统一关闭 RLS（本项目使用前端本地账号 + anon 角色读写）
-- ----------------------------------------------------------------------------
alter table profiles              disable row level security;
alter table couple_shared_states  disable row level security;
alter table diaries               disable row level security;
alter table wishes                disable row level security;
alter table plans                 disable row level security;
alter table anniversaries         disable row level security;
alter table photos                disable row level security;
alter table moods                 disable row level security;
alter table checkins              disable row level security;
alter table locations             disable row level security;
alter table finances              disable row level security;
alter table chat_messages         disable row level security;
alter table call_records          disable row level security;
alter table calm_modes            disable row level security;
