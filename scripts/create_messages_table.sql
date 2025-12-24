-- Create messages table if it doesn't exist
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) not null,
  sender_id uuid references auth.users not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false
);

-- Enable RLS
alter table public.messages enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view messages for their orders" on public.messages;
drop policy if exists "Users can send messages for their orders" on public.messages;

-- Policies
-- Users can see messages for orders they are part of
create policy "Users can view messages for their orders" on public.messages
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = messages.order_id
      and (orders.customer_id = auth.uid() or orders.business_id = auth.uid())
    )
  );

-- Users can insert messages for orders they are part of
create policy "Users can send messages for their orders" on public.messages
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = messages.order_id
      and (orders.customer_id = auth.uid() or orders.business_id = auth.uid())
    )
  );

-- Enable Realtime for messages table
alter publication supabase_realtime add table public.messages;
