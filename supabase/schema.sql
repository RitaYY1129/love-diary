-- Run this whole file once in Supabase: SQL Editor -> New query -> Run.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  identifier text not null,
  nickname text not null,
  invite_code text not null unique,
  couple_id text,
  avatar text default '',
  profile_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.create_profile()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  chosen_username text := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  shown_identifier text := trim(coalesce(new.raw_user_meta_data ->> 'identifier', new.email));
begin
  if chosen_username = '' then
    chosen_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  insert into public.profiles (id, username, identifier, nickname, invite_code)
  values (new.id, chosen_username, shown_identifier, chosen_username, 'LOVE' || upper(substr(replace(new.id::text, '-', ''), 1, 8)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_profile();

create table if not exists public.couple_shared_states (
  couple_id text not null,
  module_key text not null check (module_key ~ '^[a-zA-Z0-9_-]{1,40}$'),
  payload jsonb not null,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz default now(),
  primary key (couple_id, module_key)
);

alter table public.profiles enable row level security;
alter table public.couple_shared_states enable row level security;

create or replace function public.current_couple_id()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select couple_id from public.profiles where id = auth.uid()), auth.uid()::text)
$$;

create policy "read own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "read couple state" on public.couple_shared_states for select using (couple_id = public.current_couple_id());
create policy "write couple state" on public.couple_shared_states for insert with check (couple_id = public.current_couple_id() and updated_by = auth.uid());
create policy "update couple state" on public.couple_shared_states for update using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id() and updated_by = auth.uid());

create or replace function public.bind_partner(partner_code text)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare
  partner public.profiles;
  pair_key text;
begin
  select * into partner from public.profiles where invite_code = upper(trim(partner_code));
  if partner.id is null then raise exception '邀请码不存在'; end if;
  if partner.id = auth.uid() then raise exception '不能绑定自己'; end if;
  if partner.couple_id is not null then raise exception '对方已经绑定另一半'; end if;
  if (select couple_id from public.profiles where id = auth.uid()) is not null then raise exception '你已经绑定另一半'; end if;
  pair_key := least(auth.uid()::text, partner.id::text) || ':' || greatest(auth.uid()::text, partner.id::text);
  update public.profiles set couple_id = pair_key, updated_at = now() where id in (auth.uid(), partner.id);
  return partner;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.couple_shared_states to authenticated;
grant execute on function public.bind_partner(text) to authenticated;
