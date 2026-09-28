-- Schema da área de membros · Reserva de Emergência do Zero
-- Rode uma vez no Supabase: SQL Editor → New query → cole tudo → Run.
-- É idempotente: pode rodar de novo sem apagar dados.

-- ---------------------------------------------------------------- membros
create table if not exists public.membros (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,
  senha_hash          text not null,
  produtos_liberados  text[] not null default '{}',  -- IDs de produto da Cakto
  criado_em           timestamptz not null default now(),
  senha_reenviada_em  timestamptz                     -- limite de reenvio do /primeiro-acesso
);
create index if not exists membros_email_idx on public.membros (lower(email));

-- ---------------------------------------------------------------- progresso
-- Checklists, calculadora e painel das 52 semanas. Uma linha por membro + chave.
create table if not exists public.progresso (
  membro_id      uuid not null references public.membros(id) on delete cascade,
  chave          text not null,
  dados          jsonb not null default '{}'::jsonb,
  atualizado_em  timestamptz not null default now(),
  primary key (membro_id, chave)
);

-- ---------------------------------------------------------------- webhook_eventos
-- Deduplicação: a Cakto pode reenviar o mesmo evento.
create table if not exists public.webhook_eventos (
  pedido_id     text not null,
  evento        text not null,
  ref_id        text,
  email         text,
  produto_id    text,
  recebido_em   timestamptz not null default now(),
  primary key (pedido_id, evento)
);

-- ---------------------------------------------------------------- RLS
-- Ligado e SEM políticas: anon e authenticated não leem nem escrevem nada.
-- Só a service role (usada apenas no servidor do app) acessa.
alter table public.membros         enable row level security;
alter table public.progresso       enable row level security;
alter table public.webhook_eventos enable row level security;

revoke all on public.membros, public.progresso, public.webhook_eventos from anon, authenticated;

-- ---------------------------------------------------------------- funções atômicas
-- Libera um produto numa única instrução. Evita perder um bump quando o principal
-- e os bumps chegam ao mesmo tempo. A senha só é gravada se o membro for novo.
create or replace function public.liberar_produto(p_email text, p_senha_hash text, p_produto text)
returns table (membro_id uuid, criado boolean, criado_em timestamptz)
language sql
security definer
set search_path = public
as $$
  insert into public.membros as m (email, senha_hash, produtos_liberados)
  values (lower(trim(p_email)), p_senha_hash, array[p_produto])
  on conflict (email) do update
    set produtos_liberados = (
      select array_agg(distinct x) from unnest(m.produtos_liberados || excluded.produtos_liberados) as x
    )
  returning m.id, (xmax = 0), m.criado_em;
$$;

create or replace function public.revogar_produto(p_email text, p_produto text)
returns table (membro_id uuid)
language sql
security definer
set search_path = public
as $$
  update public.membros
     set produtos_liberados = array_remove(produtos_liberados, p_produto)
   where email = lower(trim(p_email))
  returning id;
$$;

revoke all on function public.liberar_produto(text, text, text) from public, anon, authenticated;
revoke all on function public.revogar_produto(text, text) from public, anon, authenticated;
grant execute on function public.liberar_produto(text, text, text) to service_role;
grant execute on function public.revogar_produto(text, text) to service_role;
