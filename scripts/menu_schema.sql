-- Menu Categories Table
-- Stores menu categories for each business (e.g., Starters, Main Course, Desserts)
CREATE TABLE public.menu_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(business_id, name)
);

-- Menu Items Table
-- Stores individual menu items for each business
CREATE TABLE public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_veg BOOLEAN DEFAULT true,
  price DECIMAL(10,2),
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_menu_categories_business_id ON public.menu_categories(business_id);
CREATE INDEX idx_menu_items_business_id ON public.menu_items(business_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(available);

-- Enable Row Level Security
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_categories
-- Anyone can view categories from any business
CREATE POLICY "Public menu categories are viewable by everyone" 
  ON public.menu_categories FOR SELECT 
  USING (true);

-- Only business owners can insert their own categories
CREATE POLICY "Businesses can insert own categories" 
  ON public.menu_categories FOR INSERT 
  WITH CHECK (auth.uid() = business_id);

-- Only business owners can update their own categories
CREATE POLICY "Businesses can update own categories" 
  ON public.menu_categories FOR UPDATE 
  USING (auth.uid() = business_id);

-- Only business owners can delete their own categories
CREATE POLICY "Businesses can delete own categories" 
  ON public.menu_categories FOR DELETE 
  USING (auth.uid() = business_id);

-- RLS Policies for menu_items
-- Anyone can view menu items from any business
CREATE POLICY "Public menu items are viewable by everyone" 
  ON public.menu_items FOR SELECT 
  USING (true);

-- Only business owners can insert their own menu items
CREATE POLICY "Businesses can insert own menu items" 
  ON public.menu_items FOR INSERT 
  WITH CHECK (auth.uid() = business_id);

-- Only business owners can update their own menu items
CREATE POLICY "Businesses can update own menu items" 
  ON public.menu_items FOR UPDATE 
  USING (auth.uid() = business_id);

-- Only business owners can delete their own menu items
CREATE POLICY "Businesses can delete own menu items" 
  ON public.menu_items FOR DELETE 
  USING (auth.uid() = business_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_menu_categories_updated_at 
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at 
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
