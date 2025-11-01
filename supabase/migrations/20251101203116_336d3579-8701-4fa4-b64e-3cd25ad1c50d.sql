-- Create deal_tickets table for tracking coverage requests
create table if not exists public.deal_tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Search params
  dep_icao text not null,
  arr_icao text,
  req_date date,
  req_time_utc text,
  aircraft_category text,
  
  -- Results snapshot
  shortlist jsonb not null,
  
  -- Status tracking
  status text not null default 'open' check (status in ('open', 'contacted', 'won', 'lost')),
  notes text
);

-- Indexes
create index idx_deal_tickets_user_status on public.deal_tickets(user_id, status);
create index idx_deal_tickets_user_created on public.deal_tickets(user_id, created_at desc);
create index idx_deal_tickets_corridor on public.deal_tickets(dep_icao, arr_icao);

-- RLS policies
alter table public.deal_tickets enable row level security;

create policy "deal_owner_select"
  on public.deal_tickets for select
  using (auth.uid() = user_id);

create policy "deal_owner_insert"
  on public.deal_tickets for insert
  with check (auth.uid() = user_id);

create policy "deal_owner_update"
  on public.deal_tickets for update
  using (auth.uid() = user_id);

create policy "deal_owner_delete"
  on public.deal_tickets for delete
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger deal_tickets_updated_at
  before update on public.deal_tickets
  for each row execute function public.handle_updated_at();