-- Create businesses table
create table public.businesses (
  id uuid references auth.users not null primary key,
  user_id uuid references auth.users not null,
  email text,
  name text,
  phone text,
  address text,
  description text,
  services text[],
  accepting_orders boolean default true,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  stats jsonb default '{"totalOrders": 0, "rating": 0}'::jsonb
);

-- Create customers table
create table public.customers (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id),
  business_id uuid references public.businesses(id),
  event_type text,
  food_preference text,
  cuisine text,
  service_type text,
  venue text,
  number_of_people integer,
  total_amount decimal(10,2),
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sessions jsonb,
  notes text
);

-- Create order menu items table
create table public.order_menu_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) ON DELETE CASCADE,
  session_index integer,
  item_name text,
  item_category text,
  is_veg boolean,
  quantity integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_menu_items enable row level security;

-- Create Policies
-- Businesses: Anyone can read, only owner can update
create policy "Public businesses are viewable by everyone" on public.businesses for select using (true);
create policy "Users can insert their own business" on public.businesses for insert with check (auth.uid() = user_id);
create policy "Users can update own business" on public.businesses for update using (auth.uid() = user_id);

-- Customers: Users can read/update their own data
create policy "Users can see own customer data" on public.customers for select using (auth.uid() = id);
create policy "Users can insert own customer data" on public.customers for insert with check (auth.uid() = id);

-- Orders: Customers can see their orders, Businesses can see orders for them
create policy "Customers can see own orders" on public.orders for select using (auth.uid() = customer_id);
create policy "Businesses can see assigned orders" on public.orders for select using (auth.uid() = business_id);
create policy "Customers can create orders" on public.orders for insert with check (auth.uid() = customer_id);
create policy "Businesses can update assigned orders" on public.orders for update using (auth.uid() = business_id);

-- Order Menu Items: Accessible through order permissions
create policy "Order menu items viewable by order participants" on public.order_menu_items 
  for select using (
    exists (
      select 1 from public.orders 
      where orders.id = order_menu_items.order_id 
      and (orders.customer_id = auth.uid() or orders.business_id = auth.uid())
    )
  );
create policy "Customers can insert menu items for their orders" on public.order_menu_items 
  for insert with check (
    exists (
      select 1 from public.orders 
      where orders.id = order_menu_items.order_id 
      and orders.customer_id = auth.uid()
    )
  );

-- Resource Management Tables

-- Resource Lists (Groceries, Shamiyana, Food Menu, etc.)
create table public.business_resource_lists (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  title text not null,
  type text not null, -- 'groceries', 'shamiyana', 'food_menu'
  event_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb -- For extra fields like status, notes
);

-- Resource Items (Items within a list)
create table public.business_resource_items (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.business_resource_lists(id) ON DELETE CASCADE,
  name text not null,
  quantity text, -- Text to allow units like "10 kg", "50 plates"
  category text, -- For grouping (e.g., 'Vegetables', 'Furniture', 'Day 1 - Lunch')
  is_checked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb -- For extra fields like price_estimate, vendor, etc.
);

-- Enable RLS for new tables
alter table public.business_resource_lists enable row level security;
alter table public.business_resource_items enable row level security;

-- Policies for Resource Lists
create policy "Businesses can CRUD their own resource lists" on public.business_resource_lists
  for all using (
    exists (
      select 1 from public.businesses
      where businesses.id = business_resource_lists.business_id
      and businesses.user_id = auth.uid()
    )
  );

-- Policies for Resource Items
create policy "Businesses can CRUD their own resource items" on public.business_resource_items
  for all using (
    exists (
      select 1 from public.business_resource_lists
      join public.businesses on businesses.id = business_resource_lists.business_id
      where business_resource_lists.id = business_resource_items.list_id
      and businesses.user_id = auth.uid()
    )
  );
